"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Eyes";
import { JoinLink } from "./SiteState";
import { MobileMenu } from "./MobileMenu";

const LINKS = [
  ["/destinations", "Destinations"],
  ["/planner", "Plan a trip"],
  ["/how-it-works", "How it works"],
  ["/rangers", "Rangers"],
  ["/business", "For business"],
  ["/authorities", "Authorities"],
  ["/roadmap", "Roadmap"],
] as const;

/** Distance (px) the page must move in one direction before the header reacts. */
const THRESHOLD = 6;

export function Header() {
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();

  // Slide the header away while reading down the page; bring it back on any upward scroll.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - last;
        if (y < 96) setHidden(false);
        else if (dy > THRESHOLD) setHidden(true);
        else if (dy < -THRESHOLD) setHidden(false);
        if (Math.abs(dy) > THRESHOLD || y < 96) last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-head" data-hidden={hidden || undefined} onFocusCapture={() => setHidden(false)}>
      <nav className="nav wrap" aria-label="Main">
        <Logo />
        <ul className="nav-links">
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>
            </li>
          ))}
        </ul>
        <div className="nav-cta">
          <Link className="btn btn-ghost" href="/rangers">Become a Ranger</Link>
          <JoinLink role="traveller" className="btn btn-ink">Get the app</JoinLink>
          <MobileMenu links={LINKS} />
        </div>
      </nav>
    </header>
  );
}
