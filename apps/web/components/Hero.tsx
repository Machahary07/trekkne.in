"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { DatePicker } from "./DatePicker";
import { matchDestination, type Destination } from "@/lib/destinations";
import { MAX_DAYS, MAX_PARTY, addDays, todayIST } from "@/lib/trip";

export function Hero({ destinations }: { destinations: Destination[] }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);
  // Dates are set after mount so the server and browser never disagree about "today".
  const [today, setToday] = useState("");
  const [start, setStart] = useState("");
  const [days, setDays] = useState(3);
  const [party, setParty] = useState(2);
  useEffect(() => {
    setToday(todayIST());
    setStart(addDays(todayIST(), 7));
  }, []);

  /** Matches the typed place, or explains why not. An empty box returns "" so planning can start blank. */
  function lookup() {
    const raw = input.current?.value.trim() ?? "";
    if (!raw) return "";
    const hit = matchDestination(raw, destinations);
    if (!hit) setNote(`We don’t cover “${raw}” yet. Right now we’re piloting in Assam and Meghalaya, and we’d rather show nothing than guess.`);
    return hit;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const hit = lookup();
    if (hit === null) return;
    setNote("");
    const q = new URLSearchParams({ ...(hit && { add: hit }), ...(start && { start }), days: String(days), party: String(party) });
    router.push(`/planner?${q}`);
  }

  function onCheck() {
    const hit = lookup();
    if (hit === "") {
      setNote("Type a place, such as Nongriat, Sohra or Dawki.");
      input.current?.focus();
    } else if (hit) {
      setNote("");
      // Live conditions for every place are on its page.
      router.push(`/places/${hit}`);
    }
  }

  return (
    <div className="wrap">
      <div className="hero">
        <HeroArt />
        <h1>
          <span className="w">Know</span> <span className="w">before</span> <span className="w">you</span>{" "}
          <span className="w ink">go.</span>
        </h1>
        <p className="hero-sub">
          Plan Northeast India trips that <strong>check every stop</strong> against crowding, season, festivals and
          community closures, built on conditions <strong>verified by Rangers</strong> who live there.
        </p>

        <form className="finder" role="search" autoComplete="off" onSubmit={onSubmit}>
          <div className="search">
            <Icon name="search" />
            <label htmlFor="q" className="sr-only">Where to next?</label>
            <input ref={input} id="q" name="q" type="search" placeholder="Where to? Try Nongriat, Sohra or Dawki" />
            <button className="btn btn-green" type="submit">
              <span>Plan a trip</span>
              <Icon name="route" />
            </button>
          </div>
          <div className="trip-bar">
            <DatePicker label="Start" value={start} min={today} span={days} onChange={setStart} />
            <Stepper label="Days" icon="clock" value={days} max={MAX_DAYS} onChange={setDays} />
            <Stepper label="Travellers" icon="users" value={party} max={MAX_PARTY} onChange={setParty} />
          </div>
          <button className="finder-alt" type="button" onClick={onCheck}>
            or just check today’s conditions <Icon name="arrow" />
          </button>
          <p className="finder-note" aria-live="polite">{note}</p>
        </form>

        <div className="hero-chips" aria-label="Example advisories">
          <span className="live-chip">
            <span className="dot" style={{ background: "#FF6A2B" }}><Icon name="alert" /></span>
            Road slip near Sohra <small>verified</small>
          </span>
          <span className="live-chip">
            <span className="dot" style={{ background: "#FFC21A" }}><Icon name="rain" /></span>
            Afternoon rain at Nongriat <small>IMD</small>
          </span>
          <span className="live-chip">
            <span className="dot" style={{ background: "#2DC56E" }}><Icon name="sun" /></span>
            Dry all weekend at Dawki <small>good to visit</small>
          </span>
        </div>
      </div>
    </div>
  );
}

/** A white pill with − / + buttons, for whole numbers from 1 to `max`. */
function Stepper({ label, icon, value, max, onChange }: { label: string; icon: IconName; value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="trip-pill" role="group" aria-label={label}>
      <Icon name={icon} />
      <span className="trip-k">{label}</span>
      <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

function HeroArt() {
  return (
    // Hills only: the sky is the .hero background gradient, so the band can sit at the
    // bottom of a viewport-height card without stretching behind the copy.
    <svg className="hero-art" viewBox="0 200 1440 440" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <circle cx="1110" cy="335" r="108" fill="#FFC21A" />
      <g fill="#fff" opacity=".9">
        <rect x="860" y="236" width="150" height="34" rx="17" />
        <rect x="905" y="216" width="80" height="38" rx="19" />
        <rect x="1236" y="262" width="120" height="28" rx="14" />
        <rect x="1266" y="246" width="60" height="32" rx="16" />
      </g>
      <path d="M0 420C120 360 220 330 340 370s180-70 320-60 200 90 320 70 200-80 320-60c80 13 120 40 140 50v270H0z" fill="#7090E4" />
      <path d="M0 470c140-40 260-20 380-50s200 20 340 30 220-50 340-40 240 60 380 40v190H0z" fill="#3D57B5" />
      <path d="M1028 408h16c4 30-2 60 3 98h-22c4-38-1-68 3-98z" fill="#fff" opacity=".92" />
      <ellipse cx="1036" cy="505" rx="44" ry="10" fill="#fff" opacity=".55" />
      <ellipse cx="560" cy="470" rx="300" ry="18" fill="#fff" opacity=".18" />
      <path d="M0 540c180-40 300-20 460-40s240 30 400 40 280-40 420-30c80 6 130 20 160 25v105H0z" fill="#1F2D6B" />
      <g fill="#1F2D6B">
        <path d="M140 528 158 470l18 58z" />
        <path d="M172 524 186 482l14 42z" />
        <path d="M1180 512 1198 452l18 60z" />
        <path d="M1214 516 1229 474l15 42z" />
        <path d="M760 526 776 476l16 50z" />
      </g>
      <path d="M0 600c200-20 400 10 600-5s400 15 600 5c120-6 200 0 240 5v35H0z" fill="#10131F" />
      <g fill="#10131F">
        <path d="M300 600 322 528l22 72z" />
        <path d="M336 600 354 546l18 54z" />
        <path d="M1320 604 1342 534l22 70z" />
      </g>
    </svg>
  );
}
