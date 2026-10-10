"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Eyes";
import { JoinLink } from "./SiteState";
import { MobileMenu } from "./MobileMenu";
import { AccountMenu } from "./AccountMenu";
import { RANGER_SIGNUP } from "@/lib/landing";

// Kept short on purpose: Rangers, Authorities, Roadmap and "List your business" live in the footer.
// The third flag marks features that follow the planner and show a "Soon" tag.
const LINKS = [
  ["/planner", "Plan a trip"],
  ["/destinations", "Destinations"],
  ["/homestays", "Homestays", true],
  ["/shop", "Shop", true],
  ["/about", "About Trekne"],
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
          {LINKS.map(([href, label, soon]) => (
            <li key={href}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                {label}{soon && <small className="soon-tag">Soon</small>}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-cta">
          <Link className="btn btn-ghost" href={RANGER_SIGNUP}>Become a Ranger</Link>
          <JoinLink role="traveller" className="btn btn-ink">Get the app</JoinLink>
          <MobileMenu links={LINKS} />
          <AccountMenu />
        </div>
      </nav>
    </header>
  );
}
