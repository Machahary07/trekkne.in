"use client";

import { useId, useState } from "react";
import { Icon } from "../Icon";
import type { Destination } from "@/lib/destinations";

/** Three grounded, actionable insights with an expandable full recommendation. */
export function Insights({ d }: { d: Destination }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // The underlying evidence: forecast, verified/official field reports (minus the forecast itself), destination profile.
  const sources = Array.from(
    new Set([
      `${d.weather.source} · ${d.weather.issued}`,
      ...d.reports
        .filter((r) => r.status === "verified" || (r.status === "official" && r.category !== "weather"))
        .map((r) => `${r.reporter} · ${r.when}`),
      `${d.eco.source} · ${d.eco.updated}`,
    ]),
  );

  return (
    <div className="ins">
      <div className="di-subhead">
        <span className="di-kicker ins-kicker"><Icon name="spark" />Trekne recommends</span>
        <span className="mono">Updated {d.updated}</span>
      </div>

      <ul className="ins-list">
        {d.insights.map((it) => (
          <li key={it.title} className={`ins-item t-${it.tone}`}>
            <span className="ins-ic"><Icon name={it.icon} /></span>
            <div>
              <b>{it.title}</b>
              <p>{it.text}</p>
              <span className="ins-src mono">{it.sources.join(" · ")}</span>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className="ins-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        {open ? "Hide full recommendation" : "Read full recommendation"}
        <Icon name="chevron" className="ico" />
      </button>
      <div id={panelId} className="ins-full" hidden={!open}>
        <p>{d.recommendation}</p>
        <p className="ins-sources">
          <b>Based on {sources.length} sources:</b> {sources.join(" · ")}
        </p>
        <p className="ins-fine">AI summarises verified and official sources only. It never overrides a local advisory.</p>
      </div>
    </div>
  );
}
