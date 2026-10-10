import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { PageHead, todayIST } from "@/components/crm/ui";
import { LiveMap } from "@/components/crm/LiveMap";

export default async function MapPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const staff = await requirePerm();
  const { day: qDay } = await searchParams;
  const day = qDay && /^\d{4}-\d{2}-\d{2}$/.test(qDay) ? qDay : todayIST();
  const supabase = await supabaseServer();
  const since = new Date(Date.now() - 14 * 864e5).toISOString();

  const [overview, heritage, reports, scenes] = await Promise.all([
    supabase.rpc("destination_overview", { on_day: day }),
    supabase.from("heritage_sites").select("id,name,site_type,community,lat,lng,photography,restricted,is_published").not("lat", "is", null),
    supabase.from("reports").select("id,body,category,status,lat,lng,created_at,destinations(name,lat,lng)").gte("created_at", since)
      .in("status", staff.can("reports.moderate") ? ["pending", "verified", "official", "unverified"] : ["verified", "official"]),
    supabase.from("panoramas").select("id,title,lat,lng,status,destinations(name,lat,lng)"),
  ]);

  return (
    <>
      <PageHead title="Live map" sub="Destinations by eco-risk, heritage sites, field reports from the last 14 days and 360 scenes." />
      <LiveMap
        day={day}
        destinations={overview.data ?? []}
        heritage={heritage.data ?? []}
        reports={(reports.data ?? []).map((r) => ({ ...r, dest: r.destinations }))}
        scenes={(scenes.data ?? []).map((s) => ({ ...s, dest: s.destinations }))}
        canEdit={staff.can("destinations.manage")}
      />
    </>
  );
}
