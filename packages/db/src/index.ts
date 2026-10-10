import type { Database } from "./database.types";

export type { Database, Json } from "./database.types";
export * from "./panorama";

type Public = Database["public"];
export type Tables<T extends keyof Public["Tables"]> = Public["Tables"][T]["Row"];
export type Inserts<T extends keyof Public["Tables"]> = Public["Tables"][T]["Insert"];
export type Updates<T extends keyof Public["Tables"]> = Public["Tables"][T]["Update"];
export type Enums<T extends keyof Public["Enums"]> = Public["Enums"][T];
export type Rpc<T extends keyof Public["Functions"]> = Public["Functions"][T]["Returns"];

export type Profile = Tables<"profiles">;
export type Role = Tables<"roles">;
export type Destination = Tables<"destinations">;
export type Report = Tables<"reports">;
export type Panorama = Tables<"panoramas">;
export type Trip = Tables<"trips">;
export type TripStop = Tables<"trip_stops">;
export type HeritageSite = Tables<"heritage_sites">;
export type TourismEvent = Tables<"events">;
export type DestinationOverview = Rpc<"destination_overview">[number];
export type Alternative = Rpc<"suggest_alternatives">[number];
export type CommunityNotice = Tables<"community_notices">;

/** Access in destinations.access (jsonb). */
export interface DestinationAccess {
  road?: string;
  transport?: string[];
  nearest_town?: string;
  distance_km?: number;
  connectivity?: "none" | "2g" | "4g";
  medical_km?: number;
  permit?: string | null;
}

export const PANORAMA_BUCKET = "panoramas";
export const REPORT_PHOTO_BUCKET = "report-photos";

/** True when a role's permission list grants `perm` ("*" grants everything). */
export const roleHas = (permissions: readonly string[] | null | undefined, perm: string) =>
  !!permissions && (permissions.includes("*") || permissions.includes(perm));
