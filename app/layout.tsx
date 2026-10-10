import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import { IconSprite } from "@/components/Icon";
import { EyeTracker } from "@/components/EyeTracker";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
  display: "swap",
});
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: "500", variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://trekne.in"),
  title: { default: "Trekne — Know Before You Go", template: "%s · Trekne" },
  description:
    "Ranger-verified, AI-powered travel intelligence for Northeast India. Trail, road, weather and cultural conditions — checked by the people who live there.",
  keywords: ["Northeast India travel", "Meghalaya", "living root bridges", "sustainable tourism", "local guides", "travel advisories"],
  openGraph: {
    title: "Trekne — Know Before You Go",
    description: "Ranger-verified travel intelligence for Northeast India.",
    url: "https://trekne.in",
    siteName: "Trekne",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF2F7" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0F17" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <IconSprite />
        {children}
        <EyeTracker />
      </body>
    </html>
  );
}
