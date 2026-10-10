"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MONTHS, RISK_LABEL, SUITABILITY_LABEL, pressureLevel, type Level, type Suitability } from "@trekne/brand";
import { Dropdown } from "../Dropdown";
import { Icon, type IconName } from "../Icon";
import { ExploreMap } from "./ExploreMap";
import { RISK_MAX, SEASON_RANK, kindOf, type ExploreEvent, type ExploreNotice, type ExplorePlace, type ExploreReport } from "@/lib/explore";
// Status pills (.pl-pill) are shared with the planner.
import "../plan/plan.css";
import "./explore.css";
import { STATE_NAMES } from "@/lib/states";

const CROWD: Record<Level, string> = { good: "Comfortable", warn: "Busy", high: "Over capacity", none: "Not verified" };
/** Shorter words for the narrow card stats. */
const CROWD_SHORT: Record<Level, string> = { good: "Quiet", warn: "Busy", high: "Full", none: "No count" };
const SEASON_SHORT: Record<Suitability, string> = { good: "Good", fair: "Fair", poor: "Poor", closed: "Closed" };
const SEASON_LEVEL: Record<Suitability, Level> = { good: "good", fair: "warn", poor: "high", closed: "high" };
const IMPACT_LEVEL = { low: "good", medium: "warn", high: "high", critical: "high" } as const;

type Sort = "season" | "risk" | "quiet" | "name";
const SORTS = [
  { value: "season", label: "Best for the month", hint: "Good season first, then lowest eco-risk", icon: "calendar" },
  { value: "risk", label: "Lowest eco-risk", hint: "Least pressure on the place today", icon: "leaf" },
  { value: "quiet", label: "Quietest today", hint: "Fewest visitors for its size", icon: "users" },
  { value: "name", label: "A–Z", hint: "By name", icon: "filter" },
] as const;

