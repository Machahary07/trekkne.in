import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { LEVEL_COLOR, pressureLevel, type IconName, type Level } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";
import { DestinationPicker } from "@/components/destination-picker";
import { Icon } from "@/components/icon";
import { Carousel, DateTile, PlaceThumb, PointsHint, Press, Ring, SignalChip } from "@/components/kit";
import { Button, Loading, Pill, Row, T } from "@/components/ui";
import { addDays, fmtDay, must, useLoad } from "@/lib/data";
import type { Signal } from "@/lib/glance";
import { photoFor } from "@/lib/photos";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

interface Flag { level: Level; text: string; icon: IconName }
type Alt = { id: string; slug: string; name: string; distance_km: number; risk_score: number; is_lesser_known: boolean };
const RANK: Record<Level, number> = { high: 0, warn: 1, none: 2, good: 3 };

export default function TripScreen() {
  const b = useBrand();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pickDay, setPickDay] = useState<string | null>(null);
  const [alts, setAlts] = useState<Record<string, Alt[] | "loading">>({});
  const [open, setOpen] = useState<string | null>(null);

  const { data, loading, reload } = useLoad(async () => {
    const trip = await must(supabase.from("trips").select("*").eq("id", id).single());
    const stops = await must(supabase.from("trip_stops").select("id,day,position,destination_id,destinations(name,slug,state_code,is_lesser_known)").eq("trip_id", id).order("day").order("position"));
    const days: string[] = [];
    for (let d = trip.start_date; d <= trip.end_date; d = addDays(d, 1)) days.push(d);
    const [overviews, events, notices] = await Promise.all([
      Promise.all(days.map((d) => must(supabase.rpc("destination_overview", { on_day: d })))),
      must(supabase.from("events").select("name,state_code,destination_id,starts_on,ends_on,visitor_impact,open_to_visitors").eq("is_published", true).lte("starts_on", trip.end_date).gte("ends_on", trip.start_date)),
      must(supabase.from("community_notices").select("destination_id,kind,title,starts_on,ends_on,community").eq("is_active", true).lte("starts_on", trip.end_date).gte("ends_on", trip.start_date)),
    ]);
    const byDay = Object.fromEntries(days.map((d, i) => [d, new Map(overviews[i].map((o) => [o.id, o]))]));
    return { trip, stops, days, byDay, events, notices };
  }, [id], ["trips", "trip_stops", "community_notices", "events", "visitor_counts", "reports"]);

  if (loading && !data) return <Loading />;
  if (!data) return null;
  const { trip, stops, days, byDay, events, notices } = data;
  const draft = trip.status === "draft";

  /** Signals (crowd includes your group while drafting) plus every warning, each with an icon. */
  function check(o: DestinationOverview | undefined, day: string, destId: string, state: string) {
    const flags: Flag[] = [];
    if (!o) return { flags: [{ level: "none" as Level, text: "No live data for this place", icon: "info" as IconName }], signals: [] as Signal[] };
    notices.filter((n) => n.destination_id === destId && n.starts_on <= day && n.ends_on >= day).forEach((n) =>
      flags.push({ level: n.kind === "closure" || n.kind === "sacred_day" ? "high" : "warn", text: `${n.title}${n.community ? ` · ${n.community}` : ""}`, icon: "flag" }));
    const expected = (o.expected ?? 0) + (draft ? trip.party_size : 0);
    const ratio = o.capacity && o.expected != null ? expected / o.capacity : null;
    const crowd = pressureLevel(ratio);
    if (ratio == null) flags.push({ level: "none", text: "Crowd not verified: no reliable count", icon: "users" });
    else if (crowd === "high") flags.push({ level: "high", text: `Packed: ~${expected} expected for ${o.capacity} a day`, icon: "users" });
    else if (crowd === "warn") flags.push({ level: "warn", text: `Busy: ${Math.round(ratio * 100)}% of capacity`, icon: "users" });
    else flags.push({ level: "good", text: `Quiet: ${Math.round(ratio * 100)}% of capacity`, icon: "users" });
    if (!o.community_closed) {
      if (o.suitability === "closed") flags.push({ level: "high", text: "Closed this month", icon: "sun" });
      else if (o.suitability === "poor") flags.push({ level: "high", text: "Poor season: weather limits access", icon: "rain" });
      else if (o.suitability === "fair") flags.push({ level: "warn", text: "Okay season", icon: "sun" });
      else if (o.suitability === "good") flags.push({ level: "good", text: "Great season", icon: "sun" });
    }
    if (o.risk_level === "high") flags.push({ level: "high", text: `High eco-risk (${o.risk_score}/100)`, icon: "leaf" });
    events.filter((e) => e.starts_on <= day && e.ends_on >= day && (e.destination_id === destId || (!e.destination_id && e.state_code === state)))
      .forEach((e) => flags.push({ level: e.visitor_impact === "low" ? "good" : "warn", text: `${e.name}: expect crowds${e.open_to_visitors ? "" : " (community only)"}`, icon: "calendar" }));
    flags.sort((a, c) => RANK[a.level] - RANK[c.level]);
    const seasonLvl: Level = o.community_closed || o.suitability === "closed" || o.suitability === "poor" ? "high" : o.suitability === "fair" ? "warn" : o.suitability === "good" ? "good" : "none";
    const signals: Signal[] = [
      { key: "crowd", icon: "users", level: crowd, word: { good: "Quiet", warn: "Busy", high: "Packed", none: "Unknown" }[crowd], label: "Crowd" },
      { key: "season", icon: "sun", level: seasonLvl, word: o.community_closed ? "Closed" : { good: "Great", warn: "Okay", high: o.suitability === "closed" ? "Closed" : "Poor", none: "Unknown" }[seasonLvl], label: "Season" },
      { key: "eco", icon: "leaf", level: o.risk_level, word: { good: "Low", warn: "Medium", high: "High", none: "Unknown" }[o.risk_level], label: "Eco-risk" },
    ];
    return { flags, signals };
  }

  async function findAlts(stopId: string, destId: string, day: string) {
    setAlts((a) => ({ ...a, [stopId]: "loading" }));
    const list = await must(supabase.rpc("suggest_alternatives", { dest: destId, on_day: day, max_results: 4 }));
    setAlts((a) => ({ ...a, [stopId]: list }));
  }
  async function run(p: PromiseLike<{ error: { message: string } | null }>) {
    const { error } = await p;
    if (error) Alert.alert("Something went wrong", error.message);
    reload();
  }

  const checked = stops.map((s) => ({ s, ...check(byDay[s.day]?.get(s.destination_id), s.day, s.destination_id, s.destinations?.state_code ?? "") }));
  const bad = checked.filter((c) => c.flags.some((f) => f.level === "high")).length;
  const health = stops.length ? (stops.length - bad) / stops.length : 0;
  const gems = stops.filter((s) => s.destinations?.is_lesser_known).length;
  const cover = photoFor(stops[0]?.destinations?.slug);

  return (
    <View style={{ flex: 1, backgroundColor: b.bg }}>
      <Stack.Screen options={{ title: trip.title }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}>
        {/* Trip card with health ring */}
        <View style={{ borderRadius: radius.xl, overflow: "hidden", backgroundColor: b.orange, minHeight: 190 }}>
          {cover && <Image source={cover.src} style={{ position: "absolute", inset: 0 }} contentFit="cover" />}
          {cover && <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(16,19,31,.55)" }} />}
          <View style={{ padding: 18, gap: 12, flex: 1, justifyContent: "flex-end" }}>
            <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Pill label={trip.status === "planned" ? "Confirmed" : trip.status} bg={trip.status === "planned" ? b.green : b.yellow} />
                <T v="h1" color={cover ? "#fff" : b.ink} style={{ fontSize: 30, lineHeight: 32 }}>{trip.title}</T>
                <Row gap={12}>
                  <Row gap={5}><Icon name="calendar" size={15} color={cover ? "#fff" : b.ink} /><T v="small" color={cover ? "#fff" : b.ink}>{fmtDay(trip.start_date)} – {fmtDay(trip.end_date)}</T></Row>
                  <Row gap={5}><Icon name="users" size={15} color={cover ? "#fff" : b.ink} /><T v="small" color={cover ? "#fff" : b.ink}>{trip.party_size}</T></Row>
                </Row>
              </View>
              {stops.length > 0 && (
                <Ring value={health} size={78} stroke={8} color={bad ? b.orange : b.green} track="rgba(255,255,255,.25)">
                  <T v="h3" color="#fff" style={{ fontSize: 18 }}>{Math.round(health * 100)}%</T>
                  <T v="label" color="#fff" style={{ fontSize: 9 }}>healthy</T>
                </Ring>
              )}
            </Row>
          </View>
        </View>

        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <Pill level={bad ? "high" : "good"} label={bad ? `${bad} stop${bad > 1 ? "s" : ""} to fix` : stops.length ? "All stops look good" : "Add your first stop"} />
          {gems > 0 && <Pill level="good" label={`${gems} hidden gem${gems > 1 ? "s" : ""}`} />}
        </Row>

        {draft ? (
          <View style={{ gap: 6 }}>
            <Button title="Confirm this plan" icon="check" variant="green" disabled={!stops.length} onPress={() => run(supabase.from("trips").update({ status: "planned" }).eq("id", trip.id))} />
            <Row gap={6} style={{ flexWrap: "wrap" }}>
              <PointsHint points={20} label="when you confirm" />
              {gems > 0 && <PointsHint points={30 * gems} label="for gems" />}
            </Row>
          </View>
        ) : trip.status === "planned" ? (
          <Button title="Edit plan (back to draft)" variant="ghost" small onPress={() => run(supabase.from("trips").update({ status: "draft" }).eq("id", trip.id))} />
        ) : null}

        {days.map((day, di) => (
          <View key={day} style={{ gap: 10 }}>
            <Row gap={12}>
              <DateTile iso={day} tone={checked.some((c) => c.s.day === day && c.flags.some((f) => f.level === "high")) ? "orange" : "green"} />
              <View><T v="h2" style={{ fontSize: 24 }}>Day {di + 1}</T><T v="small" muted>{fmtDay(day)}</T></View>
            </Row>
            {checked.filter((c) => c.s.day === day).map(({ s, flags, signals }) => {
              const worst = flags[0];
              const isBad = worst?.level === "high";
              const a = alts[s.id];
              const expanded = open === s.id;
              return (
                <View key={s.id} style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 12, gap: 10, borderWidth: isBad ? 2 : 0, borderColor: b.orange }}>
                  <Pressable onPress={() => setOpen(expanded ? null : s.id)} style={{ flexDirection: "row", gap: 12, alignItems: "center" }} accessibilityRole="button" accessibilityLabel={`${s.destinations?.name}, ${expanded ? "hide" : "show"} details`}>
                    <PlaceThumb slug={s.destinations?.slug} size={60} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Row gap={6}><T v="h3" numberOfLines={1} style={{ flexShrink: 1 }}>{s.destinations?.name}</T>{s.destinations?.is_lesser_known && <Icon name="leaf" size={15} color={b.green} />}</Row>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>{signals.map((x) => <SignalChip key={x.key} s={x} size="sm" />)}</View>
                    </View>
                    <Pressable hitSlop={10} accessibilityLabel={`Remove ${s.destinations?.name}`} onPress={() => run(supabase.from("trip_stops").delete().eq("id", s.id))}>
                      <Icon name="close" size={18} color={b.muted} />
                    </Pressable>
                  </Pressable>
                  {/* the single most important thing, or all of them when expanded */}
                  {(expanded ? flags : worst && worst.level !== "good" ? [worst] : []).map((f, k) => (
                    <Row key={k} gap={8}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: LEVEL_COLOR[f.level] ?? "transparent", borderWidth: f.level === "none" ? 2 : 0, borderColor: b.muted, alignItems: "center", justifyContent: "center" }}>
                        <Icon name={f.icon} size={13} color={f.level === "none" ? b.muted : b.ink} />
                      </View>
                      <T v="small" style={{ flex: 1 }}>{f.text}</T>
                    </Row>
                  ))}
                  {!expanded && flags.length > 1 && <T v="small" color={b.orange} style={{ fontFamily: F.bold }} onPress={() => setOpen(s.id)}>See all {flags.length} checks</T>}
                  {isBad && !a && <Button title="Find a quieter place" icon="leaf" small variant="green" onPress={() => findAlts(s.id, s.destination_id, day)} />}
                  {a === "loading" && <T v="small" muted>Looking for calmer places nearby…</T>}
                  {Array.isArray(a) && (a.length ? (
                    <Carousel pad={12} gap={8}>
                      {a.map((alt) => (
                        <View key={alt.id} style={{ width: 170, backgroundColor: b.surface2, borderRadius: radius.md, overflow: "hidden" }}>
                          {photoFor(alt.slug) ? <Image source={photoFor(alt.slug)!.src} style={{ height: 80 }} contentFit="cover" /> : <View style={{ height: 80, backgroundColor: b.blue }} />}
                          <View style={{ padding: 10, gap: 6 }}>
                            <T style={{ fontFamily: F.bold }} numberOfLines={1}>{alt.name}</T>
                            <T v="small" muted>{alt.distance_km} km · risk {alt.risk_score}{alt.is_lesser_known ? " · gem" : ""}</T>
                            <Button title="Swap" small variant="ink" onPress={() => { setAlts((x) => { const n = { ...x }; delete n[s.id]; return n; }); run(supabase.from("trip_stops").update({ destination_id: alt.id }).eq("id", s.id)); }} />
                          </View>
                        </View>
                      ))}
                    </Carousel>
                  ) : <T v="small" muted>No calmer place nearby that day. Try another date.</T>)}
                </View>
              );
            })}
            <Press onPress={() => setPickDay(day)} style={{ borderRadius: radius.lg, borderWidth: 2, borderStyle: "dashed", borderColor: b.line, padding: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
              <Icon name="plus" size={18} color={b.muted} /><T muted style={{ fontFamily: F.semibold }}>Add a place</T>
            </Press>
          </View>
        ))}

        <Button title="Delete trip" variant="ghost" small onPress={() => Alert.alert("Delete trip?", trip.title, [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: async () => { await supabase.from("trips").delete().eq("id", trip.id); router.back(); } },
        ])} />
      </ScrollView>

      <DestinationPicker visible={!!pickDay} day={pickDay ?? undefined} title={pickDay ? `Add to ${fmtDay(pickDay)}` : ""}
        onClose={() => setPickDay(null)}
        onPick={(d) => pickDay && run(supabase.from("trip_stops").insert({ trip_id: trip.id, destination_id: d.id, day: pickDay, position: stops.filter((s) => s.day === pickDay).length }))} />
    </View>
  );
}
