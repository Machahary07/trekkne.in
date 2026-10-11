import { router } from "expo-router";
import { View } from "react-native";
import { SENSITIVITY_LEVEL } from "@trekne/brand";
import { ActionTile, Carousel, DateTile, IconTile, LevelCard, PlaceCard, PlaceThumb, Press, SectionTitle } from "@/components/kit";
import { Icon } from "@/components/icon";
import { Eyes, LogoMark } from "@/components/mascot";
import { Button, Pill, Row, Screen, StatusPill, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { addDays, ago, fmtDay, must, todayIST, useLoad } from "@/lib/data";
import { verdict } from "@/lib/glance";
import { useProgress } from "@/lib/progress";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const CAT_ICON = { road: "car", trail: "backpack", weather: "rain", waste: "trash", crowd: "users", closure: "alert", wildlife: "eye", heritage: "temple" } as const;

export default function Home() {
  const b = useBrand();
  const { profile, role, can } = useAuth();
  const { progress } = useProgress();
  const today = todayIST();
  const { data } = useLoad(async () => {
    const [overview, reports, events, trips] = await Promise.all([
      must(supabase.rpc("destination_overview", { on_day: today })),
      must(supabase.from("reports").select("id,body,status,category,source_label,created_at,destinations(name,slug)").in("status", ["verified", "official"]).order("created_at", { ascending: false }).limit(6)),
      must(supabase.from("events").select("id,name,community,state_code,starts_on,ends_on,visitor_impact").eq("is_published", true).gte("ends_on", today).lte("starts_on", addDays(today, 60)).order("starts_on").limit(6)),
      must(supabase.from("trips").select("id,title,start_date,end_date,party_size,status,trip_stops(day,destinations(name,slug))").gte("end_date", today).neq("status", "cancelled").order("start_date").limit(1)),
    ]);
    return { overview, reports, events, trip: trips[0] ?? null };
  }, [], ["reports", "events", "trips", "trip_stops", "visitor_counts", "community_notices", "destinations"]);

  const first = profile?.full_name.split(" ")[0] || "traveller";
  const all = data?.overview ?? [];
  const goodToday = all.filter((o) => verdict(o).level === "good").sort((a, c) => a.risk_score - c.risk_score).slice(0, 8);
  const avoid = all.filter((o) => verdict(o).level === "high").sort((a, c) => c.risk_score - a.risk_score).slice(0, 6);
  const gems = all.filter((o) => o.is_lesser_known && verdict(o).level !== "high").slice(0, 8);
  const days = data?.trip ? Math.round((Date.parse(data.trip.start_date) - Date.parse(today)) / 864e5) : 0;
  const tripPhoto = data?.trip?.trip_stops[0]?.destinations?.slug;
  const field = can("reports.field") || can("panoramas.create");
  const steward = can("heritage.propose");

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={8}><LogoMark width={34} /><T v="h2">trekne</T></Row>
        {role && <Pill label={role.name} color={role.color} bg={b.surface} />}
      </Row>

      {/* Hero: who you are, what's next */}
      <View style={{ backgroundColor: b.orange, borderRadius: radius.xl, padding: 20, gap: 14, overflow: "hidden" }}>
        <View style={{ position: "absolute", right: 14, top: 14 }} pointerEvents="none"><Eyes size={44} /></View>
        <T v="label" color={b.ink} style={{ opacity: 0.75 }}>Hi {first}</T>
        <T v="h1" color={b.ink} style={{ maxWidth: "78%" }}>
          {data?.trip ? (days <= 0 ? "Your trip is on." : `${days} day${days === 1 ? "" : "s"} to go.`) : "Where to, gently?"}
        </T>
        {data?.trip ? (
          <Press onPress={() => router.push(`/trip/${data.trip!.id}`)} style={{ backgroundColor: b.white, borderRadius: radius.md, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" }}>
            {tripPhoto ? <PlaceThumb slug={tripPhoto} /> : <IconTile icon="route" tone="yellow" size={52} />}
            <View style={{ flex: 1 }}>
              <T v="h3" color={b.ink} numberOfLines={1}>{data.trip.title}</T>
              <T v="small" color="#586078">{fmtDay(data.trip.start_date)} · {data.trip.trip_stops.length} stops · {data.trip.party_size} people</T>
            </View>
            <Icon name="chevronRight" color={b.ink} size={20} />
          </Press>
        ) : (
          <Button title="Plan a trip" icon="route" variant="ink" onPress={() => router.push("/plan")} style={{ alignSelf: "flex-start" }} />
        )}
      </View>

      <LevelCard progress={progress} compact onPress={() => router.push("/profile")} />

      {/* Big, obvious actions */}
      <Row gap={10} style={{ alignItems: "stretch" }}>
        <ActionTile icon="map" title="Explore" sub={`${all.length} places`} tone="blue" onPress={() => router.push("/explore")} />
        <ActionTile icon="route" title="Plan" sub="Check every stop" tone="green" onPress={() => router.push("/plan")} />
      </Row>
      {(field || steward) && (
        <Row gap={10} style={{ alignItems: "stretch" }}>
          {field && <ActionTile icon="camera" title="Report" sub="From the trail" tone="orange" onPress={() => router.push("/report")} />}
          {field && <ActionTile icon="sphere" title="360 view" sub="Capture now" tone="ink" onPress={() => router.push("/ranger")} />}
          {steward && <ActionTile icon="flag" title="Community" sub="Closures, rules" tone="yellow" onPress={() => router.push("/community")} />}
        </Row>
      )}

      {goodToday.length > 0 && (
        <>
          <SectionTitle title="Good to go today" action="See all" onAction={() => router.push("/explore")} />
          <Carousel>
            {goodToday.map((o) => (
              <PlaceCard key={o.id} slug={o.slug} name={o.name} sub={`${o.district} · ${o.state_code}`} overview={o} width={250}
                onPress={() => router.push(`/destination/${o.slug}`)} badge={{ label: "Good to go", tone: "green", icon: "check" }} />
            ))}
          </Carousel>
        </>
      )}

      {avoid.length > 0 && (
        <>
          <SectionTitle title="Under pressure today" />
          <Carousel>
            {avoid.map((o) => (
              <PlaceCard key={o.id} slug={o.slug} name={o.name} sub={o.community_closed ? o.notice ?? "Closed today" : `${o.load_ratio != null ? Math.round(Number(o.load_ratio) * 100) + "% of capacity" : o.state_code}`}
                overview={o} width={230} height={170} onPress={() => router.push(`/destination/${o.slug}`)} badge={{ label: verdict(o).title, tone: "orange", icon: "alert" }} />
            ))}
          </Carousel>
        </>
      )}

      {gems.length > 0 && (
        <>
          <SectionTitle title="Quieter gems" />
          <T v="small" muted style={{ marginTop: -6 }}>Lesser-known places. Planning one earns +30 points.</T>
          <Carousel>
            {gems.map((o) => (
              <PlaceCard key={o.id} slug={o.slug} name={o.name} sub={o.state_code} overview={o} width={200} height={220}
                onPress={() => router.push(`/destination/${o.slug}`)} badge={{ label: "Gem", tone: "yellow", icon: "leaf" }} />
            ))}
          </Carousel>
        </>
      )}

      {!!data?.events.length && (
        <>
          <SectionTitle title="Festivals soon" />
          <Carousel>
            {data.events.map((e) => {
              const lvl = SENSITIVITY_LEVEL[e.visitor_impact];
              return (
                <View key={e.id} style={{ width: 230, backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, flexDirection: "row", gap: 12 }}>
                  <DateTile iso={e.starts_on} tone={lvl === "high" ? "orange" : lvl === "warn" ? "yellow" : "green"} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <T v="h3" numberOfLines={2} style={{ fontSize: 17 }}>{e.name}</T>
                    <T v="small" muted numberOfLines={1}>{e.community} · {e.state_code}</T>
                    <Pill level={lvl} label={`${e.visitor_impact} crowds`} />
                  </View>
                </View>
              );
            })}
          </Carousel>
        </>
      )}

      <SectionTitle title="Live from the field" />
      {data?.reports.map((r) => (
        <Press key={r.id} onPress={() => r.destinations?.slug && router.push(`/destination/${r.destinations.slug}`)}
          style={{ backgroundColor: b.surface, borderRadius: radius.md, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" }}>
          <IconTile icon={CAT_ICON[r.category]} tone={r.status === "official" ? "blue" : "green"} size={44} />
          <View style={{ flex: 1, gap: 2 }}>
            <Row gap={6}><T style={{ fontFamily: F.bold, flexShrink: 1 }} numberOfLines={1}>{r.destinations?.name}</T><T v="mono" muted>{ago(r.created_at)}</T></Row>
            <T v="small" numberOfLines={2}>{r.body}</T>
          </View>
          <StatusPill status={r.status} />
        </Press>
      ))}
      {data && !data.reports.length && <T muted>No verified updates yet.</T>}
    </Screen>
  );
}

