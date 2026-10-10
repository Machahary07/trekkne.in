import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { router, useLocalSearchParams } from "expo-router";
import { DeviceMotion, Gyroscope } from "expo-sensors";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, useWindowDimensions, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_FOV, angleTo, cameraPose, captureTargets, fuse, orientationFromUp, projectTarget,
  type CaptureTarget, type Quat, type Vec3,
} from "@trekne/db";
import { Icon } from "@/components/icon";
import { Button, Row, T } from "@/components/ui";
import { enqueue, keepFile, newId } from "@/lib/outbox";
import { radius, useBrand } from "@/lib/theme";

type Phase = "intro" | "capturing" | "saving";
const LOCK_DEG = 3.5;      // how close to a target before capturing
const LEVEL_DEG = 7;       // allowed roll
const STILL_RAD_S = 0.3;   // max rotation speed while capturing
const HOLD_MS = 280;       // must stay aligned + still this long

export default function Capture() {
  const b = useBrand();
  const params = useLocalSearchParams<{ id: string; name: string; lat?: string; lng?: string }>();
  const { width } = useWindowDimensions();
  const boxW = width;
  const boxH = (width * 4) / 3; // 3:4 portrait preview = the photo's full field of view

  const [perm, requestPerm] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const targets = useMemo(() => captureTargets(mode), [mode]);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [, setTick] = useState(0);

  const cam = useRef<CameraView>(null);
  const q = useRef<Quat | null>(null);
  const gravity = useRef<Vec3>([0, 9.8, 0]);
  const sign = useRef<1 | -1>(1);
  const gyroRate = useRef(0);
  const lastT = useRef(0);
  const alignedSince = useRef(0);
  const shooting = useRef(false);
  const frames = useRef<{ i: number; uri: string; q: Quat; target: string }[]>([]);
  const clientId = useRef(newId());

  // ---------- sensors ----------
  useEffect(() => {
    Gyroscope.setUpdateInterval(16);
    DeviceMotion.setUpdateInterval(16);
    const dm = DeviceMotion.addListener((m) => {
      const a = m.accelerationIncludingGravity;
      const lin = m.acceleration;
      if (!a) return;
      gravity.current = lin ? [a.x - lin.x, a.y - lin.y, a.z - lin.z] : [a.x, a.y, a.z];
    });
    const gy = Gyroscope.addListener(({ x, y, z }) => {
      const now = Date.now();
      const dt = lastT.current ? Math.min(0.1, (now - lastT.current) / 1000) : 0.016;
      lastT.current = now;
      gyroRate.current = Math.hypot(x, y, z);
      if (!q.current) return;
      const g = gravity.current;
      q.current = fuse(q.current, [x, y, z], [g[0] * sign.current, g[1] * sign.current, g[2] * sign.current], dt);
    });
    const ui = setInterval(() => setTick((t) => t + 1), 50);
    return () => { dm.remove(); gy.remove(); clearInterval(ui); };
  }, []);

  function start() {
    const g = gravity.current;
    // Platforms disagree on the gravity sign; the user starts upright, so "up" must point along +y.
    sign.current = g[1] >= 0 ? 1 : -1;
    q.current = orientationFromUp([g[0] * sign.current, g[1] * sign.current, g[2] * sign.current]);
    frames.current = [];
    setDone({});
    setPhase("capturing");
  }

  // ---------- auto capture ----------
  const pose = q.current ? cameraPose(q.current) : null;
  const remaining = targets.filter((t) => !done[t.id]);
  let nearest: { t: CaptureTarget; deg: number } | null = null;
  if (q.current) for (const t of remaining) {
    const deg = angleTo(q.current, t);
    if (!nearest || deg < nearest.deg) nearest = { t, deg };
  }
  const level = pose ? Math.abs(pose.roll) < LEVEL_DEG : false;
  const still = gyroRate.current < STILL_RAD_S;
  const aligned = phase === "capturing" && !!nearest && nearest.deg < LOCK_DEG && level && still;

  useEffect(() => {
    if (!aligned) { alignedSince.current = 0; return; }
    if (!alignedSince.current) alignedSince.current = Date.now();
    if (Date.now() - alignedSince.current < HOLD_MS || shooting.current || !nearest || !q.current) return;
    const target = nearest.t;
    const atShot = [...q.current] as Quat;
    shooting.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (async () => {
      try {
        const pic = await cam.current?.takePictureAsync({ quality: 0.7, shutterSound: false });
        if (!pic) return;
        const img = await ImageManipulator.manipulate(pic.uri).resize({ width: 1024 }).renderAsync();
        const saved = await img.saveAsync({ compress: 0.72, format: SaveFormat.JPEG });
        const i = frames.current.length;
        const uri = await keepFile(saved.uri, clientId.current, `${String(i).padStart(2, "0")}.jpg`);
        frames.current.push({ i, uri, q: atShot, target: target.id });
        setDone((d) => ({ ...d, [target.id]: true }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.warn("capture failed", e);
      } finally {
        shooting.current = false;
        alignedSince.current = 0;
      }
    })();
  });

  useEffect(() => {
    if (phase === "capturing" && remaining.length === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining.length, phase]);

  async function finish() {
    if (frames.current.length < 4) {
      Alert.alert("Keep going", "Capture at least 4 photos to make a scene.");
      return;
    }
    setPhase("saving");
    await enqueue({
      kind: "scene", client_id: clientId.current, destination_id: params.id, destination_name: params.name,
      title: `${params.name} · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
      lat: params.lat ? Number(params.lat) : null, lng: params.lng ? Number(params.lng) : null,
      hfov: DEFAULT_FOV.hfov, vfov: DEFAULT_FOV.vfov, captured_at: new Date().toISOString(),
      frames: frames.current.map(({ i, uri, q: fq }) => ({ i, uri, q: fq })),
    });
    router.back();
  }

  // ---------- UI ----------
  if (!perm) return <View style={{ flex: 1, backgroundColor: b.ink }} />;
  if (!perm.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: b.ink, padding: 24, justifyContent: "center", gap: 16 }}>
        <T v="h1" color={b.white}>Camera access</T>
        <T color={b.deepMuted}>Trekne needs the camera to capture a 360 view of current conditions.</T>
        <Button title="Allow camera" onPress={requestPerm} variant="orange" />
        <Button title="Cancel" variant="ghost" textColor={b.white} onPress={() => router.back()} style={{ borderColor: b.deepMuted }} />
      </SafeAreaView>
    );
  }

  const total = targets.length;
  const count = total - remaining.length;
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <View style={{ flex: 1, backgroundColor: b.ink }}>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Close" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,.14)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" color={b.white} size={20} />
          </Pressable>
          <T v="h3" color={b.white} numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>{params.name}</T>
          <View style={{ width: 40 }} />
        </Row>
      </SafeAreaView>

      <View style={{ width: boxW, height: boxH, overflow: "hidden" }}>
        <CameraView ref={cam} style={{ flex: 1 }} facing="back" ratio="4:3" animateShutter={false} />
        {phase === "capturing" && q.current && (
          <View style={{ position: "absolute", inset: 0 }} pointerEvents="none">
            {targets.map((t) => {
              const p = projectTarget(q.current!, t, boxW, boxH);
              if (!p) return null;
              const isDone = !!done[t.id];
              const isNext = nearest?.t.id === t.id;
              const size = isNext ? 30 : 20;
              return (
                <View key={t.id} style={{
                  position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, borderRadius: size / 2,
                  backgroundColor: isDone ? b.green : isNext ? b.orange : "rgba(255,255,255,.55)", borderWidth: 3, borderColor: "#fff",
                }} />
              );
            })}
            {/* centre reticle */}
            <View style={{ position: "absolute", left: boxW / 2 - 34, top: boxH / 2 - 34, width: 68, height: 68, alignItems: "center", justifyContent: "center" }}>
              <Svg width={68} height={68}>
                <Circle cx={34} cy={34} r={R} stroke="rgba(255,255,255,.35)" strokeWidth={4} fill="none" />
                <Circle cx={34} cy={34} r={R} stroke={aligned ? b.green : b.white} strokeWidth={4} fill="none"
                  strokeDasharray={`${C}`} strokeDashoffset={C * (1 - count / total)} strokeLinecap="round" transform="rotate(-90 34 34)" />
              </Svg>
            </View>
            {/* level bar */}
            {pose && (
              <View style={{ position: "absolute", left: boxW / 2 - 60, top: boxH / 2 + 50, width: 120, height: 4, borderRadius: 2,
                backgroundColor: level ? b.green : b.yellow, transform: [{ rotate: `${-pose.roll}deg` }] }} />
            )}
          </View>
        )}
      </View>

      <SafeAreaView edges={["bottom"]} style={{ flex: 1, padding: 16, gap: 12, justifyContent: "flex-end" }}>
        {phase === "intro" ? (
          <>
            <T color={b.white} style={{ textAlign: "center" }}>Stand in one spot. Hold the phone upright at chest height and turn on the spot, not around it.</T>
            <Row gap={8}>
              {(["quick", "full"] as const).map((m) => (
                <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: mode === m ? b.white : "rgba(255,255,255,.12)", gap: 2 }}>
                  <T v="h3" color={mode === m ? b.ink : b.white}>{m === "quick" ? "Quick ring" : "Full sphere"}</T>
                  <T v="small" color={mode === m ? "#586078" : b.deepMuted}>{m === "quick" ? "12 photos · ~1 min" : "29 photos · ~3 min"}</T>
                </Pressable>
              ))}
            </Row>
            <Button title="Start capture" icon="sphere" variant="orange" onPress={start} />
          </>
        ) : phase === "capturing" ? (
          <>
            <T v="h3" color={b.white} style={{ textAlign: "center" }}>
              {count}/{total} · {!level ? "Hold the phone level" : !still ? "Hold still…" : nearest && nearest.deg > LOCK_DEG ? "Move the ring onto the orange dot" : "Capturing…"}
            </T>
            <Row>
              <Button title="Restart" variant="ghost" textColor={b.white} small onPress={start} style={{ flex: 1, borderColor: "rgba(255,255,255,.3)" }} />
              <Button title={`Finish (${count})`} small variant="green" onPress={finish} disabled={count < 4} style={{ flex: 1 }} />
            </Row>
          </>
        ) : (
          <T v="h3" color={b.white} style={{ textAlign: "center" }}>Saving scene…</T>
        )}
      </SafeAreaView>
    </View>
  );
}
