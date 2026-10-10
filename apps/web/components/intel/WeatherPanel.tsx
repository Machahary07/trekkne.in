"use client";

import { useState } from "react";
import { Icon } from "../Icon";
import { WeatherIcon } from "./WeatherIcon";
import { smoothPath } from "@/lib/paths";
import type { Weather } from "@/lib/destinations";

const COL = 54; // px per hour column
const BAND = 62; // px height of the temperature band

/** Apple Weather–style hourly strip: icon, temperature curve and rain probability. */
export function WeatherPanel({ weather }: { weather: Weather }) {
  const hours = weather.hourly ?? [];
  const peak = hours.reduce((best, h, i) => (h.rain > hours[best].rain ? i : best), 0);
  const [sel, setSel] = useState(hours.length && hours[peak].rain >= 40 ? peak : 0);
  const sky = weather.now.icon === "sun" || weather.now.icon === "partly" ? "clear" : weather.now.icon === "fog" || weather.now.icon === "cloud" ? "grey" : "wet";

  const temps = hours.map((h) => h.temp);
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const pts = hours.map((h, i) => ({ x: i * COL + COL / 2, y: 20 + ((max - h.temp) / (max - min || 1)) * (BAND - 30) }));
  const line = smoothPath(pts);
  const area = line && `${line} L${pts[pts.length - 1].x} ${BAND} L${pts[0].x} ${BAND} Z`;
  const h = hours[sel];

  return (
    <div className="wx" data-sky={sky}>
      <div className="wx-top">
        <div>
          <p className="wx-area"><Icon name="pin" />{weather.area}</p>
          <div className="wx-now">
            <span className="wx-temp">{weather.now.temp}°</span>
            <WeatherIcon kind={weather.now.icon} size={52} />
          </div>
          <p className="wx-cond">{weather.now.condition} · H {weather.now.high}° L {weather.now.low}°</p>
        </div>
        <span className={`wx-risk lv-${weather.risk.level}`}>
          <i className={`lvl ${weather.risk.level}`} />
          {weather.risk.text}
        </span>
      </div>

      {hours.length > 0 ? (
        <>
          <div className="wx-scroll">
            <div className="wx-grid" role="group" aria-label="Hourly forecast" style={{ width: hours.length * COL }}>
              <svg className="wx-line" width={hours.length * COL} height={BAND} viewBox={`0 0 ${hours.length * COL} ${BAND}`} aria-hidden="true">
                <defs>
                  <linearGradient id="wx-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity=".28" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#wx-fill)" />
                <path d={line} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                {pts.map((p, i) => (
                  <g key={i} className={i === sel ? "on" : undefined}>
                    <circle cx={p.x} cy={p.y} r={i === sel ? 4.5 : 2.6} fill="#fff" />
                    <text x={p.x} y={p.y - 9} textAnchor="middle">{hours[i].temp}°</text>
                  </g>
                ))}
              </svg>
              {hours.map((hr, i) => (
                <button
                  key={hr.time}
                  type="button"
                  className="wx-hour"
                  aria-pressed={i === sel}
                  aria-label={`${hr.time}:00, ${hr.label}, ${hr.temp} degrees, ${hr.rain}% chance of rain`}
                  onClick={() => setSel(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setSel(i)}
                  onFocus={() => setSel(i)}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="wx-time">{hr.time}</span>
                  <WeatherIcon kind={hr.icon} size={26} />
                  <span className="wx-band" />
                  <span className="wx-bar"><i style={{ height: `${Math.max(4, hr.rain)}%` }} /></span>
                  <span className="wx-pct">{hr.rain}%</span>
                </button>
              ))}
            </div>
          </div>
          <p className="wx-readout" aria-live="polite">
            <b>{h.time}:00</b> {h.label} · {h.temp}° · <span className="wx-rain">{h.rain}% chance of rain</span>
          </p>
        </>
      ) : (
        <p className="wx-summary">{weather.summary}</p>
      )}

      <p className="wx-src mono">
        <span>{weather.source} · issued {weather.issued}</span>
        <span>Simulated pilot data</span>
      </p>
    </div>
  );
}
