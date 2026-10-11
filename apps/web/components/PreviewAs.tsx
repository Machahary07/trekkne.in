"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { VIEW_AS_COOKIE, parseViewAs } from "@/lib/view-as";
import { Dropdown } from "./Dropdown";
import { Icon } from "./Icon";

async function switchTo(role: string | null) {
  const res = await fetch("/super/view-as", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role }) });
  const { to } = (await res.json()) as { to?: string };
  // Full load: server components and the header re-read the role.
  if (to) window.location.assign(to);
}

/** CRM sidebar control for super admins: see the CRM, site and account page as a lower role. */
export function PreviewAsPicker({ roles, current }: { roles: { key: string; name: string; rank: number }[]; current: string | null }) {
  const [busy, setBusy] = useState(false);
  const options = [
    { value: "", label: "Yourself", hint: "Super admin, full access", icon: "key" as const, tone: "orange" as const },
    ...roles.map((r) => ({ value: r.key, label: r.name, hint: `Rank ${r.rank}`, icon: "eye" as const, tone: "blue" as const })),
  ];
  return (
    <Dropdown
      id="preview-as"
      label="Preview as role"
      className="dd-pill dd-sm"
      value={current ?? ""}
      options={options}
      onChange={(v) => { if (!busy) { setBusy(true); switchTo(v || null); } }}
    />
  );
}

/** Fixed bar on every page while a super admin previews a role, with a way back. */
export function PreviewBar() {
  const path = usePathname();
  const [as, setAs] = useState<{ key: string; name: string } | null>(null);
  useEffect(() => {
    const raw = document.cookie.split("; ").find((c) => c.startsWith(VIEW_AS_COOKIE + "="))?.slice(VIEW_AS_COOKIE.length + 1);
    setAs(parseViewAs(raw));
  }, [path]);
  if (!as) return null;
  return (
    <div className="preview-bar" role="status">
      <Icon name="eye" />
      <span>Previewing as <b>{as.name}</b></span>
      <button type="button" className="btn btn-sm btn-green" onClick={() => switchTo(null)}>Stop preview</button>
    </div>
  );
}
