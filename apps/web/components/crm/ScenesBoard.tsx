"use client";

import { useEffect, useRef, useState } from "react";
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

export function ScenesBoard({ scenes, openId }: { scenes: Scene[]; openId?: string }) {
  const supabase = supabaseBrowser();
  const { run, busy, toast } = useAction();
  const [open, setOpen] = useState<Scene | null>(() => scenes.find((s) => s.id === openId) ?? null);
  const [frames, setFrames] = useState<ViewerFrame[] | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) { dlg.current?.close(); return; }
    dlg.current?.showModal();
    setFrames(null);
    const list = (open.frames as unknown as PanoramaFrame[]) ?? [];
    if (!list.length) { setFrames([]); return; }
    supabase.storage.from(PANORAMA_BUCKET).createSignedUrls(list.map((f) => f.path), 3600).then(({ data }) => {
      const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
      setFrames(list.flatMap((f) => (byPath.get(f.path) ? [{ url: byPath.get(f.path)!, q: f.q }] : [])));
    });
  }, [open, supabase]);

  const review = (s: Scene, status: Enums<"review_status">) =>
    run(() => supabase.from("panoramas").update({ status }).eq("id", s.id), status === "published" ? "Published" : "Rejected").then((ok) => ok && setOpen(null));

  return (
    <>
      <div className="grid g-3">
        {scenes.map((s) => (
          <button key={s.id} type="button" className="card" onClick={() => setOpen(s)} style={{ textAlign: "left", border: 0, cursor: "pointer", display: "grid", gap: 10, color: "inherit" }}>
            <div className="pano" style={{ display: "grid", placeItems: "center", color: "var(--white)", aspectRatio: "16/8" }}>
              <Icon name="sphere" style={{ width: 44, height: 44, strokeWidth: 1.5 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <b style={{ fontFamily: "var(--display)", fontSize: 18, letterSpacing: "-.02em" }}>{s.title || s.destinations?.name || "Untitled scene"}</b>
              <StatusPill status={s.status === "published" ? "published" : s.status === "rejected" ? "rejected" : "pending"} />
            </div>
            <span className="sub">{s.destinations?.name} · {s.frame_count} photos · {s.author?.full_name || s.author?.email || "Ranger"} · {ago(s.captured_at)}</span>
          </button>
        ))}
      </div>
      {!scenes.length && <section className="card"><p className="empty">No scenes yet. Rangers capture them from the app&rsquo;s Ranger mode.</p></section>}

      <dialog ref={dlg} className="modal" onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="modal-head">
              <div>
                <h2>{open.title || open.destinations?.name}</h2>
                <span className="sub">{open.destinations?.name} · {open.frame_count} photos · captured {ago(open.captured_at)}</span>
              </div>
              <button className="icon-btn" type="button" aria-label="Close" onClick={() => setOpen(null)}><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              {frames ? (frames.length ? <PanoramaViewer frames={frames} hfov={open.hfov} vfov={open.vfov} /> : <p className="empty">This scene has no uploaded photos yet.</p>) : <div className="pano" />}
              <p className="sub">Photos are placed by the phone&rsquo;s orientation at capture, not stitched, so small seams are expected. Check that faces and private homes aren&rsquo;t identifiable before publishing.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                {open.status !== "rejected" && <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => review(open, "rejected")}>Reject</button>}
                {open.status !== "published" && <button className="btn btn-green btn-sm" disabled={busy} onClick={() => review(open, "published")}><Icon name="check" />Publish</button>}
              </div>
            </div>
          </>
        )}
      </dialog>
      <Toast text={toast} />
    </>
  );
}
