import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { roleHas, type Profile, type Role } from "@trekne/db";
import { supabaseServer } from "./supabase/server";
import { VIEW_AS_COOKIE, parseViewAs } from "./view-as";

export interface Staff {
  profile: Profile;
  role: Role;
  can: (perm: string) => boolean;
  /** Set while a super admin previews a lower role: their real role. */
  previewFrom?: Role;
}

/** The signed-in user's profile and role, or null. Cached per request. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims.sub;
  if (!uid) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).single();
  if (!profile) return null;
  const { data: role } = await supabase.from("roles").select("*").eq("key", profile.role).single();
  if (!role) return null;

  // Super admins can preview a lower role. It only ever narrows permissions.
  const as = role.key === "super_admin" ? parseViewAs((await cookies()).get(VIEW_AS_COOKIE)?.value) : null;
  if (as && as.key !== role.key) {
    const { data: lower } = await supabase.from("roles").select("*").eq("key", as.key).maybeSingle();
    if (lower && lower.rank < role.rank) {
      return {
        profile: { ...profile, role: lower.key },
        role: lower,
        can: (perm) => profile.is_active && roleHas(lower.permissions, perm),
        previewFrom: role,
      };
    }
  }
  return { profile, role, can: (perm) => profile.is_active && roleHas(role.permissions, perm) };
});

/** Gate a CRM page: must be signed in with crm.access and the given permission. */
export async function requirePerm(perm?: string): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/super");
  if (!staff.can("crm.access")) redirect("/super?denied=1");
  if (perm && !staff.can(perm)) redirect("/super/dashboard?denied=" + encodeURIComponent(perm));
  return staff;
}
