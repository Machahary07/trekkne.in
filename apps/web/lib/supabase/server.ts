import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@trekne/db";

/** Server Supabase client for server components and route handlers. RLS applies as the signed-in user. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(toSet) {
        // Server components can't set cookies; proxy.ts refreshes the session instead.
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {}
      },
    },
  });
}

/** True when Supabase env vars are present (the marketing site still renders without them). */
export const hasSupabase = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
