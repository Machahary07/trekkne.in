"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Enums } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { StatusPill, ago } from "./ui";
import { Toast, useAction } from "./useAction";

interface Row {
  id: string;
  body: string;
  category: string;
  status: Enums<"report_status">;
  source: string;
  source_label: string;
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  captured_at: string;
  created_at: string;
  moderation_note: string | null;
  destinations: { name: string; state_code: string } | null;
  author: { full_name: string; email: string | null } | null;
  photos: string[];
}

const TABS: [Enums<"report_status">, string][] = [
  ["pending", "Pending"], ["verified", "Verified"], ["official", "Official"], ["unverified", "Unverified"], ["rejected", "Rejected"],
];

export function ReportsQueue({ status, reports }: { status: Enums<"report_status">; reports: Row[] }) {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const { run, busy, toast } = useAction();

  useEffect(() => {
    const ch = supabase
      .channel("crm-reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, router]);

  const setStatus = (id: string, next: Enums<"report_status">, note?: string) =>
    run(() => supabase.from("reports").update({ status: next, moderation_note: note ?? null }).eq("id", id), `Marked ${next}`);

  return (
    <section className="card">
      <div className="toolbar">
        <div className="seg" role="tablist">
          {TABS.map(([k, label]) => (
            <button key={k} type="button" aria-pressed={status === k} onClick={() => router.push(`/super/reports?status=${k}`)}>{label}</button>
          ))}
        </div>
      </div>
      {reports.length === 0 && <p className="empty">{status === "pending" ? "All caught up. New reports appear here as Rangers file them." : "Nothing here."}</p>}
      <ul className="list">
        {reports.map((r) => (
          <li key={r.id} style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <StatusPill status={r.status} />
              <span className="pill" style={{ textTransform: "capitalize" }}>{r.category}</span>
              <b style={{ fontSize: 15 }}>{r.destinations?.name}</b>
              <span className="sub">{r.destinations?.state_code}</span>
              <span className="sub mono" style={{ marginLeft: "auto" }}>{ago(r.created_at)}</span>
            </div>
            <p style={{ fontSize: 16 }}>{r.body}</p>
            {r.photos.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {r.photos.map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="Report photo" style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 10 }} /></a>
                ))}
              </div>
            )}
            <div className="meta" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span><Icon name="user" style={{ width: 15, height: 15, verticalAlign: -2 }} /> {r.author?.full_name || r.author?.email || r.source_label} · {r.source}</span>
              {r.lat != null && r.lng != null && (
                <a className="mono" href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=16/${r.lat}/${r.lng}`} target="_blank" rel="noreferrer">
                  {r.lat.toFixed(4)}°N {r.lng.toFixed(4)}°E{r.accuracy_m ? ` ±${Math.round(r.accuracy_m)} m` : ""}
                </a>
              )}
              {r.moderation_note && <span>Note: {r.moderation_note}</span>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {r.status !== "verified" && <button className="btn btn-green btn-sm" disabled={busy} onClick={() => setStatus(r.id, "verified")}><Icon name="check" />Verify</button>}
              {r.status !== "official" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus(r.id, "official")}>Mark official</button>}
              {r.status !== "unverified" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus(r.id, "unverified")} title="Visible to travellers, clearly labelled as unverified">Publish unverified</button>}
              {r.status !== "rejected" && (
                <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => {
                  const note = prompt("Reason for rejecting (shown to the author):");
                  if (note !== null) setStatus(r.id, "rejected", note);
                }}>Reject</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="sub" style={{ marginTop: 14 }}>Verified reports about waste, closures, crowding, roads, wildlife and heritage raise a destination&rsquo;s eco-risk for 7 days. <Link href="/super/map">See the map →</Link></p>
      <Toast text={toast} />
    </section>
  );
}
