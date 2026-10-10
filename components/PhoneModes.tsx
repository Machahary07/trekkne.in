"use client";

import { useState } from "react";
import { Icon } from "./Icon";

type Mode = "tourist" | "ranger";

/** App mockup: one account, switching between Tourist Mode and Ranger Mode. */
export function PhoneModes() {
  const [mode, setMode] = useState<Mode>("tourist");

  return (
    <div className="phone">
      <div className="screen">
        <div className="notch" />
        <div className="modes" data-mode={mode} role="group" aria-label="App mode">
          <span className="slider" aria-hidden="true" />
          {(["tourist", "ranger"] as const).map((m) => (
            <button key={m} type="button" id={`mode-${m}`} aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m === "tourist" ? "Tourist" : "Ranger"}
            </button>
          ))}
        </div>

        <div className="mode-view" hidden={mode !== "tourist"}>
          <h4>Hi Asha, your trip is in 3 days</h4>
          <div className="mv-trip"><span className="mv-muted mv-ink">Sat 14 Nov · 2 travellers</span><b>Sohra → Nongriat</b></div>
          <div className="mv-card"><span className="st verified">Verified · 2h ago</span><b>Trail to Double-Decker open</b><span className="mv-muted">Steps dry until noon. Go early.</span></div>
          <div className="mv-card"><span className="st official">IMD</span><b>Afternoon showers likely</b><span className="mv-muted">East Khasi Hills · 06:00</span></div>
          <div className="mv-card"><div className="mv-row"><b>Book a Ranger guide</b><span className="mv-muted">from ₹1,500</span></div></div>
        </div>

        <div className="mode-view" hidden={mode !== "ranger"}>
          <h4>New field report</h4>
          <div className="mv-card"><span className="mv-muted">Destination</span><b>Nongriat · Tyrna steps</b><span className="mono mv-gps">25.2496°N 91.6677°E · ±8 m</span></div>
          <div className="cat-grid">
            {["Road", "Trail", "Weather", "Waste", "Crowd", "Closure"].map((c) => (
              <span key={c} className={c === "Trail" ? "on" : undefined}>{c}</span>
            ))}
          </div>
          <div className="photos"><i /><i /><i><Icon name="camera" /></i></div>
          <div className="offline"><Icon name="wifioff" />No signal. 2 reports saved and will upload when you’re back online.</div>
          <div className="mv-card"><div className="mv-row"><b>This week</b><span className="mv-muted">6 verified · ₹120</span></div></div>
        </div>
      </div>
    </div>
  );
}
