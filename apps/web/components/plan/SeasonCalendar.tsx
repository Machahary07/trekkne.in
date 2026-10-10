import Link from "next/link";
import { SENSITIVITY_LEVEL, MONTHS } from "@trekne/brand";
import type { Tables } from "@trekne/db";
import { STATE_NAMES, fmtDay, todayIST } from "@/lib/public-data";
import "./plan.css";

type Ev = Pick<Tables<"events">, "id" | "name" | "community" | "state_code" | "destination_id" | "starts_on" | "ends_on" | "visitor_impact" | "open_to_visitors" | "etiquette" | "description">;

/** When to go: month-by-month suitability for every place, plus upcoming festivals and their visitor impact. */
export function SeasonCalendar({ places, seasons, events }: {
  places: { id: string; slug: string; name: string; state_code: string }[];
  seasons: { destination_id: string; month: number; suitability: string }[];
  events: Ev[];
}) {
  const now = Number(todayIST().slice(5, 7));
  const byPlace = new Map(places.map((p) => [p.id, p]));
  const upcoming = events.slice(0, 8);

  return (
    <section id="seasons" aria-labelledby="seasons-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Seasons & festivals</span>
          <h2 id="seasons-h">The right month matters as much as the right place.</h2>
          <p>Monsoon closes trails, festivals fill villages. The planner and the app check both before you commit to a date.</p>
        </div>
        <div className="pl-grid pl-2">
          <div className="pl-card">
            <h3>Best months to visit</h3>
            <div className="pl-scroll">
              <div className="pl-cal">
                <span />
                {MONTHS.map((m, i) => <span key={m} className="h" style={i + 1 === now ? { color: "var(--text)", fontWeight: 700 } : undefined}>{m.slice(0, 1)}</span>)}
                {places.map((p) => (
                  <Row key={p.id} p={p} seasons={seasons.filter((s) => s.destination_id === p.id)} now={now} />
                ))}
              </div>
            </div>
            <div className="pl-legend">
              <span><i className="s-good" />Good</span><span><i className="s-fair" />Fair</span>
              <span><i className="s-poor" />Poor</span><span><i className="s-closed" />Closed</span>
              <span>Outlined: this month</span>
            </div>
          </div>
          <div className="pl-card">
            <h3>Festivals ahead</h3>
            <ul className="pl-events">
              {upcoming.map((e) => {
                const d = new Date(e.starts_on + "T00:00:00");
                const lvl = SENSITIVITY_LEVEL[e.visitor_impact];
                const place = e.destination_id ? byPlace.get(e.destination_id) : null;
                return (
                  <li key={e.id}>
                    <span className="pl-date">{d.getDate()}<small>{MONTHS[d.getMonth()]}</small></span>
                    <div>
                      <b>{e.name}</b>
                      <span className="pl-mono">
                        {fmtDay(e.starts_on)}{e.ends_on !== e.starts_on ? `–${fmtDay(e.ends_on)}` : ""} · {e.community} · {STATE_NAMES[e.state_code]}
                        {place ? <> · <Link href={`/places/${place.slug}`}>{place.name}</Link></> : null}
                      </span>
                      {e.etiquette[0] && <p className="pl-sub" style={{ fontSize: 13.5, marginTop: 4 }}>{e.etiquette[0]}</p>}
                    </div>
                    <span className={`pl-pill l-${lvl}`}><i />{e.visitor_impact} impact</span>
                  </li>
                );
              })}
            </ul>
            {!upcoming.length && <p className="pl-sub">No festivals in the calendar yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ p, seasons, now }: { p: { slug: string; name: string }; seasons: { month: number; suitability: string }[]; now: number }) {
  return (
    <>
      <span className="n"><Link href={`/places/${p.slug}`}>{p.name}</Link></span>
      {MONTHS.map((m, i) => {
        const s = seasons.find((x) => x.month === i + 1)?.suitability;
        return <span key={m} className={`c${s ? ` s-${s}` : ""}${i + 1 === now ? " now" : ""}`} title={`${p.name} · ${m}: ${s ?? "not recorded"}`} />;
      })}
    </>
  );
}
