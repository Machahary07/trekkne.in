import { ImageResponse } from "next/og";
import { INK, OG_SIZE, OgChip, OgEyes, OgLogo, ogFonts } from "@/lib/og";

export const alt = "Trekne: Know before you go. Sustainable trip planning for Northeast India.";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Site-wide share banner: the hero in miniature. */
export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
        background: "linear-gradient(180deg, #FF6A2B 0%, #FF8A3A 58%, #FFB247 100%)", padding: "52px 64px", fontFamily: "Figtree" }}>
        {/* hills */}
        <svg width="1200" height="260" viewBox="0 0 1200 260" style={{ position: "absolute", left: 0, bottom: 0 }}>
          <path d="M0 150 C 180 70 330 90 470 150 S 760 210 900 130 S 1120 90 1200 120 V260 H0z" fill="#7090E4" />
          <path d="M0 210 C 220 150 380 170 560 215 S 900 250 1200 190 V260 H0z" fill="#2DC56E" />
        </svg>
        {/* sun */}
        <div style={{ position: "absolute", right: 120, top: 60, width: 150, height: 150, borderRadius: 150, background: "#FFC21A", display: "flex" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <OgLogo dome={INK} />
          <span style={{ fontFamily: "Figtree", fontSize: 26, color: INK, opacity: 0.8 }}>trekne.in</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 40, fontFamily: "Bricolage", fontSize: 128, lineHeight: 0.9, letterSpacing: -6 }}>
          <span style={{ color: INK }}>Know before</span>
          <span style={{ color: "#fff" }}>you go.</span>
        </div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 30, color: INK, maxWidth: 700 }}>
          Ranger-verified conditions, crowd levels and community rules for Northeast India.
        </div>

        <div style={{ position: "absolute", right: 70, top: 250, display: "flex" }}><OgEyes size={118} /></div>

        <div style={{ position: "absolute", left: 64, bottom: 44, display: "flex", gap: 14 }}>
          <OgChip dot="#2DC56E" text="Trail open · verified" />
          <OgChip dot="#FFC21A" text="Fog likely at Sohra" />
          <OgChip dot="#FF6A2B" text="Busy? Try Krang Suri" />
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
