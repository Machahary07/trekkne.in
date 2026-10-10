"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Calls `tick` every `ms` while the element is on screen. `pause()` (on a tap) holds it for 8 s so people can read.
 * Under reduced motion it never auto-advances; taps still work.
 */
export function useAutoplay<T extends HTMLElement>(ms: number, tick: () => void) {
  const ref = useRef<T>(null);
  const tickRef = useRef(tick);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout>>(undefined);
  tickRef.current = tick;

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused) return;
    const id = setInterval(() => tickRef.current(), ms);
    return () => clearInterval(id);
  }, [visible, paused, ms]);

  useEffect(() => () => clearTimeout(hold.current), []);

  const pause = useCallback(() => {
    setPaused(true);
    clearTimeout(hold.current);
    hold.current = setTimeout(() => setPaused(false), 8000);
  }, []);

  return { ref, paused, pause };
}
