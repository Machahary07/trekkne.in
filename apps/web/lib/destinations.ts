import { createClient } from "@supabase/supabase-js";
import type { Database } from "@trekne/db";

/**
 * Destination intelligence data.
 *
 * The profiles below are authored pilot content (some figures SIMULATED).
 * `getDestinations()` layers live Supabase data on top (reports, indicators,
 * advisory); move more fields into the database as tables for them exist.
 * The component contract stays the same.
 *
 * Honesty rules the UI relies on:
 *  - `null` stats render as "Not verified" — never fill them with guesses.
 *  - Route geometry is SCHEMATIC (no surveyed coordinates yet); the map says so.
 *  - Caution segments come only from verified or official sources.
 *  - Visitor trends exist only where a record source exists; otherwise
 *    `visitors.available` is false and the UI shows an explicit empty state.
 */

import type { IconName } from "@/components/Icon";

export type DestinationKey = "nongriat" | "nohkalikai" | "dawki";

/** good = green, warn = yellow, high = orange, none = not verified (we don't guess). */
export type Level = "good" | "warn" | "high" | "none";

/** verified = moderator-approved Ranger report, official = government source (e.g. IMD). */
export type ReportStatus = "verified" | "official" | "pending" | "unverified";

export type ReportCategory = "trail" | "road" | "weather" | "waste" | "crowd" | "boating";

export type WeatherIcon = "sun" | "partly" | "cloud" | "fog" | "showers" | "rain";

export interface Indicator {
  label: string;
  value: string;
  level: Level;
  source: string;
  updated: string;
}

export interface Report {
  id: string;
  status: ReportStatus;
  category: ReportCategory;
  text: string;
  reporter: string;
  when: string;
  /** For sorting; relative to the pilot snapshot time (08:40). */
  minutesAgo: number;
  /** How the report was checked — shown when a report is expanded. */
  verification: string;
  evidence?: string;
  /** Route node the observation was made at, if it has a location. */
  at?: string;
}

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  /** CSS object-position for the crop. */
  focus?: string;
}

export interface RouteNode {
  id: string;
  /** Empty label = shaping point only. */
  label: string;
  kind: "start" | "waypoint" | "end" | "poi" | "shape";
  /** Put the label above the point (when the space below is crowded). */
  labelAbove?: boolean;
  /** Schematic position, 0–100 on both axes. Not geographic coordinates. */
  x: number;
  y: number;
}

export interface RouteStat {
  label: string;
  value: string | null;
  note?: string;
}

export interface Route {
  mode: "trek" | "road" | "river";
  title: string;
  nodes: RouteNode[];
  /** Stretches flagged by verified/official sources: [fromNodeId, toNodeId, note]. */
  caution: Array<[from: string, to: string, note: string]>;
  stats: RouteStat[];
}

export interface HourForecast {
  time: string;
  temp: number;
  /** Probability of precipitation, %. */
  rain: number;
  icon: WeatherIcon;
  label: string;
}

export interface Weather {
  area: string;
  source: string;
  issued: string;
  now: { temp: number; icon: WeatherIcon; condition: string; high: number; low: number };
  /** Optional — when absent the panel shows only the forecast summary. */
  hourly?: HourForecast[];
  summary: string;
  risk: { level: Level; text: string };
}

export type Visitors =
  | { available: false; reason: string }
  | { available: true; source: string; period: string; labels: string[]; series: number[]; note: string; level: Level };

export interface Insight {
  icon: IconName;
  tone: Level;
  title: string;
  text: string;
  sources: string[];
}

export interface Guideline {
  icon: IconName;
  title: string;
  detail: string;
}

export interface Destination {
  key: DestinationKey;
  tab: string;
  /** Tab label for narrow screens. */
  short?: string;
  name: string;
  place: string;
  photo: Photo;
  facts: Array<[label: string, value: string]>;
  indicators: Indicator[];
  route: Route;
  weather: Weather;
  eco: { level: "low" | "moderate" | "high"; source: string; updated: string; concerns: string[] };
  visitors: Visitors;
  insights: Insight[];
  recommendation: string;
  updated: string;
  reports: Report[];
  culture: { summary: string; guidelines: Guideline[] };
  /** Search terms that resolve to this destination from the hero search. */
  aliases: string[];
}

