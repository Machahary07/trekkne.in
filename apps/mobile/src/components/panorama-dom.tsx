"use dom";

import { useEffect, useRef, useState } from "react";
import { mountPanorama, type ViewerFrame } from "@trekne/viewer";

/** The same three.js viewer as the CRM and website, running in a webview. */
export default function PanoramaDom({ frames, hfov, vfov }: { frames: ViewerFrame[]; hfov: number; vfov: number; dom?: import("expo/dom").DOMProps }) {
  const el = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Loading scene…");
  useEffect(() => {
    if (!el.current) return;
    const v = mountPanorama(el.current, frames, {
      hfov, vfov,
      onReady: (ok, failed) => setStatus(failed ? `${failed} of ${ok + failed} photos failed` : ""),
    });
    return () => v.destroy();
  }, [frames, hfov, vfov]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#10131F", fontFamily: "system-ui, sans-serif" }}>
      <div ref={el} style={{ position: "absolute", inset: 0 }} />
      {status && (
        <span style={{ position: "absolute", left: 12, bottom: 12, background: "#fff", color: "#10131F", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
          {status}
        </span>
      )}
    </div>
  );
}
