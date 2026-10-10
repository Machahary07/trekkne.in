"use client";

import { useRef } from "react";
import { Icon } from "./Icon";
import { DestinationArt } from "./DestinationArt";
import { useSiteState } from "./SiteState";
import { REPORT_LABEL, type Destination } from "@/lib/destinations";

export function DestinationIntel({ destinations }: { destinations: Destination[] }) {
  const { destination, setDestination } = useSiteState();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const d = destinations.find((x) => x.key === destination) ?? destinations[0];

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : destinations.length - 1)) % destinations.length;
    tabRefs.current[n]?.focus();
    setDestination(destinations[n].key);
  }

  return (
    <section id="destinations" aria-labelledby="dest-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Destination intelligence</span>
          <h2 id="dest-h">Not just where to go. When, and how.</h2>
          <p>Every Trekne destination shows what we know, who said it and when. If it hasn’t been verified, we say so and don’t guess.</p>
        </div>

        <div className="intel">
          <div className="intel-top">
            <div className="tabs" role="tablist" aria-label="Pilot destinations">
              {destinations.map((x, i) => (
                <button
                  key={x.key}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  className="tab"
                  role="tab"
                  id={`tab-${x.key}`}
                  aria-selected={x.key === d.key}
                  aria-controls="intel-panel"
                  tabIndex={x.key === d.key ? 0 : -1}
                  onClick={() => setDestination(x.key)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  {x.tab}
                </button>
              ))}
            </div>
            <span className="sim">Pilot preview · simulated data, not live conditions</span>
          </div>

          <div id="intel-panel" key={d.key} className="intel-panel" role="tabpanel" aria-labelledby={`tab-${d.key}`}>
            <div className="intel-grid">
              <div className="dest-card">
                <DestinationArt dest={d.key} />
                <div className="dest-meta">
                  <div>
                    <h3>{d.name}</h3>
                    <p className="place"><Icon name="pin" /><span>{d.place}</span></p>
                  </div>
                  <dl className="facts">
                    {d.facts.map(([k, v]) => (
                      <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                  <p className="guide-note"><Icon name="temple" /><span>{d.culture}</span></p>
                </div>
              </div>

              <div>
                <div className="indicators">
                  {d.indicators.map((ind) => (
                    <div key={ind.label} className={`ind${ind.level === "none" ? " unknown" : ""}`}>
                      <span className="k">{ind.label}<span className="mono">{ind.updated}</span></span>
                      <span className="v"><i className={`lvl ${ind.level}`} />{ind.value}</span>
                      <span className="src mono">{ind.source}</span>
                    </div>
                  ))}
                </div>
                <div className="ai">
                  <div className="ai-head">
                    <b><Icon name="spark" />Trekne recommends</b>
                    <span className="mono">{d.recommendationMeta}</span>
                  </div>
                  <p>{d.recommendation}</p>
                </div>
                <ul className="feed" aria-label="Recent reports">
                  {d.reports.map((r) => (
                    <li key={r.text}>
                      <span className={`st ${r.status}`}>{REPORT_LABEL[r.status]}</span>
                      <div><span className="what">{r.text}</span><span className="who">{r.reporter}</span></div>
                      <span className="mono">{r.when}</span>
                    </li>
                  ))}
                </ul>
                <p className="legend">Indicators are for information only and are not official safety certifications. Always follow local authority advisories.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
