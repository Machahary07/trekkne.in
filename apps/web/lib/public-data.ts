import { createClient } from "@supabase/supabase-js";
import type { Database } from "@trekne/db";

/**
 * Read-only queries for the public site. Everything here is public under RLS
 * (published places, published events, active community notices, aggregate RPCs).
 */
export function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

/** Today in India as YYYY-MM-DD. */
export const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => new Date(Date.parse(iso + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const fmtDay = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", opts);

export const STATE_NAMES: Record<string, string> = {
  AS: "Assam", AR: "Arunachal Pradesh", ML: "Meghalaya", NL: "Nagaland", MN: "Manipur", MZ: "Mizoram", TR: "Tripura", SK: "Sikkim",
};

export async function getOverview(day = todayIST()) {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb.rpc("destination_overview", { on_day: day });
  return data ?? [];
}

/** Expected-load grid for `days` days starting today: one overview per day. */
export async function getPressureGrid(days = 14) {
  const start = todayIST();
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const grids = await Promise.all(dates.map((d) => getOverview(d)));
  return { dates, grids };
}

export async function getCalendar() {
  const sb = publicClient();
  if (!sb) return { events: [], seasons: [], places: [] };
  const today = todayIST();
  const [events, seasons, places] = await Promise.all([
    sb.from("events").select("id,name,community,state_code,destination_id,starts_on,ends_on,visitor_impact,open_to_visitors,etiquette,description")
      .eq("is_published", true).gte("ends_on", today).lte("starts_on", addDays(today, 365)).order("starts_on"),
    sb.from("seasonal_conditions").select("destination_id,month,suitability"),
    sb.from("destinations").select("id,slug,name,state_code,kind,ecosystem,is_lesser_known").eq("is_published", true).order("state_code").order("name"),
  ]);
  return { events: events.data ?? [], seasons: seasons.data ?? [], places: places.data ?? [] };
}

export async function getNotices(destinationId?: string) {
  const sb = publicClient();
  if (!sb) return [];
  let q = sb.from("community_notices").select("id,destination_id,kind,title,body,starts_on,ends_on,community,destinations(name,slug)")
    .eq("is_active", true).gte("ends_on", todayIST()).order("starts_on");
  if (destinationId) q = q.eq("destination_id", destinationId);
  const { data } = await q;
  return data ?? [];
}

export async function getRecurringIssues(windowDays = 30) {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb.rpc("recurring_issues", { window_days: windowDays });
  return data ?? [];
}

export const NOTICE_LABEL = { closure: "Closure", sacred_day: "Sacred day", restriction: "Restriction", advisory: "Community advice" } as const;
