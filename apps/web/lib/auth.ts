import { redirect } from "next/navigation";
import { cache } from "react";
import { roleHas, type Profile, type Role } from "@trekne/db";
import { supabaseServer } from "./supabase/server";

export interface Staff {
  profile: Profile;
  role: Role;
  can: (perm: string) => boolean;
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
