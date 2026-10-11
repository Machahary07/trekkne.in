import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import type { IconName } from "@trekne/brand";
import { Icon } from "@/components/icon";
import { IconTile, PlaceThumb, PointsHint, Press, SectionTitle } from "@/components/kit";
import { Eyes } from "@/components/mascot";
import { Button, Pill, Row, Screen, T } from "@/components/ui";
import { addDays, fmtDay, must, todayIST, useLoad } from "@/lib/data";
import { photoFor } from "@/lib/photos";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

function Stepper({ icon, label, value, set, min, max, format }: { icon: IconName; label: string; value: number; set: (n: number) => void; min: number; max: number; format?: (n: number) => string }) {
  const b = useBrand();
  const btn = { width: 40, height: 40, borderRadius: 20, backgroundColor: b.chip, alignItems: "center" as const, justifyContent: "center" as const };
  return (
    <Row style={{ backgroundColor: b.surface2, borderRadius: radius.pill, padding: 6, paddingLeft: 8 }}>
      <IconTile icon={icon} tone="yellow" size={36} round />
      <T v="label" style={{ flex: 1 }}>{label}</T>
      <Pressable style={btn} onPress={() => set(Math.max(min, value - 1))} accessibilityLabel={`Less ${label}`}><Icon name="minus" size={16} color={b.text} /></Pressable>
      <T v="h3" style={{ minWidth: 92, textAlign: "center" }}>{format ? format(value) : value}</T>
      <Pressable style={btn} onPress={() => set(Math.min(max, value + 1))} accessibilityLabel={`More ${label}`}><Icon name="plus" size={16} color={b.text} /></Pressable>
    </Row>
  );
}

type TripRow = { id: string; title: string; start_date: string; end_date: string; party_size: number; status: string; trip_stops: { id: string; destinations: { slug: string; is_lesser_known: boolean } | null }[] };

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
    must(supabase.from("trips").select("id,title,start_date,end_date,party_size,status,trip_stops(id,destinations(slug,is_lesser_known))").order("start_date", { ascending: false })),
  [], ["trips", "trip_stops"]);

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

      {creating ? (
        <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 16, gap: 12 }}>
          <T v="h2">New trip</T>
          <TextInput value={title} onChangeText={setTitle} placeholder="Name it, e.g. Meghalaya with family" placeholderTextColor={b.muted}
            style={{ backgroundColor: b.surface2, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 13, fontFamily: F.body, fontSize: 16, color: b.text }} />
          <Stepper icon="calendar" label="Start" value={startIn} set={setStartIn} min={0} max={365} format={(n) => fmtDay(addDays(today, n))} />
          <Stepper icon="clock" label="Days" value={days} set={setDays} min={1} max={14} />
          <Stepper icon="users" label="People" value={party} set={setParty} min={1} max={60} />
          <Row>
            <Button title="Cancel" variant="ghost" onPress={() => setCreating(false)} style={{ flex: 1 }} />
            <Button title="Create" icon="check" variant="green" onPress={create} loading={busy} style={{ flex: 1 }} />
          </Row>
        </View>
      ) : (
        <Press onPress={() => setCreating(true)} style={{ backgroundColor: b.green, borderRadius: radius.xl, padding: 20, flexDirection: "row", alignItems: "center", gap: 14, overflow: "hidden" }}>
          <View style={{ flex: 1, gap: 6 }}>
            <T v="h2" color={b.ink}>Start a new trip</T>
            <T v="small" color={b.ink} style={{ opacity: 0.8 }}>We check every stop for crowds, season, festivals and closures.</T>
            <PointsHint points={20} label="per confirmed trip" />
          </View>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: b.ink, alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={26} color="#fff" /></View>
        </Press>
      )}

      <SectionTitle title="Upcoming" />
      {upcoming.length ? upcoming.map((t) => <TripCard key={t.id} t={t} />) : (
        <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 20, alignItems: "center", gap: 10 }}>
          <View style={{ backgroundColor: b.orange, borderRadius: 40, padding: 14 }}><Eyes size={34} /></View>
          <T v="h3">No trips yet</T>
          <T v="small" muted style={{ textAlign: "center" }}>Start one and add places to each day.</T>
        </View>
      )}
      {past.length > 0 && <><SectionTitle title="Past & cancelled" />{past.map((t) => <TripCard key={t.id} t={t} />)}</>}
    </Screen>
  );
}

function TripCard({ t }: { t: TripRow }) {
  const b = useBrand();
  const cover = photoFor(t.trip_stops[0]?.destinations?.slug);
  const gems = t.trip_stops.filter((s) => s.destinations?.is_lesser_known).length;
  const fg = cover ? "#fff" : b.ink;
  return (
    <Press onPress={() => router.push(`/trip/${t.id}`)} style={{ borderRadius: radius.lg, overflow: "hidden", backgroundColor: b.yellow, minHeight: 150 }}>
      {cover && <Image source={cover.src} style={{ position: "absolute", inset: 0 }} contentFit="cover" />}
      {cover && <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(16,19,31,.5)" }} />}
      <View style={{ padding: 16, gap: 10, flex: 1, justifyContent: "space-between" }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Pill label={t.status === "planned" ? "Confirmed" : t.status} bg={t.status === "planned" ? b.green : t.status === "draft" ? "#FFFFFF" : b.chip} />
          {gems > 0 && <Pill label={`${gems} gem${gems > 1 ? "s" : ""}`} bg={b.yellow} />}
        </Row>
        <View style={{ gap: 6 }}>
          <T v="h2" color={fg} style={{ fontSize: 24 }} numberOfLines={1}>{t.title}</T>
          <Row gap={14}>
            <Row gap={5}><Icon name="calendar" size={15} color={fg} /><T v="small" color={fg}>{fmtDay(t.start_date)} – {fmtDay(t.end_date)}</T></Row>
            <Row gap={5}><Icon name="users" size={15} color={fg} /><T v="small" color={fg}>{t.party_size}</T></Row>
          </Row>
          <Row gap={4}>
            {t.trip_stops.slice(0, 5).map((s) => <PlaceThumb key={s.id} slug={s.destinations?.slug} size={30} />)}
            {t.trip_stops.length === 0 && <T v="small" color={fg}>No stops yet</T>}
            {t.trip_stops.length > 5 && <T v="small" color={fg}>+{t.trip_stops.length - 5}</T>}
          </Row>
        </View>
      </View>
    </Press>
  );
}
