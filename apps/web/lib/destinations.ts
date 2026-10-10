import { createClient } from "@supabase/supabase-js";
import type { Database } from "@trekne/db";

/**
 * Destination intelligence data.
 *
 * Everything here is SIMULATED pilot data for the frontend. When Supabase is
 * connected, replace the body of `getDestinations()` with a query against the
 * destinations / reports / advisories tables — the component contract stays the same.
 */

export type DestinationKey = "nongriat" | "nohkalikai" | "dawki";

/** good = green, warn = yellow, high = orange, none = not verified (we don't guess). */
export type Level = "good" | "warn" | "high" | "none";

/** verified = moderator-approved Ranger report, official = government source (e.g. IMD). */
export type ReportStatus = "verified" | "official" | "pending" | "unverified";

export interface Indicator {
  label: string;
  value: string;
  level: Level;
  source: string;
  updated: string;
}

export interface Report {
  status: ReportStatus;
  text: string;
  reporter: string;
  when: string;
}

export interface Destination {
  key: DestinationKey;
  tab: string;
  name: string;
  place: string;
  facts: Array<[label: string, value: string]>;
  culture: string;
  indicators: Indicator[];
  recommendation: string;
  recommendationMeta: string;
  reports: Report[];
  /** Search terms that resolve to this destination from the hero search. */
  aliases: string[];
}

export const REPORT_LABEL: Record<ReportStatus, string> = {
  verified: "Verified",
  official: "Official",
  pending: "Pending review",
  unverified: "Unverified",
};

const DESTINATIONS: Destination[] = [
  {
    key: "nongriat",
    tab: "Nongriat",
    name: "Double-Decker Root Bridge",
    place: "Nongriat · East Khasi Hills, Meghalaya",
    facts: [
      ["Best time", "Oct – Apr"],
      ["Access", "~3,000 steps from Tyrna"],
      ["Trek time", "2–3 h down, more up"],
      ["Facilities", "Village homestays, no ATM"],
    ],
    culture:
      "The bridges are living community heritage. Stay off the roots, carry all waste back up and ask before photographing residents.",
    indicators: [
      { label: "Weather risk", value: "Moderate", level: "warn", source: "IMD district forecast", updated: "Today 06:00" },
      { label: "Accessibility", value: "Trail open", level: "good", source: "Ranger report · verified", updated: "2 h ago" },
      { label: "Eco sensitivity", value: "High", level: "high", source: "Destination profile", updated: "Reviewed Sep 2026" },
      { label: "Visitor pressure", value: "Not verified", level: "none", source: "No reliable count, so we won’t guess", updated: "—" },
    ],
    recommendation:
      "Start down from Tyrna before 8 am. The steps are dry and the trail is open as of this morning, but afternoon showers are likely and wet steps are slow going. There are no bins below the village, so pack out what you bring. If you plan to stay overnight, book a Nongriat homestay rather than camping near the pools.",
    recommendationMeta: "Based on 4 sources · updated 08:40",
    reports: [
      { status: "verified", text: "Steps clear and dry down to the bridge. Two guides on the route this morning.", reporter: "Ranger · Tyrna", when: "2 h ago" },
      { status: "official", text: "Light to moderate rain likely in the afternoon.", reporter: "IMD · East Khasi Hills", when: "06:00" },
      { status: "pending", text: "Plastic bottles collecting at the lower pool. Clean-up requested.", reporter: "Ranger · Nongriat", when: "35 min ago" },
      { status: "unverified", text: "Felt crowded near the natural pool around noon.", reporter: "Traveller report", when: "1 h ago" },
    ],
    aliases: ["nongriat", "root", "bridge", "double", "tyrna", "living"],
  },
  {
    key: "nohkalikai",
    tab: "Nohkalikai Falls",
    name: "Nohkalikai Falls",
    place: "Sohra · East Khasi Hills, Meghalaya",
    facts: [
      ["Best time", "Jun – Oct for flow"],
      ["Access", "Road to viewpoint"],
      ["From Shillong", "~2 h by road"],
      ["Facilities", "Parking, stalls, toilets"],
    ],
    culture:
      "The falls carry a Khasi legend that locals tell with care. Stay behind the viewpoint railing, and ask a Ranger guide for the story instead of trusting a sign.",
    indicators: [
      { label: "Weather risk", value: "Fog likely", level: "warn", source: "IMD + Ranger observation", updated: "Today 07:15" },
      { label: "Accessibility", value: "Slow, one lane", level: "high", source: "Ranger report · verified", updated: "3 h ago" },
      { label: "Eco sensitivity", value: "Moderate", level: "warn", source: "Destination profile", updated: "Reviewed Sep 2026" },
      { label: "Visitor pressure", value: "Busy weekends", level: "warn", source: "Entry records (simulated)", updated: "Last 8 weeks" },
    ],
    recommendation:
      "Plan to arrive around 11 am, when the fog usually lifts. A verified Ranger report shows a small slip about 4 km before Sohra, with one-lane traffic, so allow an extra 30 minutes. Weekends are busiest. A weekday visit means more time at the railing and less waiting at parking.",
    recommendationMeta: "Based on 4 sources · updated 08:10",
    reports: [
      { status: "verified", text: "Small slip cleared to one lane, about 4 km before Sohra. Traffic moving slowly.", reporter: "Ranger · Sohra", when: "3 h ago" },
      { status: "official", text: "Dense fog likely in the morning over higher reaches.", reporter: "IMD · East Khasi Hills", when: "06:00" },
      { status: "verified", text: "Waste bins full at the viewpoint car park. Please carry your waste back.", reporter: "Ranger · Sohra", when: "5 h ago" },
      { status: "unverified", text: "Couldn’t see the falls at 9 am, but it cleared by 10:30.", reporter: "Traveller report", when: "Yesterday" },
    ],
    aliases: ["nohkalikai", "sohra", "cherrapunji", "cherrapunjee", "falls", "waterfall"],
  },
  {
    key: "dawki",
    tab: "Dawki · Umngot",
    name: "Umngot River",
    place: "Dawki & Shnongpdeng · West Jaintia Hills",
    facts: [
      ["Best time", "Nov – Apr (clear water)"],
      ["Access", "Road + boat stands"],
      ["Activities", "Boating, kayaking"],
      ["Facilities", "Homestays at Shnongpdeng"],
    ],
    culture:
      "The river feeds the villages along it. Use no soap or detergent in the water, and follow the boatmen’s association rules on timings and life jackets.",
    indicators: [
      { label: "Weather risk", value: "Low", level: "good", source: "IMD district forecast", updated: "Today 06:00" },
      { label: "Accessibility", value: "Boating open", level: "good", source: "Ranger report · verified", updated: "1 h ago" },
      { label: "Eco sensitivity", value: "High", level: "high", source: "River ecosystem profile", updated: "Reviewed Sep 2026" },
      { label: "Visitor pressure", value: "High", level: "high", source: "Boat-stand counts (simulated)", updated: "Last 4 weeks" },
    ],
    recommendation:
      "This is peak clear-water season, and it’s busy. Go on a weekday morning for fewer boats and calmer water. Stay at a Shnongpdeng homestay instead of camping on the sandbanks, which are under pressure this season. Life jackets are mandatory on all boats.",
    recommendationMeta: "Based on 4 sources · updated 08:25",
    reports: [
      { status: "verified", text: "Boating running normally from Shnongpdeng. Water very clear.", reporter: "Ranger · Shnongpdeng", when: "1 h ago" },
      { status: "pending", text: "Long boat queues reported at the Dawki stand after 11 am.", reporter: "Ranger · Dawki", when: "20 min ago" },
      { status: "official", text: "Dry weather expected through the weekend.", reporter: "IMD · West Jaintia Hills", when: "06:00" },
      { status: "unverified", text: "Saw litter on the sandbank near the suspension bridge.", reporter: "Traveller report", when: "2 h ago" },
    ],
    aliases: ["dawki", "umngot", "shnongpdeng", "river", "boat", "jaintia"],
  },
];

