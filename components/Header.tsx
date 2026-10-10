import { Logo } from "./Eyes";
import { JoinLink } from "./SiteState";
import { MobileMenu } from "./MobileMenu";

const LINKS = [
  ["#destinations", "Destinations"],
  ["#how", "How it works"],
  ["#rangers", "Rangers"],
  ["#business", "For business"],
  ["#roadmap", "Roadmap"],
] as const;

export function Header() {
  return (
    <header className="site-head">
      <nav className="nav wrap" aria-label="Main">
        <Logo />
        <ul className="nav-links">
          {LINKS.map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
        <div className="nav-cta">
          <a className="btn btn-ghost" href="#rangers">Become a Ranger</a>
          <JoinLink role="traveller" className="btn btn-ink">Get the app</JoinLink>
          <MobileMenu links={LINKS} />
        </div>
      </nav>
    </header>
  );
}
