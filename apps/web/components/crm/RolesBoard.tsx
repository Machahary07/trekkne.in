"use client";

import { useState } from "react";
import type { Tables } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { Toast, useAction } from "./useAction";

type Role = Tables<"roles">;
type Perm = Tables<"permissions">;

export function RolesBoard({ roles, perms, counts }: { roles: Role[]; perms: Perm[]; counts: Record<string, number> }) {
  const supabase = supabaseBrowser();
  const { run, busy, toast } = useAction();
  const [sel, setSel] = useState<string>(roles.find((r) => r.key !== "super_admin")?.key ?? "new");
  const role = roles.find((r) => r.key === sel);
  const [draft, setDraft] = useState<Partial<Role>>(role ?? {});
  const groups = [...new Set(perms.map((p) => p.grp))];
  const locked = role?.key === "super_admin";

  const pick = (key: string) => {
    setSel(key);
    setDraft(key === "new" ? { name: "", key: "", description: "", permissions: [], rank: 40, color: "#7090E4" } : roles.find((r) => r.key === key) ?? {});
  };
  const togglePerm = (k: string) => {
    const cur = draft.permissions ?? [];
    setDraft({ ...draft, permissions: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k] });
  };

  async function save() {
    const body = {
      name: draft.name?.trim() ?? "", description: draft.description ?? "", permissions: draft.permissions ?? [],
      rank: Number(draft.rank), color: draft.color ?? "#7090E4",
    };
    if (sel === "new") {
      const key = (draft.key || body.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      const ok = await run(() => supabase.from("roles").insert({ key, ...body }), "Role created");
      if (ok) setSel(key);
    } else {
      await run(() => supabase.from("roles").update(body).eq("key", sel), "Role saved");
    }
  }

  return (
    <div className="split" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)" }}>
      <section className="card" style={{ alignSelf: "start" }}>
        <div className="card-head"><h2>Roles</h2><button className="btn btn-ghost btn-sm" onClick={() => pick("new")}><Icon name="plus" />New role</button></div>
        <ul className="list">
          {roles.map((r) => (
            <li key={r.key} onClick={() => pick(r.key)} style={{ cursor: "pointer", boxShadow: sel === r.key ? "inset 0 0 0 2px var(--text)" : undefined }}>
              <i className="role-dot" style={{ background: r.color, marginTop: 6 }} />
              <div className="grow">
                <b>{r.name}</b>
                <div className="meta">rank {r.rank} · {counts[r.key] ?? 0} people · {r.permissions.includes("*") ? "all permissions" : `${r.permissions.length} permissions`}{r.is_system ? " · built-in" : ""}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card grid" style={{ gap: 14, alignContent: "start" }}>
        <h2>{sel === "new" ? "New role" : draft.name}</h2>
        {locked && <p className="notice"><Icon name="key" />Super admin always has every permission and can&rsquo;t be edited.</p>}
        <div className="form-grid">
          <label className="field"><span>Name</span><input className="input" disabled={locked} value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
          <label className="field"><span>Rank (1–99)</span>
            <input className="input" type="number" min={1} max={99} disabled={locked} value={draft.rank ?? 40} onChange={(e) => setDraft({ ...draft, rank: +e.target.value })} />
            <small>Higher ranks manage lower ones.</small>
          </label>
          <label className="field"><span>Colour</span><input className="input" type="color" disabled={locked} value={draft.color ?? "#7090E4"} onChange={(e) => setDraft({ ...draft, color: e.target.value })} style={{ height: 44, padding: 4 }} /></label>
        </div>
        <label className="field"><span>Description</span><input className="input" disabled={locked} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
        {groups.map((g) => (
          <div key={g} className="grid" style={{ gap: 6 }}>
            <span className="field"><span>{g}</span></span>
            <div className="perm-grid">
              {perms.filter((p) => p.grp === g).map((p) => (
                <label key={p.key}>
                  <input type="checkbox" disabled={locked} checked={locked || (draft.permissions ?? []).includes(p.key)} onChange={() => togglePerm(p.key)} />
                  <span><b>{p.label}</b><small>{p.description}</small> <code>{p.key}</code></span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {!locked && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            {role && !role.is_system ? (
              <button className="btn btn-danger btn-sm" disabled={busy} onClick={async () => {
                if (!confirm(`Delete the ${role.name} role? Move its ${counts[role.key] ?? 0} people to another role first.`)) return;
                if (await run(() => supabase.from("roles").delete().eq("key", role.key), "Role deleted")) pick("new");
              }}>Delete role</button>
            ) : <span />}
            <button className="btn btn-ink" disabled={busy || !draft.name} onClick={save}><Icon name="check" />{sel === "new" ? "Create role" : "Save role"}</button>
          </div>
        )}
      </section>

      <section className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="card-head"><h2>Permission matrix</h2><p>What each role can do today</p></div>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Permission</th>{roles.map((r) => <th key={r.key} style={{ textAlign: "center" }}>{r.name}</th>)}</tr></thead>
            <tbody>
              {perms.map((p) => (
                <tr key={p.key}>
                  <td><b style={{ fontWeight: 600 }}>{p.label}</b></td>
                  {roles.map((r) => {
                    const has = r.permissions.includes("*") || r.permissions.includes(p.key);
                    return <td key={r.key} style={{ textAlign: "center" }}>{has ? <Icon name="check" style={{ color: "var(--green)" }} /> : <span className="sub">·</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Toast text={toast} />
    </div>
  );
}
