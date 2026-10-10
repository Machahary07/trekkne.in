import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { roleHas } from "@trekne/db";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Landing point for Supabase email links (sign-up confirmation, magic links, invites).
 * Exchanges the PKCE code (or verifies the token hash) for a session cookie, then continues to `next`.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = url.searchParams.get("next");
  const explicit = next?.startsWith("/") && !next.startsWith("//") ? next : null;
  const supabase = await supabaseServer();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Missing code") };

  const dest = url.clone();
  dest.search = "";
  if (error) {
    dest.pathname = "/super";
    dest.searchParams.set("error", "link");
  } else {
    // Staff go to the CRM; travellers, Rangers and stewards (app users) see the welcome page.
    let target = explicit;
    if (!target) {
      const { data: claims } = await supabase.auth.getClaims();
      const { data: profile } = await supabase.from("profiles").select("role, roles(permissions)").eq("id", claims?.claims.sub ?? "").maybeSingle();
      target = roleHas(profile?.roles?.permissions, "crm.access") ? "/super/dashboard" : "/welcome";
    }
    dest.pathname = target;
  }
  return NextResponse.redirect(dest);
}
