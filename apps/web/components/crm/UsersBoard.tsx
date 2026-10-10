"use client";

import { useRouter } from "next/navigation";
import type { Tables } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { RolePill, ago } from "./ui";
import { Toast, useAction } from "./useAction";

type U = Pick<Tables<"profiles">, "id" | "email" | "full_name" | "phone" | "role" | "requested_role" | "is_active" | "home_state" | "created_at">;
type R = Pick<Tables<"roles">, "key" | "name" | "color" | "rank">;

const REQUEST_LABEL: Record<string, string> = { ranger: "Ranger", community: "Community steward", business: "Business" };

export function UsersBoard({ tab, q, roleFilter, users, roles, invites, me }: {
  tab: "all" | "requests" | "invites";
  q: string;
  roleFilter: string;
  users: U[];
  roles: R[];
  invites: Tables<"staff_invites">[];
  me: { id: string; rank: number; isSuper: boolean; canManage: boolean };
}) {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const { run, busy, toast, setToast } = useAction();
  const byKey = new Map(roles.map((r) => [r.key, r]));
  const grantable = roles.filter((r) => me.isSuper || r.rank < me.rank);
  const canTouch = (u: U) => me.canManage && u.id !== me.id && (me.isSuper || (byKey.get(u.role)?.rank ?? 0) < me.rank);
  const go = (params: Record<string, string>) => router.push(`/super/users?${new URLSearchParams({ tab, q, role: roleFilter, ...params })}`);

  return (
    <section className="card">
      <div className="toolbar">
        <div className="seg">
          <button type="button" aria-pressed={tab === "all"} onClick={() => go({ tab: "all" })}>All users</button>
          <button type="button" aria-pressed={tab === "requests"} onClick={() => go({ tab: "requests" })}>Role requests</button>
          {me.canManage && <button type="button" aria-pressed={tab === "invites"} onClick={() => go({ tab: "invites" })}>Staff invites</button>}
        </div>
        {tab !== "invites" && (
          <form style={{ display: "contents" }} onSubmit={(e) => { e.preventDefault(); go({ q: String(new FormData(e.currentTarget).get("q")) }); }}>
            <input className="input" name="q" placeholder="Search name or email" defaultValue={q} />
            <select className="select" value={roleFilter} onChange={(e) => go({ role: e.target.value })}>
              <option value="">All roles</option>
              {roles.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
          </form>
        )}
      </div>

      {tab === "invites" ? (
        <div className="grid" style={{ gap: 16 }}>
          <form className="toolbar" style={{ margin: 0 }} onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const form = e.currentTarget;
            let applied = false;
            run(async () => {
              const { data, error } = await supabase.rpc("invite_staff", { p_email: String(f.get("email")), p_role: String(f.get("role")) });
              if (!error) form.reset();
              applied = data === "applied";
              return { error };
            }, "Invite saved. They get the role when they sign up at /super.").then((ok) => ok && applied && setToast("They already had an account, so the role was applied now."));
          }}>
            <input className="input" name="email" type="email" required placeholder="name@department.gov.in" style={{ minWidth: 260 }} />
            <select className="select" name="role" required defaultValue="">
              <option value="" disabled>Role</option>
              {grantable.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
            <button className="btn btn-ink btn-sm" type="submit" disabled={busy}><Icon name="plus" />Invite</button>
          </form>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Email</th><th>Role</th><th>Invited</th><th>Status</th><th /></tr></thead>
              <tbody>
                {invites.map((i) => (
                  <tr key={i.email}>
                    <td><b>{i.email}</b></td>
                    <td>{byKey.get(i.role) && <RolePill name={byKey.get(i.role)!.name} color={byKey.get(i.role)!.color} />}</td>
                    <td className="sub">{ago(i.created_at)}</td>
                    <td>{i.accepted_at ? <span className="pill st-published"><i />Joined {ago(i.accepted_at)}</span> : <span className="pill st-pending"><i />Waiting</span>}</td>
                    <td style={{ textAlign: "right" }}>
                      {!i.accepted_at && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(() => supabase.from("staff_invites").delete().eq("email", i.email), "Invite revoked")}>Revoke</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!invites.length && <p className="empty">No invites yet. Invite tourism officials, moderators and admins by email.</p>}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Person</th><th>Role</th>{tab === "requests" && <th>Requested</th>}<th>Joined</th><th>Status</th>{me.canManage && <th />}</tr></thead>
            <tbody>
              {users.map((u) => {
                const r = byKey.get(u.role);
                return (
                  <tr key={u.id} style={{ opacity: u.is_active ? 1 : 0.55 }}>
                    <td className="who"><b>{u.full_name || "—"}{u.id === me.id && <span className="sub"> (you)</span>}</b><span>{u.email}{u.phone && ` · ${u.phone}`}</span></td>
                    <td>
                      {canTouch(u) ? (
                        <select className="select" style={{ width: "auto", padding: "7px 10px" }} value={u.role} disabled={busy}
                          onChange={(e) => run(() => supabase.rpc("set_user_role", { target: u.id, new_role: e.target.value }), "Role updated")}>
                          {!grantable.some((g) => g.key === u.role) && r && <option value={r.key}>{r.name}</option>}
                          {grantable.map((g) => <option key={g.key} value={g.key}>{g.name}</option>)}
                        </select>
                      ) : r ? <RolePill name={r.name} color={r.color} /> : u.role}
                    </td>
                    {tab === "requests" && <td><span className="pill st-pending"><i />{REQUEST_LABEL[u.requested_role ?? ""] ?? u.requested_role}</span></td>}
                    <td className="sub">{ago(u.created_at)}</td>
                    <td>{u.is_active ? <span className="pill st-published"><i />Active</span> : <span className="pill st-rejected"><i />Deactivated</span>}</td>
                    {me.canManage && (
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {u.requested_role && canTouch(u) && (
                          <>
                            <button className="btn btn-green btn-sm" disabled={busy} style={{ marginRight: 6 }}
                              onClick={() => run(() => supabase.rpc("set_user_role", { target: u.id, new_role: u.requested_role! }), `Approved as ${REQUEST_LABEL[u.requested_role!]}`)}>
                              Approve
                            </button>
                            <button className="btn btn-ghost btn-sm" disabled={busy} style={{ marginRight: 6 }}
                              onClick={() => run(() => supabase.rpc("decline_role_request", { target: u.id }), "Request declined")}>
                              Decline
                            </button>
                          </>
                        )}
                        {canTouch(u) && (
                          <button className="btn btn-ghost btn-sm" disabled={busy}
                            onClick={() => run(() => supabase.rpc("set_user_active", { target: u.id, active: !u.is_active }), u.is_active ? "Deactivated" : "Reactivated")}>
                            {u.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!users.length && <p className="empty">{tab === "requests" ? "No pending requests." : "No users match."}</p>}
        </div>
      )}
      <Toast text={toast} />
    </section>
  );
}
