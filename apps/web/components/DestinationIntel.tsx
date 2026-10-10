"use client";

import { useRef, useState } from "react";
import { useSiteState } from "./SiteState";
import { DestinationPhoto } from "./intel/DestinationPhoto";
import { RouteMap } from "./intel/RouteMap";
import { WeatherPanel } from "./intel/WeatherPanel";
import { Insights } from "./intel/Insights";
import { EcoVisitors } from "./intel/EcoVisitors";
import { FieldTimeline } from "./intel/FieldTimeline";
import { CultureNotes } from "./intel/CultureNotes";
import type { Destination } from "@/lib/destinations";
import "./intel/intel.css";

export function DestinationIntel({ destinations }: { destinations: Destination[] }) {
  const { destination, setDestination } = useSiteState();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const d = destinations.find((x) => x.key === destination) ?? destinations[0];

  // One selected report, shared by the map pins and the timeline. Cleared on tab change.
  const [selected, setSelected] = useState<string | null>(null);
  const [shownKey, setShownKey] = useState(d.key);
  if (shownKey !== d.key) {
    setShownKey(d.key);
    setSelected(null);
  }
  const toggle = (id: string) => setSelected((s) => (s === id ? null : id));

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : destinations.length - 1)) % destinations.length;
    tabRefs.current[n]?.focus();
    setDestination(destinations[n].key);
  }

  return (
    <section id="destinations" className="di" aria-labelledby="dest-h">
      <div className="wrap">
        <div className="di-intro">
          <div className="sec-head">
            <span className="eyebrow">Destination intelligence</span>
            <h2 id="dest-h">Not just where to go. When, and how.</h2>
            <p>Every Trekne destination shows what we know, who said it and when. If it hasn’t been verified, we say so and don’t guess.</p>
          </div>
          <div className="di-bar">
            <div className="di-tabs" role="tablist" aria-label="Pilot destinations">
              {destinations.map((x, i) => (
                <button
                  key={x.key}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  className="di-tab"
                  role="tab"
                  id={`tab-${x.key}`}
                  aria-selected={x.key === d.key}
                  aria-controls="intel-panel"
                  tabIndex={x.key === d.key ? 0 : -1}
                  onClick={() => setDestination(x.key)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  <span className="tab-long">{x.tab}</span>
                  <span className="tab-short" aria-hidden="true">{x.short ?? x.tab}</span>
                </button>
              ))}
            </div>
            <span className="sim">Pilot preview · simulated data, not live conditions</span>
          </div>
        </div>

        <div id="intel-panel" className="di-grid" role="tabpanel" aria-labelledby={`tab-${d.key}`}>
          <div className="di-col di-left">
            <div className="di-o1"><DestinationPhoto destinations={destinations} active={d} /></div>
            <div className="di-o3 di-scroll"><div className="di-swap di-panel" key={`route-${d.key}`}>
              <RouteMap route={d.route} reports={d.reports} selectedId={selected} onSelect={toggle} />
            </div></div>
            <div className="di-o7 di-scroll"><div className="di-swap" key={`cul-${d.key}`}><CultureNotes culture={d.culture} /></div></div>
          </div>

          <div className="di-col di-right">
            <div className="di-o2 di-scroll"><div className="di-swap" key={`wx-${d.key}`}><WeatherPanel weather={d.weather} /></div></div>
            <div className="di-o4 di-scroll"><div className="di-swap" key={`ins-${d.key}`}><Insights d={d} /></div></div>
            <div className="di-o5 di-scroll"><div className="di-swap" key={`ev-${d.key}`}><EcoVisitors eco={d.eco} visitors={d.visitors} pressure={d.pressure} /></div></div>
            <div className="di-o6 di-scroll"><div className="di-swap" key={`tl-${d.key}`}>
              <FieldTimeline reports={d.reports} nodes={d.route.nodes} selectedId={selected} onSelect={toggle} />
            </div></div>
          </div>
        </div>

        <p className="legend">
          Indicators are for information only and are not official safety certifications. Always follow local authority advisories.
        </p>
      </div>
    </section>
  );
}
