import type { CSSProperties } from "react";
import { Icon, type IconName } from "./Icon";
import { TrailScroll } from "./TrailScroll";

type Step = {
  who: string; icon: IconName; color: string; time: string; title: string; text: string;
  tags: Array<{ icon?: IconName; label: string; st?: "pending" | "verified" | "official" }>;
};

const STEPS: Step[] = [
  { who: "Ranger", icon: "camera", color: "var(--orange)", time: "09:00", title: "Spots it on the trail", text: "Saved offline if there’s no signal.",
    tags: [{ icon: "camera", label: "Photo" }, { icon: "pin", label: "GPS" }, { icon: "wifioff", label: "Offline" }] },
  { who: "Trekne", icon: "db", color: "var(--yellow)", time: "09:01", title: "Logged, not public", text: "Time, place, reporter and evidence stored.",
    tags: [{ label: "Pending", st: "pending" }] },
  { who: "Moderator", icon: "shield", color: "var(--green)", time: "10:30", title: "Checked by a human", text: "Duplicates merged, conflicts re-confirmed.",
    tags: [{ label: "Verified", st: "verified" }] },
  { who: "AI", icon: "spark", color: "var(--blue)", time: "10:30", title: "Advice updates", text: "Every line keeps its source and timestamp.",
    tags: [{ icon: "rain", label: "IMD weather" }, { icon: "map", label: "Maps" }] },
  { who: "You", icon: "pin", color: "var(--text)", time: "10:31", title: "Know before you go", text: "Same advisory, everywhere, instantly.",
    tags: [{ icon: "globe", label: "Web" }, { icon: "phone", label: "App" }] },
];

/* One column of the trail. Each stop draws its own slice of the road (centre at x=100 of a 200-wide box),
   so the slices meet at the column edges at y=90 with matching tangents and read as one winding road. */
function roadSlice(i: number, last: number) {
  const up = i % 2 === 0;
  const y = up ? 36 : 144;
  const c = up ? 63 : 117;
  const enter = i === 0 ? `M0 ${y} L100 ${y}` : `M0 90 C25 ${c} 50 ${y} 100 ${y}`;
  const leave = i === last ? `L200 ${y}` : `C150 ${y} 175 ${c} 200 90`;
  return `${enter} ${leave}`;
}

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-h">
      <TrailScroll>
        <div className="wrap">
          <div className="sec-head how-head">
            <span className="eyebrow">How it works</span>
            <h2 id="how-h">From a Ranger’s phone to your plan.</h2>
            <p>Follow one landslide report from the trail at 9 am to every traveller by lunch.</p>
          </div>
          <ol className="trail">
            {STEPS.map((s, i) => {
              const d = roadSlice(i, STEPS.length - 1);
              return (
                <li key={s.who} data-side={i % 2 ? "down" : "up"} style={{ "--c": s.color, "--i": i } as CSSProperties}>
                  <div className="trail-card">
                    <span className="trail-meta"><span className="who">{s.who}</span><time className="mono">{s.time}</time></span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <span className="trail-tags">
                      {s.tags.map((t) =>
                        t.st ? <span key={t.label} className={`st ${t.st}`}>{t.label}</span>
                          : <span key={t.label} className="tag">{t.icon && <Icon name={t.icon} />}{t.label}</span>,
                      )}
                    </span>
                  </div>
                  <div className="trail-road" aria-hidden="true">
                    <svg viewBox="0 0 200 180" preserveAspectRatio="none">
                      <path className="bed" d={d} />
                      <path className="dash" d={d} />
                    </svg>
                    {/* The lit copy of the road, revealed left to right as you scroll. */}
                    <svg className="lit" viewBox="0 0 200 180" preserveAspectRatio="none">
                      <path className="bed" d={d} />
                      <path className="dash" d={d} />
                    </svg>
                    <span className="trail-stop"><Icon name={s.icon} /><b>{i + 1}</b></span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </TrailScroll>
    </section>
  );
}
