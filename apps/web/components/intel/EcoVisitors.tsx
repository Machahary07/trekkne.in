import { Icon } from "../Icon";
import type { Destination } from "@/lib/destinations";

const ECO_STEPS = ["low", "moderate", "high"] as const;

/** Environmental sensitivity meter + visitor trend (only where records exist). */
export function EcoVisitors({ eco, visitors }: Pick<Destination, "eco" | "visitors">) {
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
        {visitors.available ? (
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
