import { notFound } from "next/navigation";
import { DestinationEditor } from "@/components/crm/DestinationEditor";
import { PageHead, todayIST } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function EditDestination({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requirePerm("destinations.manage");
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: states } = await supabase.from("states").select("code,name").order("sort");

  if (id === "new") {
    return (
      <>
        <PageHead title="New destination" sub="Start with the basics and location. Publish when the profile is complete." />
        <DestinationEditor states={states ?? []} seasons={[]} indicators={[]} recommendation={null} counts={[]} canLog={staff.can("visitors.log")} />
      </>
    );
  }

  const [{ data: dest }, { data: seasons }, { data: indicators }, { data: rec }, { data: counts }, { data: ov }] = await Promise.all([
    supabase.from("destinations").select("*").eq("id", id).maybeSingle(),
    supabase.from("seasonal_conditions").select("*").eq("destination_id", id),
    supabase.from("indicators").select("*").eq("destination_id", id).order("kind"),
    supabase.from("recommendations").select("*").eq("destination_id", id).maybeSingle(),
    supabase.from("visitor_counts").select("day,visitors,source").eq("destination_id", id).order("day", { ascending: false }).limit(28),
    supabase.rpc("destination_overview", { on_day: todayIST() }),
  ]);
  if (!dest) notFound();
  const today = ov?.find((o) => o.id === id) ?? null;

  return (
    <>
      <PageHead title={dest.name} sub={`${dest.place || dest.district} · last updated ${new Date(dest.updated_at).toLocaleString("en-IN")}`} />
      <DestinationEditor
        dest={dest}
        states={states ?? []}
        seasons={seasons ?? []}
        indicators={indicators ?? []}
        recommendation={rec}
        counts={counts ?? []}
        today={today}
        canLog={staff.can("visitors.log")}
      />
    </>
  );
}
