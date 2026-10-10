"use client";

import { Icon, type IconName } from "../Icon";
import { smoothPath } from "@/lib/paths";
import { REPORT_LABEL, type Report, type ReportCategory, type Route } from "@/lib/destinations";

export const CATEGORY_ICON: Record<ReportCategory, IconName> = {
  trail: "route",
  road: "car",
  weather: "rain",
  waste: "trash",
  crowd: "users",
  boating: "boat",
};

const MODE_ICON: Record<Route["mode"], IconName> = { trek: "backpack", road: "car", river: "boat" };
const MODE_LABEL: Record<Route["mode"], string> = { trek: "Footpath", road: "Road", river: "River" };

/**
 * Schematic route with Ranger observations pinned to it. Positions are
 * relative (0–100), not geographic — the panel labels itself accordingly.
 */
export function RouteMap({
  route,
  reports,
  selectedId,
  onSelect,
}: {
  route: Route;
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const index = new Map(route.nodes.map((n, i) => [n.id, i]));
  const full = smoothPath(route.nodes);
  const pinned = reports.filter((r) => r.at && index.has(r.at));
  const selected = reports.find((r) => r.id === selectedId);
  const nodeLabel = (id?: string) => route.nodes.find((n) => n.id === id)?.label;

  return (
    <div className="rt">
      <div className="rt-head">
        <div>
          <span className="di-kicker"><Icon name={MODE_ICON[route.mode]} />Route intelligence</span>
          <h4 className="rt-title">{route.title}</h4>
        </div>
        <span className="rt-schematic" title="We don’t have surveyed route geometry yet, so this is a diagram, not a map.">
          <Icon name="info" />Schematic · not to scale
        </span>
      </div>

      <div className="rt-map" data-mode={route.mode}>
        <div className="rt-stage">
        <svg className="rt-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={full} className="rt-casing" vectorEffect="non-scaling-stroke" />
          <path d={full} className="rt-path" vectorEffect="non-scaling-stroke" />
          {route.caution.map(([from, to]) => (
            <path key={`${from}-${to}`} d={smoothPath(route.nodes, index.get(from), index.get(to))} className="rt-caution" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>

        {route.nodes
          .filter((n) => n.kind !== "shape")
          .map((n) => (
            <div
              key={n.id}
              className={`rt-node k-${n.kind}`}
              data-align={n.x > 72 ? "end" : n.x < 24 ? "start" : "mid"}
              data-above={n.labelAbove || undefined}
              data-pinned={pinned.some((r) => r.at === n.id) || undefined}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <span className="rt-dot" />
              <span className="rt-label">{n.label}</span>
            </div>
          ))}

        {pinned.map((r) => {
          const n = route.nodes[index.get(r.at!)!];
          const siblings = pinned.filter((p) => p.at === r.at);
          const offset = (siblings.indexOf(r) - (siblings.length - 1) / 2) * 34;
          return (
            <button
              key={r.id}
              type="button"
              className={`rt-pin s-${r.status}`}
              style={{ left: `${n.x}%`, top: `${n.y}%`, "--dx": `${offset}px` } as React.CSSProperties}
              aria-pressed={r.id === selectedId}
              aria-label={`${REPORT_LABEL[r.status]} report at ${n.label}: ${r.text}`}
              onClick={() => onSelect(r.id)}
            >
              <Icon name={CATEGORY_ICON[r.category]} />
            </button>
          );
        })}

        </div>
        <span className="rt-mode-tag"><Icon name={MODE_ICON[route.mode]} />{MODE_LABEL[route.mode]}</span>
      </div>

      <div className="rt-detail" aria-live="polite">
        {selected ? (
          <div className={`rt-sel s-${selected.status}`}>
            <span className={`st ${selected.status}`}>{REPORT_LABEL[selected.status]}</span>
            <p>
              {(selected.status === "pending" || selected.status === "unverified") && <em>Unconfirmed: </em>}
              {selected.text}
            </p>
            <span className="mono">{selected.reporter} · {nodeLabel(selected.at)} · {selected.when}</span>
          </div>
        ) : (
          <p className="rt-hint"><Icon name="pin" />Tap a pin to read the observation made there.</p>
        )}
      </div>

      {route.caution.length > 0 && (
        <ul className="rt-cautions">
          {route.caution.map(([from, to, note]) => (
            <li key={`${from}-${to}`}>
              <span className="rt-caution-key" aria-hidden="true" />
              <span><b>Caution</b> {note}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="rt-stats">
        {route.stats.map((s) => (
          <div key={s.label} className={s.value ? undefined : "unknown"}>
            <dt>{s.label}</dt>
            <dd>{s.value ?? "Not verified"}</dd>
            {s.note && <dd className="rt-note">{s.note}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}
