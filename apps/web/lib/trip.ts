/** Shared trip-date helpers and limits for the hero trip bar and the planner. */
export const addDays = (iso: string, n: number) => new Date(Date.parse(iso + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

export const MAX_DAYS = 10;
export const MAX_PARTY = 60;

export interface TripBasics { start?: string; days?: number; party?: number }

/** Reads ?start=YYYY-MM-DD&days=&party= into valid values, dropping anything out of range or in the past. */
export function parseTrip(q: { start?: string; days?: string; party?: string }): TripBasics {
  const n = (v: string | undefined, max: number) => {
    const x = Number(v);
    return Number.isInteger(x) && x >= 1 && x <= max ? x : undefined;
  };
  const start = q.start && /^\d{4}-\d{2}-\d{2}$/.test(q.start) && q.start >= todayIST() ? q.start : undefined;
  return { start, days: n(q.days, MAX_DAYS), party: n(q.party, MAX_PARTY) };
}
