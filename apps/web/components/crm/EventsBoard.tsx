"use client";

import { useState } from "react";
import { SENSITIVITY_LEVEL } from "@trekne/brand";
import type { Tables } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { LevelPill, fmtDate, todayIST } from "./ui";
import { Toast, useAction } from "./useAction";

type Ev = Tables<"events">;
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export function EventsBoard({ events, states, dests }: { events: Ev[]; states: { code: string; name: string }[]; dests: { id: string; name: string; state_code: string }[] }) {
  const supabase = supabaseBrowser();
  const { run, busy, toast } = useAction();
  const [edit, setEdit] = useState<Partial<Ev> | null>(null);
  const [past, setPast] = useState(false);
  const today = todayIST();
  const shown = events.filter((e) => (past ? e.ends_on < today : e.ends_on >= today));
  const proposals = events.filter((e) => !e.is_published);
  const destName = new Map(dests.map((d) => [d.id, d.name]));

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const row = {
      name: s("name"), community: s("community"), state_code: s("state_code"), destination_id: s("destination_id") || null,
      starts_on: s("starts_on"), ends_on: s("ends_on") || s("starts_on"), description: s("description"),
      visitor_impact: s("visitor_impact") as Ev["visitor_impact"], open_to_visitors: f.get("open") === "on",
      etiquette: lines(s("etiquette")), is_published: f.get("published") === "on",
    };
    const ok = await run(() => (edit?.id ? supabase.from("events").update(row).eq("id", edit.id) : supabase.from("events").insert(row)), "Event saved");
    if (ok) setEdit(null);
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      {proposals.length > 0 && (
        <section className="card">
          <div className="card-head"><h2>Community proposals</h2><p>Suggested by community stewards. Publish to show them to travellers.</p></div>
          <ul className="list">
            {proposals.map((e) => (
              <li key={e.id}>
                <Icon name="calendar" />
                <div className="grow"><b>{e.name}</b><div className="meta">{fmtDate(e.starts_on)} · {e.community} · {e.state_code} · {e.description}</div></div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEdit(e)}>Review</button>
                <button className="btn btn-green btn-sm" disabled={busy} onClick={() => run(() => supabase.from("events").update({ is_published: true }).eq("id", e.id), "Published")}>Publish</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="toolbar">
          <div className="seg">
            <button type="button" aria-pressed={!past} onClick={() => setPast(false)}>Upcoming</button>
            <button type="button" aria-pressed={past} onClick={() => setPast(true)}>Past</button>
          </div>
          <button className="btn btn-ink btn-sm" style={{ marginLeft: "auto" }} onClick={() => setEdit({ visitor_impact: "medium", open_to_visitors: true, is_published: true, state_code: "ML" })}>
            <Icon name="plus" />New event
          </button>
        </div>

        {edit && (
          <form className="card grid" onSubmit={save} style={{ gap: 12, background: "var(--surface-2)", marginBottom: 14 }}>
            <h2>{edit.id ? "Edit event" : "New event"}</h2>
            <div className="form-grid">
              <label className="field"><span>Name</span><input className="input" name="name" required defaultValue={edit.name} /></label>
              <label className="field"><span>Community</span><input className="input" name="community" defaultValue={edit.community} /></label>
              <label className="field"><span>State</span>
                <select className="select" name="state_code" defaultValue={edit.state_code}>{states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select>
              </label>
              <label className="field"><span>Destination (optional)</span>
                <select className="select" name="destination_id" defaultValue={edit.destination_id ?? ""}>
                  <option value="">Region-wide</option>
                  {dests.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.state_code}</option>)}
                </select>
              </label>
              <label className="field"><span>Starts</span><input className="input" type="date" name="starts_on" required defaultValue={edit.starts_on} /></label>
              <label className="field"><span>Ends</span><input className="input" type="date" name="ends_on" defaultValue={edit.ends_on} /></label>
              <label className="field"><span>Visitor impact</span>
                <select className="select" name="visitor_impact" defaultValue={edit.visitor_impact}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </label>
            </div>
            <label className="field"><span>Description</span><textarea className="textarea" name="description" defaultValue={edit.description} /></label>
            <label className="field"><span>Etiquette (one per line)</span><textarea className="textarea" name="etiquette" defaultValue={edit.etiquette?.join("\n")} /></label>
            <div className="tag-row" style={{ gap: 18 }}>
              <label className="check"><input type="checkbox" name="open" defaultChecked={edit.open_to_visitors} />Open to visitors</label>
              <label className="check"><input type="checkbox" name="published" defaultChecked={edit.is_published} />Published</label>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              {edit.id ? <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => run(() => supabase.from("events").delete().eq("id", edit.id!), "Deleted").then((ok) => ok && setEdit(null))}>Delete</button> : <span />}
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button>
                <button className="btn btn-ink btn-sm" disabled={busy}>Save</button>
              </span>
            </div>
          </form>
        )}

        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Event</th><th>Dates</th><th>Where</th><th>Impact</th><th>Visitors</th><th /></tr></thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id}>
                  <td className="who"><b>{e.name}</b><span>{e.community}{!e.is_published && " · draft"}</span></td>
                  <td className="mono" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{fmtDate(e.starts_on)}{e.ends_on !== e.starts_on && ` – ${fmtDate(e.ends_on)}`}</td>
                  <td>{e.destination_id ? destName.get(e.destination_id) : "Region-wide"} · {e.state_code}</td>
                  <td><LevelPill level={SENSITIVITY_LEVEL[e.visitor_impact]} label={e.visitor_impact} /></td>
                  <td>{e.open_to_visitors ? "Open" : "Community only"}</td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost btn-sm" onClick={() => setEdit(e)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!shown.length && <p className="empty">No events.</p>}
        </div>
      </section>
      <Toast text={toast} />
    </div>
  );
}
