import Link from "next/link";
import { Icon } from "../Icon";
import type { Destination, Pressure } from "@/lib/destinations";

const ECO_STEPS = ["low", "moderate", "high"] as const;

const LOAD_WORD = { good: "Comfortable", warn: "Busy", high: "Over capacity", none: "Unknown" } as const;

/** Today's expected visitors against the agreed daily capacity, plus quieter options when it's busy. */
function CapacityGauge({ p }: { p: Pressure }) {
  const pct = Math.round(p.ratio * 100);
  return (
    <div className="cap">
      <p className="ev-value">{p.closed ? "Closed today" : LOAD_WORD[p.level]}</p>
      <div className="cap-track" role="img" aria-label={`About ${p.expected} visitors expected today against a daily capacity of ${p.capacity}: ${pct}%`}>
        <i className={`m-${p.level}`} style={{ width: `${Math.min(100, (p.ratio / 1.5) * 100)}%` }} />
        <b style={{ left: `${100 / 1.5}%` }} aria-hidden="true" />
      </div>
      <div className="cap-legend mono">
        <span>~{p.expected.toLocaleString("en-IN")} expected{p.planned ? ` (${p.planned} via Trekne)` : ""}</span>
        <span>capacity {p.capacity.toLocaleString("en-IN")}/day · {pct}%</span>
      </div>
      {p.notice && <p className="cap-notice"><Icon name="flag" />{p.notice}</p>}
      {p.alternatives.length > 0 && (
        <div className="cap-alt">
          <b>Too busy today? Try instead</b>
          <ul>
            {p.alternatives.map((a) => (
              <li key={a.slug}>
                <Link href={`/places/${a.slug}`}>{a.name}</Link>
                <span className="mono">{a.km} km · {a.state}{a.lesserKnown ? " · lesser-known" : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <span className="mono ev-src">{p.source}</span>
    </div>
  );
}

/** Environmental sensitivity meter + visitor pressure (capacity gauge from live data, trend where records exist). */
export function EcoVisitors({ eco, visitors, pressure }: Pick<Destination, "eco" | "visitors" | "pressure">) {
  const ecoRank = ECO_STEPS.indexOf(eco.level);

  return (
    <div className="ev">
      <div className="ev-block">
        <span className="di-kicker"><Icon name="leaf" />Eco sensitivity</span>
        <p className="ev-value">{eco.level[0].toUpperCase() + eco.level.slice(1)}</p>
        <div className="ev-meter" role="img" aria-label={`Environmental sensitivity: ${eco.level}`}>
          {ECO_STEPS.map((s, i) => (
            <i key={s} className={i <= ecoRank ? `on m-${eco.level}` : undefined} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
        <ul className="ev-concerns">
          {eco.concerns.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <span className="mono ev-src">{eco.source} · {eco.updated}</span>
      </div>

      <div className="ev-block">
        <span className="di-kicker"><Icon name="users" />Visitor pressure</span>
        {pressure ? (
          <CapacityGauge p={pressure} />
        ) : visitors.available ? (
          <>
            <p className="ev-value">{visitors.note.split(",")[0]}</p>
            <div className="ev-bars" role="img" aria-label={`Relative visitor trend, ${visitors.period}: ${visitors.note}`}>
              {visitors.series.map((v, i) => (
                <i
                  key={visitors.labels[i]}
                  className={i === visitors.series.length - 1 ? `last m-${visitors.level}` : undefined}
                  style={{ height: `${Math.round(v * 100)}%`, "--i": i } as React.CSSProperties}
                />
              ))}
            </div>
            <p className="ev-note">{visitors.note}. Relative trend, not a live count.</p>
            <span className="mono ev-src">{visitors.source} · {visitors.period}</span>
          </>
        ) : (
          <div className="ev-empty">
            <Icon name="eyeoff" />
            <p><b>Not verified</b>{visitors.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
