"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { TRAVELLER_SIGNUP } from "@/lib/landing";
import { Icon, type IconName } from "./Icon";

interface Item { href?: string; label: string; hint: string; icon: IconName; tone: "yellow" | "green" | "chip"; onSelect?: () => void }

/** Round account button at the right end of the header. Opens sign-in / create-account, or account / sign-out once signed in. */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close on navigation, outside press and Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: Item[] = signedIn
    ? [
        { href: "/account", label: "Your account", hint: "Profile, role and Ranger request", icon: "user", tone: "yellow" },
        {
          label: "Sign out", hint: "On this device", icon: "logout", tone: "chip",
          onSelect: async () => {
            await supabaseBrowser().auth.signOut();
            router.replace("/");
            router.refresh();
          },
        },
      ]
    : [
        { href: "/login", label: "Sign in", hint: "Travellers and Rangers", icon: "user", tone: "yellow" },
        { href: TRAVELLER_SIGNUP, label: "Create account", hint: "Free. Plan trips across devices", icon: "plus", tone: "green" },
      ];

  return (
    <div className="acct-dd" ref={root}>
      <button
        ref={button}
        type="button"
        className="acct-btn"
        aria-label={signedIn ? "Account menu" : "Sign in or create an account"}
        aria-expanded={open}
        aria-controls="acct-menu"
        data-in={signedIn || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="user" />
      </button>
      {open && (
        <ul id="acct-menu" className="dd-menu acct-menu">
          {items.map((it) => {
            const body = (
              <>
                <span className="dd-ic" data-tone={it.tone}><Icon name={it.icon} /></span>
                <span className="dd-text"><b>{it.label}</b><small>{it.hint}</small></span>
              </>
            );
            return (
              <li key={it.label}>
                {it.href ? (
                  <Link className="dd-option" href={it.href} onClick={() => setOpen(false)}>{body}</Link>
                ) : (
                  <button className="dd-option" type="button" onClick={() => { setOpen(false); it.onSelect?.(); }}>{body}</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Whether someone is signed in, kept in sync with sign-in and sign-out in other tabs. Null until known. */
function useSignedIn() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}
