import { NextResponse, type NextRequest } from "next/server";
import { roleHas } from "@trekne/db";
import { supabaseServer } from "@/lib/supabase/server";
import { VIEW_AS_COOKIE } from "@/lib/view-as";

/**
 * Start or stop previewing as a lower role (super admins only). Body: `{ role: "<key>" | null }`.
 * Answers with where to go next: the CRM for staff roles, the account page for app roles.
 */
export async function POST(request: NextRequest) {
  const { role: key } = (await request.json().catch(() => ({}))) as { role?: string | null };
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", claims?.claims.sub ?? "").maybeSingle();
  if (me?.role !== "super_admin") return NextResponse.json({ error: "Only super admins can preview roles." }, { status: 403 });

  if (!key || key === "super_admin") {
    const res = NextResponse.json({ to: "/super/dashboard" });
    res.cookies.delete(VIEW_AS_COOKIE);
    return res;
  }

  const { data: role } = await supabase.from("roles").select("key, name, rank, permissions").eq("key", key).maybeSingle();
  if (!role || role.rank >= 100) return NextResponse.json({ error: "Unknown role." }, { status: 400 });

  const res = NextResponse.json({ to: roleHas(role.permissions, "crm.access") ? "/super/dashboard" : "/account" });
  // Readable by the page so the "Previewing as" bar can show on every route; the server re-checks the real role.
  res.cookies.set(VIEW_AS_COOKIE, `${role.key}|${role.name}`, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 8 });
  return res;
}
