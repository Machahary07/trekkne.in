"use client";

import { useEffect, useState, type CSSProperties } from "react";

// Cherry petals and blossoms drifting down forever. Positions are random, so they're
// generated after mount to keep server and client HTML identical.
type Flake = { flower: boolean; style: CSSProperties };

function makeFlakes(count: number): Flake[] {
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  return Array.from({ length: count }, () => {
    const flower = Math.random() < 0.22;
    const fall = r(10, 20);
    return {
      flower,
      style: {
        "--x": `${r(-4, 100)}%`,
        "--y": `${r(0, 90)}%`,
        "--size": `${flower ? r(16, 26) : r(9, 17)}px`,
        "--fall": `${fall}s`,
        "--delay": `${-r(0, fall)}s`,
        "--sway": `${r(2.4, 4.8)}s`,
        "--spin": `${r(2.5, 6.5)}s`,
        "--drift": `${r(-90, 40)}px`,
      } as CSSProperties,
    };
  });
}

export function SakuraSky({ count = 24 }: { count?: number }) {
  const [flakes, setFlakes] = useState<Flake[]>([]);
  useEffect(() => setFlakes(makeFlakes(count)), [count]);

  return (
    <div className="sakura-sky" aria-hidden="true">
      {flakes.map((f, i) => (
        <span key={i} className="sakura" style={f.style}>
          <i>
            {f.flower ? (
              <svg viewBox="-22 -22 44 44"><use href="#sk-blossom" /></svg>
            ) : (
              <svg viewBox="-9 -18 18 19"><use href="#sk-petal" /></svg>
            )}
          </i>
        </span>
      ))}
    </div>
  );
}

/** Shared SVG symbols for the petals, blossoms and cherry branch. Render once per page. */
export function SakuraDefs() {
  const petal = "M0 0C-4-3-9-9-8.5-14C-8-17-5-18.5-2.4-17L0-15 2.4-17C5-18.5 8-17 8.5-14C9-9 4-3 0 0Z";
  const tips: [number, number][] = [[8, 0], [6.9, 4], [4, 6.9], [0, 8], [-4, 6.9], [-6.9, 4], [-8, 0], [-6.9, -4], [-4, -6.9], [0, -8], [4, -6.9], [6.9, -4]];
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="sk-grad" cx=".5" cy="1" r="1.1">
          <stop offset="0" stopColor="#E35A92" />
          <stop offset=".35" stopColor="#F49BBE" />
          <stop offset=".75" stopColor="#FBD3E2" />
          <stop offset="1" stopColor="#FFF3F7" />
        </radialGradient>
        <g id="sk-petal">
          <path d={petal} fill="url(#sk-grad)" stroke="#D9668F" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M0-1.5V-13M0-3-3.2-11M0-3 3.2-11" fill="none" stroke="#E35A92" strokeOpacity=".35" strokeWidth=".6" />
        </g>
        <g id="sk-blossom">
          {[0, 72, 144, 216, 288].map((a) => (
            <use key={a} href="#sk-petal" transform={`rotate(${a}) scale(1.15)`} />
          ))}
          <path d={tips.map(([x, y]) => `M0 0L${x} ${y}`).join("")} stroke="#D24F80" strokeWidth=".7" strokeLinecap="round" />
          <g fill="#F6D55C">
            {tips.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r="1.1" />)}
          </g>
          <circle r="2.8" fill="#C93A6E" />
          <circle r="1.2" fill="#B9D86A" />
        </g>
        <g id="sk-bud">
          <path d="M0 0C-5-3-6-11 0-17C6-11 5-3 0 0Z" fill="#EE7FA8" stroke="#C94C7C" strokeWidth=".9" />
          <path d="M0 1C-4 0-5-4-4-7L0-4 4-7C5-4 4 0 0 1Z" fill="#7A3B2E" />
        </g>
      </defs>
    </svg>
  );
}

/** A Himalayan cherry branch (Shillong blooms every November). */
export function CherryBranch({ className }: { className?: string }) {
  const blooms: [number, number, number, number][] = [
    [34, 44, 1.05, 10], [78, 90, 0.95, 30], [116, 30, 1.1, -12], [143, 10, 0.8, 30],
    [154, 62, 1.2, 8], [184, 92, 1, -20], [207, 113, 0.8, 0], [224, 54, 1, 40],
  ];
  return (
    <svg className={className} viewBox="0 0 260 170" aria-hidden="true">
      <g fill="#5A3A32" stroke="#2E1A16" strokeWidth=".8">
        <path d="M0 34C50 44 96 36 138 52C172 64 204 62 258 40L258 45C206 70 172 74 136 62C96 49 52 57 0 49Z" />
        <path d="M98 44C108 30 120 20 142 9L144 12C124 24 112 34 104 47Z" />
        <path d="M164 64C174 84 186 100 207 110L205 114C184 104 170 90 160 68Z" />
        <path d="M56 49C56 64 62 78 76 90L73 92C58 82 51 66 52 50Z" />
      </g>
      <path d="M4 37C50 46 96 38 138 54C170 65 204 63 254 43" fill="none" stroke="#A97A66" strokeWidth="1.3" />
      <use href="#sk-bud" transform="translate(96 42) rotate(-30)" />
      <use href="#sk-bud" transform="translate(130 18) rotate(20) scale(.9)" />
      <use href="#sk-bud" transform="translate(244 44) rotate(50) scale(.85)" />
      <use href="#sk-bud" transform="translate(196 72) rotate(150) scale(.8)" />
      {blooms.map(([x, y, s, rot]) => (
        <use key={`${x},${y}`} href="#sk-blossom" transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`} />
      ))}
    </svg>
  );
}
