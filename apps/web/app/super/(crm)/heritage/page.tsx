import { HeritageBoard } from "@/components/crm/HeritageBoard";
import { PageHead } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Heritage() {
  await requirePerm("heritage.manage");
  const supabase = await supabaseServer();
  const [{ data: sites }, { data: states }, { data: dests }] = await Promise.all([
    supabase.from("heritage_sites").select("*").order("state_code").order("name"),
    supabase.from("states").select("code,name").order("sort"),
    supabase.from("destinations").select("id,name,state_code").order("name"),
  ]);
  return (
    <>
      <PageHead title="Heritage sites" sub="Sacred groves, monoliths, monasteries and villages, with the community's own rules for visitors." />
      <HeritageBoard sites={sites ?? []} states={states ?? []} dests={dests ?? []} />
    </>
  );
}
