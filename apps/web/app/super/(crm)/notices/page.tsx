import { NoticesBoard } from "@/components/crm/NoticesBoard";
import { PageHead } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Notices() {
  await requirePerm("destinations.manage");
  const supabase = await supabaseServer();
  const [{ data: notices }, { data: dests }] = await Promise.all([
    supabase.from("community_notices").select("*,destinations(name,state_code),author:profiles!community_notices_author_id_fkey(full_name,email)").order("starts_on", { ascending: false }).limit(200),
    supabase.from("destinations").select("id,name,state_code").order("name"),
  ]);
  return (
    <>
      <PageHead title="Community notices" sub="Closures, sacred days and visitor rules from community stewards. They go live immediately; switch one off if it's wrong or abusive." />
      <NoticesBoard notices={notices ?? []} dests={dests ?? []} />
    </>
  );
}
