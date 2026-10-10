"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Opens every new page at the very top, instantly. Without this Next keeps the
 * old scroll position (or scrolls to the first section) and the global
 * `scroll-behavior: smooth` animates that jump. Hash links and back/forward
 * navigation keep their own position.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const first = useRef(true);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPop = () => { fromHistory.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const skip = first.current || fromHistory.current || window.location.hash !== "";
    first.current = false;
    fromHistory.current = false;
    if (!skip) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
