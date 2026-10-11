import { PANORAMA_BUCKET, type PanoramaFrame } from "@trekne/db";
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

  // Cover photo per scene (its first frame) so cards show the view, not a placeholder.
  const covers = (data ?? []).flatMap((s) => {
    const f = (s.frames as unknown as PanoramaFrame[] | null)?.[0];
    return f ? [{ id: s.id, path: f.path }] : [];
  });
  const { data: signed } = covers.length
    ? await supabase.storage.from(PANORAMA_BUCKET).createSignedUrls(covers.map((c) => c.path), 3600)
    : { data: [] as { path: string | null; signedUrl: string }[] };
  const byPath = new Map((signed ?? []).map((x) => [x.path, x.signedUrl]));
  const coverUrls = Object.fromEntries(covers.map((c) => [c.id, byPath.get(c.path) ?? null]));

  return (
    <>
      <PageHead title="360 scenes" sub="Phone-captured 360 views from Rangers. Review them right here; published scenes show on the place page and in the app." />
      <ScenesBoard scenes={data ?? []} covers={coverUrls} openId={open} />
    </>
  );
}
