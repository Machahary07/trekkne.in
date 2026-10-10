import Link from "next/link";
import { Eyes, Logo } from "./Eyes";

const COLUMNS = [
  { title: "Explore", links: [["/destinations", "Destinations"], ["/how-it-works", "How it works"], ["/planner", "Plan a trip"], ["/destinations#seasons", "Seasons & festivals"]] },
  { title: "Join", links: [["/rangers", "Become a Ranger"], ["/business", "List your business"], ["/authorities", "Authorities & councils"], ["#join", "Get the app"]] },
  { title: "Trust", links: [["/how-it-works#promise-h", "Our promise"], ["/roadmap", "Roadmap"], ["/how-it-works", "How we verify"]] },
] as const;

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Logo />
            <p className="foot-tag">AI-powered, community-verified travel intelligence for Northeast India. Pronounced <em>Trek-nee</em>.</p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h4>{c.title}</h4>
              <ul>{c.links.map(([href, label]) => <li key={label}><Link href={href}>{label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="wordmark-xl" aria-hidden="true">trekne<Eyes /></div>
        <div className="foot-legal">
          <p>
            Trekne indicators are informational and are not official safety certifications. Conditions change quickly,
            so always follow advisories from local authorities. Destination data shown in this preview is simulated.
          </p>
          <p>© {new Date().getFullYear()} Trekne · trekne.in</p>
        </div>
      </div>
    </footer>
  );
}
