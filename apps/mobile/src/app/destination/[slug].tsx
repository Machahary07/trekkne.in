import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MONTHS, SENSITIVITY_LEVEL, SUITABILITY_LEVEL, pressureLevel, type Level } from "@trekne/brand";
import type { DestinationAccess } from "@trekne/db";
import { Icon } from "@/components/icon";
import { Eyes } from "@/components/mascot";
import { Button, Card, Dot, Empty, Eyebrow, Loading, Pill, RiskPill, Row, Screen, StatusPill, T } from "@/components/ui";
import { addDays, ago, fmtDay, maybe, must, todayIST, useLoad } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const PHOTO = { allowed: "Photos allowed", ask: "Ask before photos", forbidden: "No photography" } as const;
const SIGNAL = { none: "No mobile signal", "2g": "Patchy 2G", "4g": "4G" } as const;

export default function DestinationScreen() {
  const b = useBrand();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const today = todayIST();
  const [picking, setPicking] = useState(false);

  const { data, loading } = useLoad(async () => {
    const dest = await must(supabase.from("destinations").select("*").eq("slug", slug).single());
    const [seasons, indicators, rec, heritage, events, reports, scenes, overview, trips] = await Promise.all([
      must(supabase.from("seasonal_conditions").select("month,suitability,note").eq("destination_id", dest.id)),
      must(supabase.from("indicators").select("kind,label,value,level,source,updated_at").eq("destination_id", dest.id)),
      maybe(supabase.from("recommendations").select("body,meta,generated_at").eq("destination_id", dest.id).maybeSingle()),
      must(supabase.from("heritage_sites").select("id,name,site_type,community,photography,restricted,guidelines,destination_id,community_endorsed_at").eq("is_published", true).eq("state_code", dest.state_code)),
      must(supabase.from("events").select("id,name,community,starts_on,ends_on,visitor_impact,open_to_visitors,etiquette,destination_id").eq("is_published", true).eq("state_code", dest.state_code).gte("ends_on", today).lte("starts_on", addDays(today, 120)).order("starts_on")),
      must(supabase.from("reports").select("id,body,status,category,source_label,created_at").eq("destination_id", dest.id).in("status", ["verified", "official", "unverified"]).order("created_at", { ascending: false }).limit(8)),
      must(supabase.from("panoramas").select("id,title,frame_count,captured_at").eq("destination_id", dest.id).eq("status", "published").order("captured_at", { ascending: false }).limit(5)),
      must(supabase.rpc("destination_overview", { on_day: today })),
      must(supabase.from("trips").select("id,title,start_date,end_date,status").gte("end_date", today).neq("status", "cancelled").order("start_date")),
    ]);
    const notices = await must(supabase.from("community_notices").select("id,kind,title,body,starts_on,ends_on,community").eq("destination_id", dest.id).eq("is_active", true).gte("ends_on", today).order("starts_on"));
    const ov = overview.find((o) => o.id === dest.id) ?? null;
    const alternatives = ov && ov.risk_level !== "good" ? await must(supabase.rpc("suggest_alternatives", { dest: dest.id, on_day: today })) : [];
    return { notices, dest, seasons, indicators, rec, heritage: heritage.filter((h) => h.destination_id === dest.id).concat(heritage.filter((h) => h.destination_id !== dest.id)).slice(0, 4), events, reports, scenes, ov, trips, alternatives };
  }, [slug]);

  if (loading && !data) return <Loading />;
  if (!data) return <Empty title="Not found" />;
  const { dest, ov } = data;
  const access = dest.access as DestinationAccess;
  const month = new Date().getMonth() + 1;

  async function addTo(trip: { id: string; start_date: string }) {
    const { error } = await supabase.from("trip_stops").insert({ trip_id: trip.id, destination_id: dest.id, day: trip.start_date });
    setPicking(false);
    if (error) return Alert.alert("Couldn't add", error.message);
    router.push(`/trip/${trip.id}`);
  }

  return (
    <Screen edges={[]} pad={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{ backgroundColor: b.heroSky, paddingTop: 110, paddingHorizontal: 20, paddingBottom: 26, gap: 8, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, overflow: "hidden" }}>
        <T v="small" color={b.ink} style={{ fontFamily: F.semibold, opacity: 0.8 }}>{dest.place || `${dest.district} · ${dest.state_code}`}</T>
        <T v="hero" color={b.ink} style={{ fontSize: 44, lineHeight: 42 }}>{dest.name}</T>
        <Row gap={6} style={{ flexWrap: "wrap" }}>
          <Pill label={dest.kind} bg={b.white} />
          <Pill label={dest.ecosystem || "Ecosystem"} bg={b.white} />
          {dest.is_lesser_known && <Pill label="Lesser-known" color={b.green} bg={b.white} />}
        </Row>
        <View style={{ position: "absolute", right: 16, top: 96 }} pointerEvents="none"><Eyes size={40} /></View>
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        {data.notices.length > 0 && (
          <Card style={{ backgroundColor: b.tint.pending }}>
            <Row><Icon name="flag" color={b.text} size={20} /><T v="h3">From the community</T></Row>
            {data.notices.map((n) => (
              <View key={n.id} style={{ gap: 2 }}>
                <T style={{ fontFamily: F.bold }}>{n.title}</T>
                <T v="small" muted>{fmtDay(n.starts_on)}{n.ends_on !== n.starts_on ? ` – ${fmtDay(n.ends_on)}` : ""}{n.community ? ` · ${n.community}` : ""}</T>
                {n.body ? <T v="small">{n.body}</T> : null}
              </View>
            ))}
          </Card>
        )}

        {ov && (
          <Card>
            <Row style={{ justifyContent: "space-between" }}>
              <Eyebrow>Eco-risk today</Eyebrow>
              <RiskPill level={ov.risk_level} score={ov.risk_score} />
            </Row>
            {([
              ["Sensitivity", ov.risk_sensitivity, 45, `${dest.sensitivity} sensitivity`],
              ["Visitor load", ov.risk_pressure, 30, ov.load_ratio != null ? `${ov.expected} expected of ${ov.capacity} a day` : "No reliable count, so we don't guess"],
              ["Season", ov.risk_season, 25, ov.suitability ? `${ov.suitability} month to visit` : "Season not recorded"],
              ["Verified issues", ov.risk_issues, 12, `${ov.open_issues} in the last 7 days`],
            ] as const).map(([k, v, max, note]) => (
              <View key={k} style={{ gap: 4 }}>
                <Row style={{ justifyContent: "space-between" }}><T v="small" style={{ fontFamily: F.semibold }}>{k}</T><T v="mono" muted>{v}/{max}</T></Row>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: b.chip, overflow: "hidden" }}>
                  <View style={{ width: `${(v / max) * 100}%`, height: 8, borderRadius: 4, backgroundColor: b.text }} />
                </View>
                <T v="small" muted>{note}</T>
              </View>
            ))}
            {data.alternatives.length > 0 && (
              <View style={{ gap: 8, marginTop: 4 }}>
                <T v="label">Lower-pressure alternatives today</T>
                {data.alternatives.map((a) => (
                  <Pressable key={a.id} onPress={() => router.push(`/destination/${a.slug}`)} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.sm, backgroundColor: b.surface2 }}>
                    <Icon name="leaf" size={18} color={b.green} />
                    <T style={{ flex: 1, fontFamily: F.semibold }}>{a.name}</T>
                    <T v="mono" muted>{a.distance_km} km · risk {a.risk_score}</T>
                  </Pressable>
                ))}
              </View>
            )}
          </Card>
        )}

        <Card>
          <Eyebrow>When to go</Eyebrow>
          <Row gap={3}>
            {MONTHS.map((m, i) => {
              const s = data.seasons.find((x) => x.month === i + 1);
              const lvl: Level = s ? SUITABILITY_LEVEL[s.suitability] : "none";
              return (
                <View key={m} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                  <View style={{ height: 30, alignSelf: "stretch", borderRadius: 6, backgroundColor: s?.suitability === "closed" ? b.text : lvl === "none" ? b.chip : lvl === "good" ? b.green : lvl === "warn" ? b.yellow : b.orange, borderWidth: i + 1 === month ? 2.5 : 0, borderColor: b.text }} />
                  <T v="mono" muted style={{ fontSize: 9.5 }}>{m.slice(0, 1)}</T>
                </View>
              );
            })}
          </Row>
          <Row gap={12} style={{ flexWrap: "wrap" }}>
            <Row gap={5}><Dot level="good" size={8} /><T v="small" muted>Good</T></Row>
            <Row gap={5}><Dot level="warn" size={8} /><T v="small" muted>Fair</T></Row>
            <Row gap={5}><Dot level="high" size={8} /><T v="small" muted>Poor</T></Row>
          </Row>
        </Card>

        {data.indicators.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {data.indicators.map((i) => (
              <Card key={i.kind} style={{ width: "48%", flexGrow: 1, gap: 4 }}>
                <T v="label">{i.label}</T>
                <Row gap={8}><Dot level={i.level} /><T v="h3" color={i.level === "none" ? b.muted : b.text}>{i.value}</T></Row>
                <T v="small" muted numberOfLines={2}>{i.source}</T>
              </Card>
            ))}
          </View>
        )}

        {data.rec && (
          <Card tone="deep">
            <Row><Icon name="spark" color={b.yellow} size={20} /><T v="h3" color={b.bg}>Trekne advises</T></Row>
            <T color={b.bg}>{data.rec.body}</T>
            <T v="small" color={b.deepMuted}>{data.rec.meta} · {ago(data.rec.generated_at)}</T>
          </Card>
        )}

        <Card>
          <Eyebrow>Respect the place</Eyebrow>
          <T>{dest.culture}</T>
          {dest.etiquette.map((e) => (
            <Row key={e} gap={8} style={{ alignItems: "flex-start" }}><Icon name="check" size={18} color={b.green} /><T style={{ flex: 1 }}>{e}</T></Row>
          ))}
        </Card>

        {data.heritage.length > 0 && (
          <Card>
            <Eyebrow>Heritage nearby</Eyebrow>
            {data.heritage.map((h) => (
              <View key={h.id} style={{ gap: 4, paddingVertical: 6, borderTopWidth: 1.5, borderTopColor: b.line }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <T v="h3" style={{ flex: 1 }}>{h.name}</T>
                  <Pill level={h.photography === "forbidden" ? "high" : h.photography === "ask" ? "warn" : "good"} label={PHOTO[h.photography as keyof typeof PHOTO]} />
                </Row>
                <T v="small" muted>{h.site_type} · {h.community}{h.restricted ? " · some areas closed to visitors" : ""}</T>
                {h.community_endorsed_at ? <Pill level="good" label="Approved by the community" /> : null}
                {h.guidelines.map((g) => <T key={g} v="small">• {g}</T>)}
              </View>
            ))}
          </Card>
        )}

        <Card>
          <Eyebrow>Getting there</Eyebrow>
          {access.road ? <Row gap={8}><Icon name="route" size={18} color={b.muted} /><T style={{ flex: 1 }}>{access.road}</T></Row> : null}
          {access.transport?.length ? <Row gap={8}><Icon name="backpack" size={18} color={b.muted} /><T style={{ flex: 1 }}>{access.transport.join(" · ")}</T></Row> : null}
          {access.connectivity ? <Row gap={8}><Icon name="wifioff" size={18} color={b.muted} /><T style={{ flex: 1 }}>{SIGNAL[access.connectivity]} · download offline maps</T></Row> : null}
          {access.medical_km != null ? <Row gap={8}><Icon name="alert" size={18} color={b.muted} /><T style={{ flex: 1 }}>Medical help ~{access.medical_km} km away</T></Row> : null}
          {access.permit ? <Row gap={8}><Icon name="id" size={18} color={b.muted} /><T style={{ flex: 1 }}>{access.permit} required</T></Row> : null}
        </Card>

        {data.events.length > 0 && (
          <Card>
            <Eyebrow>{`Festivals in ${dest.state_code}`}</Eyebrow>
            {data.events.slice(0, 4).map((e) => (
              <View key={e.id} style={{ gap: 2, paddingVertical: 6, borderTopWidth: 1.5, borderTopColor: b.line }}>
                <Row style={{ justifyContent: "space-between" }}><T v="h3" style={{ flex: 1 }}>{e.name}</T><Pill level={SENSITIVITY_LEVEL[e.visitor_impact]} label={`${e.visitor_impact} impact`} /></Row>
                <T v="small" muted>{fmtDay(e.starts_on)}{e.ends_on !== e.starts_on ? ` – ${fmtDay(e.ends_on)}` : ""} · {e.community}{e.open_to_visitors ? "" : " · community only"}</T>
                {e.etiquette.map((x) => <T key={x} v="small">• {x}</T>)}
              </View>
            ))}
          </Card>
        )}

        {data.scenes.length > 0 && (
          <Card>
            <Eyebrow>360 views from Rangers</Eyebrow>
            {data.scenes.map((s) => (
              <Pressable key={s.id} onPress={() => router.push(`/scene/${s.id}`)} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.sm, backgroundColor: b.surface2 }}>
                <Icon name="sphere" color={b.orange} />
                <View style={{ flex: 1 }}><T style={{ fontFamily: F.semibold }}>{s.title || "360 scene"}</T><T v="small" muted>{s.frame_count} photos · {ago(s.captured_at)}</T></View>
                <Icon name="chevronRight" size={18} color={b.muted} />
              </Pressable>
            ))}
          </Card>
        )}

        <Eyebrow>Field reports</Eyebrow>
        {data.reports.length ? data.reports.map((r) => (
          <Card key={r.id} style={{ gap: 6 }}>
            <Row style={{ justifyContent: "space-between" }}><StatusPill status={r.status} /><T v="mono" muted>{ago(r.created_at)}</T></Row>
            <T>{r.body}</T>
            <T v="small" muted>{r.source_label} · {r.category}</T>
          </Card>
        )) : <Empty title="No reports yet" />}

        <Button title="Add to a trip" icon="plus" onPress={() => (data.trips.length ? setPicking(true) : router.push("/plan"))} />
        {ov && <T v="small" muted style={{ textAlign: "center" }}>Pressure today: {ov.load_ratio != null ? `${Math.round(ov.load_ratio * 100)}% of capacity` : "unknown"} · {pressureLevel(ov.load_ratio) === "high" ? "consider another day" : "ok to visit"}</T>}
      </View>

      <Modal visible={picking} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPicking(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: b.bg, padding: 16, gap: 10 }}>
          <Row style={{ justifyContent: "space-between" }}><T v="h2">Add to which trip?</T><Button title="Close" small variant="chip" onPress={() => setPicking(false)} /></Row>
          {data.trips.map((t) => (
            <Pressable key={t.id} onPress={() => addTo(t)} style={{ backgroundColor: b.surface, padding: 16, borderRadius: radius.md, gap: 2 }}>
              <T v="h3">{t.title}</T>
              <T v="small" muted>{fmtDay(t.start_date)} – {fmtDay(t.end_date)} · {t.status}</T>
            </Pressable>
          ))}
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
