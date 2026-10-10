import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./Icon";
import { Eyes } from "./Eyes";
import { JoinLink } from "./SiteState";

type Feature = { icon: IconName; title: string; text: string };
type Stop = { href: string; icon: IconName; label: string; live?: boolean };

/* Where each upcoming feature sits next to what's live today. */
const STOPS: Stop[] = [
  { href: "/planner", icon: "route", label: "Trip planner & local guide", live: true },
  { href: "/homestays", icon: "home", label: "Homestays" },
  { href: "/shop", icon: "store", label: "Shop local markets" },
];

/** Shared "coming soon" page for features that follow the planner: a colour block, three planned features and a mini road. */
export function ComingSoon({ id, color, blob, title, lede, cta, chips, features }: {
  id: string; color: string; blob: string; title: ReactNode; lede: string; cta: string;
  chips: Array<{ icon: IconName; color: string; label: string }>; features: Feature[];
}) {
  const here = `/${id}`;
  return (
    <section aria-labelledby={`${id}-h`}>
      <div className="wrap">
        <div className="soon" style={{ "--c": color, "--blob": blob } as CSSProperties}>
          <div className="soon-copy">
            <span className="soon-badge"><Icon name="clock" />Coming soon</span>
            <h1 id={`${id}-h`}>{title}</h1>
            <p>{lede}</p>
            <div className="soon-ctas">
              <a className="btn btn-ink" href="#list">{cta}<Icon name="arrow" /></a>
              <JoinLink role="traveller" className="btn btn-ghost">Tell me when it’s live</JoinLink>
            </div>
          </div>
          <div className="soon-art" aria-hidden="true">
            <span className="blob" />
            <Eyes />
            {chips.map((c) => (
              <span key={c.label} className="live-chip">
                <span className="dot" style={{ background: c.color }}><Icon name={c.icon} /></span>{c.label}
              </span>
            ))}
          </div>
        </div>

        <ul className="soon-feats">
          {features.map((f) => (
            <li key={f.title}>
              <span className="ic"><Icon name={f.icon} /></span>
              <b>{f.title}</b>
              <p>{f.text}</p>
              <span className="st unverified">Planned</span>
            </li>
          ))}
        </ul>

        <div className="soon-road">
          <h2>Planner first. This comes next.</h2>
          <ol>
            {STOPS.map((s) => (
              <li key={s.href} data-live={s.live || undefined} aria-current={s.href === here ? "page" : undefined}>
                <Link href={s.href}>
                  <span className="stop"><Icon name={s.icon} /></span>
                  <b>{s.label}</b>
                  <small>{s.live ? "Live now" : s.href === here ? "You’re here · soon" : "Soon"}</small>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
