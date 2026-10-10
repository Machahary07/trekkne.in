"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { useSiteState } from "./SiteState";
import { matchDestination, type Destination } from "@/lib/destinations";

const CATEGORIES = [
  { id: "all", label: "All", placeholder: "Where to next? Try Nongriat, Sohra or Dawki" },
  { id: "treks", label: "Treks", placeholder: "Try “root bridge trek”" },
  { id: "falls", label: "Waterfalls", placeholder: "Try “Nohkalikai”" },
  { id: "rivers", label: "Rivers", placeholder: "Try “Umngot river”" },
  { id: "guides", label: "Local guides", placeholder: "Where do you need a guide? Try Sohra" },
] as const;

export function Hero({ destinations }: { destinations: Destination[] }) {
  const { openDestination } = useSiteState();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const placeholder = CATEGORIES.find((c) => c.id === cat)!.placeholder;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = input.current?.value.trim() ?? "";
    if (!raw) {
      setNote("Type a place, such as Nongriat, Sohra or Dawki.");
      input.current?.focus();
      return;
    }
    const hit = matchDestination(raw, destinations);
    if (hit) {
      setNote("");
      openDestination(hit);
    } else {
      setNote(`We don’t cover “${raw}” yet. Right now we’re piloting three places in Meghalaya, and we’d rather show nothing than guess.`);
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
          Real-time, <strong>Ranger-verified</strong> conditions for Northeast India: trails, roads, weather and local
          customs, checked by the people who live there.
        </p>

        <form className="finder" role="search" autoComplete="off" onSubmit={onSubmit}>
          <div className="cats" role="radiogroup" aria-label="What are you looking for">
            {CATEGORIES.map((c) => (
              <label key={c.id}>
                <input
                  type="radio"
                  name="cat"
                  id={`cat-${c.id}`}
                  value={c.id}
                  checked={cat === c.id}
                  onChange={() => {
                    setCat(c.id);
                    input.current?.focus();
                  }}
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
          <div className="search">
            <Icon name="search" />
            <label htmlFor="q" className="sr-only">Where to next?</label>
            <input ref={input} id="q" name="q" type="search" placeholder={placeholder} />
            <button className="btn btn-green" type="submit">
              <span>Check conditions</span>
              <Icon name="arrow" />
            </button>
          </div>
          <p className="finder-note" aria-live="polite">{note}</p>
        </form>

        <div className="hero-chips" aria-label="Example live advisories">
          <span className="live-chip">
            <span className="dot" style={{ background: "#2DC56E" }}><Icon name="check" /></span>
            Nongriat trail open <small>verified · 2h ago</small>
          </span>
          <span className="live-chip">
            <span className="dot" style={{ background: "#7090E4" }}><Icon name="rain" /></span>
            Rain after 2 pm <small>IMD · 06:00</small>
          </span>
          <span className="live-chip">
            <span className="dot" style={{ background: "#FFC21A" }}><Icon name="shield" /></span>
            3 Rangers near Sohra <small>today</small>
          </span>
        </div>
      </div>
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
