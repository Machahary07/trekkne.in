import { pressureLevel, type IconName, type Level } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";

export interface Signal { key: "crowd" | "season" | "eco"; icon: IconName; level: Level; word: string; label: string }

const CROWD = { good: "Quiet", warn: "Busy", high: "Packed", none: "Unknown" } as const;
const ECO = { good: "Low", warn: "Medium", high: "High", none: "Unknown" } as const;

/** Three one-word signals anyone can read at a glance: how crowded, is it the right season, how fragile today. */
export function glance(o: Pick<DestinationOverview, "load_ratio" | "suitability" | "risk_level" | "community_closed">): Signal[] {
  const crowd = pressureLevel(o.load_ratio == null ? null : Number(o.load_ratio));
  const season: Level = o.community_closed || o.suitability === "closed" || o.suitability === "poor" ? "high" : o.suitability === "fair" ? "warn" : o.suitability === "good" ? "good" : "none";
  const seasonWord = o.community_closed ? "Closed" : o.suitability === "closed" ? "Closed" : o.suitability === "poor" ? "Poor" : o.suitability === "fair" ? "Okay" : o.suitability === "good" ? "Great" : "Unknown";
  return [
    { key: "crowd", icon: "users", level: crowd, word: CROWD[crowd], label: "Crowd" },
    { key: "season", icon: "sun", level: season, word: seasonWord, label: "Season" },
    { key: "eco", icon: "leaf", level: o.risk_level, word: ECO[o.risk_level], label: "Eco-risk" },
  ];
}

/** One verdict for a place on a day. */
export function verdict(o: Pick<DestinationOverview, "load_ratio" | "suitability" | "risk_level" | "community_closed">): { level: Level; title: string } {
  if (o.community_closed) return { level: "high", title: "Closed by the community" };
  if (o.suitability === "closed") return { level: "high", title: "Closed this month" };
  const s = glance(o);
  if (s.some((x) => x.level === "high")) return { level: "high", title: "Better another day" };
  if (s.some((x) => x.level === "warn")) return { level: "warn", title: "Go, with care" };
  return { level: "good", title: "Good to go" };
}
