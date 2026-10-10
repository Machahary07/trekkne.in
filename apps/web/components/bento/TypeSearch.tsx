"use client";

import { useEffect, useState } from "react";
import { Icon } from "../Icon";

const PLACES = ["Living Root Bridges", "Dawki river", "Nohkalikai Falls", "a trail, village or falls"];

/** The fake search pill in the bento: place names type themselves out and back. Static under reduced motion. */
export function TypeSearch() {
  const [text, setText] = useState("Enter a trail, village or falls");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let place = 0;
    let len = 0;
    let deleting = false;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      const word = PLACES[place];
      len += deleting ? -1 : 1;
      setText(`Enter ${word.slice(0, len)}`);
      let wait = deleting ? 35 : 75;
      if (!deleting && len === word.length) { deleting = true; wait = 1600; }
      else if (deleting && len === 0) { deleting = false; place = (place + 1) % PLACES.length; wait = 300; }
      id = setTimeout(step, wait);
    };
    id = setTimeout(step, 800);
    return () => clearTimeout(id);
  }, []);

  return (
    <a className="fake-input" href="#top" aria-label="Search for a trail, village or falls">
      <Icon name="search" />
      <span aria-hidden="true">{text}<i className="caret" /></span>
    </a>
  );
}
