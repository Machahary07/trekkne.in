import type { CSSProperties } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./Icon";
import { Eyes } from "./Eyes";

/* The four groups around Trekne, placed on the corners of the orbit (x/y are % of the panel). */
const NODES: Array<{ href: string; icon: IconName; color: string; who: string; does: string; x: number; y: number }> = [
  { href: "/rangers", icon: "camera", color: "var(--orange)", who: "Rangers", does: "Report & earn", x: 22, y: 20 },
  { href: "/planner", icon: "backpack", color: "var(--blue)", who: "Travellers", does: "Plan with verified advice", x: 78, y: 20 },
  { href: "/authorities", icon: "shield", color: "var(--green)", who: "Authorities", does: "Notices & visitor pressure", x: 22, y: 80 },
  { href: "/business", icon: "store", color: "var(--yellow)", who: "Businesses", does: "Get found & booked", x: 78, y: 80 },
];

const STATS = [
  { n: "8", label: "Northeast states modelled" },
  { n: "2", label: "Pilot states: Assam & Meghalaya" },
  { n: "5–10", label: "Founding Rangers in the pilot" },
  { n: "100%", label: "Reports checked by a person" },
];

export function AboutHero() {
  return (
    <section className="about" aria-labelledby="about-h">
      <div className="wrap about-grid">
        <div className="about-copy">
          <span className="eyebrow">About Trekne</span>
          <h1 id="about-h">Ground truth for travel in <em>Northeast India.</em></h1>
          <p className="lede">Local Rangers see it. We check it. You plan with it.</p>
          <p className="say"><b>trekne</b><span className="mono">/trek·nee/</span></p>
          <dl className="about-stats">
            {STATS.map((s) => (
              <div key={s.label}><dt>{s.label}</dt><dd>{s.n}</dd></div>
            ))}
          </dl>
        </div>

        <nav className="eco" aria-label="Who Trekne is for">
          <svg className="eco-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <circle cx="50" cy="50" r="24" />
            <circle cx="50" cy="50" r="40" />
            {NODES.map((n) => <line key={n.who} x1="50" y1="50" x2={n.x} y2={n.y} />)}
          </svg>
          <div className="eco-core" aria-hidden="true">
            <Eyes />
            <span>trekne</span>
          </div>
          <ul>
            {NODES.map((n) => (
              <li key={n.who} style={{ left: `${n.x}%`, top: `${n.y}%`, "--c": n.color } as CSSProperties}>
                <Link href={n.href}>
                  <span className="ic"><Icon name={n.icon} /></span>
                  <b>{n.who}</b>
                  <small>{n.does}</small>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
