"use client";

import { useState } from "react";
import { Icon } from "../Icon";
import { useAutoplay } from "./useAutoplay";

/* Tips drawn from the pilot destinations' advisories. */
const NOTES = [
  { place: "Nongriat", text: "Start down from Tyrna before 8 am." },
  { place: "Nongriat", text: "No bins below the village. Pack out what you bring." },
  { place: "Dawki", text: "Go on a weekday morning for calmer water." },
  { place: "Dawki", text: "Life jackets are mandatory on every boat." },
];

/** Field notes tile body: a local tip that rotates on its own and on tap. */
export function FieldNotes() {
  const [i, setI] = useState(0);
  const { ref, pause } = useAutoplay<HTMLButtonElement>(4500, () => setI((n) => (n + 1) % NOTES.length));
  const n = NOTES[i];

  return (
    <button ref={ref} type="button" className="note-card" aria-label={`Field note from ${n.place}: ${n.text} Tap for another`}
      onClick={() => { pause(); setI((x) => (x + 1) % NOTES.length); }}>
      <span key={i} className="note-text" aria-hidden="true">
        <small><Icon name="pin" />{n.place}</small>
        “{n.text}”
      </span>
      <span className="note-next" aria-hidden="true">{i + 1}/{NOTES.length}<Icon name="arrow" /></span>
    </button>
  );
}
