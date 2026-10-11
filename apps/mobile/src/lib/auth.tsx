import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { roleHas, type Profile, type Role } from "@trekne/db";
import { useLive } from "./live";
import { supabase } from "./supabase";

interface Auth {
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  role: Role | null;
  /** Set while a super admin previews a lower role: their real role. */
  previewFrom: Role | null;
  /** Super admins only: see the app as a lower role (null to stop). Only ever narrows permissions. */
  previewAs: (key: string | null) => Promise<void>;
  can: (perm: string) => boolean;
  refresh: () => Promise<void>;
}

const PREVIEW_KEY = "trekne.previewAs";

const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [previewFrom, setPreviewFrom] = useState<Role | null>(null);

  const load = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      setRole(null);
      setPreviewFrom(null);
      return;
    }
    const { data: p } = await supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
    if (p) {
      const { data: r } = await supabase.from("roles").select("*").eq("key", p.role).maybeSingle();
      const asKey = r?.key === "super_admin" ? await AsyncStorage.getItem(PREVIEW_KEY) : null;
      const { data: as } = asKey ? await supabase.from("roles").select("*").eq("key", asKey).maybeSingle() : { data: null };
      // The database still runs as the real user; the preview only changes which tools the app shows.
      const previewing = !!r && !!as && as.rank < r.rank;
      setProfile(previewing ? { ...p, role: as.key } : p);
      setRole(previewing ? as : r);
      setPreviewFrom(previewing ? r : null);
    } else {
      setProfile(null);
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

  // Role approvals and edits apply instantly: new tabs appear without signing out.
  useLive(["profiles"], () => load(session), { filter: session ? `id=eq.${session.user.id}` : undefined, enabled: !!session, delay: 200 });
  useLive(["roles"], () => load(session), { enabled: !!session });

  const value = useMemo<Auth>(
    () => ({
      ready,
      session,
      profile,
      role,
      previewFrom,
      previewAs: async (key) => {
        await (key ? AsyncStorage.setItem(PREVIEW_KEY, key) : AsyncStorage.removeItem(PREVIEW_KEY));
        await load(session);
      },
      can: (perm) => !!profile?.is_active && roleHas(role?.permissions, perm),
      refresh: () => load(session),
    }),
    [ready, session, profile, role, previewFrom, load],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
