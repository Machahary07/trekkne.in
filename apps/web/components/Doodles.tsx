// Northeast add-on graphics: decorative only, no data.

export type Textile = "aronai" | "naga" | "gamosa" | "puan" | "moirang" | "dakmanda" | "risa";

/** Woven border bands from different Northeast communities. */
const TEXTILES: Record<Textile, React.ReactNode> = {
  // Nagaland: red and black shawl stripes with a white diamond chain
  naga: (
    <>
      <rect width="32" height="32" fill="#10131F" />
      <rect y="2" width="32" height="6" fill="#D2343C" /><rect y="24" width="32" height="6" fill="#D2343C" />
      <rect y="9.5" width="32" height="1" fill="#FFC21A" /><rect y="21.5" width="32" height="1" fill="#2DC56E" />
      <path d="M16 11L21 16 16 21 11 16Z" fill="#fff" /><circle cx="16" cy="16" r="1.6" fill="#D2343C" />
    </>
  ),
  // Assam: white gamosa with a red woven border and flower motif
  gamosa: (
    <>
      <rect width="32" height="32" fill="#FBFAF6" />
      <rect y="2" width="32" height="2" fill="#D2343C" /><rect y="28" width="32" height="2" fill="#D2343C" />
      <rect y="8" width="32" height="16" fill="#D2343C" />
      <path d="M16 10L22 16 16 22 10 16Z" fill="#fff" /><circle cx="16" cy="16" r="1.8" fill="#D2343C" />
      <circle cx="2" cy="16" r="1.4" fill="#fff" /><circle cx="30" cy="16" r="1.4" fill="#fff" />
    </>
  ),
  // Mizoram: puan with zigzag stripes on black and green
  puan: (
    <>
      <rect width="32" height="32" fill="#10131F" />
      <rect width="32" height="4" fill="#2DC56E" /><rect y="28" width="32" height="4" fill="#2DC56E" />
      <path d="M0 20L8 10 16 20 24 10 32 20" fill="none" stroke="#FFC21A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 26L8 16 16 26 24 16 32 26" fill="none" stroke="#D2343C" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  // Manipur: moirang phee temple-tooth border, red and black on white
  moirang: (
    <>
      <rect width="32" height="32" fill="#FBFAF6" />
      <rect y="2" width="32" height="3" fill="#10131F" /><rect y="27" width="32" height="3" fill="#10131F" />
      <path d="M0 24L8 10 16 24ZM16 24L24 10 32 24Z" fill="#C2222F" />
      <path d="M4 24L8 17 12 24ZM20 24L24 17 28 24Z" fill="#10131F" />
      <rect x="7" y="7" width="2" height="3" fill="#C2222F" /><rect x="23" y="7" width="2" height="3" fill="#C2222F" />
    </>
  ),
  // Garo, Meghalaya: dakmanda red with white geometric blocks
  dakmanda: (
    <>
      <rect width="32" height="32" fill="#B3202B" />
      <rect y="3" width="32" height="2" fill="#fff" /><rect y="27" width="32" height="2" fill="#fff" />
      <path d="M4 10H12V14H8V18H12V22H4Z" fill="#fff" /><path d="M20 10H28V22H20V18H24V14H20Z" fill="#fff" />
      <rect x="14" y="14" width="4" height="4" fill="#FFC21A" />
    </>
  ),
  // Bodo: aronai pharo megon diamonds and hajw hill triangles
  aronai: (
    <>
      <rect width="32" height="32" fill="#C2222F" />
      <rect y="2" width="32" height="2.5" fill="#F2B705" /><rect y="5.5" width="32" height="1.2" fill="#1F8A4C" />
      <rect y="27.5" width="32" height="2.5" fill="#F2B705" /><rect y="25.3" width="32" height="1.2" fill="#1F8A4C" />
      <path d="M16 9.5L22 16 16 22.5 10 16Z" fill="#F2B705" /><path d="M16 12.5L19 16 16 19.5 13 16Z" fill="#1F8A4C" />
      <circle cx="16" cy="16" r="1.2" fill="#fff" />
      <path d="M0 22L4 14 8 22ZM24 22L28 14 32 22Z" fill="#F2B705" />
    </>
  ),
  // Tripura: risa, maroon with stepped white and yellow bands
  risa: (
    <>
      <rect width="32" height="32" fill="#7E1A2C" />
      <rect y="3" width="32" height="2" fill="#FFC21A" /><rect y="27" width="32" height="2" fill="#FFC21A" />
      <rect y="7" width="32" height="1.4" fill="#2DC56E" /><rect y="23.6" width="32" height="1.4" fill="#2DC56E" />
      <path d="M0 16L4 12H8L12 16 8 20H4ZM16 16L20 12H24L28 16 24 20H20Z" fill="#fff" />
      <path d="M4 16H8M20 16H24" stroke="#7E1A2C" strokeWidth="2" />
      <circle cx="14" cy="16" r="1.3" fill="#FFC21A" /><circle cx="30" cy="16" r="1.3" fill="#FFC21A" />
    </>
  ),
};

export function TextileBand({ kind = "aronai", className = "agor-band" }: { kind?: Textile; className?: string }) {
  return (
    <svg className={className} preserveAspectRatio="none" viewBox="0 0 960 32" aria-hidden="true">
      <defs>
        <pattern id={`tx-${kind}`} width="32" height="32" patternUnits="userSpaceOnUse">{TEXTILES[kind]}</pattern>
      </defs>
      <rect width="960" height="32" fill={`url(#tx-${kind})`} />
    </svg>
  );
}

const VIEWBOX: Record<string, string> = { cherry: "0 0 240 160", petals: "0 0 200 140", cloud: "0 0 200 100", flags: "0 0 320 110", rhino: "0 0 220 160", sangai: "0 0 220 160" };

export type DoodleName =
  | "aronai" | "bamboo" | "cherry" | "cloud" | "dhol" | "flags" | "gamosa" | "gate" | "gompa" | "headgear"
  | "hornbill" | "japi" | "mithun" | "orchid" | "palace" | "pepa" | "petals" | "rhino" | "sangai" | "shawl" | "tea" | "xorai";

/** One doodle from the sprite in /public/doodles.svg. */
export function Doodle({ name, className, style }: { name: DoodleName; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox={VIEWBOX[name] ?? "0 0 200 200"} aria-hidden="true">
      <use href={`/doodles.svg#d-${name}`} />
    </svg>
  );
}

/** A row of doodles between home sections, each gently bobbing at its own pace. */
export function DoodleStrip({ items, band }: { items: DoodleName[]; band?: Textile }) {
  return (
    <div className="wrap doodle-strip" aria-hidden="true">
      {band && <TextileBand kind={band} />}
      <div className="doodle-row">
        {items.map((n, i) => (
          <Doodle key={n + i} name={n} className={`doodle d-${n}`} style={{ animationDelay: `${-i * 0.9}s` }} />
        ))}
      </div>
    </div>
  );
}

const FLAG_COLOURS = ["#3E73D8", "#FBFAF6", "#D2343C", "#2DC56E", "#FFC21A"];

/** A string of prayer flags in the five traditional colours. */
export function PrayerFlags({ className = "prayer-flags", count = 9 }: { className?: string; count?: number }) {
  const w = 40 * count;
  return (
    <svg className={className} viewBox={`0 0 ${w} 70`} aria-hidden="true">
      <path d={`M2 8Q${w / 2} 44 ${w - 2} 8`} fill="none" stroke="#5A4A3A" strokeWidth="1.6" />
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        const x = 2 + (w - 4) * t;
        const y = 8 + 72 * t * (1 - t);
        const angle = (0.5 - t) * 30;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
            <path d="M-13 0H13V30L10 32.5 6.5 30 3 32.5 0 30-3 32.5-6.5 30-10 32.5-13 30Z" fill={FLAG_COLOURS[i % 5]} stroke="rgba(16,19,31,.35)" strokeWidth="1" />
            <path d="M-8 14H8M-8 18H6M-8 22H8" stroke="rgba(16,19,31,.4)" strokeWidth="1" />
            <circle cy="7.5" r="3" fill="none" stroke="rgba(16,19,31,.4)" strokeWidth="1" />
          </g>
        );
      })}
    </svg>
  );
}