const KIND_ORDER = ["weather", "access", "eco", "pressure"];
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return m < 2880 ? "Yesterday" : `${Math.round(m / 1440)} days ago`;
};

/**
 * Pilot destinations from Supabase (published rows, verified/official/unverified reports only),
 * layered over the simulated copy so the page still renders if the database is unreachable.
 */
export async function getDestinations(): Promise<Destination[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return DESTINATIONS;
  try {
    const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("destinations")
      .select("slug,name,place,facts,culture,indicators(kind,label,value,level,source,updated_at),recommendations(body,meta,generated_at),reports(status,body,source_label,created_at)")
      .in("slug", DESTINATIONS.map((d) => d.key))
      .in("reports.status", ["verified", "official", "unverified"])
      .order("created_at", { referencedTable: "reports", ascending: false })
      .limit(4, { referencedTable: "reports" });
    if (error || !data) return DESTINATIONS;
    return DESTINATIONS.map((sim) => {
      const row = data.find((d) => d.slug === sim.key);
      if (!row) return sim;
      const rec = row.recommendations;
      return {
        ...sim,
        name: row.name,
        place: row.place || sim.place,
        facts: (Array.isArray(row.facts) && row.facts.length ? row.facts : sim.facts) as Destination["facts"],
        culture: row.culture || sim.culture,
        indicators: row.indicators.length
          ? [...row.indicators]
              .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
              .map((i) => ({ label: i.label, value: i.value, level: i.level, source: i.source, updated: ago(i.updated_at) }))
          : sim.indicators,
        recommendation: rec?.body ?? sim.recommendation,
        recommendationMeta: rec ? `${rec.meta} · updated ${ago(rec.generated_at)}` : sim.recommendationMeta,
        reports: row.reports.length
          ? row.reports.map((r) => ({ status: r.status as ReportStatus, text: r.body, reporter: r.source_label, when: ago(r.created_at) }))
          : sim.reports,
      };
    });
  } catch {
    return DESTINATIONS;
  }
}

export function matchDestination(query: string, list: Destination[]): DestinationKey | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const hit = list.find((d) => d.aliases.some((a) => q.includes(a) || (q.length > 3 && a.includes(q))));
  return hit?.key ?? null;
}
