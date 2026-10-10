"use client";

import { useEffect } from "react";

/** One global pointer listener that points every mascot pupil at the cursor. */
export function EyeTracker() {
  useEffect(() => {
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 3;
    let queued = false;

    const look = () => {
      queued = false;
      document.querySelectorAll<HTMLElement>(".pupil").forEach((pupil) => {
        const eye = pupil.parentElement!.getBoundingClientRect();
        const dx = px - (eye.left + eye.width / 2);
        const dy = py - (eye.top + eye.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const m = Math.min(eye.width * 0.2, dist / 10);
        pupil.style.transform = `translate(calc(-50% + ${(dx / dist) * m}px), calc(-50% + ${(dy / dist) * m}px))`;
      });
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(look);
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      queue();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    look();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", queue);
    };
  }, []);

  return null;
}
