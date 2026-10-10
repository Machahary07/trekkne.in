import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { Icon } from "@/components/icon";
import { Button, Card, Empty, Eyebrow, Pill, Row, Screen, T } from "@/components/ui";
import { addDays, fmtDay, must, todayIST, useLoad } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

function Stepper({ label, value, set, min, max, format }: { label: string; value: number; set: (n: number) => void; min: number; max: number; format?: (n: number) => string }) {
  const b = useBrand();
  const btn = { width: 40, height: 40, borderRadius: 20, backgroundColor: b.chip, alignItems: "center" as const, justifyContent: "center" as const };
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <T v="label">{label}</T>
      <Row gap={10}>
        <Pressable style={btn} onPress={() => set(Math.max(min, value - 1))} accessibilityLabel={`Less ${label}`}><T v="h3">−</T></Pressable>
        <T v="h3" style={{ minWidth: 110, textAlign: "center" }}>{format ? format(value) : value}</T>
        <Pressable style={btn} onPress={() => set(Math.min(max, value + 1))} accessibilityLabel={`More ${label}`}><T v="h3">+</T></Pressable>
      </Row>
    </Row>
  );
}

export default function Plan() {
  const b = useBrand();
  const today = todayIST();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [startIn, setStartIn] = useState(7);
  const [days, setDays] = useState(3);
  const [party, setParty] = useState(2);
  const [busy, setBusy] = useState(false);
  const { data: trips } = useLoad(() =>
    must(supabase.from("trips").select("id,title,start_date,end_date,party_size,status,trip_stops(id)").order("start_date", { ascending: false })),
  );

  async function create() {
    setBusy(true);
    const start = addDays(today, startIn);
    const { data, error } = await supabase.from("trips")
      .insert({ title: title.trim() || "My Northeast trip", start_date: start, end_date: addDays(start, days - 1), party_size: party })
      .select("id").single();
    setBusy(false);
    if (error) return Alert.alert("Couldn't create trip", error.message);
    setCreating(false);
    setTitle("");
    router.push(`/trip/${data.id}`);
  }

  const upcoming = (trips ?? []).filter((t) => t.end_date >= today && t.status !== "cancelled");
  const past = (trips ?? []).filter((t) => !(t.end_date >= today && t.status !== "cancelled"));

  return (
    <Screen>
      <T v="h1">Plan</T>
      <T muted>Trips are checked against carrying capacity, seasons, festivals and eco-risk, and we suggest quieter alternatives when a place is under pressure.</T>

      {creating ? (
        <Card style={{ gap: 14 }}>
          <T v="h2">New trip</T>
          <TextInput value={title} onChangeText={setTitle} placeholder="Trip name, e.g. Meghalaya with family" placeholderTextColor={b.muted}
            style={{ backgroundColor: b.surface2, borderRadius: radius.sm, padding: 14, fontFamily: F.body, fontSize: 16, color: b.text, borderWidth: 1.5, borderColor: b.line }} />
          <Stepper label="Starts" value={startIn} set={setStartIn} min={0} max={365} format={(n) => fmtDay(addDays(today, n))} />
          <Stepper label="Days" value={days} set={setDays} min={1} max={14} />
          <Stepper label="Travellers" value={party} set={setParty} min={1} max={60} />
          <Row>
            <Button title="Cancel" variant="ghost" onPress={() => setCreating(false)} style={{ flex: 1 }} />
            <Button title="Create" icon="check" onPress={create} loading={busy} style={{ flex: 1 }} />
          </Row>
        </Card>
      ) : (
        <Button title="New trip" icon="plus" onPress={() => setCreating(true)} />
      )}

      <Eyebrow>Upcoming</Eyebrow>
      {upcoming.length ? upcoming.map((t) => <TripCard key={t.id} t={t} />) : <Empty icon="route" title="No trips yet" body="Plan one and we'll check each day for crowding, weather season and festivals." />}
      {past.length > 0 && <><Eyebrow>Past & cancelled</Eyebrow>{past.map((t) => <TripCard key={t.id} t={t} />)}</>}
    </Screen>
  );
}

function TripCard({ t }: { t: { id: string; title: string; start_date: string; end_date: string; party_size: number; status: string; trip_stops: { id: string }[] } }) {
  const b = useBrand();
  return (
    <Pressable onPress={() => router.push(`/trip/${t.id}`)} style={{ backgroundColor: b.surface, borderRadius: radius.md, padding: 16, gap: 8 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <T v="h3" style={{ flex: 1 }}>{t.title}</T>
        <Pill label={t.status} level={t.status === "planned" ? "good" : t.status === "draft" ? "warn" : undefined} />
      </Row>
      <Row gap={14}>
        <Row gap={6}><Icon name="calendar" size={17} color={b.muted} /><T v="small" muted>{fmtDay(t.start_date)} – {fmtDay(t.end_date)}</T></Row>
        <Row gap={6}><Icon name="users" size={17} color={b.muted} /><T v="small" muted>{t.party_size}</T></Row>
        <Row gap={6}><Icon name="pin" size={17} color={b.muted} /><T v="small" muted>{t.trip_stops.length} stops</T></Row>
      </Row>
      <View />
    </Pressable>
  );
}
