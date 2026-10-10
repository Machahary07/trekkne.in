"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DestinationKey } from "@/lib/destinations";

export type JoinRole = "traveller" | "ranger" | "business";

interface SiteState {
  destination: DestinationKey;
  setDestination: (key: DestinationKey) => void;
  /** Select a destination and scroll the intelligence panel into view. */
  openDestination: (key: DestinationKey) => void;
  joinRole: JoinRole;
  setJoinRole: (role: JoinRole) => void;
}

const Ctx = createContext<SiteState | null>(null);

export function SiteStateProvider({ children }: { children: React.ReactNode }) {
  const [destination, setDestination] = useState<DestinationKey>("nongriat");
  const [joinRole, setJoinRole] = useState<JoinRole>("traveller");

  const openDestination = useCallback((key: DestinationKey) => {
    setDestination(key);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("destinations")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }, []);

  const value = useMemo(
    () => ({ destination, setDestination, openDestination, joinRole, setJoinRole }),
    [destination, openDestination, joinRole],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSiteState must be used inside <SiteStateProvider>");
  return ctx;
}

/** Anchor that also preselects a destination tab. */
export function DestinationLink({ to, className, children }: { to: DestinationKey; className?: string; children: React.ReactNode }) {
  const { setDestination } = useSiteState();
  return (
    <a className={className} href="#destinations" onClick={() => setDestination(to)}>
      {children}
    </a>
  );
}

/** Anchor that jumps to the waitlist with a role preselected. */
export function JoinLink({ role, className, children }: { role: JoinRole; className?: string; children: React.ReactNode }) {
  const { setJoinRole } = useSiteState();
  return (
    <a className={className} href="#join" onClick={() => setJoinRole(role)}>
      {children}
    </a>
  );
}
