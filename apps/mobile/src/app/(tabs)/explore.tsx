import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pressureLevel, type IconName } from "@trekne/brand";
import { PlaceCard } from "@/components/kit";
import { PlacesMap } from "@/components/places-map";
import { Icon } from "@/components/icon";
import { Dot, Loading, Row, T } from "@/components/ui";
import { addDays, must, todayIST, useLoad } from "@/lib/data";
import { verdict } from "@/lib/glance";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const STATES = [["All", "All"], ["ML", "Meghalaya"], ["AS", "Assam"], ["AR", "Arunachal"], ["NL", "Nagaland"], ["MN", "Manipur"], ["MZ", "Mizoram"], ["TR", "Tripura"], ["SK", "Sikkim"]] as const;
const FILTERS: { key: string; label: string; icon: IconName }[] = [
  { key: "go", label: "Good to go", icon: "check" },
  { key: "quiet", label: "Quiet", icon: "users" },
  { key: "season", label: "In season", icon: "sun" },
  { key: "gem", label: "Gems", icon: "leaf" },
];

export default function Explore() {
  const b = useBrand();
  const [view, setView] = useState<"list" | "map">("list");
  const [state, setState] = useState("All");
  const [filters, setFilters] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const day = addDays(todayIST(), offset);
  const { data, loading } = useLoad(() => must(supabase.rpc("destination_overview", { on_day: day })), [day],
    ["visitor_counts", "community_notices", "trip_stops", "trips", "reports", "destinations", "seasonal_conditions"]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? [])
      .filter((d) => state === "All" || d.state_code === state)
      .filter((d) => !s || `${d.name} ${d.district} ${d.ecosystem} ${d.kind}`.toLowerCase().includes(s))
      .filter((d) => !filters.includes("go") || verdict(d).level === "good")
      .filter((d) => !filters.includes("quiet") || pressureLevel(d.load_ratio == null ? null : Number(d.load_ratio)) === "good")
      .filter((d) => !filters.includes("season") || d.suitability === "good")
      .filter((d) => !filters.includes("gem") || d.is_lesser_known)
      .sort((a, c) => a.risk_score - c.risk_score);
  }, [data, state, q, filters]);

  const chip = (active: boolean, tone = b.text) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: active ? tone : b.surface });
  const dayLabel = (n: number) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : new Date(addDays(todayIST(), n) + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: b.bg }}>
      <View style={{ paddingHorizontal: 16, gap: 10, paddingBottom: 10 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T v="h1">Explore</T>
          <Row gap={4} style={{ backgroundColor: b.chip, borderRadius: radius.pill, padding: 3 }}>
            {(["list", "map"] as const).map((v) => (
              <Pressable key={v} onPress={() => setView(v)} accessibilityRole="button" accessibilityState={{ selected: view === v }}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: view === v ? b.text : "transparent" }}>
                <Icon name={v === "list" ? "menu" : "map"} size={16} color={view === v ? b.bg : b.text} />
                <T v="small" color={view === v ? b.bg : b.text} style={{ fontFamily: F.bold, textTransform: "capitalize" }}>{v}</T>
              </Pressable>
            ))}
          </Row>
        </Row>
        <Row style={{ backgroundColor: b.surface, borderRadius: radius.pill, paddingHorizontal: 16 }}>
          <Icon name="search" size={19} color={b.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Root bridge, wetland, monastery…" placeholderTextColor={b.muted}
            style={{ flex: 1, paddingVertical: 12, fontFamily: F.body, fontSize: 16, color: b.text }} />
        </Row>
        {/* when */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {Array.from({ length: 8 }, (_, n) => (
            <Pressable key={n} onPress={() => setOffset(n)} style={chip(offset === n, b.orange)}>
              <Icon name="calendar" size={15} color={offset === n ? b.ink : b.muted} />
              <T v="small" color={offset === n ? b.ink : b.text} style={{ fontFamily: F.bold }}>{dayLabel(n)}</T>
            </Pressable>
          ))}
        </ScrollView>
        {/* what */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {FILTERS.map((f) => {
            const on = filters.includes(f.key);
            return (
              <Pressable key={f.key} onPress={() => setFilters(on ? filters.filter((x) => x !== f.key) : [...filters, f.key])} style={chip(on, b.green)}
                accessibilityRole="button" accessibilityState={{ selected: on }}>
                <Icon name={f.icon} size={15} color={on ? b.ink : b.muted} />
                <T v="small" color={on ? b.ink : b.text} style={{ fontFamily: F.bold }}>{f.label}</T>
              </Pressable>
            );
          })}
          {STATES.map(([code, name]) => (
            <Pressable key={code} onPress={() => setState(code)} style={chip(state === code)}>
              <T v="small" color={state === code ? b.bg : b.text} style={{ fontFamily: F.bold }}>{name}</T>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading && !data ? <Loading /> : view === "map" ? (
        <PlacesMap places={list} onOpen={(slug) => router.push(`/destination/${slug}`)} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 12, paddingBottom: 120 }}>
          <T v="small" muted>{list.length} place{list.length === 1 ? "" : "s"} · {dayLabel(offset).toLowerCase()} · calmest first</T>
          {list.map((d) => {
            const v = verdict(d);
            return (
              <PlaceCard key={d.id} slug={d.slug} name={d.name} sub={`${d.district} · ${d.state_code}${d.is_lesser_known ? " · gem" : ""}`} overview={d}
                height={200} onPress={() => router.push(`/destination/${d.slug}`)}
                badge={{ label: v.title, tone: v.level === "good" ? "green" : v.level === "warn" ? "yellow" : "orange", icon: v.level === "good" ? "check" : "alert" }} />
            );
          })}
          {!list.length && <T muted style={{ textAlign: "center", padding: 30 }}>Nothing matches. Try removing a filter.</T>}
          <Row style={{ justifyContent: "center", gap: 14, paddingTop: 6, flexWrap: "wrap" }}>
            <Row gap={6}><Dot level="good" size={9} /><T v="small" muted>Fine</T></Row>
            <Row gap={6}><Dot level="warn" size={9} /><T v="small" muted>Watch</T></Row>
            <Row gap={6}><Dot level="high" size={9} /><T v="small" muted>Problem</T></Row>
            <Row gap={6}><Dot level="none" size={9} /><T v="small" muted>Not verified</T></Row>
          </Row>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
