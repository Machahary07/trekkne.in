"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";

export function LoginForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ err?: boolean; text: string } | null>(
    linkError ? { err: true, text: "That email link has expired or was already used. Sign in with your password instead." } : null,
  );

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
      setBusy(false);
      if (error) return setMsg({ err: true, text: error.message });
      router.replace(next);
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: String(f.get("name")).trim() }, emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      setBusy(false);
      if (error) return setMsg({ err: true, text: error.message });
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else {
        setMsg({ text: "Check your email to confirm your account, then sign in here." });
      }
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>{mode === "in" ? "Staff sign in" : "Create account"}</h1>
      <p className="sub" style={{ fontSize: 15.5, marginTop: -6 }}>
        {mode === "in"
          ? "For moderators, tourism authorities and admins."
          : "Staff roles come from an invite. Use the email address you were invited with."}
      </p>
      {mode === "up" && (
        <label className="field"><span>Full name</span><input className="input" name="name" required autoComplete="name" /></label>
      )}
      <label className="field"><span>Email</span><input className="input" name="email" type="email" required autoComplete="email" /></label>
      <label className="field">
        <span>Password</span>
        <input className="input" name="password" type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} />
      </label>
      {msg && (
        <p className={`notice${msg.err ? " err" : ""}`} role="status"><Icon name={msg.err ? "alert" : "check"} />{msg.text}</p>
      )}
      <button className="btn btn-ink" type="submit" disabled={busy}>
        {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}<Icon name="arrow" />
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
        {mode === "in" ? "I was invited, create my account" : "I already have an account"}
      </button>
    </form>
  );
}
