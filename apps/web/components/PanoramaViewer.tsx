"use client";

import { useEffect, useRef, useState } from "react";
import type { ViewerFrame } from "@trekne/viewer";

/** Interactive 360 view (drag / pinch / wheel). Frames carry signed image URLs + capture orientation. */
export function PanoramaViewer({ frames, hfov, vfov, className = "pano" }: { frames: ViewerFrame[]; hfov?: number; vfov?: number; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<string>("Loading scene…");

  useEffect(() => {
    let destroy: (() => void) | undefined;
    let cancelled = false;
    import("@trekne/viewer").then(({ mountPanorama }) => {
      if (cancelled || !el.current) return;
      const v = mountPanorama(el.current, frames, {
        hfov, vfov,
        onReady: (ok, failed) => setState(failed ? `${failed} of ${ok + failed} photos failed to load` : ""),
      });
      destroy = v.destroy;
    });
    return () => { cancelled = true; destroy?.(); };
  }, [frames, hfov, vfov]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div ref={el} style={{ position: "absolute", inset: 0 }} />
      {state && <span className="pill" style={{ position: "absolute", left: 12, bottom: 12 }}>{state}</span>}
      <span className="pill" style={{ position: "absolute", right: 12, top: 12, opacity: .85 }}>Drag to look around</span>
    </div>
  );
}
