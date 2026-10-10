"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { IconName } from "@trekne/brand";
import { LogoMark } from "../Eyes";
import { Icon } from "../Icon";
import { SignOutButton } from "./SignOutButton";

export interface NavItem {
  group: string;
  href: string;
  label: string;
  icon: IconName;
  count?: number;
}

export function Shell({ nav, me, children }: {
  nav: NavItem[];
  me: { name: string; email: string; role: string; color: string };
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const groups = [...new Set(nav.map((n) => n.group))];

  return (
    <div className="crm" data-open={open}>
      <aside className="side" aria-label="CRM">
        <Link className="logo" href="/super/dashboard"><LogoMark />trekne<small>/super</small></Link>
        {groups.map((g) => (
          <nav key={g} aria-label={g}>
            <h6>{g}</h6>
            {nav.filter((n) => n.group === g).map((n) => (
              <Link key={n.href} className="nav-i" href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>
                <Icon name={n.icon} />{n.label}
                {!!n.count && <span className="count" aria-label={`${n.count} waiting`}>{n.count}</span>}
              </Link>
            ))}
          </nav>
        ))}
        <div className="me">
          <div>
            <b>{me.name}</b>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i className="role-dot" style={{ background: me.color }} />{me.role}
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="mobile-bar">
          <span className="logo" style={{ fontSize: 24 }}><LogoMark />trekne</span>
          <button className="icon-btn" type="button" aria-label="Open menu" onClick={() => setOpen(true)}><Icon name="filter" /></button>
        </div>
        <main className="main" onClick={() => open && setOpen(false)}>{children}</main>
      </div>
    </div>
  );
}
