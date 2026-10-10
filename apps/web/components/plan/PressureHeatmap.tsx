import { pressureLevel } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";
import { fmtDay } from "@/lib/public-data";
import "./plan.css";

/** Places × days grid of expected visitors as % of carrying capacity. */
export function PressureHeatmap({ dates, grids }: { dates: string[]; grids: DestinationOverview[][] }) {
  const places = [...(grids[0] ?? [])].sort((a, b) => (b.load_ratio ?? -1) - (a.load_ratio ?? -1));
  return (
    <>
      <div className="pl-scroll">
        <div className="pl-heat" style={{ gridTemplateColumns: `minmax(150px, 1.4fr) repeat(${dates.length}, minmax(36px, 1fr))` }}>
          <span />
          {dates.map((d) => (
            <span key={d} className="h">
              {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "narrow" })}<br />{d.slice(8)}
            </span>
          ))}
          {places.map((p) => (
            <Cells key={p.id} name={p.name} cells={dates.map((d, i) => ({ d, o: grids[i]?.find((x) => x.id === p.id) }))} />
          ))}
        </div>
      </div>
      <div className="pl-legend">
        <span><i style={{ background: "var(--green)" }} />Under 60%</span>
        <span><i style={{ background: "var(--yellow)" }} />60–89%</span>
        <span><i style={{ background: "var(--orange)" }} />90%+ of capacity</span>
        <span><i style={{ background: "var(--text)" }} />Community closure</span>
        <span>Counts are simulated in this preview</span>
      </div>
    </>
  );
}

function Cells({ name, cells }: { name: string; cells: { d: string; o?: DestinationOverview }[] }) {
  return (
    <>
      <span className="n" title={name}>{name}</span>
      {cells.map(({ d, o }) => {
        const lvl = pressureLevel(o?.load_ratio == null ? null : Number(o.load_ratio));
        const pct = o?.load_ratio == null ? "–" : Math.round(Number(o.load_ratio) * 100);
        return (
          <span key={d} className={`c ${o?.community_closed ? "closed" : `l-${lvl}`}`}
            title={`${name} · ${fmtDay(d)} · ${o?.community_closed ? `closed: ${o.notice}` : `${o?.expected ?? "no count"} of ${o?.capacity ?? "?"} expected`}`}>
            {o?.community_closed ? "×" : pct}
          </span>
        );
      })}
    </>
  );
}
