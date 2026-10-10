"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Drives the how-it-works road with scroll. Sets `--p` (0 → 1) on the wrapper:
 * - desktop with room: the stage is sticky, so the section holds still while the road fills edge to edge;
 * - otherwise (phones, short screens): the road fills as the trail passes a line at 80% of the viewport.
 * Without JS `--p` stays at its CSS default of 1, so the road is simply drawn in full.
 */
export function TrailScroll({ children }: { children: ReactNode }) {
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pin.current;
    const stage = el?.firstElementChild as HTMLElement | null;
    const trail = el?.querySelector<HTMLElement>(".trail");
    if (!el || !stage || !trail) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      let p: number;
      if (getComputedStyle(stage).position === "sticky") {
        const r = el.getBoundingClientRect();
        p = -r.top / Math.max(1, r.height - stage.offsetHeight);
      } else {
        const r = trail.getBoundingClientRect();
        p = (window.innerHeight * 0.8 - r.top) / Math.max(1, r.height);
      }
      el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  return (
    <div ref={pin} className="trail-pin">
      <div className="trail-stage">{children}</div>
    </div>
  );
}
