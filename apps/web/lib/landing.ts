import { roleHas } from "@trekne/db";

/** Create-account links, one per tab. Every "Become a Ranger" / "Apply to be a Ranger" button uses RANGER_SIGNUP. */
export const TRAVELLER_SIGNUP = "/login?mode=up&as=traveller";
export const RANGER_SIGNUP = "/login?mode=up&as=ranger";

/** A same-site path to continue to after sign-in, or null for anything else (absolute, `//host` or `/\host` URLs). */
export const safeNext = (next: string | null | undefined) => (next && /^\/(?![/\\])/.test(next) ? next : null);

/** Where someone lands after signing in, by role: staff to the CRM, Rangers (and requests) to their account, travellers to the planner. */
export function homeFor(profile: { role: string; requested_role: string | null } | null, permissions: readonly string[] | null | undefined) {
  if (roleHas(permissions, "crm.access")) return "/super/dashboard";
  if (profile?.role === "ranger" || profile?.requested_role === "ranger") return "/account";
  return "/planner";
}
