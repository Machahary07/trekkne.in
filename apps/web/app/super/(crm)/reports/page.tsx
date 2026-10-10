import { REPORT_PHOTO_BUCKET } from "@trekne/db";
import { ReportsQueue } from "@/components/crm/ReportsQueue";
import { PageHead } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

const TABS = ["pending", "verified", "official", "unverified", "rejected"] as const;
type Tab = (typeof TABS)[number];

export default async function Reports({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePerm("reports.moderate");
  const { status: s } = await searchParams;
  const status: Tab = TABS.includes(s as Tab) ? (s as Tab) : "pending";
  const supabase = await supabaseServer();
  const { data: reports } = await supabase
    .from("reports")
    .select("id,body,category,status,source,source_label,lat,lng,accuracy_m,captured_at,created_at,moderation_note,destinations(name,state_code),author:profiles!reports_author_id_fkey(full_name,email),report_photos(storage_path)")
    .eq("status", status)
    .order("created_at", { ascending: status !== "pending" ? false : true })
    .limit(100);

  const paths = (reports ?? []).flatMap((r) => r.report_photos.map((p) => p.storage_path));
  const { data: signed } = paths.length
    ? await supabase.storage.from(REPORT_PHOTO_BUCKET).createSignedUrls(paths, 3600)
    : { data: [] as { path: string | null; signedUrl: string }[] };
  const urls: Record<string, string | null | undefined> = Object.fromEntries((signed ?? []).map((x) => [x.path ?? "", x.signedUrl]));

  return (
    <>
      <PageHead title="Reports" sub="Nothing reaches travellers until it's verified. Oldest pending first. The queue updates live." />
      <ReportsQueue
        status={status}
        reports={(reports ?? []).map((r) => ({ ...r, photos: r.report_photos.map((p) => urls[p.storage_path]).filter((u): u is string => !!u) }))}
      />
    </>
  );
}
