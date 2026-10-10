"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SUITABILITY_LABEL, pressureLevel, type Level } from "@trekne/brand";
import type { Alternative, DestinationOverview } from "@trekne/db";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";
import { Dropdown } from "../Dropdown";
import { DatePicker } from "../DatePicker";
import { MAX_DAYS, MAX_PARTY, addDays, todayIST, type TripBasics } from "@/lib/trip";
import "./plan.css";
import { STATE_NAMES } from "@/lib/states";
import { placePhoto, photoThumb } from "@/lib/photos";
import { kindOf } from "@/lib/explore";

interface Place { id: string; slug: string; name: string; state_code: string; kind: string; is_lesser_known: boolean; cover_url: string | null }
interface Ev { name: string; state_code: string; destination_id: string | null; starts_on: string; ends_on: string; visitor_impact: string; open_to_visitors: boolean }
interface Notice { destination_id: string; kind: string; title: string; starts_on: string; ends_on: string; community: string }
interface Plan { start: string; days: number; party: number; stops: { day: number; id: string }[] }
interface Flag { level: Level; text: string }

const KEY = "trekne.planner.v1";
const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

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
export function Planner({ places, events, notices, initialAdd, initialTrip = {}, tripId }: {
  places: Place[];
  events: Ev[];
  notices: Notice[];
  initialAdd?: string;
  initialTrip?: TripBasics;
  /** A saved trip to open for editing (?trip=id); saving then updates it. */
  tripId?: string;
}) {
  const supabase = supabaseBrowser();
  const defaultStart = addDays(todayIST(), 7);
  const [plan, setPlan] = useState<Plan>({ start: defaultStart, days: 3, party: 2, stops: [] });
  const [ready, setReady] = useState(false);
  const [byDay, setByDay] = useState<Record<string, Map<string, DestinationOverview>>>({});
  const [alts, setAlts] = useState<Record<string, Alternative[] | "loading">>({});
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [savedId, setSavedId] = useState<string | null>(tripId ?? null);
  const [save, setSave] = useState<{ busy?: boolean; ok?: boolean; err?: string }>({});

  // Restore the saved plan once on mount, then apply ?start/days/party and ?add=slug (from the homepage or a place page).
  useEffect(() => {
    const p = load(defaultStart);
    if (initialTrip.start) p.start = initialTrip.start;
    if (initialTrip.party) p.party = initialTrip.party;
    if (initialTrip.days) {
      p.days = initialTrip.days;
      p.stops = p.stops.filter((s) => s.day < p.days);
    }
    const add = places.find((x) => x.slug === initialAdd);
    if (add && !p.stops.some((s) => s.id === add.id)) p.stops = [...p.stops, { day: 0, id: add.id }];
    setPlan(p);
    setReady(true);
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    if (tripId) openSaved(tripId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Load a saved trip from the account into the planner. */
  async function openSaved(id: string) {
    const { data: t } = await supabase.from("trips").select("id,start_date,end_date,party_size,trip_stops(destination_id,day,position)").eq("id", id).maybeSingle();
    if (!t) return setSavedId(null);
    const days = Math.round((Date.parse(t.end_date) - Date.parse(t.start_date)) / 864e5) + 1;
    const stops = [...t.trip_stops]
      .sort((a, b) => a.day.localeCompare(b.day) || a.position - b.position)
      .map((s) => ({ day: Math.round((Date.parse(s.day) - Date.parse(t.start_date)) / 864e5), id: s.destination_id }));
    setPlan({ start: t.start_date, days: Math.min(MAX_DAYS, days), party: t.party_size, stops: stops.filter((s) => s.day < MAX_DAYS) });
  }

  /** Save to the signed-in account: a new trip, or an update of the one being edited. Saved trips start as drafts. */
  async function saveTrip() {
    setSave({ busy: true });
    const first = places.find((x) => x.id === plan.stops[0]?.id);
    const title = first ? `Trip to ${first.name}${plan.stops.length > 1 ? ` + ${plan.stops.length - 1} more` : ""}` : "My trip";
    const fields = { title, start_date: plan.start, end_date: addDays(plan.start, plan.days - 1), party_size: plan.party };
    let id = savedId;
    if (id) {
      const { error } = await supabase.from("trips").update(fields).eq("id", id);
      if (error) return setSave({ err: error.message });
      await supabase.from("trip_stops").delete().eq("trip_id", id);
    } else {
      const { data, error } = await supabase.from("trips").insert(fields).select("id").single();
      if (error || !data) return setSave({ err: error?.message ?? "Couldn't save" });
      id = data.id;
      setSavedId(id);
      const url = new URL(location.href);
      url.searchParams.set("trip", id);
      history.replaceState(history.state, "", url);
    }
    const rows = plan.stops.map((s, position) => ({ trip_id: id!, destination_id: s.id, day: addDays(plan.start, s.day), position }));
    if (rows.length) {
      const { error } = await supabase.from("trip_stops").insert(rows);
      if (error) return setSave({ err: error.message });
    }
    setSave({ ok: true });
  }

  function newTrip() {
    setSavedId(null);
    setSave({});
    set({ stops: [] });
    setAlts({});
    const url = new URL(location.href);
    url.searchParams.delete("trip");
    history.replaceState(history.state, "", url);
  }

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch {}
  }, [plan, ready]);

  // Any edit after saving means there are unsaved changes again.
  useEffect(() => setSave((s) => (s.ok ? {} : s)), [plan]);

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
        <div className="pln-field">
          <span>Start date</span>
          <DatePicker variant="field" label="Start date" value={plan.start} min={todayIST()} span={plan.days} onChange={(start) => set({ start })} />
        </div>
        <div className="pl-between">
          <div className="pln-field"><span>Days</span>
            <div className="pln-step">
              <button type="button" aria-label="Fewer days" onClick={() => set({ days: Math.max(1, plan.days - 1), stops: plan.stops.filter((s) => s.day < plan.days - 1) })}>−</button>
              <output>{plan.days}</output>
              <button type="button" aria-label="More days" onClick={() => set({ days: Math.min(MAX_DAYS, plan.days + 1) })}>+</button>
            </div>
          </div>
          <div className="pln-field"><span>Travellers</span>
            <div className="pln-step">
              <button type="button" aria-label="Fewer travellers" onClick={() => set({ party: Math.max(1, plan.party - 1) })}>−</button>
              <output>{plan.party}</output>
              <button type="button" aria-label="More travellers" onClick={() => set({ party: Math.min(MAX_PARTY, plan.party + 1) })}>+</button>
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
          {signedIn ? (
            <button type="button" className="btn btn-green btn-sm" disabled={save.busy || !plan.stops.length} onClick={saveTrip}>
              <Icon name="check" />{save.busy ? "Saving…" : savedId ? "Save changes" : "Save trip"}
            </button>
          ) : (
            <Link className="btn btn-green btn-sm" href="/login?next=/planner"><Icon name="user" />Sign in to save</Link>
          )}
          {savedId ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={newTrip}>New trip</button>
          ) : plan.stops.length > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { set({ stops: [] }); setAlts({}); }}>Clear</button>
          )}
        </div>
        {save.ok && <p className="pl-note" role="status"><Icon name="check" />Saved. <Link href="/account">See it in My trips</Link> and confirm it there when you&rsquo;re sure.</p>}
        {save.err && <p className="pl-note" role="status" style={{ color: "var(--orange)" }}><Icon name="alert" />{save.err}</p>}
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
                <Dropdown
                  id={`add-${di}`}
                  className="dd-pill"
                  label={`Add a place to day ${di + 1}`}
                  placeholder={`+ Add a place to ${fmt(day)}`}
                  value=""
                  layout="grid"
                  options={[...places].sort((x, y) => x.name.localeCompare(y.name)).map((p) => {
                    const o = byDay[day]?.get(p.id);
                    return {
                      value: p.id,
                      label: p.name,
                      hint: STATE_NAMES[p.state_code] ?? p.state_code,
                      image: (() => { const src = placePhoto(p.slug, p.cover_url); return src && photoThumb(src); })(),
                      tone: kindOf(p.kind).tone,
                      dot: o ? (o.community_closed ? "high" : o.risk_level) : "none",
                      meta: [
                        o ? `Eco-risk ${o.risk_score}` : "Checking…",
                        o?.suitability ? SUITABILITY_LABEL[o.suitability] : null,
                        o?.community_closed ? "Closed this day" : null,
                        p.is_lesser_known ? "Lesser-known" : null,
                      ].filter((m): m is string => !!m),
                    };
                  })}
                  onChange={(id) => set({ stops: [...plan.stops, { day: di, id }] })}
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
