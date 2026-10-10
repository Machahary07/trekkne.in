import Link from "next/link";
import { MONTHS, pressureLevel, type Level, type Suitability } from "@trekne/brand";
import { Icon } from "./Icon";
import { STATE_NAMES } from "@/lib/states";
import type { ExploreEvent, ExplorePlace } from "@/lib/explore";
import "./home-intel.css";

const CROWD: Record<Level, string> = { good: "Quiet", warn: "Busy", high: "Full", none: "No count" };
const SEASON: Record<Suitability, string> = { good: "Good season", fair: "Fair season", poor: "Poor season", closed: "Closed" };
const SEASON_LEVEL: Record<Suitability, Level> = { good: "good", fair: "warn", poor: "high", closed: "high" };

/** Great-circle distance in km, to suggest the nearest place in good shape. */
function km(a: ExplorePlace, b: ExplorePlace) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)));
}

const crowdOf = (p: ExplorePlace) => pressureLevel(p.load_ratio);
const isGood = (p: ExplorePlace) => p.today === "good" && !p.community_closed && crowdOf(p) !== "high" && p.risk_level !== "high";

/** Why a place should get a rest today, most serious first; null when it's fine. */
function strain(p: ExplorePlace): { rank: number; text: string } | null {
  if (p.community_closed) return { rank: 0, text: p.notice ?? "Closed by the community today" };
  if (crowdOf(p) === "high") return { rank: 1, text: `Over capacity: ~${p.expected} expected for ${p.capacity} a day` };
  if (p.today === "poor" || p.today === "closed") return { rank: 2, text: `${SEASON[p.today]} right now` };
  if (p.risk_level === "high") return { rank: 3, text: `High eco-risk today (${p.risk_score}/100)` };
  return null;
}

/**
 * Home page "Destination intelligence": today's picture across every place, from the same live data as /destinations.
 * Shows where conditions are good and which places to give a rest, each with a nearby alternative.
 */
export function HomeIntel({ places, events }: { places: ExplorePlace[]; events: ExploreEvent[] }) {
  if (!places.length) return null;
  const month = new Date(Date.now() + 5.5 * 3600e3).getUTCMonth();
  const goodSeason = places.filter((p) => p.months[month] === "good").length;
  const strained = places.map((p) => ({ p, s: strain(p) })).filter((x): x is { p: ExplorePlace; s: NonNullable<ReturnType<typeof strain>> } => !!x.s)
    .sort((a, b) => a.s.rank - b.s.rank || b.p.risk_score - a.p.risk_score);
  const good = places.filter(isGood).sort((a, b) => Number(!!b.photo) - Number(!!a.photo) || a.risk_score - b.risk_score).slice(0, 4);
  const lesser = places.filter((p) => p.is_lesser_known).length;
  const next = events[0];
  const nextPlace = next?.destination_id ? places.find((p) => p.id === next.destination_id) : null;

  /** Nearest place in good shape within a realistic detour (150 km), preferring lesser-known ones near the closest. */
  const alternative = (from: ExplorePlace) => {
    const opts = places.filter((q) => q.id !== from.id && isGood(q)).map((q) => ({ q, d: km(from, q) })).filter((o) => o.d <= 150).sort((a, b) => a.d - b.d);
    if (!opts.length) return null;
    return opts.find((o) => o.q.is_lesser_known && o.d <= opts[0].d + 40) ?? opts[0];
  };

  return (
    <section id="destinations" className="hi" aria-labelledby="hi-h">
      <div className="wrap">
        <div className="hi-head">
          <div className="sec-head">
            <span className="eyebrow">Destination intelligence</span>
            <h2 id="hi-h">Where to go today, and where to give a rest.</h2>
            <p>
              Worked out every day for all {places.length} places across the Northeast: season, crowding against carrying
              capacity, community closures and eco-risk.
            </p>
          </div>
          <div className="hi-cta">
            <Link className="btn btn-ink" href="/destinations"><Icon name="map" />Explore all places</Link>
            <Link className="btn btn-ghost" href="/planner"><Icon name="route" />Plan a trip</Link>
          </div>
        </div>

        <ul className="hi-stats">
          <li><b>{goodSeason}</b><span>places in good season this {MONTHS[month]}</span></li>
          <li data-tone="warn"><b>{strained.length}</b><span>under strain today: full, closed or off-season</span></li>
          <li><b>{lesser}</b><span>lesser-known places we suggest when a famous one is full</span></li>
          <li className="hi-fest">
            {next ? (
              <>
                <span className="hi-date"><b>{new Date(next.starts_on + "T00:00:00").getDate()}</b>{MONTHS[new Date(next.starts_on + "T00:00:00").getMonth()]}</span>
                <span><small>Next festival</small><strong>{next.name}</strong>{nextPlace ? nextPlace.name : STATE_NAMES[next.state_code]} · {next.visitor_impact} impact</span>
              </>
            ) : <span>No festivals in the calendar yet.</span>}
          </li>
        </ul>

        <div className="hi-grid">
          <div className="hi-panel">
            <h3><span className="hi-dot" data-l="good" />Good to go today</h3>
            {good.length ? (
              <ul className="hi-cards">
                {good.map((p) => {
                  const crowd = crowdOf(p);
                  return (
                    <li key={p.id}>
                      <Link className="hi-card" href={`/places/${p.slug}`} data-img={p.photo ? true : undefined}
                        style={p.photo ? ({ "--img": `url("${p.photo}")` } as React.CSSProperties) : undefined}>
                        <span className="hi-state">{STATE_NAMES[p.state_code]}</span>
                        <b>{p.name}</b>
                        <span className="hi-chips">
                          <span><i data-l={p.risk_level} />Eco-risk {p.risk_score}</span>
                          <span><i data-l={crowd} />{CROWD[crowd]}</span>
                          {p.today && <span><i data-l={SEASON_LEVEL[p.today]} />{SEASON[p.today]}</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="hi-empty">No place is in a comfortable spot today. Try another date in the planner.</p>}
          </div>

          <div className="hi-panel">
            <h3><span className="hi-dot" data-l="high" />Give these a rest today</h3>
            {strained.length ? (
              <ul className="hi-rest">
                {strained.slice(0, 4).map(({ p, s }) => {
                  const alt = alternative(p);
                  return (
                    <li key={p.id}>
                      <Link className="hi-rest-place" href={`/places/${p.slug}`}>
                        {p.photo ? <img src={p.photo} alt="" loading="lazy" /> : <span className="hi-ph"><Icon name="pin" /></span>}
                        <span><b>{p.name}</b><small>{s.text}</small></span>
                      </Link>
                      {alt ? (
                        <Link className="hi-alt" href={`/places/${alt.q.slug}`}>
                          Try <b>{alt.q.name}</b> instead <span>{alt.d} km{alt.q.is_lesser_known ? " · lesser-known" : ""}</span><Icon name="arrow" />
                        </Link>
                      ) : (
                        <Link className="hi-alt hi-alt-date" href={`/planner?add=${p.slug}`}>
                          Nothing quieter nearby: <b>try another date</b><Icon name="arrow" />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : <p className="hi-empty">Nothing is under strain today. Good day to go.</p>}
            <p className="hi-note"><Icon name="info" />Visitor counts in this preview are simulated. Confirmed Trekne trips are added to each place&rsquo;s expected load.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
