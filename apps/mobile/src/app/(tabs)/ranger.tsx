import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { DestinationPicker, type Picked } from "@/components/destination-picker";
import { Icon } from "@/components/icon";
import { Button, Card, Empty, Eyebrow, Pill, Row, Screen, StatusPill, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ago, must, todayIST, useLoad } from "@/lib/data";
import { discard, flush, useOutbox } from "@/lib/outbox";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

export default function Ranger() {
  const b = useBrand();
  const { can, profile } = useAuth();
  const outbox = useOutbox();
  const [picker, setPicker] = useState<"scene" | "count" | null>(null);
  const [countFor, setCountFor] = useState<Picked | null>(null);
  const [count, setCount] = useState("");

  const { data, reload } = useLoad(async () => {
    const [reports, scenes] = await Promise.all([
      must(supabase.from("reports").select("id,body,status,category,moderation_note,created_at,destinations(name)").eq("author_id", profile!.id).order("created_at", { ascending: false }).limit(20)),
      must(supabase.from("panoramas").select("id,title,status,frame_count,captured_at,destinations(name)").eq("author_id", profile!.id).order("captured_at", { ascending: false }).limit(10)),
    ]);
    return { reports, scenes };
  }, [outbox.length]);

  async function saveCount() {
    if (!countFor) return;
    const { error } = await supabase.from("visitor_counts").insert({ destination_id: countFor.id, day: todayIST(), visitors: Number(count), source: "ranger_estimate", recorded_by: profile!.id });
    if (error) return Alert.alert("Couldn't save", /duplicate/.test(error.message) ? "Today's count for this place is already logged." : error.message);
    Alert.alert("Saved", `${count} visitors at ${countFor.name} today.`);
    setCountFor(null);
    setCount("");
  }

  return (
    <Screen>
      <T v="h1">Ranger</T>
      <T muted>Your reports go to moderators before travellers see them. No signal? Everything saves on the phone and uploads later.</T>

      <Row gap={10}>
        {can("reports.field") && (
          <Pressable onPress={() => router.push("/report")} style={{ flex: 1, backgroundColor: b.orange, borderRadius: radius.lg, padding: 18, gap: 18, minHeight: 140, justifyContent: "space-between" }}>
            <Icon name="camera" size={30} color={b.white} />
            <T v="h3" color={b.white}>New field report</T>
          </Pressable>
        )}
        {can("panoramas.create") && (
          <Pressable onPress={() => setPicker("scene")} style={{ flex: 1, backgroundColor: b.blue, borderRadius: radius.lg, padding: 18, gap: 18, minHeight: 140, justifyContent: "space-between" }}>
            <Icon name="sphere" size={30} color={b.ink} />
            <T v="h3" color={b.ink}>Capture 360 view</T>
          </Pressable>
        )}
      </Row>

      {can("visitors.log") && (
        <Card>
          <Row style={{ justifyContent: "space-between" }}><T v="h3">Log today&rsquo;s visitors</T><Icon name="users" color={b.muted} /></Row>
          {countFor ? (
            <Row>
              <TextInput value={count} onChangeText={setCount} keyboardType="number-pad" placeholder={`Visitors at ${countFor.name}`} placeholderTextColor={b.muted}
                style={{ flex: 1, backgroundColor: b.surface2, borderRadius: radius.sm, padding: 12, fontFamily: F.body, fontSize: 16, color: b.text }} />
              <Button title="Save" small onPress={saveCount} disabled={!count} />
            </Row>
          ) : <Button title="Choose place" small variant="chip" icon="pin" onPress={() => setPicker("count")} />}
          <T v="small" muted>Counts drive the pressure and eco-risk planners see in the CRM.</T>
        </Card>
      )}

      {outbox.length > 0 && (
        <>
          <Eyebrow>Waiting to upload</Eyebrow>
          {outbox.map((o) => (
            <Card key={o.client_id} style={{ gap: 6 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Row gap={8}><Icon name={o.kind === "scene" ? "sphere" : "shield"} size={19} color={b.text} /><T v="h3">{o.destination_name}</T></Row>
                <Pill level={o.error ? "high" : "warn"} label={o.error ? "Failed" : o.progress ?? "Queued"} />
              </Row>
              <T v="small" muted numberOfLines={2}>{o.kind === "scene" ? `360 scene · ${o.frames.length} photos` : o.body}</T>
              {o.error && <T v="small" color={b.orangeDeep}>{o.error}</T>}
              <Row>
                <Button title="Retry" small variant="chip" onPress={() => flush()} />
                <Button title="Discard" small variant="ghost" onPress={() => Alert.alert("Discard?", "This can't be undone.", [{ text: "Keep" }, { text: "Discard", style: "destructive", onPress: () => discard(o.client_id) }])} />
              </Row>
            </Card>
          ))}
        </>
      )}

      <Eyebrow>My reports</Eyebrow>
      {data?.reports.length ? data.reports.map((r) => (
        <Card key={r.id} style={{ gap: 6 }}>
          <Row style={{ justifyContent: "space-between" }}><StatusPill status={r.status} /><T v="mono" muted>{ago(r.created_at)}</T></Row>
          <T v="h3">{r.destinations?.name}</T>
          <T>{r.body}</T>
          {r.moderation_note && <T v="small" muted>Moderator: {r.moderation_note}</T>}
        </Card>
      )) : <Empty icon="shield" title="No reports yet" body="File your first report from the trail." />}

      {!!data?.scenes.length && (
        <>
          <Eyebrow>My 360 scenes</Eyebrow>
          {data.scenes.map((s) => (
            <Pressable key={s.id} onPress={() => router.push(`/scene/${s.id}`)}>
              <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Icon name="sphere" color={b.orange} />
                <View style={{ flex: 1 }}><T v="h3">{s.title || s.destinations?.name}</T><T v="small" muted>{s.frame_count} photos · {ago(s.captured_at)}</T></View>
                <Pill label={s.status} level={s.status === "published" ? "good" : s.status === "rejected" ? "high" : "warn"} />
              </Card>
            </Pressable>
          ))}
        </>
      )}
      <Button title="Refresh" variant="ghost" small onPress={reload} />

      <DestinationPicker visible={!!picker} title={picker === "scene" ? "Where are you capturing?" : "Where are you counting?"}
        onClose={() => setPicker(null)}
        onPick={(d) => {
          if (picker === "scene") router.push({ pathname: "/capture", params: { id: d.id, name: d.name, lat: String(d.lat), lng: String(d.lng) } });
          else setCountFor(d);
        }} />
    </Screen>
  );
}
