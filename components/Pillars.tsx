import { Icon, type IconName } from "./Icon";

const PILLARS: Array<{ icon: IconName; title: string; text: string; wont: string }> = [
  { icon: "route", title: "Travel & access", text: "Road damage, trail closures and transport options, with alternatives when the evidence supports one.", wont: "Say a road is open based on a forecast alone." },
  { icon: "leaf", title: "Eco-risk", text: "Fragile ecosystems, recurring waste problems and seasonal hazards, so you can choose responsible activities.", wont: "Push you toward protected or sacred places because they’re quiet." },
  { icon: "users", title: "Visitor pressure", text: "Busy-period estimates from entry counts and historical records, plus suggestions for quieter times.", wont: "Invent crowd numbers. No records means “not verified”." },
  { icon: "temple", title: "Cultural heritage", text: "Festivals, customs, photography rules and seasonal restrictions, all checked with the communities themselves.", wont: "Publish sacred or restricted knowledge without permission." },
];

export function Pillars() {
  return (
    <section aria-labelledby="pill-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Four kinds of intelligence</span>
          <h2 id="pill-h">Smart about places. Honest about limits.</h2>
        </div>
        <div className="pillars">
          {PILLARS.map((p) => (
            <article key={p.title} className="pillar">
              <span className="ic"><Icon name={p.icon} /></span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <p className="wont"><b>We won’t</b>{p.wont}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
