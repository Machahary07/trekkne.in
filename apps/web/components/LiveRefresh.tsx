"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Keeps server-rendered pages live: when any of `tables` changes in Supabase Realtime, re-render the
 * page's server components (client state such as form inputs is kept). RLS applies to what each viewer hears.
 * Pages using this must be dynamic, not cached.
 */
export function LiveRefresh({ tables, delay = 800, badge = false }: { tables: string[]; delay?: number; badge?: boolean }) {
  const router = useRouter();
  const [live, setLive] = useState(false);
  const key = tables.join(",");

  useEffect(() => {
    const supabase = supabaseBrowser();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), delay);
    };
    let ch = supabase.channel(`page-live-${key}`);
    for (const table of key.split(",")) ch = ch.on("postgres_changes", { event: "*", schema: "public", table }, fire);
    ch.subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(ch);
    };
  }, [key, delay, router]);

  if (!badge) return null;
  return (
    <span className="pill" title={live ? "Updates appear as they happen" : "Connecting…"} style={{ background: "var(--chip)" }}>
      <i style={{ background: live ? "var(--green)" : "var(--muted)" }} />{live ? "Live" : "Connecting"}
    </span>
  );
}
