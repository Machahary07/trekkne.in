import { useEffect, useId, useRef } from "react";
import { supabase } from "./supabase";

export type LiveTable =
  | "destinations" | "seasonal_conditions" | "indicators" | "recommendations" | "visitor_counts" | "heritage_sites"
  | "events" | "trips" | "trip_stops" | "profiles" | "roles" | "reports" | "panoramas" | "community_notices";

/**
 * Re-run `onChange` (debounced) whenever any of `tables` changes in Supabase Realtime.
 * RLS applies, so a user only hears about rows they're allowed to read.
 */
export function useLive(tables: LiveTable[], onChange: () => void, opts: { filter?: string; delay?: number; enabled?: boolean } = {}) {
  const id = useId();
  const cb = useRef(onChange);
  cb.current = onChange;
  const key = tables.join(",");
  const { filter, delay = 600, enabled = true } = opts;

  useEffect(() => {
    if (!enabled || !tables.length) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      clearTimeout(timer);
      timer = setTimeout(() => cb.current(), delay);
    };
    let ch = supabase.channel(`live${id}${key}`);
    for (const table of tables) {
      ch = ch.on("postgres_changes", { event: "*", schema: "public", table, ...(filter ? { filter } : {}) }, fire);
    }
    ch.subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, key, filter, delay, enabled]);
}
