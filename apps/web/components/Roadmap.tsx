import { Icon } from "./Icon";

const PHASES = [
  { title: "Platform foundation", text: "Website, shared backend, destination pages, admin dashboard and AI retrieval." },
  { title: "App & Ranger network", text: "Tourist and Ranger modes, field reports, photo evidence and offline sync." },
  { title: "AI & sustainability", text: "Weather and geographic data, plus clear eco and access indicators." },
  { title: "Bookings & business", text: "Guide bookings, business profiles, payments and Ranger incentives." },
];

const STATES = ["Meghalaya", "Assam", "Arunachal", "Nagaland", "Mizoram", "Manipur", "Tripura", "Sikkim"];

export function Roadmap() {
  return (
    <section id="roadmap" aria-labelledby="road-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Roadmap</span>
          <h2 id="road-h">Starting small in Meghalaya, then all eight states.</h2>
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
            <div className="states">{STATES.map((s) => <span key={s}>{s}</span>)}</div>
          </li>
        </ol>
        <div className="pilot">
          <b>The pilot</b>
          <span><Icon name="pin" />3 destinations in Meghalaya</span>
          <span><Icon name="users" />5–10 founding Rangers</span>
          <span><Icon name="shield" />Every report moderated</span>
        </div>
      </div>
    </section>
  );
}
