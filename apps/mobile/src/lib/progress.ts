import { EMPTY_PROGRESS, type Progress } from "@trekne/brand";
import { useLoad } from "./data";
import { supabase } from "./supabase";

/** The signed-in user's activity counts; updates live when trips, reports or scenes change. */
export function useProgress() {
  const { data, reload } = useLoad(
    async () => {
      const { data, error } = await supabase.rpc("my_progress");
      if (error) throw new Error(error.message);
      return { ...EMPTY_PROGRESS, ...((data ?? {}) as Partial<Progress>) };
    },
    [],
    ["trips", "trip_stops", "reports", "panoramas", "community_notices", "heritage_sites", "visitor_counts"],
  );
  return { progress: data ?? EMPTY_PROGRESS, reload };
}
