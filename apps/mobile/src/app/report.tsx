import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { REPORT_CATEGORIES } from "@trekne/brand";
import type { Enums } from "@trekne/db";
import { DestinationPicker, type Picked } from "@/components/destination-picker";
import { Icon, type IconName } from "@/components/icon";
import { Button, Card, Row, T } from "@/components/ui";
import { enqueue, keepFile, newId } from "@/lib/outbox";
import { F, radius, useBrand } from "@/lib/theme";

const CAT_ICON: Record<(typeof REPORT_CATEGORIES)[number], IconName> = {
  road: "route", trail: "backpack", weather: "rain", waste: "leaf", crowd: "users", closure: "alert", wildlife: "eye", heritage: "temple",
};

export default function NewReport() {
  const b = useBrand();
  const [dest, setDest] = useState<Picked | null>(null);
  const [picking, setPicking] = useState(true);
  const [cat, setCat] = useState<Enums<"report_category">>("trail");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [gps, setGps] = useState<Location.LocationObject | null>(null);
  const [gpsMsg, setGpsMsg] = useState("Getting location…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return setGpsMsg("Location off: the report will use the destination's position");
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setGps(loc);
        setGpsMsg(`${loc.coords.latitude.toFixed(4)}°N ${loc.coords.longitude.toFixed(4)}°E ±${Math.round(loc.coords.accuracy ?? 0)} m`);
      } catch {
        setGpsMsg("Couldn't get a GPS fix");
      }
    })();
  }, []);

  async function addPhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Camera permission needed");
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6, exif: false });
    if (!res.canceled) setPhotos((p) => [...p, res.assets[0].uri].slice(0, 4));
  }

  async function submit() {
    if (!dest) return;
    setBusy(true);
    const client_id = newId();
    try {
      const kept = await Promise.all(photos.map((u, i) => keepFile(u, client_id, `${i}.jpg`)));
      await enqueue({
        kind: "report", client_id, destination_id: dest.id, destination_name: dest.name, category: cat, body: body.trim(),
        lat: gps?.coords.latitude ?? null, lng: gps?.coords.longitude ?? null, accuracy_m: gps?.coords.accuracy ?? null,
        captured_at: new Date().toISOString(), photos: kept,
      });
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: b.bg }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 60 }}>
      <Card>
        <T v="label">Destination</T>
        <Pressable onPress={() => setPicking(true)}><Row style={{ justifyContent: "space-between" }}><T v="h3">{dest?.name ?? "Choose…"}</T><Icon name="chevronRight" color={b.muted} /></Row></Pressable>
        <Row gap={6}><Icon name="pin" size={16} color={b.muted} /><T v="mono" muted style={{ flex: 1 }}>{gpsMsg}</T></Row>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {REPORT_CATEGORIES.map((c) => (
          <Pressable key={c} onPress={() => setCat(c)} style={{ width: "23%", flexGrow: 1, alignItems: "center", gap: 6, paddingVertical: 12, borderRadius: radius.sm, backgroundColor: cat === c ? b.text : b.surface }}>
            <Icon name={CAT_ICON[c]} size={22} color={cat === c ? b.bg : b.text} />
            <T v="small" color={cat === c ? b.bg : b.text} style={{ fontFamily: F.bold, textTransform: "capitalize" }}>{c}</T>
          </Pressable>
        ))}
      </View>

      <TextInput value={body} onChangeText={setBody} multiline placeholder="What did you see? Be specific: where, how bad, since when." placeholderTextColor={b.muted}
        style={{ minHeight: 120, backgroundColor: b.surface, borderRadius: radius.md, padding: 16, fontFamily: F.body, fontSize: 16, color: b.text, textAlignVertical: "top" }} />

      <Row gap={8} style={{ flexWrap: "wrap" }}>
        {photos.map((u) => (
          <Pressable key={u} onLongPress={() => setPhotos(photos.filter((p) => p !== u))}>
            <Image source={{ uri: u }} style={{ width: 76, height: 76, borderRadius: 14 }} />
          </Pressable>
        ))}
        {photos.length < 4 && (
          <Pressable onPress={addPhoto} style={{ width: 76, height: 76, borderRadius: 14, backgroundColor: b.surface, alignItems: "center", justifyContent: "center" }}>
            <Icon name="camera" color={b.text} />
          </Pressable>
        )}
      </Row>
      <T v="small" muted>Avoid faces and private homes in photos. Long-press a photo to remove it.</T>

      <Button title="Save report" icon="check" onPress={submit} loading={busy} disabled={!dest || body.trim().length < 3} />
      <DestinationPicker visible={picking} onClose={() => setPicking(false)} onPick={setDest} title="Where are you?" />
    </ScrollView>
  );
}
