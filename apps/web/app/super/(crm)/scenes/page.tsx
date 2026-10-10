import { ScenesBoard } from "@/components/crm/ScenesBoard";
import { PageHead } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Scenes({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  await requirePerm("reports.moderate");
  const { open } = await searchParams;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("panoramas")
    .select("id,title,status,frames,frame_count,hfov,vfov,lat,lng,captured_at,created_at,destinations(name,state_code),author:profiles!panoramas_author_id_fkey(full_name,email)")
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <>
      <PageHead title="360 scenes" sub="Phone-captured 360 views from Rangers. Publish to show the current conditions on the destination page." />
      <ScenesBoard scenes={data ?? []} openId={open} />
    </>
  );
}
