"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { homeFor } from "@/lib/landing";
import { Icon } from "../Icon";
import { PasswordField } from "../PasswordField";

type As = "traveller" | "ranger";

const COPY: Record<As, { in: string; up: string }> = {
  traveller: {
    in: "Welcome back. Pick up your saved trips and see what has changed on the ground.",
    up: "Free. Plan trips that check every stop against crowding, season and closures.",
  },
  ranger: {
    in: "For approved Rangers and anyone whose Ranger request is still being reviewed.",
    up: "The Trekne team reviews every request. Field reports and 360 capture are in the app.",
  },
};

/** Public sign-in / sign-up for travellers and Rangers. Staff sign in at /super, which is deliberately not linked from here. */
export function AccountLoginForm({ next, initialAs, initialMode, linkError }: { next: string | null; initialAs: As; initialMode: "in" | "up"; linkError?: boolean }) {
  const router = useRouter();
  const [as, setAs] = useState<As>(initialAs);
  const [mode, setMode] = useState(initialMode);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ err?: boolean; text: string } | null>(
    linkError ? { err: true, text: "That email link has expired or was already used. Sign in with your password instead." } : null,
  );

  // Mirror the tab and mode in the URL (?mode=in|up&as=traveller|ranger) so it can be shared or bookmarked.
  // history.replaceState updates the address bar without a navigation, so nothing typed is lost.
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("mode", mode);
    url.searchParams.set("as", as);
    url.searchParams.delete("error");
    if (url.href !== location.href) history.replaceState(history.state, "", url);
  }, [mode, as]);

  async function goHome() {
    const supabase = supabaseBrowser();
    const { data: claims } = await supabase.auth.getClaims();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, requested_role, roles(permissions)")
      .eq("id", claims?.claims.sub ?? "")
      .maybeSingle();
    router.replace(next ?? homeFor(profile, profile?.roles?.permissions));
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    setBusy(true);
    setMsg(null);
    const supabase = supabaseBrowser();
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setBusy(false);
        return setMsg({ err: true, text: error.message });
      }
      return goHome();
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: String(f.get("name")).trim(), ...(as === "ranger" && { requested_role: "ranger" }) },
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next ?? (as === "ranger" ? "/account" : "/planner"))}`,
      },
    });
    if (error) {
      setBusy(false);
      return setMsg({ err: true, text: error.message });
    }
    if (data.session) return goHome();
    setBusy(false);
    setMsg({ text: "Check your email to confirm your account, then sign in here." });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="seg" role="group" aria-label="Sign in as" style={{ justifySelf: "center" }}>
        {(["traveller", "ranger"] as const).map((k) => (
          <button key={k} type="button" aria-pressed={as === k} onClick={() => { setAs(k); setMsg(null); }}>
            {k === "traveller" ? "Traveller" : "Ranger"}
          </button>
        ))}
      </div>
      <h1 style={{ textAlign: "center" }}>{mode === "in" ? "Sign in" : as === "ranger" ? "Become a Ranger" : "Create account"}</h1>
      <p className="sub auth-tag">{COPY[as][mode]}</p>
      {mode === "up" && (
        <label className="field"><span>Full name</span><input className="input" name="name" required autoComplete="name" /></label>
      )}
      <label className="field"><span>Email</span><input className="input" name="email" type="email" required autoComplete="email" /></label>
      <PasswordField key={mode} autoComplete={mode === "in" ? "current-password" : "new-password"} />
      {msg && (
        <p className={`notice${msg.err ? " err" : ""}`} role="status"><Icon name={msg.err ? "alert" : "check"} />{msg.text}</p>
      )}
      <button className="btn btn-ink" type="submit" disabled={busy}>
        {busy ? "Please wait…" : mode === "in" ? "Sign in" : as === "ranger" ? "Send Ranger request" : "Create account"}<Icon name="arrow" />
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
        {mode === "in" ? "New here? Create an account" : "I already have an account"}
      </button>
    </form>
  );
}
