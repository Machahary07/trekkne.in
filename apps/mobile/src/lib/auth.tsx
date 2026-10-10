import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { roleHas, type Profile, type Role } from "@trekne/db";
import { supabase } from "./supabase";

interface Auth {
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  role: Role | null;
  can: (perm: string) => boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const load = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      setRole(null);
      return;
    }
    const { data: p } = await supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
    setProfile(p);
    if (p) {
      const { data: r } = await supabase.from("roles").select("*").eq("key", p.role).maybeSingle();
      setRole(r);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await load(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Defer the profile fetch so it doesn't run inside the auth callback's lock.
      setTimeout(() => load(s), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  const value = useMemo<Auth>(
    () => ({
      ready,
      session,
      profile,
      role,
      can: (perm) => !!profile?.is_active && roleHas(role?.permissions, perm),
      refresh: () => load(session),
    }),
    [ready, session, profile, role, load],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
