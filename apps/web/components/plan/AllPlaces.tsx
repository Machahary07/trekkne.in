import Link from "next/link";
import type { DestinationOverview } from "@trekne/db";
import { STATE_NAMES } from "@/lib/public-data";
import { Icon } from "../Icon";
import "./plan.css";

const RISK = { good: "Low risk", warn: "Moderate", high: "High risk", none: "Unknown" } as const;

/** Every published place, grouped by state, with today's eco-risk. Shows that states are data, not code. */
export function AllPlaces({ overview }: { overview: DestinationOverview[] }) {
  const states = [...new Set(overview.map((o) => o.state_code))].sort((a, b) => (STATE_NAMES[a] ?? a).localeCompare(STATE_NAMES[b] ?? b));
  const ecosystems = new Set(overview.map((o) => o.ecosystem.split("·")[0].trim()).filter(Boolean));

  return (
    <section id="all-places" aria-labelledby="places-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Across the Northeast</span>
          <h2 id="places-h">{overview.length} places, {states.length} states, one model.</h2>
          <p>
            The three pilot sites above get full Ranger coverage. These places carry the same planning data: carrying capacity,
            seasons, sensitivity and community rules. Lesser-known places are what we suggest when a famous one is full.
          </p>
        </div>
        <div className="pl-states">
          {states.map((code) => {
            const list = overview.filter((o) => o.state_code === code).sort((a, b) => a.name.localeCompare(b.name));
            return (
              <div className="pl-state" key={code}>
                <h3>{STATE_NAMES[code] ?? code}<span className="pl-mono">{list.length}</span></h3>
                <ul>
                  {list.map((o) => (
                    <li key={o.id}>
                      <Link href={`/places/${o.slug}`}>
                        <b>{o.name}</b>
                        <span className="pl-row" style={{ gap: 6 }}>
                          <span className={`pl-pill l-${o.risk_level}`}><i />{RISK[o.risk_level]}</span>
                          {o.is_lesser_known && <span className="pl-pill"><Icon name="leaf" style={{ width: 13, height: 13 }} />Lesser-known</span>}
                          {o.community_closed && <span className="pl-pill l-high"><i />Closed today</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="pl-config">
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <span className="pl-kicker" style={{ color: "var(--deep-muted)" }}><Icon name="db" />Built to adapt</span>
            <h3>A new state is data entry, not new code.</h3>
            <p>
              States, ecosystems ({ecosystems.size} so far, from wetlands to alpine lakes), carrying capacities, seasons, festivals,
              heritage rules and even user roles are rows in the database. Tourism departments and community councils edit them
              in the Trekne CRM, and the website, the app and the risk score pick them up immediately.
            </p>
          </div>
          <code>{`destination   Loktak Lake
state         Manipur
ecosystem     Wetland · floating phumdis
sensitivity   critical
capacity      1,500 visitors / day
seasons       Oct–Mar good · Jun–Aug poor
etiquette     Use local boats
              No plastic on the lake
community     Notices by the local council`}</code>
        </div>
      </div>
    </section>
  );
}
