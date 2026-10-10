"use client";

import { useState } from "react";
import { brand } from "@trekne/brand";
import type { Tables } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { MapView } from "./MapView";
import { Toast, useAction } from "./useAction";

type Site = Tables<"heritage_sites">;
const PHOTO = { allowed: "Photos allowed", ask: "Ask first", forbidden: "No photography" } as const;
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export function HeritageBoard({ sites, states, dests }: { sites: Site[]; states: { code: string; name: string }[]; dests: { id: string; name: string; state_code: string }[] }) {
  const supabase = supabaseBrowser();
  const { run, busy, toast } = useAction();
  const [edit, setEdit] = useState<Partial<Site> | null>(null);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);

  const open = (s: Partial<Site>) => { setEdit(s); setLoc(s.lat != null && s.lng != null ? { lat: s.lat, lng: s.lng } : null); };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const row = {
      name: s("name"), site_type: s("site_type"), community: s("community"), state_code: s("state_code"), destination_id: s("destination_id") || null,
      description: s("description"), protection: s("protection") || "Unlisted", photography: s("photography"), restricted: f.get("restricted") === "on",
      guidelines: lines(s("guidelines")), is_published: f.get("published") === "on", lat: loc?.lat ?? null, lng: loc?.lng ?? null,
    };
    const ok = await run(() => (edit?.id ? supabase.from("heritage_sites").update(row).eq("id", edit.id) : supabase.from("heritage_sites").insert(row)), "Heritage site saved");
    if (ok) setEdit(null);
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <section className="card">
        <div className="card-head">
          <h2>{sites.length} sites</h2>
          <button className="btn btn-ink btn-sm" onClick={() => open({ photography: "ask", is_published: true, state_code: "ML" })}><Icon name="plus" />New site</button>
        </div>
        <MapView height={320} points={sites.filter((s) => s.lat != null && s.lng != null).map((s) => ({
          id: s.id, lat: s.lat!, lng: s.lng!, color: s.is_published ? brand.ink : brand.yellow, shape: "square", title: s.name, body: `${s.site_type} · ${s.community}`,
        }))} />
      </section>

      {edit && (
        <form className="card grid" onSubmit={save} style={{ gap: 12 }}>
          <h2>{edit.id ? `Edit ${edit.name}` : "New heritage site"}</h2>
          <div className="split">
            <div className="grid" style={{ gap: 12, alignContent: "start" }}>
              <div className="form-grid">
                <label className="field"><span>Name</span><input className="input" name="name" required defaultValue={edit.name} /></label>
                <label className="field"><span>Type</span><input className="input" name="site_type" placeholder="Sacred grove, monastery…" defaultValue={edit.site_type} /></label>
                <label className="field"><span>Community</span><input className="input" name="community" defaultValue={edit.community} /></label>
                <label className="field"><span>Protection</span><input className="input" name="protection" placeholder="ASI protected, Community sacred…" defaultValue={edit.protection} /></label>
                <label className="field"><span>State</span>
                  <select className="select" name="state_code" defaultValue={edit.state_code}>{states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select>
                </label>
                <label className="field"><span>Near destination</span>
                  <select className="select" name="destination_id" defaultValue={edit.destination_id ?? ""}>
                    <option value="">None</option>{dests.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </label>
                <label className="field"><span>Photography</span>
                  <select className="select" name="photography" defaultValue={edit.photography}>
                    {Object.entries(PHOTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              </div>
              <label className="field"><span>Description</span><textarea className="textarea" name="description" defaultValue={edit.description} /></label>
              <label className="field"><span>Visitor guidelines (one per line)</span><textarea className="textarea" name="guidelines" defaultValue={edit.guidelines?.join("\n")} /></label>
              <div className="tag-row" style={{ gap: 18 }}>
                <label className="check"><input type="checkbox" name="restricted" defaultChecked={edit.restricted} />Has restricted areas</label>
                <label className="check"><input type="checkbox" name="published" defaultChecked={edit.is_published} />Published</label>
              </div>
            </div>
            <div className="grid" style={{ gap: 8, alignContent: "start" }}>
              <span className="sub">Click the map to place the site{loc && `: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}</span>
              <MapView height={340} focus={loc ? { ...loc, zoom: 11 } : undefined}
                points={loc ? [{ id: "pin", ...loc, color: brand.orange, title: "Site" }] : []}
                onPick={(lat, lng) => setLoc({ lat: +lat.toFixed(5), lng: +lng.toFixed(5) })} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            {edit.id ? <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => run(() => supabase.from("heritage_sites").delete().eq("id", edit.id!), "Deleted").then((ok) => ok && setEdit(null))}>Delete</button> : <span />}
            <span style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn btn-ink btn-sm" disabled={busy}>Save</button>
            </span>
          </div>
        </form>
      )}

      <section className="card">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Site</th><th>Community</th><th>Protection</th><th>Photography</th><th>Status</th><th /></tr></thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id}>
                  <td className="who"><b>{s.name}</b><span>{s.site_type} · {s.state_code}{s.restricted && " · restricted areas"}</span></td>
                  <td>{s.community}</td>
                  <td>{s.protection}</td>
                  <td><span className={`pill ${s.photography === "forbidden" ? "lvl-high" : s.photography === "ask" ? "lvl-warn" : "lvl-good"}`}><i />{PHOTO[s.photography as keyof typeof PHOTO]}</span></td>
                  <td>{s.is_published ? <span className="pill st-published"><i />Published</span> : (
                    <button className="btn btn-green btn-sm" disabled={busy} onClick={() => run(() => supabase.from("heritage_sites").update({ is_published: true }).eq("id", s.id), "Published")}>Approve proposal</button>
                  )}</td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost btn-sm" onClick={() => open(s)}>Edit</button></td>
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
