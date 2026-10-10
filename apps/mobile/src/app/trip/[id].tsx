import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { SUITABILITY_LABEL, type Level } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";
import { DestinationPicker } from "@/components/destination-picker";
import { Icon } from "@/components/icon";
import { Button, Card, Dot, Eyebrow, Loading, Pill, Row, Screen, T } from "@/components/ui";
import { addDays, fmtDay, must, useLoad } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

interface Flag { level: Level; text: string }
type Alt = { id: string; slug: string; name: string; distance_km: number; risk_score: number };

export default function TripScreen() {
  const b = useBrand();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pickDay, setPickDay] = useState<string | null>(null);
  const [alts, setAlts] = useState<Record<string, Alt[] | "loading">>({});

  const { data, loading, reload } = useLoad(async () => {
    const trip = await must(supabase.from("trips").select("*").eq("id", id).single());
    const stops = await must(supabase.from("trip_stops").select("id,day,position,destination_id,destinations(name,slug,state_code)").eq("trip_id", id).order("day").order("position"));
    const days: string[] = [];
    for (let d = trip.start_date; d <= trip.end_date; d = addDays(d, 1)) days.push(d);
    const [overviews, events] = await Promise.all([
      Promise.all(days.map((d) => must(supabase.rpc("destination_overview", { on_day: d })))),
      must(supabase.from("events").select("name,state_code,destination_id,starts_on,ends_on,visitor_impact,open_to_visitors").eq("is_published", true).lte("starts_on", trip.end_date).gte("ends_on", trip.start_date)),
    ]);
    const byDay = Object.fromEntries(days.map((d, i) => [d, new Map(overviews[i].map((o) => [o.id, o]))]));
    return { trip, stops, days, byDay, events };
  }, [id]);

  if (loading && !data) return <Loading />;
  if (!data) return null;
  const { trip, stops, days, byDay, events } = data;
  const draft = trip.status === "draft";

  function check(o: DestinationOverview | undefined, day: string, destId: string, state: string): Flag[] {
    const flags: Flag[] = [];
    if (!o) return [{ level: "none", text: "No live data for this place" }];
    const expected = (o.expected ?? 0) + (draft ? trip.party_size : 0);
    const ratio = o.capacity ? expected / o.capacity : null;
    if (ratio == null || o.expected == null) flags.push({ level: "none", text: "Visitor pressure unknown: no reliable count" });
    else if (ratio >= 0.9) flags.push({ level: "high", text: `Over capacity: ~${expected} expected for ${o.capacity} a day` });
    else if (ratio >= 0.6) flags.push({ level: "warn", text: `Busy: ${Math.round(ratio * 100)}% of daily capacity` });
    else flags.push({ level: "good", text: `${Math.round(ratio * 100)}% of capacity: comfortable` });
    if (o.suitability === "closed") flags.push({ level: "high", text: "Closed to visitors this month" });
    else if (o.suitability === "poor") flags.push({ level: "high", text: `${SUITABILITY_LABEL.poor}: monsoon or weather limits access` });
    else if (o.suitability === "fair") flags.push({ level: "warn", text: SUITABILITY_LABEL.fair });
    if (o.risk_level === "high") flags.push({ level: "high", text: `High eco-risk (${o.risk_score}/100)` });
    events.filter((e) => e.starts_on <= day && e.ends_on >= day && (e.destination_id === destId || (!e.destination_id && e.state_code === state)))
      .forEach((e) => flags.push({ level: e.visitor_impact === "low" ? "good" : "warn", text: `${e.name} is on${e.open_to_visitors ? "" : " (community only)"}: expect crowds, follow local etiquette` }));
    return flags;
  }

  async function findAlts(stopId: string, destId: string, day: string) {
    setAlts((a) => ({ ...a, [stopId]: "loading" }));
    const list = await must(supabase.rpc("suggest_alternatives", { dest: destId, on_day: day, max_results: 3 }));
    setAlts((a) => ({ ...a, [stopId]: list }));
  }

  async function run(p: PromiseLike<{ error: { message: string } | null }>) {
    const { error } = await p;
    if (error) Alert.alert("Something went wrong", error.message);
    reload();
  }

  const allFlags = stops.flatMap((s) => check(byDay[s.day]?.get(s.destination_id), s.day, s.destination_id, s.destinations?.state_code ?? ""));
  const high = allFlags.filter((f) => f.level === "high").length;
  const warn = allFlags.filter((f) => f.level === "warn").length;

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: trip.title }} />
      <Card style={{ gap: 8 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T v="h2" style={{ flex: 1 }}>{trip.title}</T>
          <Pill label={trip.status} level={trip.status === "planned" ? "good" : "warn"} />
        </Row>
        <T muted>{fmtDay(trip.start_date)} – {fmtDay(trip.end_date)} · {trip.party_size} traveller{trip.party_size === 1 ? "" : "s"}</T>
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <Pill level={high ? "high" : "good"} label={high ? `${high} serious issue${high === 1 ? "" : "s"}` : "No serious issues"} />
          {warn > 0 && <Pill level="warn" label={`${warn} to watch`} />}
        </Row>
        {draft ? (
          <>
            <T v="small" muted>Confirming adds your group to each place&rsquo;s expected visitors, so planners and other travellers see it.</T>
            <Button title="Confirm plan" icon="check" variant="green" disabled={!stops.length} onPress={() => run(supabase.from("trips").update({ status: "planned" }).eq("id", trip.id))} />
          </>
        ) : trip.status === "planned" ? (
          <Button title="Back to draft" variant="ghost" small onPress={() => run(supabase.from("trips").update({ status: "draft" }).eq("id", trip.id))} />
        ) : null}
      </Card>

      {days.map((day, di) => (
        <View key={day} style={{ gap: 8 }}>
          <Eyebrow>{`Day ${di + 1} · ${fmtDay(day)}`}</Eyebrow>
          {stops.filter((s) => s.day === day).map((s) => {
            const o = byDay[day]?.get(s.destination_id);
            const flags = check(o, day, s.destination_id, s.destinations?.state_code ?? "");
            const worst = flags.some((f) => f.level === "high");
            const a = alts[s.id];
            return (
              <Card key={s.id} style={{ gap: 8, borderWidth: worst ? 2 : 0, borderColor: b.orange }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Pressable style={{ flex: 1 }} onPress={() => router.push(`/destination/${s.destinations?.slug}`)}>
                    <T v="h3">{s.destinations?.name}</T>
                    <T v="small" muted>{s.destinations?.state_code}{o ? ` · eco-risk ${o.risk_score}` : ""}</T>
                  </Pressable>
                  <Pressable accessibilityLabel="Remove stop" onPress={() => run(supabase.from("trip_stops").delete().eq("id", s.id))} style={{ padding: 6 }}>
                    <Icon name="close" size={18} color={b.muted} />
                  </Pressable>
                </Row>
                {flags.map((f, k) => (
                  <Row key={k} gap={8} style={{ alignItems: "flex-start" }}><View style={{ marginTop: 5 }}><Dot level={f.level} size={9} /></View><T v="small" style={{ flex: 1 }}>{f.text}</T></Row>
                ))}
                {worst && !a && <Button title="Find quieter alternatives" icon="leaf" small variant="chip" onPress={() => findAlts(s.id, s.destination_id, day)} />}
                {a === "loading" && <T v="small" muted>Looking…</T>}
                {Array.isArray(a) && (a.length ? a.map((alt) => (
                  <Row key={alt.id} style={{ backgroundColor: b.surface2, borderRadius: radius.sm, padding: 10 }}>
                    <View style={{ flex: 1 }}><T style={{ fontFamily: F.semibold }}>{alt.name}</T><T v="small" muted>{alt.distance_km} km away · eco-risk {alt.risk_score}</T></View>
                    <Button title="Swap" small variant="green" onPress={() => { setAlts((x) => ({ ...x, [s.id]: undefined as never })); run(supabase.from("trip_stops").update({ destination_id: alt.id }).eq("id", s.id)); }} />
                  </Row>
                )) : <T v="small" muted>No lower-pressure alternatives nearby that day. Consider another date.</T>)}
              </Card>
            );
          })}
          <Pressable onPress={() => setPickDay(day)} style={{ borderRadius: radius.md, borderWidth: 2, borderStyle: "dashed", borderColor: b.line, padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
            <Icon name="plus" size={18} color={b.muted} /><T muted style={{ fontFamily: F.semibold }}>Add a place</T>
          </Pressable>
        </View>
      ))}

      <Button title="Delete trip" variant="ghost" small onPress={() => Alert.alert("Delete trip?", trip.title, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => { await supabase.from("trips").delete().eq("id", trip.id); router.back(); } },
      ])} />

      <DestinationPicker visible={!!pickDay} day={pickDay ?? undefined} title={pickDay ? `Add to ${fmtDay(pickDay)}` : ""}
        onClose={() => setPickDay(null)}
        onPick={(d) => pickDay && run(supabase.from("trip_stops").insert({ trip_id: trip.id, destination_id: d.id, day: pickDay, position: stops.filter((s) => s.day === pickDay).length }))} />
    </Screen>
  );
}
