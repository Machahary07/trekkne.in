"use client";

import { useEffect, useState } from "react";
import { burstPath } from "@/lib/shapes";
import { useAutoplay } from "./useAutoplay";

type Who = 0 | 1 | 2;

/* A short loop of the three groups talking: a question, the Ranger's check, the community's rule. */
const SCRIPT: Array<[Who, string]> = [
  [0, "Is the root bridge trail open today?"],
  [1, "Walked it at 7 am. Steps are dry."],
  [2, "Friday is our prayer day, so it’s closed then."],
  [0, "Do I need cash down there?"],
  [1, "Yes, there’s no ATM below Tyrna."],
  [2, "Please ask before taking photos."],
];

const CAPTIONS = ["Travellers", "Rangers", "Communities"];

/** The Travellers / Rangers / Communities trio. They chat on a loop; tap one to make it jump and speak. */
export function TrioCast() {
  const [step, setStep] = useState(0);
  const [jump, setJump] = useState(0);
  const { paused, pause, ref } = useAutoplay<HTMLDivElement>(3200, () => setStep((s) => (s + 1) % SCRIPT.length));
  const [who, line] = SCRIPT[step];

  // Restart the jump animation each time the speaker changes.
  useEffect(() => setJump((j) => j + 1), [step]);

  const tap = (w: Who) => {
    pause();
    const from = SCRIPT.findIndex(([x], i) => x === w && i > step);
    setStep(from >= 0 ? from : SCRIPT.findIndex(([x]) => x === w));
    setJump((j) => j + 1);
  };

  return (
    <div className="trio" ref={ref} data-paused={paused || undefined}>
      {CAPTIONS.map((caption, i) => (
        <figure key={caption} data-talking={who === i || undefined}>
          {who === i && <p key={step} className="say-bubble" aria-live="polite">{line}</p>}
          <button type="button" className="cast" onClick={() => tap(i as Who)} aria-label={`${caption}: tap to hear from them`}>
            <span key={who === i ? jump : undefined} className="cast-body">{FACES[i]}</span>
          </button>
          <figcaption>{caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const FACES = [
  <svg key="t" viewBox="0 0 120 92" aria-hidden="true">
    <g fill="#FF6A2B">
      <circle cx="34" cy="50" r="32" /><circle cx="86" cy="50" r="32" /><circle cx="60" cy="40" r="32" />
      <rect x="34" y="50" width="52" height="32" />
    </g>
    <path d="M42 46q6 6 12 0M66 46q6 6 12 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="60" cy="58" rx="5" ry="4" fill="#10131F" />
  </svg>,
  <svg key="r" viewBox="0 0 120 120" aria-hidden="true">
    <g fill="#7090E4">
      <circle cx="38" cy="38" r="28" /><circle cx="82" cy="38" r="28" /><circle cx="38" cy="82" r="28" /><circle cx="82" cy="82" r="28" />
      <rect x="34" y="34" width="52" height="52" />
    </g>
    <circle cx="48" cy="56" r="5" fill="#10131F" /><circle cx="72" cy="56" r="5" fill="#10131F" />
    <path d="M50 70q10 9 20 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>,
  <svg key="c" viewBox="0 0 120 120" aria-hidden="true">
    <path d={burstPath(58, 50, 22)} fill="#FFC21A" />
    <path d="M40 52l9 6-9 6M80 52l-9 6 9 6" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 74q10 9 20 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>,
];
