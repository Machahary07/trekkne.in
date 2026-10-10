import { useColorScheme } from "react-native";
import { brand, fonts, palette, radius, tracking } from "@trekne/brand";

/** Brand palette for the current colour scheme (follows the system, like the site). */
export function useBrand() {
  const scheme = useColorScheme();
  const mode = scheme === "dark" ? "dark" : "light";
  return { ...palette[mode], ...brand, mode } as const;
}
export type Brand = ReturnType<typeof useBrand>;

export const F = {
  display: fonts.display.native[800],
  displayBold: fonts.display.native[700],
  body: fonts.body.native[400],
  medium: fonts.body.native[500],
  semibold: fonts.body.native[600],
  bold: fonts.body.native[700],
  mono: fonts.mono.native[500],
} as const;

export { radius, tracking };