const todayMonth = () => new Date(Date.now() + 5.5 * 3600e3).getUTCMonth();
const fmtDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
function ago(iso: string) {
  const h = Math.round((Date.now() - Date.parse(iso)) / 36e5);
  return h < 1 ? "just now" : h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

/** Season for a month, with today's community closure applied when the month is the current one. */
function seasonFor(p: ExplorePlace, month: number): Suitability | null {
  return month === todayMonth() && p.today ? p.today : p.months[month];
}

/**
 * Destinations explorer for every published place in every state. Filters, the card list, the map and the detail
 * panel share one selection: hover a card to find it on the map, click a pin to open its card, and the URL keeps
 * ?place= so a selection can be shared.
 */
export function Explorer({ places, events, notices, reports }: {
  places: ExplorePlace[];
  events: ExploreEvent[];
  notices: ExploreNotice[];
  reports: ExploreReport[];
}) {
  const [q, setQ] = useState("");
  const [state, setState] = useState<string>("all");
  const [month, setMonth] = useState(todayMonth);
  const [sort, setSort] = useState<Sort>("season");
  const [lesser, setLesser] = useState(false);
  const [goodOnly, setGoodOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const cards = useRef(new Map<string, HTMLElement>());

  const states = useMemo(() => [...new Set(places.map((p) => p.state_code))].sort((a, b) => (STATE_NAMES[a] ?? a).localeCompare(STATE_NAMES[b] ?? b)), [places]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = places.filter((p) =>
      (state === "all" || p.state_code === state) &&
      (!lesser || p.is_lesser_known) &&
      (!goodOnly || seasonFor(p, month) === "good") &&
      (!needle || [p.name, p.district, p.ecosystem, p.place, STATE_NAMES[p.state_code] ?? ""].some((s) => s.toLowerCase().includes(needle))));
    const rank = (s: Suitability | null) => (s ? SEASON_RANK[s] : 4);
    const quiet = (p: ExplorePlace) => (p.load_ratio == null ? 99 : p.load_ratio);
    return list.sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name)
        : sort === "risk" ? a.risk_score - b.risk_score
          : sort === "quiet" ? quiet(a) - quiet(b) || a.risk_score - b.risk_score
            : rank(seasonFor(a, month)) - rank(seasonFor(b, month)) || a.risk_score - b.risk_score);
  }, [places, q, state, lesser, goodOnly, month, sort]);
  const visible = useMemo(() => new Set(shown.map((p) => p.id)), [shown]);
  const current = places.find((p) => p.id === selected) ?? null;
  const filtered = q || state !== "all" || lesser || goodOnly;

  // ?place=slug in, and out on every selection, so a selected place can be shared.
  useEffect(() => {
    const slug = new URLSearchParams(location.search).get("place");
    const p = slug && places.find((x) => x.slug === slug);
    if (p) setSelected(p.id);
  }, [places]);
  useEffect(() => {
    const url = new URL(location.href);
    if (current) url.searchParams.set("place", current.slug);
    else url.searchParams.delete("place");
    if (url.href !== location.href) history.replaceState(history.state, "", url);
  }, [current]);

  const selectedFrom = useRef<"card" | "map" | "event">("card");
  const side = useRef<HTMLElement>(null);
  const select = useCallback((id: string | null, from: "card" | "map" | "event" = "card") => {
    selectedFrom.current = from;
    setSelected((cur) => (id && cur === id && from === "card" ? null : id));
  }, []);

  // Selecting narrows the list so the map and details get the width. Once that slide finishes:
  // from a card, scroll until the whole map + details column is on screen (desktop, where it sits beside the list);
  // from a pin or festival, bring the matching card into view instead.
  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => {
      const el = side.current;
      if (selectedFrom.current === "card" && el && matchMedia("(min-width: 981px)").matches) {
        const stickTop = parseFloat(getComputedStyle(el).top) || 0;
        const offset = el.getBoundingClientRect().top - stickTop;
        if (offset > 1) scrollBy({ top: offset, behavior: "smooth" });
      } else if (selectedFrom.current !== "card") {
        cards.current.get(selected)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 480);
    return () => clearTimeout(t);
  }, [selected]);

  function reset() {
    setQ(""); setState("all"); setLesser(false); setGoodOnly(false);
  }

  return (
    <>
      <section className="xp" aria-labelledby="xp-h">
        <div className="wrap">
          <div className="xp-head">
            <div className="sec-head">
              <span className="eyebrow">Destinations</span>
              <h1 id="xp-h">{places.length} places across {states.length} Northeast states.</h1>
              <p>
                Every place carries the same planning data: its season month by month, today&rsquo;s eco-risk and crowding,
                community notices and festivals. Pick one to see why, then add it to a trip.
              </p>
            </div>
          </div>

          <div className="xp-body" data-view={view} data-selected={selected ? true : undefined}>
            {/* Filters, count and cards share the left column so the map column starts level with the filters. */}
            <div className="xp-main">
              <div className="xp-bar" role="search" aria-label="Filter places">
                <label className="xp-search">
                  <Icon name="search" />
                  <span className="sr-only">Search places</span>
                  <input type="search" placeholder="Search a place, district or ecosystem" value={q} onChange={(e) => setQ(e.target.value)} />
                </label>
                <Dropdown
                  id="xp-state" className="dd-pill" label="State" value={state}
                  options={[{ value: "all", label: "All states", hint: `${places.length} places` },
                    ...states.map((s) => ({ value: s, label: STATE_NAMES[s] ?? s, hint: `${places.filter((p) => p.state_code === s).length} places` }))]}
                  onChange={setState}
                />
                <Dropdown
                  id="xp-month" className="dd-pill" label="Travel month" value={String(month)}
                  options={MONTHS.map((m, i) => ({ value: String(i), label: i === todayMonth() ? `${m} (this month)` : m, hint: `${places.filter((p) => seasonFor(p, i) === "good").length} places in good season` }))}
                  onChange={(v) => setMonth(Number(v))}
                />
                <Dropdown id="xp-sort" className="dd-pill" label="Sort" value={sort} options={SORTS} onChange={setSort} />
                <div className="xp-toggles">
                  <button type="button" className="xp-chip" aria-pressed={goodOnly} onClick={() => setGoodOnly((v) => !v)}>
                    <Icon name="check" />Good in {MONTHS[month]}
                  </button>
                  <button type="button" className="xp-chip" aria-pressed={lesser} onClick={() => setLesser((v) => !v)}>
                    <Icon name="leaf" />Lesser-known
                  </button>
                </div>
              </div>

              <div className="xp-meta">
                <span aria-live="polite"><b>{shown.length}</b> of {places.length} places{filtered && <> · <button type="button" className="xp-link" onClick={reset}>Clear filters</button></>}</span>
                <div className="xp-view" role="group" aria-label="View">
                  <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}><Icon name="menu" />List</button>
                  <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}><Icon name="map" />Map</button>
                </div>
              </div>
              <div className="xp-list">
                {shown.map((p) => (
                  <PlaceCard
                    key={p.id}
                    p={p}
                    month={month}
                    selected={p.id === selected}
                    hovered={p.id === hovered}
                    refEl={(el) => { if (el) cards.current.set(p.id, el); else cards.current.delete(p.id); }}
                    onSelect={() => select(p.id)}
                    onHover={(on) => setHovered(on ? p.id : null)}
                  />
                ))}
                {!shown.length && (
                  <div className="xp-empty">
                    <b>No places match.</b>
                    <span>Try another month or state, or <button type="button" className="xp-link" onClick={reset}>clear the filters</button>.</span>
                  </div>
                )}
              </div>
            </div>

            <aside className="xp-side" ref={side} aria-label="Map and place details">
              <ExploreMap places={places} visible={visible} selected={selected} hovered={hovered} onSelect={(id) => select(id, "map")} onHover={setHovered} />
              <div className="xp-legend" aria-hidden="true">
                <span><i data-l="good" />Low risk</span><span><i data-l="warn" />Moderate</span><span><i data-l="high" />High or closed</span>
              </div>
              {current ? (
                <Detail
                  key={current.id}
                  p={current}
                  month={month}
                  events={events.filter((e) => e.destination_id === current.id || (!e.destination_id && e.state_code === current.state_code)).slice(0, 2)}
                  notices={notices.filter((n) => n.destination_id === current.id)}
                  reports={reports.filter((r) => r.destination_id === current.id).slice(0, 1)}
                  onClose={() => setSelected(null)}
                />
              ) : (
                <div className="xp-hint">
                  <Icon name="pin" />
                  <p><b>Pick a place</b> from the list or the map to see its eco-risk breakdown, today&rsquo;s crowding, season and community notices.</p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section id="seasons" className="xp-fests" aria-labelledby="fests-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Festivals ahead</span>
              <h2 id="fests-h">Festivals fill villages. Plan around them.</h2>
              <p>The next big gatherings across the Northeast and how much they add to visitor pressure.</p>
            </div>
            <ul className="xp-fests-grid">
              {events.slice(0, 8).map((e) => {
                const place = e.destination_id ? places.find((p) => p.id === e.destination_id) : null;
                const d = new Date(e.starts_on + "T00:00:00");
                const lvl = IMPACT_LEVEL[e.visitor_impact];
                return (
                  <li key={e.id} className="xp-fest">
                    <div className="xp-fest-top">
                      <span className="xp-fest-date"><b>{d.getDate()}</b>{MONTHS[d.getMonth()]}</span>
                      <span className={`pl-pill l-${lvl}`}><i />{e.visitor_impact === "critical" ? "Critical" : e.visitor_impact[0].toUpperCase() + e.visitor_impact.slice(1)} impact</span>
                    </div>
                    <b className="xp-fest-name">{e.name}</b>
                    <span className="xp-fest-meta">
                      <span><Icon name="calendar" />{fmtDate(e.starts_on)}{e.ends_on !== e.starts_on && ` – ${fmtDate(e.ends_on)}`}</span>
                      <span><Icon name="pin" />{place ? place.name : `Across ${STATE_NAMES[e.state_code] ?? e.state_code}`}</span>
                      <span><Icon name="users" />{e.community}</span>
                    </span>
                    {place && (
                      <button type="button" className="xp-fest-go" aria-label={`See ${place.name}`} onClick={() => { select(place.id, "event"); document.getElementById("xp-h")?.scrollIntoView({ behavior: "smooth" }); }}>
                        See place<Icon name="arrow" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function PlaceCard({ p, month, selected, hovered, refEl, onSelect, onHover }: {
  p: ExplorePlace;
  month: number;
  selected: boolean;
  hovered: boolean;
  refEl: (el: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onHover: (on: boolean) => void;
}) {
  const k = kindOf(p.kind);
  const season = seasonFor(p, month);
  const crowd = pressureLevel(p.load_ratio);
  return (
    <button
      ref={refEl}
      type="button"
      className="xp-card"
      aria-pressed={selected}
      data-img={p.photo ? true : undefined}
      data-tone={p.photo ? undefined : k.tone}
      style={p.photo ? ({ "--img": `url("${p.photo}")` } as React.CSSProperties) : undefined}
      data-hovered={hovered || undefined}
      onClick={onSelect}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <span className="xp-card-top">
        <span className="xp-kind" data-tone={k.tone}><Icon name={k.icon as IconName} /></span>
        <span className="xp-state">{STATE_NAMES[p.state_code] ?? p.state_code}</span>
      </span>
      <span className="xp-name">{p.name}</span>
      <span className="xp-sub">{p.district} · {p.ecosystem}</span>
      <span className="xp-stats">
        <span><small>Eco-risk</small><b className={`xp-lv l-${p.risk_level}`}><i />{p.risk_score}</b></span>
        <span><small>Today</small><b className={`xp-lv l-${p.community_closed ? "high" : crowd}`}><i />{p.community_closed ? "Closed" : CROWD_SHORT[crowd]}</b></span>
        <span><small>{MONTHS[month]}</small><b className={`xp-lv l-${season ? SEASON_LEVEL[season] : "none"}`}><i />{season ? SEASON_SHORT[season] : "—"}</b></span>
      </span>
      <MonthStrip months={p.months} month={month} labels />
      {(p.is_lesser_known || p.community_closed) && (
        <span className="xp-badges">
          {p.is_lesser_known && <span className="pl-pill"><Icon name="leaf" />Lesser-known</span>}
          {p.community_closed && <span className="pl-pill l-high"><i />{p.notice ?? "Community closure today"}</span>}
        </span>
      )}
    </button>
  );
}

function MonthStrip({ months, month, labels = false }: { months: (Suitability | null)[]; month: number; labels?: boolean }) {
  return (
    <span className={`xp-months${labels ? " xp-months-l" : ""}`} aria-label={`Season by month: ${months.map((s, i) => `${MONTHS[i]} ${s ?? "not recorded"}`).join(", ")}`}>
      {months.map((s, i) => (
        <span key={i} className="xp-m" data-s={s ?? "none"} data-now={i === month || undefined}>
          {labels && <small>{MONTHS[i].slice(0, 1)}</small>}
        </span>
      ))}
    </span>
  );
}

function Detail({ p, month, events, notices, reports, onClose }: {
  p: ExplorePlace;
  month: number;
  events: ExploreEvent[];
  notices: ExploreNotice[];
  reports: ExploreReport[];
  onClose: () => void;
}) {
  const k = kindOf(p.kind);
  const crowd = pressureLevel(p.load_ratio);
  const parts = [
    { key: "sensitivity", label: "Ecosystem sensitivity", v: p.risk.sensitivity, max: RISK_MAX.sensitivity },
    { key: "pressure", label: "Crowding today", v: p.risk.pressure, max: RISK_MAX.pressure },
    { key: "season", label: "Season today", v: p.risk.season, max: RISK_MAX.season },
    { key: "issues", label: "Open field issues", v: p.risk.issues, max: RISK_MAX.issues },
  ];

  // On phones the panel is a bottom sheet: Escape closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
    {/* Phones only (CSS): dims the page behind the bottom sheet; tap to close. */}
    <div className="xp-scrim" aria-hidden="true" onClick={onClose} />
    <div className="xp-detail" role="region" aria-label={`${p.name} details`}>
      <div className="xp-detail-head">
        <span className="xp-kind" data-tone={k.tone}><Icon name={k.icon as IconName} /></span>
        <div>
          <h2>{p.name}</h2>
          <span className="xp-sub">{p.place}</span>
        </div>
        <button type="button" className="xp-close" aria-label="Close details" onClick={onClose}><Icon name="close" /></button>
      </div>
      <p className="xp-summary">{p.summary}</p>
      {p.credit && (
        <p className="xp-credit">
          Photo: <a href={p.credit.sourceUrl} target="_blank" rel="noreferrer">{p.credit.credit}</a>
          {" · "}<a href={p.credit.licenseUrl} target="_blank" rel="noreferrer">{p.credit.license}</a>
        </p>
      )}


      {/* Two columns once the panel is wide (container query), one otherwise. */}
      <div className="xp-d-cols">
        <div className="xp-d-col">
          <div className="xp-block">
            <div className="xp-score">
              <b className={`l-${p.risk_level}`}>{p.risk_score}<small>/100</small></b>
              <span title="Higher means more pressure on the place. It adds up the four parts below."><strong>{RISK_LABEL[p.risk_level]}</strong><small>Eco-risk today, out of 100</small></span>
            </div>
            <ul className="xp-parts">
              {parts.map((x) => (
                <li key={x.key}>
                  <span>{x.label}</span>
                  <span className="xp-bar-track"><span className="xp-bar-fill" style={{ width: `${(x.v / x.max) * 100}%` }} /></span>
                  <span className="mono">{x.v}/{x.max}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="xp-block">
            <small className="xp-k">Crowding today</small>
            {p.capacity && p.expected != null ? (
              <>
                <b className={`xp-lv l-${crowd}`}><i />{CROWD[crowd]}</b>
                <span className="xp-bar-track"><span className={`xp-bar-fill l-${crowd}`} style={{ width: `${Math.min(100, (p.load_ratio ?? 0) * 100)}%` }} /></span>
                <span className="mono xp-muted">~{p.expected} expected · {p.capacity}/day capacity</span>
              </>
            ) : (
              <>
                <b className="xp-lv l-none"><i />Not verified</b>
                <span className="xp-muted">No reliable count yet, so we don&rsquo;t guess.</span>
              </>
            )}
          </div>
          <div className="xp-actions">
            <Link className="btn btn-green" href={`/planner?add=${p.slug}`}><Icon name="route" />Add to a trip</Link>
            <Link className="btn btn-ghost" href={`/places/${p.slug}`}>Full guide<Icon name="arrow" /></Link>
          </div>
        </div>
        <div className="xp-d-col">
          {notices.map((n) => (
            <p className="xp-notice" key={n.id}>
              <Icon name="alert" />
              <span><b>{n.title}</b> · {n.community} · {fmtDate(n.starts_on)}{n.ends_on !== n.starts_on && `–${fmtDate(n.ends_on)}`}</span>
            </p>
          ))}
          <div className="xp-block">
            <small className="xp-k">Season · {MONTHS[month]}</small>
            {(() => {
              const s = seasonFor(p, month);
              return <b className={`xp-lv l-${s ? SEASON_LEVEL[s] : "none"}`}><i />{s ? SUITABILITY_LABEL[s] : "Not recorded"}</b>;
            })()}
            <MonthStrip months={p.months} month={month} labels />
          </div>
          {events.length > 0 && (
            <div className="xp-block">
              <small className="xp-k">Festivals nearby</small>
              <ul className="xp-mini">
                {events.map((e) => (
                  <li key={e.id}><Icon name="calendar" /><span><b>{e.name}</b> · {fmtDate(e.starts_on)}{e.ends_on !== e.starts_on && `–${fmtDate(e.ends_on)}`} · {e.visitor_impact} impact</span></li>
                ))}
              </ul>
            </div>
          )}

          <div className="xp-block">
            <small className="xp-k">Latest verified report</small>
            {reports.length ? (
              <ul className="xp-mini">
                {reports.map((r) => (
                  <li key={r.id}>
                    <span className={`st ${r.status}`}>{r.status === "official" ? "Official" : "Verified"}</span>
                    <span className="xp-report"><span className="xp-clamp">{r.body}</span><small className="xp-muted">{r.source_label} · {ago(r.created_at)}</small></span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="xp-muted">No verified reports yet. Rangers haven&rsquo;t filed from here recently.</span>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
