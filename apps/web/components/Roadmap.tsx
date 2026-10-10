import { Icon } from "./Icon";

const PHASES = [
  { title: "Platform foundation", text: "Website, shared backend, destination pages, admin dashboard and AI retrieval." },
  { title: "App & Ranger network", text: "Tourist and Ranger modes, field reports, photo evidence and offline sync." },
  { title: "AI & sustainability", text: "Weather and geographic data, plus clear eco and access indicators." },
  { title: "Bookings & business", text: "Guide bookings, business profiles, payments and Ranger incentives." },
];

const STATES = ["Assam", "Meghalaya", "Arunachal", "Nagaland", "Mizoram", "Manipur", "Tripura", "Sikkim"];
/** The pilot starts in these two; the rest follow. */
const PILOT = new Set(["Assam", "Meghalaya"]);

export function Roadmap() {
  return (
    <section id="roadmap" aria-labelledby="road-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Roadmap</span>
          <h2 id="road-h">Starting in Assam and Meghalaya, then all eight states.</h2>
        </div>
        <ol className="road">
          {PHASES.map((p, i) => (
            <li key={p.title}>
              <span className="ph">PHASE {i + 1}</span>
              <div className="bar"><i /></div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
          <li>
            <span className="ph">PHASE 5</span>
            <div className="bar"><i /></div>
            <h3>Across the Northeast</h3>
            <div className="states">{STATES.map((s) => <span key={s} data-pilot={PILOT.has(s) || undefined}>{s}{PILOT.has(s) && " · pilot"}</span>)}</div>
            <p>States, ecosystems and cultural rules are data, so each new state is set up in the CRM, not rebuilt in code. <a href="/destinations#all-places">All 8 are already modelled →</a></p>
          </li>
        </ol>
        <div className="pilot">
          <b>The pilot</b>
          <span><Icon name="pin" />Assam &amp; Meghalaya first</span>
          <span><Icon name="users" />5–10 founding Rangers</span>
          <span><Icon name="shield" />Every report moderated</span>
        </div>
      </div>
    </section>
  );
}
