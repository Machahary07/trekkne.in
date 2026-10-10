import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase session for CRM routes and sends signed-out visitors to the /super login. */
export async function proxy(request: NextRequest) {
  // Supabase falls back to the Site URL (/) for email links when the redirect isn't allow-listed.
  if (!request.nextUrl.pathname.startsWith("/super")) {
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
  const inside = request.nextUrl.pathname !== "/super";
  if (!data?.claims && inside) {
    const url = request.nextUrl.clone();
    url.pathname = "/super";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: [
    "/super",
    "/super/:path*",
    // Only the homepage when it carries an auth code or token hash.
    { source: "/", has: [{ type: "query", key: "code" }] },
    { source: "/", has: [{ type: "query", key: "token_hash" }] },
  ],
};
