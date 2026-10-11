import type { IconName } from "./icons";

/**
 * Trekne progress: points, levels and badges from a user's own activity (`my_progress()` in the database).
 * Points follow the site's promise, "earn for accuracy, not volume": verified reports and lower-pressure
 * choices are worth far more than raw activity.
 */
export interface Progress {
  trips_planned: number;
  stops: number;
  lesser_known_stops: number;
  good_season_stops: number;
  states: number;
  reports: number;
  reports_verified: number;
  scenes_published: number;
  notices: number;
  endorsements: number;
  counts_logged: number;
}

export const EMPTY_PROGRESS: Progress = {
  trips_planned: 0, stops: 0, lesser_known_stops: 0, good_season_stops: 0, states: 0, reports: 0,
  reports_verified: 0, scenes_published: 0, notices: 0, endorsements: 0, counts_logged: 0,
};

/** How each action earns points. Shown to users so the rules are never a mystery. */
export const POINT_RULES: { key: keyof Progress; points: number; label: string; icon: IconName }[] = [
  { key: "trips_planned", points: 20, label: "Trip confirmed", icon: "route" },
  { key: "lesser_known_stops", points: 30, label: "Lesser-known stop", icon: "leaf" },
  { key: "good_season_stops", points: 10, label: "Visit in a good month", icon: "sun" },
  { key: "reports_verified", points: 50, label: "Verified field report", icon: "shield" },
  { key: "reports", points: 5, label: "Report filed", icon: "camera" },
  { key: "scenes_published", points: 80, label: "360 view published", icon: "sphere" },
  { key: "counts_logged", points: 15, label: "Visitor count logged", icon: "users" },
  { key: "notices", points: 40, label: "Community notice", icon: "flag" },
  { key: "endorsements", points: 20, label: "Heritage approved", icon: "temple" },
];

export const pointsFor = (p: Progress) => POINT_RULES.reduce((sum, r) => sum + (p[r.key] ?? 0) * r.points, 0);

export const LEVELS = [
  { at: 0, name: "Newcomer" },
  { at: 50, name: "Gentle Traveller" },
  { at: 150, name: "Trail Friend" },
  { at: 350, name: "Hill Guardian" },
  { at: 700, name: "Keeper of the Northeast" },
] as const;

export function levelFor(points: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && points >= LEVELS[i + 1].at) i++;
  const next = LEVELS[i + 1];
  return {
    level: i + 1,
    name: LEVELS[i].name,
    next: next?.name ?? null,
    toNext: next ? next.at - points : 0,
    /** 0..1 progress through the current level. */
    progress: next ? (points - LEVELS[i].at) / (next.at - LEVELS[i].at) : 1,
  };
}

export interface Badge { id: string; name: string; hint: string; icon: IconName; color: "orange" | "yellow" | "blue" | "green"; value: (p: Progress) => number; goal: number }

export const BADGES: Badge[] = [
  { id: "first-trip", name: "First steps", hint: "Confirm your first trip", icon: "route", color: "orange", value: (p) => p.trips_planned, goal: 1 },
  { id: "off-path", name: "Off the beaten path", hint: "Plan 3 lesser-known stops", icon: "leaf", color: "green", value: (p) => p.lesser_known_stops, goal: 3 },
  { id: "season-smart", name: "Season smart", hint: "5 stops in a good month", icon: "sun", color: "yellow", value: (p) => p.good_season_stops, goal: 5 },
  { id: "three-states", name: "Spread the love", hint: "Plan stops in 3 states", icon: "map", color: "blue", value: (p) => p.states, goal: 3 },
  { id: "eyes-trail", name: "Eyes on the trail", hint: "Get a report verified", icon: "shield", color: "green", value: (p) => p.reports_verified, goal: 1 },
  { id: "trusted", name: "Trusted Ranger", hint: "10 verified reports", icon: "star", color: "yellow", value: (p) => p.reports_verified, goal: 10 },
  { id: "sphere", name: "Sphere seeker", hint: "Publish a 360 view", icon: "sphere", color: "blue", value: (p) => p.scenes_published, goal: 1 },
  { id: "headcount", name: "Headcount hero", hint: "Log 10 visitor counts", icon: "users", color: "orange", value: (p) => p.counts_logged, goal: 10 },
  { id: "village-voice", name: "Voice of the village", hint: "Publish a community notice", icon: "flag", color: "orange", value: (p) => p.notices, goal: 1 },
  { id: "heritage", name: "Heritage keeper", hint: "Approve 3 heritage descriptions", icon: "temple", color: "green", value: (p) => p.endorsements, goal: 3 },
];
