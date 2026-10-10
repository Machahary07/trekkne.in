"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEVEL_COLOR, MONTHS, brand, type Level, type Suitability } from "@trekne/brand";
import type { DestinationAccess, DestinationOverview, Json, Tables } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { MapView } from "./MapView";
import { LevelPill, fmtDate, todayIST } from "./ui";
import { Toast, useAction } from "./useAction";

type Dest = Tables<"destinations">;
type Indicator = Tables<"indicators">;
const KINDS = ["nature", "cultural", "heritage", "eco", "adventure", "village", "wildlife"] as const;
const SENS = ["low", "medium", "high", "critical"] as const;
const IND_KINDS = ["weather", "access", "eco", "pressure", "waste", "water", "landslide", "wildlife", "connectivity"] as const;
const CYCLE: (Suitability | null)[] = ["good", "fair", "poor", "closed", null];

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function DestinationEditor({ dest, states, seasons, indicators, recommendation, counts, today, canLog }: {
  dest?: Dest;
  states: { code: string; name: string }[];
  seasons: Tables<"seasonal_conditions">[];
  indicators: Indicator[];
  recommendation: Tables<"recommendations"> | null;
  counts: { day: string; visitors: number; source: string }[];
  today?: DestinationOverview | null;
  canLog: boolean;
}) {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const { run, busy, toast, setToast } = useAction();
  const access = (dest?.access ?? {}) as DestinationAccess;

  const [loc, setLoc] = useState({ lat: dest?.lat ?? 25.57, lng: dest?.lng ?? 91.88 });
  const [months, setMonths] = useState<(Suitability | null)[]>(
    Array.from({ length: 12 }, (_, i) => seasons.find((s) => s.month === i + 1)?.suitability ?? null),
  );
  const [inds, setInds] = useState<Partial<Indicator>[]>(indicators);
  const [rec, setRec] = useState(recommendation?.body ?? "");

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const n = (k: string) => (s(k) === "" ? null : Number(s(k)));
    const accessJson: DestinationAccess = {
      road: s("road"), transport: s("transport").split(",").map((x) => x.trim()).filter(Boolean), nearest_town: s("nearest_town"),
      distance_km: n("distance_km") ?? undefined, connectivity: (s("connectivity") || undefined) as DestinationAccess["connectivity"],
      medical_km: n("medical_km") ?? undefined, permit: s("permit") || null,
    };
    const row = {
      name: s("name"), slug: s("slug") || slugify(s("name")), state_code: s("state_code"), district: s("district"), place: s("place"),
      kind: s("kind"), ecosystem: s("ecosystem"), summary: s("summary"), culture: s("culture"), etiquette: lines(s("etiquette")),
      aliases: s("aliases").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean),
      sensitivity: s("sensitivity") as Dest["sensitivity"], carrying_capacity: n("carrying_capacity"),
      is_lesser_known: f.get("is_lesser_known") === "on", is_published: f.get("is_published") === "on",
      access: accessJson as unknown as Json, lat: loc.lat, lng: loc.lng,
    };

    await run(async () => {
      const saved = dest
        ? await supabase.from("destinations").update(row).eq("id", dest.id).select("id").single()
        : await supabase.from("destinations").insert(row).select("id").single();
      if (saved.error) return saved;
      const id = saved.data.id;
      const set = months.flatMap((m, i) => (m ? [{ destination_id: id, month: i + 1, suitability: m }] : []));
      const unset = months.flatMap((m, i) => (m ? [] : [i + 1]));
      const steps = [
        set.length ? supabase.from("seasonal_conditions").upsert(set) : null,
        unset.length ? supabase.from("seasonal_conditions").delete().eq("destination_id", id).in("month", unset) : null,
        inds.filter((i) => i.label && i.value).length
          ? supabase.from("indicators").upsert(
              inds.filter((i) => i.label && i.value).map((i) => ({
                destination_id: id, kind: i.kind!, label: i.label!, value: i.value!, level: i.level ?? "none", source: i.source ?? "", updated_at: new Date().toISOString(),
              })),
              { onConflict: "destination_id,kind" },
            )
          : null,
        rec.trim()
          ? supabase.from("recommendations").upsert({ destination_id: id, body: rec.trim(), meta: "Edited by staff", generated_at: new Date().toISOString() })
          : supabase.from("recommendations").delete().eq("destination_id", id),
      ];
      for (const step of steps) {
        if (!step) continue;
        const { error } = await step;
        if (error) return { error };
      }
      if (!dest) router.replace(`/super/destinations/${id}`);
      return { error: null };
    }, dest ? "Saved" : "Destination created");
  }

  async function logCount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dest) return;
    const f = new FormData(e.currentTarget);
    const { data: me } = await supabase.auth.getUser();
    await run(
      () => supabase.from("visitor_counts").upsert({
        destination_id: dest.id, day: String(f.get("day")), visitors: Number(f.get("visitors")), source: String(f.get("source")), recorded_by: me.user?.id,
      }),
      "Visitor count saved",
    );
  }

  async function remove() {
    if (!dest || !confirm(`Delete ${dest.name}? Its reports, scenes and counts are deleted too.`)) return;
    const ok = await run(() => supabase.from("destinations").delete().eq("id", dest.id), "Deleted");
    if (ok) router.replace("/super/destinations");
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      {today && (
        <div className="kpis" style={{ marginBottom: 0 }}>
          <div className="kpi"><span className="k">Eco-risk today</span><span className="v">{today.risk_score}</span>
            <span className="d">sensitivity {today.risk_sensitivity} + load {today.risk_pressure} + season {today.risk_season} + issues {today.risk_issues}</span></div>
          <div className="kpi"><span className="k">Expected today</span><span className="v">{today.expected ?? "—"}</span>
            <span className="d">{today.load_ratio == null ? "No reliable count" : `${Math.round(today.load_ratio * 100)}% of capacity`}</span></div>
          <div className="kpi"><span className="k">Planned trips today</span><span className="v">{today.planned}</span><span className="d">travellers in the app</span></div>
          <div className="kpi"><span className="k">Verified issues (7d)</span><span className="v">{today.open_issues}</span><span className="d">waste, closures, crowding, roads</span></div>
        </div>
      )}

      <form className="grid" style={{ gap: 14 }} onSubmit={save}>
        <div className="split">
          <section className="card grid" style={{ gap: 14, alignContent: "start" }}>
            <h2>Profile</h2>
            <div className="form-grid">
              <label className="field"><span>Name</span><input className="input" name="name" required defaultValue={dest?.name} /></label>
              <label className="field"><span>Slug</span><input className="input" name="slug" pattern="[a-z0-9-]+" placeholder="from name" defaultValue={dest?.slug} /></label>
              <label className="field"><span>State</span>
                <select className="select" name="state_code" required defaultValue={dest?.state_code ?? "ML"}>
                  {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </label>
              <label className="field"><span>District</span><input className="input" name="district" defaultValue={dest?.district} /></label>
              <label className="field"><span>Type</span>
                <select className="select" name="kind" defaultValue={dest?.kind ?? "nature"}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <label className="field"><span>Ecosystem</span><input className="input" name="ecosystem" placeholder="e.g. Wetland · floating phumdis" defaultValue={dest?.ecosystem} /></label>
            </div>
            <label className="field"><span>Place line</span><input className="input" name="place" placeholder="Village · District, State" defaultValue={dest?.place} /></label>
            <label className="field"><span>Summary</span><textarea className="textarea" name="summary" defaultValue={dest?.summary} /></label>
            <label className="field"><span>Search aliases</span><input className="input" name="aliases" placeholder="comma separated" defaultValue={dest?.aliases.join(", ")} /></label>
            <div className="tag-row" style={{ gap: 18 }}>
              <label className="check"><input type="checkbox" name="is_lesser_known" defaultChecked={dest?.is_lesser_known} />Lesser-known (suggested as an alternative)</label>
              <label className="check"><input type="checkbox" name="is_published" defaultChecked={dest?.is_published} />Published</label>
            </div>
          </section>

          <section className="card grid" style={{ gap: 12, alignContent: "start" }}>
            <h2>Location</h2>
            <p className="sub">Click the map to move the pin.</p>
            <MapView
              points={[{ id: "pin", lat: loc.lat, lng: loc.lng, color: brand.orange, title: "Destination" }]}
              height={300}
              focus={{ lat: loc.lat, lng: loc.lng, zoom: dest ? 10 : 6 }}
              onPick={(lat, lng) => setLoc({ lat: +lat.toFixed(5), lng: +lng.toFixed(5) })}
            />
            <div className="form-grid">
              <label className="field"><span>Latitude</span><input className="input" type="number" step="any" value={loc.lat} onChange={(e) => setLoc({ ...loc, lat: +e.target.value })} /></label>
              <label className="field"><span>Longitude</span><input className="input" type="number" step="any" value={loc.lng} onChange={(e) => setLoc({ ...loc, lng: +e.target.value })} /></label>
            </div>
          </section>
        </div>

        <div className="grid g-2">
          <section className="card grid" style={{ gap: 14, alignContent: "start" }}>
            <h2>Protection &amp; capacity</h2>
            <div className="form-grid">
              <label className="field"><span>Eco / cultural sensitivity</span>
                <select className="select" name="sensitivity" defaultValue={dest?.sensitivity ?? "medium"}>{SENS.map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <label className="field"><span>Carrying capacity / day</span>
                <input className="input" name="carrying_capacity" type="number" min={1} defaultValue={dest?.carrying_capacity ?? ""} />
                <small>Agreed with the community or authority. Drives pressure and risk.</small>
              </label>
            </div>
            <label className="field"><span>Cultural context</span><textarea className="textarea" name="culture" defaultValue={dest?.culture} /></label>
            <label className="field"><span>Visitor etiquette (one per line)</span><textarea className="textarea" name="etiquette" defaultValue={dest?.etiquette.join("\n")} /></label>
          </section>

          <section className="card grid" style={{ gap: 14, alignContent: "start" }}>
            <h2>Access &amp; connectivity</h2>
            <label className="field"><span>Road</span><input className="input" name="road" defaultValue={access.road} /></label>
            <label className="field"><span>Transport (comma separated)</span><input className="input" name="transport" defaultValue={access.transport?.join(", ")} /></label>
            <div className="form-grid">
              <label className="field"><span>Nearest town</span><input className="input" name="nearest_town" defaultValue={access.nearest_town} /></label>
              <label className="field"><span>Distance (km)</span><input className="input" name="distance_km" type="number" step="any" defaultValue={access.distance_km} /></label>
              <label className="field"><span>Mobile signal</span>
                <select className="select" name="connectivity" defaultValue={access.connectivity ?? ""}>
                  <option value="">Unknown</option><option value="none">No signal</option><option value="2g">2G / patchy</option><option value="4g">4G</option>
                </select>
              </label>
              <label className="field"><span>Medical help (km)</span><input className="input" name="medical_km" type="number" step="any" defaultValue={access.medical_km} /></label>
            </div>
            <label className="field"><span>Permit</span><input className="input" name="permit" placeholder="e.g. Inner Line Permit" defaultValue={access.permit ?? ""} /></label>
          </section>
        </div>

        <section className="card grid" style={{ gap: 12 }}>
          <div className="card-head" style={{ margin: 0 }}><h2>Seasons</h2><p>Click a month to cycle good → fair → poor → closed → unknown</p></div>
          <div>
            <div className="month-labels">{MONTHS.map((m) => <span key={m}>{m}</span>)}</div>
            <div className="months">
              {months.map((m, i) => (
                <button key={i} type="button" className={`s-${m ?? "none"}`} aria-label={`${MONTHS[i]}: ${m ?? "unknown"}`}
                  onClick={() => setMonths(months.map((x, j) => (j === i ? CYCLE[(CYCLE.indexOf(x) + 1) % CYCLE.length] : x)))}>
                  {m ? m[0].toUpperCase() : "?"}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card grid" style={{ gap: 12 }}>
          <div className="card-head" style={{ margin: 0 }}>
            <h2>Live indicators</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInds([...inds, { kind: IND_KINDS.find((k) => !inds.some((i) => i.kind === k)) ?? "weather", level: "none" }])}>
              <Icon name="plus" />Add
            </button>
          </div>
          {inds.map((ind, idx) => (
            <div key={idx} className="form-grid" style={{ gridTemplateColumns: "130px 1fr 1fr 130px 1.4fr 38px", alignItems: "end" }}>
              <label className="field"><span>Kind</span>
                <select className="select" value={ind.kind} onChange={(e) => setInds(inds.map((x, j) => (j === idx ? { ...x, kind: e.target.value } : x)))}>
                  {IND_KINDS.map((k) => <option key={k}>{k}</option>)}
                </select>
              </label>
              <label className="field"><span>Label</span><input className="input" value={ind.label ?? ""} onChange={(e) => setInds(inds.map((x, j) => (j === idx ? { ...x, label: e.target.value } : x)))} /></label>
              <label className="field"><span>Value</span><input className="input" value={ind.value ?? ""} onChange={(e) => setInds(inds.map((x, j) => (j === idx ? { ...x, value: e.target.value } : x)))} /></label>
              <label className="field"><span>Level</span>
                <select className="select" value={ind.level ?? "none"} onChange={(e) => setInds(inds.map((x, j) => (j === idx ? { ...x, level: e.target.value as Level } : x)))}>
                  <option value="good">Good</option><option value="warn">Watch</option><option value="high">High</option><option value="none">Not verified</option>
                </select>
              </label>
              <label className="field"><span>Source</span><input className="input" value={ind.source ?? ""} onChange={(e) => setInds(inds.map((x, j) => (j === idx ? { ...x, source: e.target.value } : x)))} /></label>
              <button type="button" className="icon-btn" aria-label="Remove indicator" style={{ marginBottom: 2 }}
                onClick={async () => {
                  if (ind.id) {
                    const { error } = await supabase.from("indicators").delete().eq("id", ind.id);
                    if (error) return setToast(error.message);
                  }
                  setInds(inds.filter((_, j) => j !== idx));
                }}>
                <Icon name="close" />
              </button>
            </div>
          ))}
          {!inds.length && <p className="sub">No indicators yet.</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {inds.filter((i) => i.label).map((i, k) => (
              <span key={k} className="pill" style={{ background: "var(--surface-2)" }}>
                <i style={{ background: LEVEL_COLOR[(i.level ?? "none") as Level] ?? "transparent", boxShadow: i.level === "none" ? "inset 0 0 0 2px var(--muted)" : undefined }} />
                {i.label}: {i.value}
              </span>
            ))}
          </div>
        </section>

        <section className="card grid" style={{ gap: 12 }}>
          <div className="card-head" style={{ margin: 0 }}><h2>Advisory for travellers</h2><p>Shown in the app and on the site. Keep it practical.</p></div>
          <textarea className="textarea" value={rec} onChange={(e) => setRec(e.target.value)} placeholder="When to go, what to carry, what to avoid…" />
        </section>

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
          {dest ? <button type="button" className="btn btn-danger btn-sm" onClick={remove}>Delete destination</button> : <span />}
          <button className="btn btn-ink" type="submit" disabled={busy}><Icon name="check" />{busy ? "Saving…" : dest ? "Save changes" : "Create destination"}</button>
        </div>
      </form>

      {dest && (
        <section className="card grid" style={{ gap: 12 }}>
          <div className="card-head" style={{ margin: 0 }}><h2>Visitor counts</h2><p>Last 28 entries · used for pressure</p></div>
          {canLog && (
            <form className="toolbar" onSubmit={logCount}>
              <input className="input" type="date" name="day" defaultValue={todayIST()} required />
              <input className="input" type="number" name="visitors" min={0} placeholder="Visitors" required />
              <select className="select" name="source" defaultValue="entry_records">
                <option value="entry_records">Entry records</option><option value="official">Official</option><option value="ranger_estimate">Ranger estimate</option>
              </select>
              <button className="btn btn-ink btn-sm" type="submit" disabled={busy}>Log count</button>
            </form>
          )}
          <div className="bars" style={{ height: 90 }} role="img" aria-label="Recent daily visitor counts">
            {[...counts].reverse().map((c) => (
              <span key={c.day} data-tip={`${fmtDate(c.day)} · ${c.visitors} (${c.source.replace("_", " ")})`}
                style={{ height: `${Math.min(100, (c.visitors / Math.max(dest.carrying_capacity ?? 1, ...counts.map((x) => x.visitors))) * 100)}%`,
                  background: dest.carrying_capacity && c.visitors > dest.carrying_capacity ? brand.orange : undefined }} />
            ))}
          </div>
          <div className="legend">
            <span><i style={{ background: brand.blue }} />Within capacity</span>
            <span><i style={{ background: brand.orange }} />Over capacity</span>
            {counts.some((c) => c.source === "simulated") && <LevelPill level="none" label="Includes simulated sample data" />}
          </div>
        </section>
      )}
      <Toast text={toast} />
    </div>
  );
}
