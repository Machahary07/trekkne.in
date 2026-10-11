import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEVEL_COLOR, MONTHS, SENSITIVITY_LEVEL, SUITABILITY_LEVEL, type IconName, type Level } from "@trekne/brand";
import type { DestinationAccess } from "@trekne/db";
import { Carousel, DateTile, IconTile, PlaceCard, PointsHint, Press, Ring, SectionTitle, SignalTile } from "@/components/kit";
import { Icon } from "@/components/icon";
import { Button, Empty, Loading, Pill, Row, StatusPill, T } from "@/components/ui";
import { addDays, ago, fmtDay, maybe, must, todayIST, useLoad } from "@/lib/data";
import { glance, verdict } from "@/lib/glance";
import { photoFor } from "@/lib/photos";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const PHOTO_RULE: Record<string, { label: string; level: Level }> = {
  allowed: { label: "Photos OK", level: "good" }, ask: { label: "Ask first", level: "warn" }, forbidden: { label: "No photos", level: "high" },
};
const SIGNAL: Record<string, { label: string; level: Level }> = {
  none: { label: "No signal", level: "high" }, "2g": { label: "Patchy 2G", level: "warn" }, "4g": { label: "4G", level: "good" },
};
const IND_ICON: Record<string, IconName> = {
  weather: "rain", access: "route", eco: "leaf", pressure: "users", waste: "trash", water: "boat", landslide: "alert", wildlife: "eye", connectivity: "wifioff",
};
const CAT_ICON = { road: "car", trail: "backpack", weather: "rain", waste: "trash", crowd: "users", closure: "alert", wildlife: "eye", heritage: "temple" } as const;

