"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PANORAMA_BUCKET, type Enums, type Json, type PanoramaFrame } from "@trekne/db";
import type { ViewerFrame } from "@trekne/viewer";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { PanoramaViewer } from "../PanoramaViewer";
import { StatusPill, ago } from "./ui";
import { Toast, useAction } from "./useAction";

interface Scene {
  id: string;
  title: string;
  status: Enums<"review_status">;
  frames: Json;
  frame_count: number;
  hfov: number;
  vfov: number;
  captured_at: string;
  destinations: { name: string; state_code: string } | null;
  author: { full_name: string; email: string | null } | null;
}

/** Inline 360 review: the selected scene plays in a live viewer at the top; cards below show each scene's cover. */
export function ScenesBoard({ scenes, covers, openId }: { scenes: Scene[]; covers: Record<string, string | null>; openId?: string }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const { run, busy, toast } = useAction();
  const firstPending = scenes.find((s) => s.status === "pending") ?? scenes[0];
  const [selId, setSelId] = useState<string | undefined>(openId ?? firstPending?.id);
  const sel = scenes.find((s) => s.id === selId) ?? firstPending ?? null;
  const [frames, setFrames] = useState<ViewerFrame[] | null>(null);
  const stage = useRef<HTMLElement>(null);

  // New captures and other moderators' decisions show up without a reload.
  useEffect(() => {
    const ch = supabase.channel("crm-scenes")
      .on("postgres_changes", { event: "*", schema: "public", table: "panoramas" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, router]);

  const frameKey = sel ? `${sel.id}:${sel.frame_count}` : "";
  useEffect(() => {
    if (!sel) return;
    setFrames(null);
    const list = (sel.frames as unknown as PanoramaFrame[]) ?? [];
    if (!list.length) { setFrames([]); return; }
    let cancelled = false;
    supabase.storage.from(PANORAMA_BUCKET).createSignedUrls(list.map((f) => f.path), 3600).then(({ data }) => {
      if (cancelled) return;
      const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
      setFrames(list.flatMap((f) => (byPath.get(f.path) ? [{ url: byPath.get(f.path)!, q: f.q }] : [])));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey, supabase]);

  const review = (s: Scene, status: Enums<"review_status">) =>
    run(() => supabase.from("panoramas").update({ status }).eq("id", s.id), status === "published" ? "Published" : status === "rejected" ? "Rejected" : "Back in review");

  if (!scenes.length) return <section className="card"><p className="empty">No scenes yet. Rangers capture them from the app&rsquo;s Ranger mode.</p></section>;

  return (
    <>
      {sel && (
        <section ref={stage} className="card grid" style={{ gap: 14, marginBottom: 14 }} aria-label="Scene preview">
          <div className="card-head" style={{ margin: 0 }}>
            <div>
              <h2>{sel.title || sel.destinations?.name || "Untitled scene"}</h2>
              <p>{sel.destinations?.name} · {sel.frame_count} photos · {sel.author?.full_name || sel.author?.email || "Ranger"} · captured {ago(sel.captured_at)}</p>
            </div>
            <StatusPill status={sel.status === "published" ? "published" : sel.status === "rejected" ? "rejected" : "pending"} />
          </div>
          {frames ? (frames.length ? <PanoramaViewer key={sel.id} frames={frames} hfov={sel.hfov} vfov={sel.vfov} /> : <p className="empty">This scene&rsquo;s photos are still uploading.</p>) : <div className="pano" />}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <p className="sub" style={{ maxWidth: "70ch" }}>Photos are placed by the phone&rsquo;s orientation, not stitched, so small seams are expected. Check that faces and private homes aren&rsquo;t identifiable before publishing.</p>
            <div style={{ display: "flex", gap: 8 }}>
              {sel.status !== "rejected" && <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => review(sel, "rejected")}>Reject</button>}
              {sel.status !== "pending" && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => review(sel, "pending")}>Back to review</button>}
              {sel.status !== "published" && <button className="btn btn-green btn-sm" disabled={busy} onClick={() => review(sel, "published")}><Icon name="check" />Publish</button>}
            </div>
          </div>
        </section>
      )}

      <div className="grid g-3">
        {scenes.map((s) => {
          const cover = covers[s.id];
          const active = s.id === sel?.id;
          return (
            <button key={s.id} type="button" className="card" aria-pressed={active}
              onClick={() => { setSelId(s.id); stage.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              style={{ textAlign: "left", border: 0, cursor: "pointer", display: "grid", gap: 10, color: "inherit", boxShadow: active ? "inset 0 0 0 2px var(--orange)" : undefined }}>
              <div className="pano" style={{ position: "relative", aspectRatio: "16/9", display: "grid", placeItems: "center", color: "var(--white)",
                backgroundImage: cover ? `url(${cover})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
                {!cover && <Icon name="sphere" style={{ width: 44, height: 44, strokeWidth: 1.5 }} />}
                <span className="pill" style={{ position: "absolute", left: 10, bottom: 10, background: "rgba(16,19,31,.7)", color: "#fff" }}>
                  <Icon name="sphere" style={{ width: 14, height: 14 }} />360 · {s.frame_count}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <b style={{ fontFamily: "var(--display)", fontSize: 18, letterSpacing: "-.02em" }}>{s.title || s.destinations?.name || "Untitled scene"}</b>
                <StatusPill status={s.status === "published" ? "published" : s.status === "rejected" ? "rejected" : "pending"} />
              </div>
              <span className="sub">{s.destinations?.name} · {s.author?.full_name || s.author?.email || "Ranger"} · {ago(s.captured_at)}</span>
            </button>
          );
        })}
      </div>
      <Toast text={toast} />
    </>
  );
}
