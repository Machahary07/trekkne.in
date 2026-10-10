import { EventsBoard } from "@/components/crm/EventsBoard";
import { PageHead } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Events() {
  await requirePerm("events.manage");
  const supabase = await supabaseServer();
  const [{ data: events }, { data: states }, { data: dests }] = await Promise.all([
    supabase.from("events").select("*").order("starts_on"),
    supabase.from("states").select("code,name").order("sort"),
    supabase.from("destinations").select("id,name,state_code").order("name"),
  ]);
  return (
    <>
      <PageHead title="Festivals & events" sub="Seasonal events change visitor pressure and cultural protocols. High-impact events raise warnings in trip planning." />
      <EventsBoard events={events ?? []} states={states ?? []} dests={dests ?? []} />
    </>
  );
}
