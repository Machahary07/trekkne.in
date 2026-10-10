import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase session for CRM and account routes, and sends signed-out visitors to the right login. */
export async function proxy(request: NextRequest) {
  // Supabase falls back to the Site URL (/) for email links when the redirect isn't allow-listed.
  const path = request.nextUrl.pathname;
  if (path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(toSet, headers) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  // /super and /login are the sign-in pages themselves; everything else here needs a session.
  const login = path.startsWith("/super") ? "/super" : "/login";
  if (!data?.claims && path !== "/super" && path !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = login;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: [
    "/super",
    "/super/:path*",
    "/login",
    "/account",
    // Only the homepage when it carries an auth code or token hash.
    { source: "/", has: [{ type: "query", key: "code" }] },
    { source: "/", has: [{ type: "query", key: "token_hash" }] },
  ],
};