export const REPORT_LABEL: Record<ReportStatus, string> = {
  verified: "Verified",
  official: "Official",
  pending: "Pending review",
  unverified: "Unverified",
};

const CC_BY_2 = "https://creativecommons.org/licenses/by/2.0/";
const CC_BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0/";

const DESTINATIONS: Destination[] = [
  {
    key: "nongriat",
    tab: "Nongriat",
    name: "Double-Decker Root Bridge",
    place: "Nongriat · East Khasi Hills, Meghalaya",
    photo: {
      src: "/destinations/nongriat.jpg",
      width: 1920,
      height: 1286,
      alt: "The two-level living root bridge at Nongriat spanning a rocky stream in dense forest",
      credit: "Vinayak Hegde",
      license: "CC BY 2.0",
      licenseUrl: CC_BY_2,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:A_double_decker_living_bridge_in_Meghalaya,_December_2011.jpg",
      focus: "50% 40%",
    },
    facts: [
      ["Best time", "Oct – Apr"],
      ["Access", "~3,000 steps from Tyrna"],
      ["Stay", "Village homestays"],
      ["Note", "No ATM below Tyrna"],
    ],
    indicators: [
      { label: "Weather", value: "Moderate", level: "warn", source: "IMD district forecast", updated: "Today 06:00" },
      { label: "Access", value: "Trail open", level: "good", source: "Ranger report · verified", updated: "2 h ago" },
      { label: "Eco", value: "High", level: "high", source: "Destination profile", updated: "Reviewed Sep 2026" },
      { label: "Visitors", value: "Not verified", level: "none", source: "No reliable count", updated: "—" },
    ],
    route: {
      mode: "trek",
      title: "Tyrna trailhead → Double-Decker Bridge",
      nodes: [
        { id: "tyrna", label: "Tyrna trailhead", kind: "start", x: 9, y: 18, labelAbove: true },
        { id: "s1", label: "", kind: "shape", x: 20, y: 30 },
        { id: "steps", label: "Stone steps", kind: "waypoint", x: 24, y: 44 },
        { id: "wire", label: "Suspension bridges", kind: "poi", x: 46, y: 70 },
        { id: "village", label: "Nongriat village", kind: "waypoint", x: 64, y: 40, labelAbove: true },
        { id: "bridge", label: "Double-Decker Bridge", kind: "end", x: 80, y: 66, labelAbove: true },
        { id: "pool", label: "Natural pool", kind: "poi", x: 94, y: 92 },
      ],
      caution: [["steps", "wire", "Steps get slippery once showers start (IMD)"]],
      stats: [
        { label: "Steps", value: "~3,000", note: "Ranger estimate" },
        { label: "Time down", value: "2–3 h", note: "Longer back up" },
        { label: "Difficulty", value: "Strenuous", note: "Return climb" },
        { label: "Distance", value: null, note: "Not yet surveyed" },
      ],
    },
    weather: {
      area: "East Khasi Hills",
      source: "IMD district forecast",
      issued: "Today 06:00",
      now: { temp: 18, icon: "sun", condition: "Mostly sunny", high: 25, low: 17 },
      hourly: [
        { time: "09", temp: 19, rain: 5, icon: "sun", label: "Sunny" },
        { time: "10", temp: 21, rain: 10, icon: "partly", label: "Partly cloudy" },
        { time: "11", temp: 22, rain: 15, icon: "partly", label: "Partly cloudy" },
        { time: "12", temp: 24, rain: 25, icon: "partly", label: "Partly cloudy" },
        { time: "13", temp: 24, rain: 40, icon: "cloud", label: "Cloudy" },
        { time: "14", temp: 23, rain: 65, icon: "showers", label: "Showers" },
        { time: "15", temp: 22, rain: 70, icon: "showers", label: "Showers" },
        { time: "16", temp: 21, rain: 75, icon: "rain", label: "Rain" },
        { time: "17", temp: 20, rain: 55, icon: "showers", label: "Showers" },
        { time: "18", temp: 19, rain: 30, icon: "cloud", label: "Cloudy" },
        { time: "19", temp: 18, rain: 20, icon: "cloud", label: "Cloudy" },
        { time: "20", temp: 17, rain: 15, icon: "cloud", label: "Cloudy" },
      ],
      summary: "Dry morning, light to moderate showers likely in the afternoon.",
      risk: { level: "warn", text: "Showers 14:00–17:00 · wet steps" },
    },
    eco: {
      level: "high",
      source: "Destination profile",
      updated: "Reviewed Sep 2026",
      concerns: ["Roots damaged by climbing and carving", "No bins below Tyrna", "Soap and sunscreen in pools"],
    },
    visitors: { available: false, reason: "No reliable visitor count for this trail yet, so we won’t guess." },
    insights: [
      { icon: "clock", tone: "warn", title: "Start down before 8 am", text: "Showers likely from 2 pm, and wet steps are slow and slippery.", sources: ["IMD 06:00"] },
      { icon: "route", tone: "good", title: "Trail open to the bridge", text: "Steps clear and dry, confirmed by a Ranger at Tyrna.", sources: ["Ranger · verified 2 h ago"] },
      { icon: "leaf", tone: "high", title: "Pack out your waste", text: "No bins below Tyrna. Plastic at the lower pool is awaiting review.", sources: ["Destination profile", "Ranger · pending"] },
    ],
    recommendation:
      "Start down from Tyrna before 8 am. The steps are dry and the trail is open as of this morning, but afternoon showers are likely and wet steps are slow going. There are no bins below the village, so pack out what you bring. If you plan to stay overnight, book a Nongriat homestay rather than camping near the pools.",
    updated: "08:40",
    reports: [
      { id: "n1", status: "pending", category: "waste", text: "Plastic bottles collecting at the lower pool. Clean-up requested.", reporter: "Ranger · Nongriat", when: "35 min ago", minutesAgo: 35, verification: "Awaiting moderator review", evidence: "2 photos · GPS pin", at: "pool" },
      { id: "n2", status: "unverified", category: "crowd", text: "Felt crowded at the bridge around noon.", reporter: "Traveller report", when: "1 h ago", minutesAgo: 60, verification: "Traveller submission, not reviewed", at: "bridge" },
      { id: "n3", status: "verified", category: "trail", text: "Steps clear and dry down to the bridge. Two guides on the route this morning.", reporter: "Ranger · Tyrna", when: "2 h ago", minutesAgo: 120, verification: "Verified by moderator at 07:05", evidence: "3 photos · GPS pin", at: "steps" },
      { id: "n4", status: "official", category: "weather", text: "Light to moderate rain likely in the afternoon.", reporter: "IMD · East Khasi Hills", when: "06:00", minutesAgo: 160, verification: "Government district forecast" },
    ],
    culture: {
      summary: "The bridges are living community heritage, grown and cared for by Khasi villagers over generations.",
      guidelines: [
        { icon: "temple", title: "Treat the roots as heritage", detail: "Don’t climb on, carve or pull at the living roots. They are shaped and maintained by the village." },
        { icon: "camera", title: "Ask before photographing people", detail: "Nongriat is a home, not a set. Ask residents before photographing them or their houses." },
        { icon: "leaf", title: "Carry it back up", detail: "There are no bins below Tyrna. Bring a bag and take all your waste back to the trailhead." },
      ],
    },
    aliases: ["nongriat", "root", "bridge", "double", "tyrna", "living"],
  },
  {
    key: "nohkalikai",
    tab: "Nohkalikai Falls",
    short: "Nohkalikai",
    name: "Nohkalikai Falls",
    place: "Sohra · East Khasi Hills, Meghalaya",
    photo: {
      src: "/destinations/nohkalikai.jpg",
      width: 1920,
      height: 1475,
      alt: "Nohkalikai Falls plunging from a forested cliff into a turquoise pool far below",
      credit: "Vikramjit Kakati",
      license: "CC BY-SA 4.0",
      licenseUrl: CC_BY_SA_4,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:NohKaLikai_Falls_V2_Wiki.jpg",
      focus: "45% 55%",
    },
    facts: [
      ["Best time", "Jun – Oct for flow"],
      ["Access", "Road to viewpoint"],
      ["From Shillong", "~2 h by road"],
      ["Facilities", "Parking, stalls, toilets"],
    ],
    indicators: [
      { label: "Weather", value: "Fog likely", level: "warn", source: "IMD + Ranger observation", updated: "Today 07:15" },
      { label: "Access", value: "Slow, one lane", level: "high", source: "Ranger report · verified", updated: "3 h ago" },
      { label: "Eco", value: "Moderate", level: "warn", source: "Destination profile", updated: "Reviewed Sep 2026" },
      { label: "Visitors", value: "Busy weekends", level: "warn", source: "Entry records (simulated)", updated: "Last 8 weeks" },
    ],
    route: {
      mode: "road",
      title: "Shillong → Sohra → Nohkalikai viewpoint",
      nodes: [
        { id: "shillong", label: "Shillong", kind: "start", x: 7, y: 22, labelAbove: true },
        { id: "r1", label: "", kind: "shape", x: 22, y: 42 },
        { id: "r2", label: "", kind: "shape", x: 38, y: 36 },
        { id: "slip", label: "Slip · one lane", kind: "poi", x: 50, y: 62 },
        { id: "sohra", label: "Sohra", kind: "waypoint", x: 70, y: 40 },
        { id: "falls", label: "Nohkalikai viewpoint", kind: "end", x: 90, y: 72 },
      ],
      caution: [["r2", "sohra", "One-lane traffic at a cleared slip (Ranger, verified)"]],
      stats: [
        { label: "By road", value: "~2 h", note: "From Shillong" },
        { label: "Delay", value: "+30 min", note: "Slip, verified" },
        { label: "Difficulty", value: "Easy", note: "Short walk to railing" },
        { label: "Distance", value: null, note: "Not yet verified" },
      ],
    },
    weather: {
      area: "East Khasi Hills",
      source: "IMD district forecast",
      issued: "Today 06:00",
      now: { temp: 16, icon: "fog", condition: "Fog", high: 21, low: 14 },
      hourly: [
        { time: "09", temp: 16, rain: 20, icon: "fog", label: "Fog" },
        { time: "10", temp: 17, rain: 15, icon: "fog", label: "Fog" },
        { time: "11", temp: 19, rain: 10, icon: "partly", label: "Clearing" },
        { time: "12", temp: 20, rain: 10, icon: "partly", label: "Partly cloudy" },
        { time: "13", temp: 21, rain: 15, icon: "partly", label: "Partly cloudy" },
        { time: "14", temp: 21, rain: 25, icon: "cloud", label: "Cloudy" },
        { time: "15", temp: 20, rain: 30, icon: "cloud", label: "Cloudy" },
        { time: "16", temp: 19, rain: 45, icon: "showers", label: "Showers" },
        { time: "17", temp: 18, rain: 50, icon: "showers", label: "Showers" },
        { time: "18", temp: 17, rain: 35, icon: "cloud", label: "Cloudy" },
        { time: "19", temp: 16, rain: 30, icon: "fog", label: "Fog" },
        { time: "20", temp: 15, rain: 25, icon: "fog", label: "Fog" },
      ],
      summary: "Dense morning fog over higher reaches, clearing by late morning.",
      risk: { level: "warn", text: "Fog until ~11:00 · low visibility" },
    },
    eco: {
      level: "moderate",
      source: "Destination profile",
      updated: "Reviewed Sep 2026",
      concerns: ["Bins overflow at the car park", "Litter thrown over the railing"],
    },
    visitors: {
      available: true,
      source: "Entry records (simulated)",
      period: "Last 8 weeks",
      labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
      series: [0.55, 0.6, 0.58, 0.7, 0.66, 0.8, 0.78, 0.9],
      note: "Rising, with weekends consistently busiest",
      level: "warn",
    },
    insights: [
      { icon: "clock", tone: "warn", title: "Arrive around 11 am", text: "Fog usually lifts by late morning.", sources: ["IMD 06:00", "Ranger observation"] },
      { icon: "route", tone: "high", title: "Allow an extra 30 min", text: "One-lane traffic at a slip ~4 km before Sohra.", sources: ["Ranger · verified 3 h ago"] },
      { icon: "users", tone: "warn", title: "Pick a weekday", text: "Entry records show weekends are the busiest.", sources: ["Entry records (simulated)"] },
    ],
    recommendation:
      "Plan to arrive around 11 am, when the fog usually lifts. A verified Ranger report shows a small slip about 4 km before Sohra, with one-lane traffic, so allow an extra 30 minutes. Weekends are busiest. A weekday visit means more time at the railing and less waiting at parking.",
    updated: "08:10",
    reports: [
      { id: "k1", status: "verified", category: "road", text: "Small slip cleared to one lane, about 4 km before Sohra. Traffic moving slowly.", reporter: "Ranger · Sohra", when: "3 h ago", minutesAgo: 180, verification: "Verified by moderator at 05:52", evidence: "2 photos · GPS pin", at: "slip" },
      { id: "k2", status: "official", category: "weather", text: "Dense fog likely in the morning over higher reaches.", reporter: "IMD · East Khasi Hills", when: "06:00", minutesAgo: 160, verification: "Government district forecast" },
      { id: "k3", status: "verified", category: "waste", text: "Waste bins full at the viewpoint car park. Please carry your waste back.", reporter: "Ranger · Sohra", when: "5 h ago", minutesAgo: 300, verification: "Verified by moderator at 04:20", evidence: "1 photo · GPS pin", at: "falls" },
      { id: "k4", status: "unverified", category: "weather", text: "Couldn’t see the falls at 9 am, but it cleared by 10:30.", reporter: "Traveller report", when: "Yesterday", minutesAgo: 1400, verification: "Traveller submission, not reviewed", at: "falls" },
    ],
    culture: {
      summary: "The falls carry a Khasi legend that locals tell with care.",
      guidelines: [
        { icon: "temple", title: "Hear the story from a local", detail: "Ask a Ranger guide to tell the legend of the falls rather than relying on a signboard version." },
        { icon: "shield", title: "Stay behind the railing", detail: "Don’t step past the viewpoint railing or onto the cliff edge for photos." },
        { icon: "leaf", title: "Bins are full today", detail: "Carry your waste back to Sohra instead of adding to the overflowing car-park bins." },
      ],
    },
    aliases: ["nohkalikai", "sohra", "cherrapunji", "cherrapunjee", "falls", "waterfall"],
  },
  {
    key: "dawki",
    tab: "Dawki · Umngot",
    short: "Dawki",
    name: "Umngot River",
    place: "Dawki & Shnongpdeng · West Jaintia Hills",
    photo: {
      src: "/destinations/dawki.jpg",
      width: 1920,
      height: 1280,
      alt: "A wooden boat on the still green Umngot river near Dawki, with a suspension bridge and forested banks behind",
      credit: "Vikramjit Kakati",
      license: "CC BY-SA 4.0",
      licenseUrl: CC_BY_SA_4,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Umngot_river,_Dawki.jpg",
      focus: "50% 55%",
    },
    facts: [
      ["Best time", "Nov – Apr (clear water)"],
      ["Access", "Road + boat stands"],
      ["Activities", "Boating, kayaking"],
      ["Stay", "Homestays at Shnongpdeng"],
    ],
    indicators: [
      { label: "Weather", value: "Low", level: "good", source: "IMD district forecast", updated: "Today 06:00" },
      { label: "Access", value: "Boating open", level: "good", source: "Ranger report · verified", updated: "1 h ago" },
      { label: "Eco", value: "High", level: "high", source: "River ecosystem profile", updated: "Reviewed Sep 2026" },
      { label: "Visitors", value: "High", level: "high", source: "Boat-stand counts (simulated)", updated: "Last 4 weeks" },
    ],
    route: {
      mode: "river",
      title: "Dawki boat stand → Shnongpdeng",
      nodes: [
        { id: "dawki", label: "Dawki bridge & boat stand", kind: "start", x: 10, y: 26 },
        { id: "w1", label: "", kind: "shape", x: 28, y: 46 },
        { id: "sand", label: "Sandbanks", kind: "poi", x: 48, y: 54 },
        { id: "w2", label: "", kind: "shape", x: 66, y: 48 },
        { id: "shnong", label: "Shnongpdeng boat stand", kind: "end", x: 88, y: 72 },
      ],
      caution: [],
      stats: [
        { label: "Mode", value: "Road + boat", note: "Rowed boats" },
        { label: "From Shillong", value: "~2.5–3 h", note: "By road" },
        { label: "Difficulty", value: "Easy", note: "Life jacket required" },
        { label: "River distance", value: null, note: "Not yet surveyed" },
      ],
    },
    weather: {
      area: "West Jaintia Hills",
      source: "IMD district forecast",
      issued: "Today 06:00",
      now: { temp: 24, icon: "sun", condition: "Sunny", high: 29, low: 19 },
      hourly: [
        { time: "09", temp: 24, rain: 0, icon: "sun", label: "Sunny" },
        { time: "10", temp: 26, rain: 0, icon: "sun", label: "Sunny" },
        { time: "11", temp: 27, rain: 5, icon: "sun", label: "Sunny" },
        { time: "12", temp: 28, rain: 5, icon: "partly", label: "Partly cloudy" },
        { time: "13", temp: 29, rain: 5, icon: "partly", label: "Partly cloudy" },
        { time: "14", temp: 29, rain: 10, icon: "partly", label: "Partly cloudy" },
        { time: "15", temp: 28, rain: 10, icon: "partly", label: "Partly cloudy" },
        { time: "16", temp: 27, rain: 10, icon: "cloud", label: "Cloudy" },
        { time: "17", temp: 25, rain: 5, icon: "cloud", label: "Cloudy" },
        { time: "18", temp: 24, rain: 5, icon: "partly", label: "Partly cloudy" },
        { time: "19", temp: 22, rain: 0, icon: "partly", label: "Clear" },
        { time: "20", temp: 21, rain: 0, icon: "partly", label: "Clear" },
      ],
      summary: "Dry weather expected through the weekend.",
      risk: { level: "good", text: "Dry all day · calm water" },
    },
    eco: {
      level: "high",
      source: "River ecosystem profile",
      updated: "Reviewed Sep 2026",
      concerns: ["Soap and detergent in the river", "Camping pressure on sandbanks", "Litter on sandbanks"],
    },
    visitors: {
      available: true,
      source: "Boat-stand counts (simulated)",
      period: "Last 4 weeks",
      labels: ["W1", "W2", "W3", "W4"],
      series: [0.62, 0.74, 0.86, 0.95],
      note: "Climbing into peak clear-water season",
      level: "high",
    },
    insights: [
      { icon: "users", tone: "high", title: "Go on a weekday morning", text: "Boat-stand counts are at a seasonal high.", sources: ["Boat-stand counts (simulated)"] },
      { icon: "leaf", tone: "high", title: "Skip sandbank camping", text: "Sandbanks are under pressure. Stay at a Shnongpdeng homestay.", sources: ["River ecosystem profile"] },
      { icon: "shield", tone: "good", title: "Boating running normally", text: "Life jackets are mandatory on every boat.", sources: ["Ranger · verified 1 h ago"] },
    ],
    recommendation:
      "This is peak clear-water season, and it’s busy. Go on a weekday morning for fewer boats and calmer water. Stay at a Shnongpdeng homestay instead of camping on the sandbanks, which are under pressure this season. Life jackets are mandatory on all boats.",
    updated: "08:25",
    reports: [
      { id: "d1", status: "pending", category: "crowd", text: "Long boat queues reported at the Dawki stand after 11 am.", reporter: "Ranger · Dawki", when: "20 min ago", minutesAgo: 20, verification: "Awaiting moderator review", evidence: "1 photo · GPS pin", at: "dawki" },
      { id: "d2", status: "verified", category: "boating", text: "Boating running normally from Shnongpdeng. Water very clear.", reporter: "Ranger · Shnongpdeng", when: "1 h ago", minutesAgo: 60, verification: "Verified by moderator at 07:48", evidence: "2 photos · GPS pin", at: "shnong" },
      { id: "d3", status: "unverified", category: "waste", text: "Saw litter on the sandbank near the suspension bridge.", reporter: "Traveller report", when: "2 h ago", minutesAgo: 120, verification: "Traveller submission, not reviewed", at: "sand" },
      { id: "d4", status: "official", category: "weather", text: "Dry weather expected through the weekend.", reporter: "IMD · West Jaintia Hills", when: "06:00", minutesAgo: 160, verification: "Government district forecast" },
    ],
    culture: {
      summary: "The river feeds the villages along it, and the boatmen’s association runs boating.",
      guidelines: [
        { icon: "leaf", title: "No soap in the river", detail: "Don’t use soap, shampoo or detergent in the water. Villages downstream rely on it." },
        { icon: "users", title: "Follow the boatmen", detail: "The boatmen’s association sets timings, routes and life-jacket rules. Their word goes." },
        { icon: "store", title: "Stay local", detail: "Choose a Shnongpdeng homestay over sandbank camping. It eases pressure and supports families." },
      ],
    },
    aliases: ["dawki", "umngot", "shnongpdeng", "river", "boat", "jaintia"],
  },
];

