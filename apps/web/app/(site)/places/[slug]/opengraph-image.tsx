import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pressureLevel } from "@trekne/brand";
import { INK, OG_SIZE, OgLogo, ogFonts } from "@/lib/og";
import { PHOTOS } from "@/lib/photos";
import { STATE_NAMES, getOverview } from "@/lib/public-data";

export const alt = "A Northeast India place on Trekne, with today's crowd, season and eco-risk";
export const size = OG_SIZE;
export const contentType = "image/png";

const COLOR = { good: "#2DC56E", warn: "#FFC21A", high: "#FF6A2B", none: "#A3ABBD" } as const;

/** Per-place share card: the place photo with today's three signals, so a shared link answers "should I go?". */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [overview, fonts] = await Promise.all([getOverview(), ogFonts()]);
  const o = overview.find((x) => x.slug === slug);
  let photo: string | null = null;
  try {
    photo = `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public/destinations", `${slug}.jpg`))).toString("base64")}`;
  } catch {}

  const crowd = pressureLevel(o?.load_ratio == null ? null : Number(o.load_ratio));
  const season = o?.community_closed || o?.suitability === "poor" || o?.suitability === "closed" ? "high" : o?.suitability === "fair" ? "warn" : o?.suitability === "good" ? "good" : "none";
  const signals = o ? [
    { label: "Crowd", word: { good: "Quiet", warn: "Busy", high: "Packed", none: "Unknown" }[crowd], c: COLOR[crowd] },
    { label: "Season", word: o.community_closed ? "Closed" : { good: "Great", warn: "Okay", high: "Poor", none: "Unknown" }[season], c: COLOR[season] },
    { label: "Eco-risk", word: { good: "Low", warn: "Medium", high: "High", none: "Unknown" }[o.risk_level], c: COLOR[o.risk_level] },
  ] : [];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#7090E4", fontFamily: "Figtree" }}>
        {photo && <img src={photo} width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} alt="" />}
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(180deg, rgba(16,19,31,.15) 0%, rgba(16,19,31,.35) 45%, rgba(16,19,31,.88) 100%)" }} />
        {PHOTOS[slug] && (
          <span style={{ position: "absolute", top: 50, right: 56, color: "rgba(255,255,255,.8)", fontSize: 18, background: "rgba(16,19,31,.45)", borderRadius: 999, padding: "6px 14px" }}>
            Photo: {PHOTOS[slug].credit} · {PHOTOS[slug].license}
          </span>
        )}
        <div style={{ position: "absolute", top: 40, left: 52, display: "flex", background: "#fff", borderRadius: 999, padding: "10px 22px 10px 14px" }}>
          <OgLogo scale={0.7} />
        </div>
        <div style={{ position: "absolute", left: 56, right: 56, bottom: 48, display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ color: "rgba(255,255,255,.85)", fontSize: 28 }}>{o ? `${o.district} · ${STATE_NAMES[o.state_code] ?? o.state_code}` : "Northeast India"}</span>
          <span style={{ color: "#fff", fontFamily: "Bricolage", fontSize: 96, lineHeight: 0.95, letterSpacing: -4 }}>{o?.name ?? "Trekne"}</span>
          <div style={{ display: "flex", gap: 14 }}>
            {signals.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(16,19,31,.6)", borderRadius: 999, padding: "10px 22px 10px 12px" }}>
                <div style={{ width: 30, height: 30, borderRadius: 30, background: s.c, display: "flex" }} />
                <span style={{ color: "#fff", fontSize: 28 }}>{s.label}: {s.word}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", background: "#2DC56E", color: INK, borderRadius: 999, padding: "10px 24px", fontSize: 28 }}>Plan on trekne.in</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
