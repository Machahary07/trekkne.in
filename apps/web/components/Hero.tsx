"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { DatePicker } from "./DatePicker";
import { CherryBranch, SakuraDefs, SakuraSky } from "./SakuraSky";
import { PrayerFlags } from "./Doodles";
import { HeroScene } from "./HeroScene";
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
        <HeroScene />
        <SakuraDefs />
        <PrayerFlags />
        <CherryBranch className="hero-branch" />
        <SakuraSky count={22} />
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
