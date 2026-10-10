/**
 * Trekne brand tokens — the single source for web (CSS variables) and mobile (StyleSheet).
 * Sohra orange · monsoon yellow · root blue · moss green · ink.
 * Values mirror apps/web/app/globals.css; change them here and in the CSS together.
 */

export const brand = {
  orange: "#FF6A2B",
  orangeDeep: "#E9541A",
  yellow: "#FFC21A",
  blue: "#7090E4",
  green: "#2DC56E",
  greenDeep: "#1B8A4C",
  ink: "#10131F",
  white: "#FFFFFF",
  heroSky: "#FF7A34",
  placeholder: "#7A8195",
} as const;

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  line: string;
  chip: string;
  deep: string;
  deepText: string;
  deepMuted: string;
  /** color-mix() tints precomputed per theme (React Native has no color-mix). */
  tint: { verified: string; official: string; pending: string; note: string; high: string };
}

export const palette: Record<"light" | "dark", Palette> = {
  light: {
    bg: "#EEF2F7",
    surface: "#FFFFFF",
    surface2: "#F5F7FB",
    text: "#10131F",
    muted: "#586078",
    line: "#DCE2EC",
    chip: "#E4E9F2",
    deep: "#10131F",
    deepText: "#F3F5FA",
    deepMuted: "#A9B0C2",
    tint: { verified: "#D1F2DF", official: "#DDE4F9", pending: "#FFEEBF", note: "#E8EDFB", high: "#FFE1D5" },
  },
  dark: {
    bg: "#0C0F17",
    surface: "#161A25",
    surface2: "#1C2130",
    text: "#EEF1F7",
    muted: "#A3ABBD",
    line: "#2A3042",
    chip: "#252B3C",
    deep: "#1A1F2E",
    deepText: "#F3F5FA",
    deepMuted: "#A9B0C2",
    tint: { verified: "#1B4035", official: "#2C3653", pending: "#574922", note: "#242D44", high: "#452A26" },
  },
};

export const radius = { xl: 36, lg: 28, md: 18, sm: 14, xs: 10, pill: 999 } as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40 } as const;

/**
 * Font families. Web loads them through next/font; mobile through @expo-google-fonts,
 * where each weight is its own family name.
 */
export const fonts = {
  display: { web: "Bricolage Grotesque", native: { 700: "BricolageGrotesque_700Bold", 800: "BricolageGrotesque_800ExtraBold" } },
  body: {
    web: "Figtree",
    native: { 400: "Figtree_400Regular", 500: "Figtree_500Medium", 600: "Figtree_600SemiBold", 700: "Figtree_700Bold" },
  },
  mono: { web: "JetBrains Mono", native: { 500: "JetBrainsMono_500Medium" } },
} as const;

/** CSS letter-spacing in em → React Native letterSpacing in points. */
export const tracking = (em: number, fontSize: number) => em * fontSize;

/** Motion: the web's overshoot curve cubic-bezier(.3,1.6,.5,1) as a spring. */
export const spring = { damping: 14, stiffness: 260, mass: 0.7 } as const;
