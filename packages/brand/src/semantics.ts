import { brand } from "./tokens";

/** good = green, warn = yellow, high = orange, none = not verified (we don't guess). */
export type Level = "good" | "warn" | "high" | "none";
export const LEVEL_COLOR: Record<Level, string | null> = {
  good: brand.green,
  warn: brand.yellow,
  high: brand.orange,
  none: null,
};
export const RISK_LABEL: Record<Level, string> = { good: "Low risk", warn: "Moderate risk", high: "High risk", none: "Unknown" };

export type ReportStatus = "pending" | "verified" | "official" | "unverified" | "rejected";
export const REPORT_LABEL: Record<ReportStatus, string> = {
  verified: "Verified",
  official: "Official",
  pending: "Pending review",
  unverified: "Unverified",
  rejected: "Rejected",
};

export type Suitability = "good" | "fair" | "poor" | "closed";
export const SUITABILITY_LEVEL: Record<Suitability, Level> = { good: "good", fair: "warn", poor: "high", closed: "high" };
export const SUITABILITY_LABEL: Record<Suitability, string> = { good: "Good season", fair: "Fair season", poor: "Poor season", closed: "Closed" };

export type Sensitivity = "low" | "medium" | "high" | "critical";
export const SENSITIVITY_LEVEL: Record<Sensitivity, Level> = { low: "good", medium: "warn", high: "high", critical: "high" };

export const REPORT_CATEGORIES = ["road", "trail", "weather", "waste", "crowd", "closure", "wildlife", "heritage"] as const;

/** Pressure level from expected visitors / carrying capacity. Null ratio = no reliable count. */
export function pressureLevel(ratio: number | null | undefined): Level {
  if (ratio == null) return "none";
  if (ratio >= 0.9) return "high";
  if (ratio >= 0.6) return "warn";
  return "good";
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
