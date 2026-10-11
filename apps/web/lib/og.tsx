import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Brand fonts for next/og images (OFL, bundled in assets/og). */
export async function ogFonts() {
  const [display, body] = await Promise.all([
    readFile(join(process.cwd(), "assets/og/BricolageGrotesque_800ExtraBold.ttf")),
    readFile(join(process.cwd(), "assets/og/Figtree_600SemiBold.ttf")),
  ]);
  return [
    { name: "Bricolage", data: display, style: "normal" as const, weight: 800 as const },
    { name: "Figtree", data: body, style: "normal" as const, weight: 600 as const },
  ];
}

export const OG_SIZE = { width: 1200, height: 630 };
export const INK = "#10131F";

/** Logo: orange dome with two eyes + wordmark. */
export function OgLogo({ color = INK, dome = "#FF6A2B", scale = 1 }: { color?: string; dome?: string; scale?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
      <svg width={56 * scale} height={42 * scale} viewBox="0 0 40 30">
        <path d="M2 30a18 18 0 0 1 36 0z" fill={dome} />
        <circle cx="13.5" cy="20" r="5.5" fill="#fff" />
        <circle cx="26.5" cy="20" r="5.5" fill="#fff" />
        <circle cx="14.5" cy="20.5" r="2.8" fill={INK} />
        <circle cx="27.5" cy="20.5" r="2.8" fill={INK} />
      </svg>
      <span style={{ fontFamily: "Bricolage", fontSize: 46 * scale, color, letterSpacing: -2 * scale }}>trekne</span>
    </div>
  );
}

/** The mascot's eyes. */
export function OgEyes({ size = 120, look = { x: 0.25, y: 0.1 } }: { size?: number; look?: { x: number; y: number } }) {
  const eye = (
    <div style={{ width: size, height: size, borderRadius: size, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: size * 0.56, height: size * 0.56, borderRadius: size, background: INK, display: "flex", transform: `translate(${look.x * size * 0.2}px, ${look.y * size * 0.2}px)` }}>
        <div style={{ width: size * 0.14, height: size * 0.14, borderRadius: size, background: "#fff", margin: `${size * 0.1}px 0 0 ${size * 0.3}px`, display: "flex" }} />
      </div>
    </div>
  );
  return <div style={{ display: "flex", gap: size * 0.14 }}>{eye}{eye}</div>;
}

export function OgChip({ dot, text, bg = "#fff", color = INK }: { dot: string; text: string; bg?: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: bg, color, borderRadius: 999, padding: "14px 24px", fontFamily: "Figtree", fontSize: 26, boxShadow: "0 14px 30px -14px rgba(60,20,0,.45)" }}>
      <div style={{ width: 16, height: 16, borderRadius: 16, background: dot, display: "flex" }} />
      {text}
    </div>
  );
}
