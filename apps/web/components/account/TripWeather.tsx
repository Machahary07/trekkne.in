"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon";
import { WeatherIcon } from "../intel/WeatherIcon";
import { smoothPath } from "@/lib/paths";
import type { DayForecast } from "@/lib/weather";

export interface TripWeatherDay {
  day: string;
  /** "Day 1" and "Sun 18 Oct" */
  label: string;
  date: string;
  place: string | null;
  forecast: DayForecast | null;
  /** Why there's no forecast: no stop that day, past the 16-day window, or the fetch failed. */
  missing?: "free" | "later" | "unavailable";
}

const W = 300; // viewBox width of the hourly chart
const H = 52; // height of the temperature band

/** Weather for a trip, one day at a time: a day switcher, the day's headline and a daytime strip (temperature + rain). */
export function TripWeather({ days, readoutSlot }: { days: TripWeatherDay[]; readoutSlot?: string }) {
  // The selected hour's readout can live elsewhere on the card (the actions row), rendered into that element.
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setSlot(readoutSlot ? document.getElementById(readoutSlot) : null), [readoutSlot]);
  const first = Math.max(0, days.findIndex((d) => d.forecast));
  const [sel, setSel] = useState(first);
  const [hourSel, setHourSel] = useState<number | null>(null);
  const d = days[sel];
  const f = d.forecast;
  const hours = f?.hours ?? [];
  const col = hours.length ? W / hours.length : W;
  const temps = hours.map((h) => h.temp);
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const pts = hours.map((h, i) => ({ x: i * col + col / 2, y: 16 + ((max - h.temp) / (max - min || 1)) * (H - 24) }));
  const line = pts.length > 1 ? smoothPath(pts) : "";
  const area = line && `${line} L${pts[pts.length - 1].x} ${H} L${pts[0].x} ${H} Z`;
  const peak = hours.reduce((best, h, i) => (h.rain > (hours[best]?.rain ?? -1) ? i : best), 0);
  const hi = hourSel ?? (hours[peak]?.rain >= 30 ? peak : 0);
  const sky = !f ? "grey" : f.icon === "sun" || f.icon === "partly" ? "clear" : f.icon === "fog" || f.icon === "cloud" ? "grey" : "wet";

  return (
    <aside className="twx" data-sky={sky} aria-label="Weather for this trip">
      <div className="twx-days" role="tablist" aria-label="Pick a day">
        {days.map((x, i) => (
          <button key={x.day} type="button" role="tab" aria-selected={i === sel} onClick={() => { setSel(i); setHourSel(null); }}>
            <b>{x.label}</b>
            {x.forecast ? <WeatherIcon kind={x.forecast.icon} size={18} /> : <i className="twx-dot" />}
          </button>
        ))}
      </div>

      <div className="twx-body" key={d.day}>
        <div className="twx-sum">
          <p className="twx-where"><Icon name="pin" />{d.place ?? "No stop planned"}</p>
          <span className="twx-date">{d.date}</span>
          {f && (
            <div className="twx-now">
              <WeatherIcon kind={f.icon} size={44} />
              <span className="twx-temp">{f.high}°</span>
              <span className="twx-cond"><b>{f.label}</b>Low {f.low}°{f.rain != null && ` · ${f.rain}% rain`}</span>
            </div>
          )}
        </div>
        {f ? (
          <>
            {hours.length > 1 && (
              <div className="twx-strip" style={{ "--n": hours.length } as React.CSSProperties}>
                <svg className="twx-line" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="twx-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#fff" stopOpacity=".3" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={area} fill="url(#twx-fill)" />
                  <path d={line} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
                {hours.map((h, i) => (
                  <button
                    key={h.hour}
                    type="button"
                    className="twx-hour"
                    aria-pressed={i === hi}
                    aria-label={`${h.hour}:00, ${h.label}, ${h.temp} degrees, ${h.rain}% chance of rain`}
                    onClick={() => setHourSel(i)}
                    style={{ "--i": i, "--y": `${pts[i].y}px` } as React.CSSProperties}
                  >
                    <span className="twx-t">{h.temp}°</span>
                    <i className="twx-pt" />
                    <WeatherIcon kind={h.icon} size={22} />
                    <span className="twx-bar"><i style={{ height: `${Math.max(6, h.rain)}%` }} /></span>
                    <span className="twx-h">{h.hour > 12 ? `${h.hour - 12} pm` : h.hour === 12 ? "12 pm" : `${h.hour} am`}</span>
                  </button>
                ))}
              </div>
            )}
            {hi != null && hours[hi] && (() => {
              const h = hours[hi];
              const text = <><b>{String(h.hour).padStart(2, "0")}:00</b> {h.label} · {h.temp}° · <span className="twx-rain">{h.rain}% chance of rain</span></>;
              return slot
                ? createPortal(<span className="btn btn-ghost btn-sm twx-read" aria-live="polite"><WeatherIcon kind={h.icon} size={18} /><span>{text}</span></span>, slot)
                : <p className="twx-readout" aria-live="polite">{text}</p>;
            })()}
          </>
        ) : (
          <p className="twx-empty">
            {d.missing === "later" ? "The forecast opens 16 days before this day. Check back closer to the trip."
              : d.missing === "free" ? "Free day: add a place to see its weather."
              : "Forecast unavailable right now. We don't guess, so nothing is shown."}
          </p>
        )}
      </div>

      <p className="twx-src">Open-Meteo forecast · refreshed hourly</p>
    </aside>
  );
}
