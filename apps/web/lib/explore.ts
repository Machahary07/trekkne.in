import type { Level, Suitability } from "@trekne/brand";
import type { PlacePhoto } from "./photos";

/** One place on the destinations explorer: its profile plus today's computed conditions. Same shape for every state. */
export interface ExplorePlace {
  id: string;
  slug: string;
  name: string;
  place: string;
  summary: string;
  state_code: string;
  district: string;
  kind: string;
  ecosystem: string;
  is_lesser_known: boolean;
  lat: number;
  lng: number;
  capacity: number | null;
  expected: number | null;
  load_ratio: number | null;
  /** Today's suitability, already "closed" when a community closure applies. */
  today: Suitability | null;
  community_closed: boolean;
  notice: string | null;
  open_issues: number;
  risk_score: number;
  risk_level: Level;
  risk: { sensitivity: number; pressure: number; season: number; issues: number };
  /** Suitability for Jan..Dec (null where not recorded). */
  months: (Suitability | null)[];
  /** Card-sized photo URL, or null when the place has no photo yet. */
  photo: string | null;
  /** Attribution for the photo, shown wherever it's displayed large. */
  credit: PlacePhoto | null;
}

export interface ExploreEvent {
  id: string;
  name: string;
  community: string;
  state_code: string;
  destination_id: string | null;
  starts_on: string;
  ends_on: string;
  visitor_impact: "low" | "medium" | "high" | "critical";
}

export interface ExploreNotice { id: string; destination_id: string; kind: string; title: string; starts_on: string; ends_on: string; community: string }
export interface ExploreReport { id: string; destination_id: string; body: string; status: "verified" | "official"; source_label: string; created_at: string }

/** Maximum points each part of the eco-risk score can add (see destination_overview in the migrations). */
export const RISK_MAX = { sensitivity: 45, pressure: 30, season: 25, issues: 12 } as const;

export const KIND = {
  nature: { label: "Nature", icon: "leaf", tone: "green" },
  heritage: { label: "Heritage", icon: "temple", tone: "yellow" },
  village: { label: "Village", icon: "home", tone: "blue" },
  wildlife: { label: "Wildlife", icon: "eye", tone: "orange" },
} as const;
export const kindOf = (k: string) => KIND[k as keyof typeof KIND] ?? { label: k, icon: "pin", tone: "blue" as const };

export const SEASON_RANK: Record<Suitability, number> = { good: 0, fair: 1, poor: 2, closed: 3 };
