import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEVEL_COLOR, SUITABILITY_LABEL, SUITABILITY_LEVEL, brand, pressureLevel } from "@trekne/brand";
import { Icon } from "@/components/icon";
import { Dot, Loading, Pill, RiskPill, Row, T } from "@/components/ui";
import { addDays, fmtDay, must, todayIST, useLoad } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const STATES = ["All", "ML", "AS", "AR", "NL", "MN", "MZ", "TR", "SK"];

export default function Explore() {
  const b = useBrand();
  const [view, setView] = useState<"list" | "map">("list");
  const [state, setState] = useState("All");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const day = addDays(todayIST(), offset);
  const { data, loading } = useLoad(() => must(supabase.rpc("destination_overview", { on_day: day })), [day]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? [])
      .filter((d) => state === "All" || d.state_code === state)
      .filter((d) => !s || `${d.name} ${d.district} ${d.ecosystem} ${d.kind}`.toLowerCase().includes(s))
      .sort((a, c) => a.risk_score - c.risk_score);
  }, [data, state, q]);

  const chip = (active: boolean) => ({ paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: active ? b.text : b.chip });

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: b.bg }}>
      <View style={{ paddingHorizontal: 16, gap: 10, paddingBottom: 10 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T v="h1">Explore</T>
          <Row gap={4} style={{ backgroundColor: b.chip, borderRadius: radius.pill, padding: 3 }}>
            {(["list", "map"] as const).map((v) => (
              <Pressable key={v} onPress={() => setView(v)} style={{ paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: view === v ? b.text : "transparent" }}>
                <T v="small" color={view === v ? b.bg : b.text} style={{ fontFamily: F.bold, textTransform: "capitalize" }}>{v}</T>
              </Pressable>
            ))}
          </Row>
        </Row>
        <Row style={{ backgroundColor: b.surface, borderRadius: radius.pill, paddingHorizontal: 16, borderWidth: 1.5, borderColor: b.line }}>
          <Icon name="search" size={19} color={b.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Root bridge, wetland, monastery…" placeholderTextColor={b.muted}
            style={{ flex: 1, paddingVertical: 12, fontFamily: F.body, fontSize: 16, color: b.text }} />
        </Row>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {STATES.map((s) => (
            <Pressable key={s} onPress={() => setState(s)} style={chip(state === s)}>
              <T v="small" color={state === s ? b.bg : b.text} style={{ fontFamily: F.bold }}>{s}</T>
            </Pressable>
          ))}
        </ScrollView>
        <Row style={{ justifyContent: "space-between" }}>
          <T v="small" muted>Conditions for <T v="small" style={{ fontFamily: F.bold }}>{offset === 0 ? "today" : fmtDay(day)}</T></T>
          <Row gap={6}>
            <Pressable onPress={() => setOffset(Math.max(0, offset - 1))} style={chip(false)}><T v="small">‹</T></Pressable>
            <Pressable onPress={() => setOffset(offset + 1)} style={chip(false)}><T v="small">›</T></Pressable>
          </Row>
        </Row>
      </View>

      {loading && !data ? <Loading /> : view === "map" ? (
        <MapView style={{ flex: 1 }} initialRegion={{ latitude: 25.9, longitude: 92.9, latitudeDelta: 7.5, longitudeDelta: 7.5 }}>
          {list.map((d) => (
            <Marker key={d.id} coordinate={{ latitude: d.lat, longitude: d.lng }} title={d.name}
              description={`Eco-risk ${d.risk_score} · ${d.load_ratio != null ? Math.round(d.load_ratio * 100) + "% of capacity" : "no count"}`}
              pinColor={LEVEL_COLOR[d.risk_level] ?? brand.blue}
              onCalloutPress={() => router.push(`/destination/${d.slug}`)} />
          ))}
        </MapView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 10, paddingBottom: 120 }}>
          {list.map((d) => (
            <Pressable key={d.id} onPress={() => router.push(`/destination/${d.slug}`)}
              style={{ backgroundColor: b.surface, borderRadius: radius.md, padding: 16, gap: 10 }}>
              <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <T v="h3">{d.name}</T>
                  <T v="small" muted>{d.district} · {d.state_code} · {d.ecosystem}</T>
                </View>
                <RiskPill level={d.risk_level} score={d.risk_score} />
              </Row>
              <Row gap={6} style={{ flexWrap: "wrap" }}>
                {d.suitability && <Pill level={SUITABILITY_LEVEL[d.suitability]} label={SUITABILITY_LABEL[d.suitability]} />}
                <Pill level={pressureLevel(d.load_ratio)} label={d.load_ratio != null ? `${Math.round(d.load_ratio * 100)}% busy` : "Pressure unknown"} />
                {d.is_lesser_known && <Pill label="Lesser-known" color={b.green} />}
              </Row>
            </Pressable>
          ))}
          {!list.length && <T muted style={{ textAlign: "center", padding: 30 }}>Nothing matches.</T>}
          <Row style={{ justifyContent: "center", gap: 14, paddingTop: 6 }}>
            <Row gap={6}><Dot level="good" size={9} /><T v="small" muted>Low risk</T></Row>
            <Row gap={6}><Dot level="warn" size={9} /><T v="small" muted>Moderate</T></Row>
            <Row gap={6}><Dot level="high" size={9} /><T v="small" muted>High</T></Row>
          </Row>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