export default function DestinationScreen() {
  const b = useBrand();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const today = todayIST();
  const [picking, setPicking] = useState(false);
  const [moreAdvice, setMoreAdvice] = useState(false);

  const { data, loading } = useLoad(async () => {
    const dest = await must(supabase.from("destinations").select("*").eq("slug", slug).single());
    const [seasons, indicators, rec, heritage, events, reports, scenes, overview, trips, notices] = await Promise.all([
      must(supabase.from("seasonal_conditions").select("month,suitability,note").eq("destination_id", dest.id)),
      must(supabase.from("indicators").select("kind,label,value,level,source,updated_at").eq("destination_id", dest.id)),
      maybe(supabase.from("recommendations").select("body,meta,generated_at").eq("destination_id", dest.id).maybeSingle()),
      must(supabase.from("heritage_sites").select("id,name,site_type,community,photography,restricted,guidelines,destination_id,community_endorsed_at").eq("is_published", true).eq("state_code", dest.state_code)),
      must(supabase.from("events").select("id,name,community,starts_on,ends_on,visitor_impact,open_to_visitors,etiquette,destination_id").eq("is_published", true).eq("state_code", dest.state_code).gte("ends_on", today).lte("starts_on", addDays(today, 120)).order("starts_on")),
      must(supabase.from("reports").select("id,body,status,category,source_label,created_at").eq("destination_id", dest.id).in("status", ["verified", "official", "unverified"]).order("created_at", { ascending: false }).limit(8)),
      must(supabase.from("panoramas").select("id,title,frame_count,captured_at").eq("destination_id", dest.id).eq("status", "published").order("captured_at", { ascending: false }).limit(5)),
      must(supabase.rpc("destination_overview", { on_day: today })),
      must(supabase.from("trips").select("id,title,start_date,end_date,status").gte("end_date", today).neq("status", "cancelled").order("start_date")),
      must(supabase.from("community_notices").select("id,kind,title,body,starts_on,ends_on,community").eq("destination_id", dest.id).eq("is_active", true).gte("ends_on", today).order("starts_on")),
    ]);
    const ov = overview.find((o) => o.id === dest.id) ?? null;
    const alternatives = ov && verdict(ov).level !== "good" ? await must(supabase.rpc("suggest_alternatives", { dest: dest.id, on_day: today })) : [];
    const sorted = heritage.filter((h) => h.destination_id === dest.id).concat(heritage.filter((h) => h.destination_id !== dest.id)).slice(0, 5);
    return { notices, dest, seasons, indicators, rec, heritage: sorted, events, reports, scenes, ov, trips, alternatives };
  }, [slug], ["reports", "community_notices", "visitor_counts", "indicators", "recommendations", "panoramas", "events", "heritage_sites", "trip_stops", "trips", "destinations"]);

  if (loading && !data) return <Loading />;
  if (!data) return <Empty title="Not found" />;
  const { dest, ov } = data;
  const access = dest.access as DestinationAccess;
  const month = new Date().getMonth() + 1;
  const photo = photoFor(dest.slug);
  const v = ov ? verdict(ov) : null;
  const signals = ov ? glance(ov) : [];
  const ratio = ov?.load_ratio == null ? null : Number(ov.load_ratio);

  async function addTo(trip: { id: string; start_date: string }) {
    const { error } = await supabase.from("trip_stops").insert({ trip_id: trip.id, destination_id: dest.id, day: trip.start_date });
    setPicking(false);
    if (error) return Alert.alert("Couldn't add", error.message);
    router.push(`/trip/${trip.id}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: b.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Photo hero */}
        <View style={{ height: 360, backgroundColor: b.blue }}>
          {photo && <Image source={photo.src} style={{ position: "absolute", inset: 0 }} contentFit="cover" accessibilityLabel={photo.alt} />}
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(16,19,31,.1)" }} />
            <View style={{ flex: 1, backgroundColor: "rgba(16,19,31,.45)" }} />
            <View style={{ flex: 1.4, backgroundColor: "rgba(16,19,31,.75)" }} />
          </View>
          <View style={{ position: "absolute", left: 16, right: 16, bottom: 18, gap: 8 }}>
            <Row gap={6} style={{ flexWrap: "wrap" }}>
              <Pill label={dest.kind} bg="rgba(255,255,255,.92)" />
              {dest.is_lesser_known && <Pill label="Hidden gem" bg={b.yellow} />}
            </Row>
            <T v="hero" color="#fff" style={{ fontSize: 40, lineHeight: 40 }}>{dest.name}</T>
            <T v="small" color="rgba(255,255,255,.85)">{dest.place || `${dest.district} · ${dest.state_code}`}</T>
            {photo && <T v="small" color="rgba(255,255,255,.6)" style={{ fontSize: 11 }}>Photo: {photo.credit} · {photo.license}</T>}
          </View>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Verdict */}
          {v && ov && (
            <View style={{ backgroundColor: LEVEL_COLOR[v.level] ?? b.chip, borderRadius: radius.lg, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Ring value={ov.risk_score / 100} size={72} stroke={8} color={b.ink} track="rgba(16,19,31,.18)">
                <T v="h2" color={b.ink} style={{ fontSize: 22 }}>{ov.risk_score}</T>
              </Ring>
              <View style={{ flex: 1, gap: 2 }}>
                <T v="label" color={b.ink} style={{ opacity: 0.7 }}>Today</T>
                <T v="h2" color={b.ink} style={{ fontSize: 24 }}>{v.title}</T>
                <T v="small" color={b.ink} style={{ opacity: 0.8 }}>Eco-risk {ov.risk_score} of 100</T>
              </View>
            </View>
          )}

          {/* Community notices */}
          {data.notices.map((n) => (
            <View key={n.id} style={{ backgroundColor: b.tint.pending, borderRadius: radius.md, padding: 14, flexDirection: "row", gap: 12 }}>
              <IconTile icon="flag" tone={n.kind === "closure" || n.kind === "sacred_day" ? "orange" : "yellow"} size={40} round />
              <View style={{ flex: 1, gap: 2 }}>
                <T style={{ fontFamily: F.bold }}>{n.title}</T>
                <T v="small" muted>{fmtDay(n.starts_on)}{n.ends_on !== n.starts_on ? ` – ${fmtDay(n.ends_on)}` : ""}{n.community ? ` · ${n.community}` : ""}</T>
              </View>
            </View>
          ))}

          {/* Three glance tiles */}
          {signals.length > 0 && (
            <Row gap={8} style={{ alignItems: "stretch" }}>
              {signals.map((s) => (
                <SignalTile key={s.key} s={s} detail={s.key === "crowd" ? (ratio != null && ov ? `${Math.round(ratio * 100)}% of ${ov.capacity}/day` : "No reliable count") : undefined} />
              ))}
            </Row>
          )}

          {/* Alternatives */}
          {data.alternatives.length > 0 && (
            <>
              <SectionTitle title="Try these instead" />
              <PointsHint points={30} label="for planning a lesser-known place" />
              <Carousel>
                {data.alternatives.map((a) => (
                  <PlaceCard key={a.id} slug={a.slug} name={a.name} sub={`${a.distance_km} km away · risk ${a.risk_score}`} width={260} height={200}
                    onPress={() => router.push(`/destination/${a.slug}`)} badge={{ label: a.is_lesser_known ? "Gem" : "Quieter", tone: "green", icon: "leaf" }} />
                ))}
              </Carousel>
            </>
          )}

          {/* When to go */}
          <SectionTitle title="When to go" />
          <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, gap: 10 }}>
            <Row gap={3}>
              {MONTHS.map((m, i) => {
                const s = data.seasons.find((x) => x.month === i + 1);
                const lvl: Level = s ? SUITABILITY_LEVEL[s.suitability] : "none";
                const bg = s?.suitability === "closed" ? b.text : LEVEL_COLOR[lvl] ?? b.chip;
                return (
                  <View key={m} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                    <View style={{ height: 34, alignSelf: "stretch", borderRadius: 8, backgroundColor: bg, borderWidth: i + 1 === month ? 3 : 0, borderColor: b.text }} />
                    <T v="mono" muted style={{ fontSize: 10, color: i + 1 === month ? b.text : b.muted }}>{m.slice(0, 1)}</T>
                  </View>
                );
              })}
            </Row>
            <Row gap={12} style={{ flexWrap: "wrap" }}>
              {([["good", "Great"], ["warn", "Okay"], ["high", "Poor"]] as const).map(([l, w]) => (
                <Row key={l} gap={5}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: LEVEL_COLOR[l]! }} /><T v="small" muted>{w}</T></Row>
              ))}
              <T v="small" muted>Outlined: this month</T>
            </Row>
          </View>

          {/* Live indicators as tiles */}
          {data.indicators.length > 0 && (
            <>
              <SectionTitle title="Conditions now" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {data.indicators.map((i) => (
                  <View key={i.kind} style={{ width: "48%", flexGrow: 1, backgroundColor: b.surface, borderRadius: radius.md, padding: 12, gap: 8 }}>
                    <Row gap={8}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: LEVEL_COLOR[i.level] ?? "transparent", borderWidth: i.level === "none" ? 2 : 0, borderColor: b.muted, alignItems: "center", justifyContent: "center" }}>
                        <Icon name={IND_ICON[i.kind] ?? "info"} size={18} color={i.level === "none" ? b.muted : b.ink} />
                      </View>
                      <T v="label" style={{ flex: 1 }} numberOfLines={1}>{i.label}</T>
                    </Row>
                    <T v="h3" color={i.level === "none" ? b.muted : b.text} numberOfLines={1}>{i.value}</T>
                    <T v="small" muted numberOfLines={1} style={{ fontSize: 11.5 }}>{i.source}</T>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Advice, short by default */}
          {data.rec && (
            <Press onPress={() => setMoreAdvice((x) => !x)} style={{ backgroundColor: b.text, borderRadius: radius.lg, padding: 16, gap: 8 }}>
              <Row><IconTile icon="spark" tone="yellow" size={36} round /><T v="h3" color={b.bg}>Trekne advises</T></Row>
              <T color={b.bg} numberOfLines={moreAdvice ? undefined : 3}>{data.rec.body}</T>
              <T v="small" color={b.deepMuted}>{moreAdvice ? `${data.rec.meta} · ${ago(data.rec.generated_at)}` : "Tap to read more"}</T>
            </Press>
          )}

          {/* Respect: icon chips */}
          <SectionTitle title="Respect the place" />
          <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, gap: 10 }}>
            {dest.etiquette.map((e) => (
              <Row key={e} gap={10} style={{ alignItems: "flex-start" }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: b.green, alignItems: "center", justifyContent: "center" }}><Icon name="check" size={15} color={b.ink} /></View>
                <T style={{ flex: 1, fontFamily: F.semibold }}>{e}</T>
              </Row>
            ))}
            {dest.culture ? <T v="small" muted>{dest.culture}</T> : null}
          </View>

          {/* Heritage carousel */}
          {data.heritage.length > 0 && (
            <>
              <SectionTitle title="Heritage nearby" />
              <Carousel>
                {data.heritage.map((h) => {
                  const rule = PHOTO_RULE[h.photography] ?? PHOTO_RULE.ask;
                  return (
                    <View key={h.id} style={{ width: 240, backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, gap: 8 }}>
                      <Row><IconTile icon="temple" tone="blue" size={40} /><View style={{ flex: 1 }}><T v="h3" numberOfLines={2} style={{ fontSize: 16 }}>{h.name}</T></View></Row>
                      <T v="small" muted numberOfLines={1}>{h.site_type} · {h.community}</T>
                      <Row gap={6} style={{ flexWrap: "wrap" }}>
                        <Pill level={rule.level} label={rule.label} />
                        {h.community_endorsed_at ? <Pill level="good" label="Community-approved" /> : null}
                      </Row>
                      {h.guidelines[0] ? <T v="small" numberOfLines={2}>{h.guidelines[0]}</T> : null}
                    </View>
                  );
                })}
              </Carousel>
            </>
          )}

          {/* Getting there: icon facts */}
          <SectionTitle title="Getting there" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {access.distance_km != null && <Fact icon="route" title={`${access.distance_km} km`} sub={`from ${access.nearest_town ?? "town"}`} />}
            {access.connectivity && <Fact icon="wifioff" title={SIGNAL[access.connectivity].label} sub="Mobile signal" level={SIGNAL[access.connectivity].level} />}
            {access.medical_km != null && <Fact icon="alert" title={`${access.medical_km} km`} sub="to medical help" level={access.medical_km > 25 ? "warn" : "good"} />}
            {access.permit ? <Fact icon="id" title="Permit" sub={access.permit} level="warn" /> : <Fact icon="id" title="No permit" sub="needed" level="good" />}
            {dest.carrying_capacity ? <Fact icon="users" title={`${dest.carrying_capacity.toLocaleString("en-IN")}`} sub="visitors a day, max" /> : null}
          </View>
          {access.road ? <T v="small" muted>{access.road}{access.transport?.length ? ` · ${access.transport.join(" · ")}` : ""}</T> : null}

          {/* Festivals */}
          {data.events.length > 0 && (
            <>
              <SectionTitle title={`Festivals in ${dest.state_code}`} />
              <Carousel>
                {data.events.slice(0, 6).map((e) => {
                  const lvl = SENSITIVITY_LEVEL[e.visitor_impact];
                  return (
                    <View key={e.id} style={{ width: 230, backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, flexDirection: "row", gap: 12 }}>
                      <DateTile iso={e.starts_on} tone={lvl === "high" ? "orange" : lvl === "warn" ? "yellow" : "green"} />
                      <View style={{ flex: 1, gap: 4 }}>
                        <T v="h3" numberOfLines={2} style={{ fontSize: 16 }}>{e.name}</T>
                        <Pill level={lvl} label={`${e.visitor_impact} crowds`} />
                      </View>
                    </View>
                  );
                })}
              </Carousel>
            </>
          )}

          {/* 360 */}
          {data.scenes.length > 0 && (
            <>
              <SectionTitle title="Look around in 360" />
              <Carousel>
                {data.scenes.map((s) => (
                  <Press key={s.id} onPress={() => router.push(`/scene/${s.id}`)} style={{ width: 180, height: 130, borderRadius: radius.lg, backgroundColor: b.ink, padding: 14, justifyContent: "space-between" }}>
                    <IconTile icon="sphere" tone="orange" size={40} round />
                    <View><T v="h3" color="#fff" numberOfLines={1} style={{ fontSize: 16 }}>{s.title || "360 view"}</T><T v="small" color={b.deepMuted}>{ago(s.captured_at)}</T></View>
                  </Press>
                ))}
              </Carousel>
            </>
          )}

          {/* Reports */}
          <SectionTitle title="From the field" />
          {data.reports.length ? data.reports.map((r) => (
            <View key={r.id} style={{ backgroundColor: b.surface, borderRadius: radius.md, padding: 12, flexDirection: "row", gap: 12, alignItems: "center", borderWidth: r.status === "unverified" ? 1.5 : 0, borderStyle: "dashed", borderColor: b.line }}>
              <IconTile icon={CAT_ICON[r.category]} tone={r.status === "official" ? "blue" : r.status === "verified" ? "green" : "yellow"} size={42} />
              <View style={{ flex: 1, gap: 2 }}>
                <T v="small" numberOfLines={2}>{r.body}</T>
                <T v="mono" muted style={{ fontSize: 11 }}>{r.source_label} · {ago(r.created_at)}</T>
              </View>
              <StatusPill status={r.status} />
            </View>
          )) : <T muted>No reports yet.</T>}
        </View>
      </ScrollView>

      {/* Sticky action */}
      <SafeAreaView edges={["bottom"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, backgroundColor: b.bg }}>
        <Button title={data.trips.length ? "Add to a trip" : "Plan a trip here"} icon="plus" variant="green" onPress={() => (data.trips.length ? setPicking(true) : router.push("/plan"))} style={{ marginBottom: 8 }} />
      </SafeAreaView>

      <Modal visible={picking} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPicking(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: b.bg, padding: 16, gap: 10 }}>
          <Row style={{ justifyContent: "space-between" }}><T v="h2">Add to which trip?</T><Button title="Close" small variant="chip" onPress={() => setPicking(false)} /></Row>
          {data.trips.map((t) => (
            <Press key={t.id} onPress={() => addTo(t)} style={{ backgroundColor: b.surface, padding: 16, borderRadius: radius.md, flexDirection: "row", gap: 12, alignItems: "center" }}>
              <IconTile icon="route" tone="green" size={44} />
              <View style={{ flex: 1 }}><T v="h3">{t.title}</T><T v="small" muted>{fmtDay(t.start_date)} – {fmtDay(t.end_date)}</T></View>
              <Icon name="plus" color={b.text} />
            </Press>
          ))}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function Fact({ icon, title, sub, level }: { icon: IconName; title: string; sub: string; level?: Level }) {
  const b = useBrand();
  return (
    <View style={{ width: "48%", flexGrow: 1, backgroundColor: b.surface, borderRadius: radius.md, padding: 12, flexDirection: "row", gap: 10, alignItems: "center" }}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: level ? LEVEL_COLOR[level] ?? b.chip : b.chip, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={19} color={level ? b.ink : b.text} />
      </View>
      <View style={{ flex: 1 }}>
        <T style={{ fontFamily: F.bold }} numberOfLines={1}>{title}</T>
        <T v="small" muted numberOfLines={1}>{sub}</T>
      </View>
    </View>
  );
}
