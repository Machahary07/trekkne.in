"use client";

import { useEffect, useRef } from "react";

/**
 * Drop inside a block to let CSS react to it scrolling into view: sets `data-armed` on the parent once JS runs,
 * `data-in` when 35% of it is visible, and clears `data-in` once it has fully left (so the entrance replays).
 * Skipped under reduced motion, so the block simply renders in its resting state.
 */
export function InViewFlag() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    host.dataset.armed = "";
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.35) host.dataset.in = "";
        else if (!e.isIntersecting) delete host.dataset.in;
      },
      { threshold: [0, 0.35] },
    );
    io.observe(host);
    return () => {
      io.disconnect();
      delete host.dataset.armed;
      delete host.dataset.in;
    };
  }, []);

  return <span ref={ref} hidden />;
}
