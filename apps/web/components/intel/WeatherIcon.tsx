import type { WeatherIcon as Kind } from "@/lib/destinations";

const CLOUD = "M7.2 18.5a4.2 4.2 0 0 1-.5-8.37 5.6 5.6 0 0 1 10.6-1.1 4.3 4.3 0 0 1 .2 9.47z";

/** Small full-colour weather glyphs in the Apple Weather spirit. */
export function WeatherIcon({ kind, size = 28 }: { kind: Kind; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="wx-icon">
      {(kind === "sun" || kind === "partly") && (
        <g transform={kind === "partly" ? "translate(-3 -3) scale(.82)" : undefined}>
          <circle cx="12" cy="12" r="4.6" fill="#FFC21A" />
          <g stroke="#FFC21A" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M5.4 18.6l1.5-1.5M17.1 6.9l1.5-1.5" />
          </g>
        </g>
      )}
      {kind === "partly" && <path d={CLOUD} transform="translate(2.5 2) scale(.82)" fill="#F4F6FB" />}
      {(kind === "cloud" || kind === "showers" || kind === "rain") && (
        <path d={CLOUD} transform={kind === "cloud" ? undefined : "translate(0 -2.4)"} fill={kind === "rain" ? "#C9D3E6" : "#F4F6FB"} />
      )}
      {(kind === "showers" || kind === "rain") && (
        <g stroke="#7FB6FF" strokeWidth="1.9" strokeLinecap="round">
          <path d="M9 18.6l-.9 2.4M13 18.6l-.9 2.4" />
          {kind === "rain" && <path d="M17 18.6l-.9 2.4" />}
        </g>
      )}
      {kind === "fog" && (
        <g stroke="#F4F6FB" strokeWidth="2" strokeLinecap="round">
          <path d="M4 9h12M7 13h13M4 17h12" />
        </g>
      )}
    </svg>
  );
}
