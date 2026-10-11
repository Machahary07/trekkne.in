import { router } from "expo-router";
import { useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { DestinationPicker, type Picked } from "@/components/destination-picker";
import { Icon } from "@/components/icon";
import { ActionTile, IconTile, LevelCard, PlaceThumb, PointsHint, Press, SectionTitle, StatTile } from "@/components/kit";
import { Button, Pill, Row, Screen, StatusPill, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ago, must, todayIST, useLoad } from "@/lib/data";
import { discard, flush, useOutbox } from "@/lib/outbox";
import { useProgress } from "@/lib/progress";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const CAT_ICON = { road: "car", trail: "backpack", weather: "rain", waste: "trash", crowd: "users", closure: "alert", wildlife: "eye", heritage: "temple" } as const;

export default function Ranger() {
  const b = useBrand();
  const { can, profile } = useAuth();
  const { progress } = useProgress();
  const outbox = useOutbox();
  const [picker, setPicker] = useState<"scene" | "count" | null>(null);
  const [countFor, setCountFor] = useState<Picked | null>(null);
  const [count, setCount] = useState("");

  // Live: a moderator verifying your report flips its status here instantly.
  const { data } = useLoad(async () => {
    const [reports, scenes] = await Promise.all([
      must(supabase.from("reports").select("id,body,status,category,moderation_note,created_at,destinations(name,slug)").eq("author_id", profile!.id).order("created_at", { ascending: false }).limit(20)),
      must(supabase.from("panoramas").select("id,title,status,frame_count,captured_at,destinations(name,slug)").eq("author_id", profile!.id).order("captured_at", { ascending: false }).limit(10)),
    ]);
    return { reports, scenes };
  }, [outbox.length], ["reports", "panoramas"]);

  async function saveCount() {
    if (!countFor) return;
    const { error } = await supabase.from("visitor_counts").insert({ destination_id: countFor.id, day: todayIST(), visitors: Number(count), source: "ranger_estimate", recorded_by: profile!.id });
    if (error) return Alert.alert("Couldn't save", /duplicate/.test(error.message) ? "Today's count for this place is already logged." : error.message);
    Alert.alert("Saved · +15 points", `${count} visitors at ${countFor.name} today.`);
    setCountFor(null);
    setCount("");
  }

  const pending = (data?.reports ?? []).filter((r) => r.status === "pending").length;

  return (
    <Screen>
      <T v="h1">Ranger</T>
      <LevelCard progress={progress} compact onPress={() => router.push("/profile")} />

      <Row gap={8} style={{ alignItems: "stretch" }}>
        <StatTile icon="shield" value={progress.reports_verified} label="Verified" tone="green" />
        <StatTile icon="clock" value={pending} label="Review" tone="yellow" />
        <StatTile icon="sphere" value={progress.scenes_published} label="360 live" tone="blue" />
        <StatTile icon="users" value={progress.counts_logged} label="Counts" tone="orange" />
      </Row>

      <Row gap={10} style={{ alignItems: "stretch" }}>
        {can("reports.field") && <ActionTile icon="camera" title="Report" sub="+50 when verified" tone="orange" onPress={() => router.push("/report")} />}
        {can("panoramas.create") && <ActionTile icon="sphere" title="360 view" sub="+80 when live" tone="blue" onPress={() => setPicker("scene")} />}
      </Row>

      {can("visitors.log") && (
        <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, gap: 10 }}>
          <Row><IconTile icon="users" tone="orange" size={40} round /><View style={{ flex: 1 }}><T v="h3">Count today's visitors</T><T v="small" muted>Feeds the crowd signal everyone sees</T></View></Row>
          {countFor ? (
            <Row>
              <TextInput value={count} onChangeText={setCount} keyboardType="number-pad" placeholder={`How many at ${countFor.name}?`} placeholderTextColor={b.muted}
                style={{ flex: 1, backgroundColor: b.surface2, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 12, fontFamily: F.body, fontSize: 16, color: b.text }} />
              <Button title="Save" small variant="green" onPress={saveCount} disabled={!count} />
            </Row>
          ) : <Button title="Choose place" small variant="chip" icon="pin" onPress={() => setPicker("count")} />}
          <PointsHint points={15} label="per count" />
        </View>
      )}

      {outbox.length > 0 && (
        <>
          <SectionTitle title="Waiting for signal" />
          {outbox.map((o) => (
            <View key={o.client_id} style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 12, gap: 8 }}>
              <Row gap={10}>
                <IconTile icon={o.kind === "scene" ? "sphere" : "camera"} tone={o.error ? "orange" : "yellow"} size={42} />
                <View style={{ flex: 1 }}>
                  <T style={{ fontFamily: F.bold }} numberOfLines={1}>{o.destination_name}</T>
                  <T v="small" muted numberOfLines={1}>{o.kind === "scene" ? `360 view · ${o.frames.length} photos` : o.body}</T>
                </View>
                <Pill level={o.error ? "high" : "warn"} label={o.error ? "Failed" : o.progress ?? "Saved on phone"} />
              </Row>
              {o.error && <T v="small" color={b.orangeDeep}>{o.error}</T>}
              <Row>
                <Button title="Retry" small variant="chip" icon="arrow" onPress={() => flush()} />
                <Button title="Discard" small variant="ghost" onPress={() => Alert.alert("Discard?", "This can't be undone.", [{ text: "Keep" }, { text: "Discard", style: "destructive", onPress: () => discard(o.client_id) }])} />
              </Row>
            </View>
          ))}
        </>
      )}

      <SectionTitle title="My reports" />
      {data?.reports.length ? data.reports.map((r) => (
        <View key={r.id} style={{ backgroundColor: b.surface, borderRadius: radius.md, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" }}>
          <IconTile icon={CAT_ICON[r.category]} tone={r.status === "verified" || r.status === "official" ? "green" : r.status === "rejected" ? "ink" : "yellow"} size={42} />
          <View style={{ flex: 1, gap: 2 }}>
            <Row gap={6}><T style={{ fontFamily: F.bold, flexShrink: 1 }} numberOfLines={1}>{r.destinations?.name}</T><T v="mono" muted>{ago(r.created_at)}</T></Row>
            <T v="small" numberOfLines={2}>{r.body}</T>
            {r.moderation_note ? <T v="small" muted numberOfLines={2}>Moderator: {r.moderation_note}</T> : null}
          </View>
          <StatusPill status={r.status} />
        </View>
      )) : (
        <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 20, alignItems: "center", gap: 8 }}>
          <IconTile icon="camera" tone="orange" size={52} round />
          <T v="h3">Your first report</T>
          <T v="small" muted style={{ textAlign: "center" }}>Spot a landslide, litter or a crowd? Report it. It works offline too.</T>
        </View>
      )}

      {!!data?.scenes.length && (
        <>
          <SectionTitle title="My 360 views" />
          {data.scenes.map((s) => (
            <Press key={s.id} onPress={() => router.push(`/scene/${s.id}`)} style={{ backgroundColor: b.surface, borderRadius: radius.md, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" }}>
              <PlaceThumb slug={s.destinations?.slug} size={46} />
              <View style={{ flex: 1 }}><T style={{ fontFamily: F.bold }} numberOfLines={1}>{s.title || s.destinations?.name}</T><T v="small" muted>{s.frame_count} photos · {ago(s.captured_at)}</T></View>
              <Pill label={s.status} level={s.status === "published" ? "good" : s.status === "rejected" ? "high" : "warn"} />
              <Icon name="chevronRight" size={18} color={b.muted} />
            </Press>
          ))}
        </>
      )}

      <DestinationPicker visible={!!picker} title={picker === "scene" ? "Where are you capturing?" : "Where are you counting?"}
        onClose={() => setPicker(null)}
        onPick={(d) => {
          if (picker === "scene") router.push({ pathname: "/capture", params: { id: d.id, name: d.name, lat: String(d.lat), lng: String(d.lng) } });
          else setCountFor(d);
        }} />
    </Screen>
  );
}
