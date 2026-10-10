import { Link, router } from "expo-router";
import { Pressable, View } from "react-native";
import { SENSITIVITY_LEVEL } from "@trekne/brand";
import { Icon } from "@/components/icon";
import { Eyes, LogoMark } from "@/components/mascot";
import { Button, Card, Dot, Empty, Eyebrow, Pill, RiskPill, Row, Screen, StatusPill, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { addDays, ago, fmtDay, must, todayIST, useLoad } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { radius, useBrand } from "@/lib/theme";

export default function Home() {
  const b = useBrand();
  const { profile, role } = useAuth();
  const today = todayIST();
  const { data } = useLoad(async () => {
    const [overview, reports, events, trips] = await Promise.all([
      must(supabase.rpc("destination_overview", { on_day: today })),
      must(supabase.from("reports").select("id,body,status,category,source_label,created_at,destinations(name,slug)").in("status", ["verified", "official"]).order("created_at", { ascending: false }).limit(5)),
      must(supabase.from("events").select("id,name,community,state_code,starts_on,ends_on,visitor_impact").eq("is_published", true).gte("ends_on", today).lte("starts_on", addDays(today, 45)).order("starts_on").limit(4)),
      must(supabase.from("trips").select("id,title,start_date,end_date,party_size,status,trip_stops(day,destinations(name))").gte("end_date", today).neq("status", "cancelled").order("start_date").limit(1)),
    ]);
    return { overview, reports, events, trip: trips[0] ?? null };
  });

  const first = profile?.full_name.split(" ")[0] || "traveller";
  const busy = (data?.overview ?? []).filter((d) => d.risk_level === "high").sort((a, c) => c.risk_score - a.risk_score).slice(0, 3);
  const quiet = (data?.overview ?? []).filter((d) => d.is_lesser_known && d.risk_level !== "high" && d.suitability !== "poor" && d.suitability !== "closed").slice(0, 3);
  const days = data?.trip ? Math.round((Date.parse(data.trip.start_date) - Date.parse(today)) / 864e5) : 0;

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={8}><LogoMark width={34} /><T v="h2">trekne</T></Row>
        {role && <Pill label={role.name} color={role.color} bg={b.surface} />}
      </Row>

      <View style={{ backgroundColor: b.heroSky, borderRadius: radius.lg, padding: 20, gap: 12, overflow: "hidden" }}>
        <T v="h1" color={b.ink}>Hi {first},{"\n"}<T v="h1" color={b.white}>
          {data?.trip ? (days <= 0 ? "your trip is on." : `your trip is in ${days} day${days === 1 ? "" : "s"}.`) : "where to, gently?"}
        </T></T>
        {data?.trip ? (
          <Pressable onPress={() => router.push(`/trip/${data.trip!.id}`)} style={{ backgroundColor: b.white, borderRadius: radius.md, padding: 14, gap: 4 }}>
            <T v="small" color="#586078">{fmtDay(data.trip.start_date)} · {data.trip.party_size} traveller{data.trip.party_size === 1 ? "" : "s"} · {data.trip.status}</T>
            <T v="h3" color={b.ink}>{data.trip.title}</T>
            <T v="small" color="#586078" numberOfLines={1}>{data.trip.trip_stops.map((s) => s.destinations?.name).filter(Boolean).join(" → ") || "No stops yet"}</T>
          </Pressable>
        ) : (
          <Button title="Plan a trip" icon="route" onPress={() => router.push("/plan")} style={{ alignSelf: "flex-start" }} />
        )}
        <View style={{ position: "absolute", right: -10, bottom: -18, opacity: 0.95 }} pointerEvents="none"><Eyes size={54} /></View>
      </View>

      {profile?.requested_role && (
        <Card tone="surface2" style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Icon name="id" color={b.text} />
          <T v="small" style={{ flex: 1 }}>Your request to join as a <T v="small" style={{ fontWeight: "700" }}>{profile.requested_role}</T> is with the Trekne team.</T>
        </Card>
      )}

      {busy.length > 0 && (
        <Card>
          <Eyebrow>Under pressure today</Eyebrow>
          {busy.map((d) => (
            <Link key={d.id} href={`/destination/${d.slug}`} asChild>
              <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
                <Dot level={d.risk_level} />
                <View style={{ flex: 1 }}>
                  <T v="h3">{d.name}</T>
                  <T v="small" muted>{d.load_ratio != null ? `${Math.round(d.load_ratio * 100)}% of daily capacity` : "No reliable count"} · {d.state_code}</T>
                </View>
                <RiskPill level={d.risk_level} score={d.risk_score} />
              </Pressable>
            </Link>
          ))}
        </Card>
      )}

      {quiet.length > 0 && (
        <Card tone="deep">
          <Row><Icon name="leaf" color={b.yellow} /><T v="h3" color={b.bg}>Quieter, lesser-known</T></Row>
          <T v="small" color={b.mode === "dark" ? b.muted : b.deepMuted}>Spread the load: these are in season and well under capacity today.</T>
          {quiet.map((d) => (
            <Link key={d.id} href={`/destination/${d.slug}`} asChild>
              <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
                <Dot level={d.risk_level} />
                <T v="body" color={b.bg} style={{ flex: 1, fontWeight: "600" }}>{d.name}</T>
                <T v="mono" color={b.deepMuted}>{d.state_code}</T>
              </Pressable>
            </Link>
          ))}
        </Card>
      )}

      <Eyebrow>Latest verified updates</Eyebrow>
      {data?.reports.length ? data.reports.map((r) => (
        <Card key={r.id} style={{ gap: 6 }}>
          <Row style={{ justifyContent: "space-between" }}><StatusPill status={r.status} /><T v="mono" muted>{ago(r.created_at)}</T></Row>
          <T v="h3">{r.destinations?.name}</T>
          <T>{r.body}</T>
          <T v="small" muted>{r.source_label}</T>
        </Card>
      )) : <Empty title="No verified updates yet" body="Ranger reports appear here once a moderator checks them." />}

      {!!data?.events.length && (
        <>
          <Eyebrow>Festivals coming up</Eyebrow>
          {data.events.map((e) => (
            <Card key={e.id} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Icon name="calendar" color={b.text} />
              <View style={{ flex: 1 }}>
                <T v="h3">{e.name}</T>
                <T v="small" muted>{fmtDay(e.starts_on)}{e.ends_on !== e.starts_on ? ` – ${fmtDay(e.ends_on)}` : ""} · {e.community} · {e.state_code}</T>
              </View>
              <Pill level={SENSITIVITY_LEVEL[e.visitor_impact]} label={`${e.visitor_impact} impact`} />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
