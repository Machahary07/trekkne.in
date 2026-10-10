"use client";

import type { Tables } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { ago, fmtDate, todayIST } from "./ui";
import { Toast, useAction } from "./useAction";

type N = Tables<"community_notices"> & { destinations: { name: string; state_code: string } | null; author: { full_name: string; email: string | null } | null };
const KIND = { closure: "Closure", sacred_day: "Sacred day", restriction: "Restriction", advisory: "Advice" } as const;

export function NoticesBoard({ notices, dests }: { notices: N[]; dests: { id: string; name: string; state_code: string }[] }) {
  const supabase = supabaseBrowser();
  const { run, busy, toast } = useAction();
  const today = todayIST();

  return (
    <div className="grid" style={{ gap: 14 }}>
      <form className="card grid" style={{ gap: 12 }} onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const form = e.currentTarget;
        run(async () => {
          const { data: me } = await supabase.auth.getUser();
          const r = await supabase.from("community_notices").insert({
            destination_id: String(f.get("dest")), kind: f.get("kind") as N["kind"], title: String(f.get("title")).trim(),
            body: String(f.get("body")).trim(), starts_on: String(f.get("from")), ends_on: String(f.get("to") || f.get("from")),
            community: String(f.get("community")).trim(), author_id: me.user?.id,
          });
          if (!r.error) form.reset();
          return r;
        }, "Notice published");
      }}>
        <h2>Publish on behalf of a community</h2>
        <div className="form-grid">
          <label className="field"><span>Place</span>
            <select className="select" name="dest" required defaultValue="">
              <option value="" disabled>Choose…</option>
              {dests.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.state_code}</option>)}
            </select>
          </label>
          <label className="field"><span>Kind</span>
            <select className="select" name="kind" defaultValue="closure">{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="field"><span>From</span><input className="input" type="date" name="from" required defaultValue={today} /></label>
          <label className="field"><span>To</span><input className="input" type="date" name="to" defaultValue={today} /></label>
          <label className="field"><span>Community</span><input className="input" name="community" placeholder="e.g. Nongriat Dorbar" /></label>
        </div>
        <label className="field"><span>Title</span><input className="input" name="title" required minLength={3} maxLength={120} /></label>
        <label className="field"><span>Message to visitors</span><textarea className="textarea" name="body" maxLength={1000} /></label>
        <button className="btn btn-ink btn-sm" style={{ justifySelf: "end" }} disabled={busy}><Icon name="flag" />Publish</button>
      </form>

      <section className="card">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Notice</th><th>Place</th><th>Dates</th><th>From</th><th>Status</th><th /></tr></thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id} style={{ opacity: n.is_active ? 1 : 0.55 }}>
                  <td className="who"><b>{n.title}</b><span>{KIND[n.kind]}{n.body ? ` · ${n.body.slice(0, 80)}` : ""}</span></td>
                  <td>{n.destinations?.name} · {n.destinations?.state_code}</td>
                  <td className="mono" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{fmtDate(n.starts_on)}{n.ends_on !== n.starts_on && ` – ${fmtDate(n.ends_on)}`}</td>
                  <td className="who"><b style={{ fontWeight: 600 }}>{n.community || "—"}</b><span>{n.author?.full_name || n.author?.email || "sample"} · {ago(n.created_at)}</span></td>
                  <td>{!n.is_active ? <span className="pill"><i />Off</span> : n.ends_on < today ? <span className="pill"><i />Ended</span> : <span className="pill st-published"><i />Live</span>}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost btn-sm" disabled={busy}
                      onClick={() => run(() => supabase.from("community_notices").update({ is_active: !n.is_active }).eq("id", n.id), n.is_active ? "Switched off" : "Switched on")}>
                      {n.is_active ? "Switch off" : "Switch on"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!notices.length && <p className="empty">No notices yet.</p>}
        </div>
      </section>
      <Toast text={toast} />
    </div>
  );
}
