"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SUITABILITY_LABEL, pressureLevel, type Level } from "@trekne/brand";
import type { Alternative, DestinationOverview } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import "./plan.css";

interface Place { id: string; slug: string; name: string; state_code: string; is_lesser_known: boolean }
interface Ev { name: string; state_code: string; destination_id: string | null; starts_on: string; ends_on: string; visitor_impact: string; open_to_visitors: boolean }
interface Notice { destination_id: string; kind: string; title: string; starts_on: string; ends_on: string; community: string }
interface Plan { start: string; days: number; party: number; stops: { day: number; id: string }[] }
interface Flag { level: Level; text: string }

const KEY = "trekne.planner.v1";
const addDays = (iso: string, n: number) => new Date(Date.parse(iso + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

function load(fallbackStart: string): Plan {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Plan;
      if (p.start >= todayIST()) return p;
    }
  } catch {}
  return { start: fallbackStart, days: 3, party: 2, stops: [] };
}

/** Public trip planner: every stop is checked against capacity, season, festivals, community notices and eco-risk. */
export function Planner({ places, events, notices, initialAdd }: { places: Place[]; events: Ev[]; notices: Notice[]; initialAdd?: string }) {
  const supabase = supabaseBrowser();
  const defaultStart = addDays(todayIST(), 7);
  const [plan, setPlan] = useState<Plan>({ start: defaultStart, days: 3, party: 2, stops: [] });
  const [ready, setReady] = useState(false);
  const [byDay, setByDay] = useState<Record<string, Map<string, DestinationOverview>>>({});
  const [alts, setAlts] = useState<Record<string, Alternative[] | "loading">>({});

  // Restore the saved plan (and add ?add=slug from a place page) once on mount.
  useEffect(() => {
    const p = load(defaultStart);
    const add = places.find((x) => x.slug === initialAdd);
    if (add && !p.stops.some((s) => s.id === add.id)) p.stops = [...p.stops, { day: 0, id: add.id }];
    setPlan(p);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch {}
  }, [plan, ready]);

  const dates = useMemo(() => Array.from({ length: plan.days }, (_, i) => addDays(plan.start, i)), [plan.start, plan.days]);

  useEffect(() => {
    const missing = dates.filter((d) => !byDay[d]);
    if (!missing.length) return;
    Promise.all(missing.map((d) => supabase.rpc("destination_overview", { on_day: d }).then(({ data }) => [d, new Map((data ?? []).map((o) => [o.id, o]))] as const)))
      .then((rows) => setByDay((cur) => ({ ...cur, ...Object.fromEntries(rows) })));
  }, [dates, byDay, supabase]);

  const placeById = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);

  function flags(o: DestinationOverview | undefined, day: string, place: Place): Flag[] {
    const out: Flag[] = [];
    if (!o) return [{ level: "none", text: "Checking conditions…" }];
    notices.filter((n) => n.destination_id === place.id && n.starts_on <= day && n.ends_on >= day).forEach((n) =>
      out.push({ level: n.kind === "closure" || n.kind === "sacred_day" ? "high" : "warn", text: `${n.title}${n.community ? ` · ${n.community}` : ""}` }));
    if (o.expected == null || !o.capacity) out.push({ level: "none", text: "Visitor pressure unknown: no reliable count, so we don't guess" });
    else {
      const expected = o.expected + plan.party;
      const ratio = expected / o.capacity;
      const lvl = pressureLevel(ratio);
      out.push({
        level: lvl,
        text: lvl === "high" ? `Over capacity: ~${expected} expected for ${o.capacity} a day` : lvl === "warn" ? `Busy: ${Math.round(ratio * 100)}% of daily capacity` : `${Math.round(ratio * 100)}% of capacity: comfortable`,
      });
    }
    if (o.suitability && !o.community_closed) {
      if (o.suitability === "closed") out.push({ level: "high", text: "Closed to visitors this month" });
      else if (o.suitability === "poor") out.push({ level: "high", text: `${SUITABILITY_LABEL.poor}: monsoon or weather limits access` });
      else if (o.suitability === "fair") out.push({ level: "warn", text: SUITABILITY_LABEL.fair });
      else out.push({ level: "good", text: SUITABILITY_LABEL.good });
    }
    if (o.risk_level === "high") out.push({ level: "high", text: `High eco-risk today (${o.risk_score}/100)` });
    events.filter((e) => e.starts_on <= day && e.ends_on >= day && (e.destination_id === place.id || (!e.destination_id && e.state_code === place.state_code)))
      .forEach((e) => out.push({ level: e.visitor_impact === "low" ? "good" : "warn", text: `${e.name} is on${e.open_to_visitors ? "" : " (community only)"}: expect crowds and follow local etiquette` }));
    return out;
  }

  async function findAlts(key: string, destId: string, day: string) {
    setAlts((a) => ({ ...a, [key]: "loading" }));
    const { data } = await supabase.rpc("suggest_alternatives", { dest: destId, on_day: day, max_results: 3 });
    setAlts((a) => ({ ...a, [key]: data ?? [] }));
  }

  const set = (patch: Partial<Plan>) => setPlan((p) => ({ ...p, ...patch }));
  const allFlags = plan.stops.flatMap((s) => {
    const place = placeById.get(s.id);
    return place && dates[s.day] ? flags(byDay[dates[s.day]]?.get(s.id), dates[s.day], place) : [];
  });
  const serious = allFlags.filter((f) => f.level === "high").length;
  const watch = allFlags.filter((f) => f.level === "warn").length;

  return (
    <div className="pln">
      <aside className="pl-card pln-form" aria-label="Trip details">
        <h3>Your trip</h3>
        <label className="pln-field">
          <span>Start date</span>
          <input className="pln-input" type="date" min={todayIST()} value={plan.start} onChange={(e) => e.target.value && set({ start: e.target.value })} />
        </label>
        <div className="pl-between">
          <div className="pln-field"><span>Days</span>
            <div className="pln-step">
              <button type="button" aria-label="Fewer days" onClick={() => set({ days: Math.max(1, plan.days - 1), stops: plan.stops.filter((s) => s.day < plan.days - 1) })}>−</button>
              <output>{plan.days}</output>
              <button type="button" aria-label="More days" onClick={() => set({ days: Math.min(10, plan.days + 1) })}>+</button>
            </div>
          </div>
          <div className="pln-field"><span>Travellers</span>
            <div className="pln-step">
              <button type="button" aria-label="Fewer travellers" onClick={() => set({ party: Math.max(1, plan.party - 1) })}>−</button>
              <output>{plan.party}</output>
              <button type="button" aria-label="More travellers" onClick={() => set({ party: Math.min(60, plan.party + 1) })}>+</button>
            </div>
          </div>
        </div>
        <div className="pln-summary" aria-live="polite">
          {plan.stops.length === 0 ? <span className="pl-pill l-none"><i />Add a place to a day</span> : (
            <>
              <span className={`pl-pill ${serious ? "l-high" : "l-good"}`}><i />{serious ? `${serious} serious issue${serious > 1 ? "s" : ""}` : "No serious issues"}</span>
              {watch > 0 && <span className="pl-pill l-warn"><i />{watch} to watch</span>}
            </>
          )}
        </div>
        <p className="pl-note"><Icon name="info" />Your group is added to each place&rsquo;s expected visitors. Visitor counts in this preview are simulated.</p>
        <div className="pl-row">
          <Link className="btn btn-ink btn-sm" href="/#join"><Icon name="phone" />Save it in the app</Link>
          {plan.stops.length > 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { set({ stops: [] }); setAlts({}); }}>Clear</button>}
        </div>
      </aside>

      <div className="pl-grid">
        {dates.map((day, di) => {
          const stops = plan.stops.map((s, idx) => ({ ...s, idx })).filter((s) => s.day === di);
          return (
            <section key={day} className="pln-day" aria-label={`Day ${di + 1}`}>
              <header><h3>Day {di + 1}</h3><span className="pl-mono">{fmt(day)}</span></header>
              {stops.map((s) => {
                const place = placeById.get(s.id);
                if (!place) return null;
                const o = byDay[day]?.get(s.id);
                const f = flags(o, day, place);
                const bad = f.some((x) => x.level === "high");
                const key = `${s.idx}-${s.id}-${day}`;
                const a = alts[key];
                return (
                  <article key={key} className={`pln-stop${bad ? " bad" : ""}`}>
                    <div className="pl-between">
                      <div>
                        <h4><Link href={`/places/${place.slug}`} style={{ color: "inherit" }}>{place.name}</Link></h4>
                        <span className="pl-mono">{place.state_code}{o ? ` · eco-risk ${o.risk_score}/100` : ""}{place.is_lesser_known ? " · lesser-known" : ""}</span>
                      </div>
                      <button type="button" className="icon-x" aria-label={`Remove ${place.name}`}
                        onClick={() => set({ stops: plan.stops.filter((_, i) => i !== s.idx) })}><Icon name="close" /></button>
                    </div>
                    <ul className="pln-flags">{f.map((x, k) => <li key={k} className={`l-${x.level}`}>{x.text}</li>)}</ul>
                    {bad && !a && (
                      <button type="button" className="btn btn-green btn-sm" style={{ justifySelf: "start" }} onClick={() => findAlts(key, s.id, day)}>
                        <Icon name="leaf" />Find quieter alternatives
                      </button>
                    )}
                    {a === "loading" && <p className="pl-sub">Looking for lower-pressure places…</p>}
                    {Array.isArray(a) && (
                      <div className="pln-alts">
                        {a.length ? a.map((alt) => (
                          <div key={alt.id} className="pln-alt">
                            <span><b>{alt.name}</b> <span className="pl-mono">{alt.distance_km} km · eco-risk {alt.risk_score}{alt.is_lesser_known ? " · lesser-known" : ""}</span></span>
                            <button type="button" className="btn btn-ink btn-sm" onClick={() => {
                              set({ stops: plan.stops.map((x, i) => (i === s.idx ? { ...x, id: alt.id } : x)) });
                              setAlts((m) => { const n = { ...m }; delete n[key]; return n; });
                            }}>Swap</button>
                          </div>
                        )) : <p className="pl-sub">No quieter place nearby that day. Try another date.</p>}
                      </div>
                    )}
                  </article>
                );
              })}
              <div className="pln-add">
                <select className="pln-input" aria-label={`Add a place to day ${di + 1}`} value=""
                  onChange={(e) => e.target.value && set({ stops: [...plan.stops, { day: di, id: e.target.value }] })}>
                  <option value="">+ Add a place to {fmt(day)}</option>
                  {[...places].sort((x, y) => x.name.localeCompare(y.name)).map((p) => {
                    const o = byDay[day]?.get(p.id);
                    return <option key={p.id} value={p.id}>{p.name} · {p.state_code}{o ? ` · risk ${o.risk_score}` : ""}{o?.community_closed ? " · closed" : ""}</option>;
                  })}
                </select>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