const KIND_ORDER = ["weather", "access", "eco", "pressure"];
const minutesSince = (iso: string) => Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
const ago = (iso: string) => {
  const m = minutesSince(iso);
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return m < 2880 ? "Yesterday" : `${Math.round(m / 1440)} days ago`;
};
const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

/** Database categories → the categories this UI draws icons for. */
const CATEGORY: Record<string, ReportCategory> = {
  trail: "trail", road: "road", weather: "weather", waste: "waste", crowd: "crowd",
  closure: "road", wildlife: "trail", heritage: "trail",
};
const VERIFICATION: Partial<Record<ReportStatus, string>> = {
  verified: "Verified by a moderator",
  official: "Government source",
  unverified: "Traveller submission, not reviewed",
};

/**
 * Live data from Supabase layered over the profile content above.
 * The database supplies reports (verified / official / unverified only: RLS hides pending ones),
 * indicators and the advisory. Photos, routes, weather and culture guidelines stay as authored here
 * until the database stores them. A live report that matches an authored one by text keeps its
 * route node and evidence, so it still pins on the route map. Falls back to the authored data if
 * Supabase is unreachable.
 */
export async function getDestinations(): Promise<Destination[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return DESTINATIONS;
  try {
    const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("destinations")
      .select("slug,indicators(kind,label,value,level,source,updated_at),recommendations(body,generated_at),reports(id,status,category,body,source_label,created_at)")
      .in("slug", DESTINATIONS.map((d) => d.key))
      .in("reports.status", ["verified", "official", "unverified"])
      .order("created_at", { referencedTable: "reports", ascending: false })
      .limit(6, { referencedTable: "reports" });
    if (error || !data) return DESTINATIONS;
    return DESTINATIONS.map((sim) => {
      const row = data.find((d) => d.slug === sim.key);
      if (!row) return sim;
      const rec = row.recommendations;
      return {
        ...sim,
        indicators: row.indicators.length
          ? [...row.indicators]
              .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
              .map((i) => ({ label: i.label, value: i.value, level: i.level, source: i.source, updated: ago(i.updated_at) }))
          : sim.indicators,
        recommendation: rec?.body ?? sim.recommendation,
        updated: rec ? clock(rec.generated_at) : sim.updated,
        reports: row.reports.length
          ? row.reports.map((r): Report => {
              const status = r.status as ReportStatus;
              const authored = sim.reports.find((x) => x.text === r.body);
              return {
                id: r.id,
                status,
                category: authored?.category ?? CATEGORY[r.category] ?? "trail",
                text: r.body,
                reporter: r.source_label,
                when: ago(r.created_at),
                minutesAgo: minutesSince(r.created_at),
                verification: VERIFICATION[status] ?? authored?.verification ?? "",
                evidence: authored?.evidence,
                at: authored?.at,
              };
            })
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
