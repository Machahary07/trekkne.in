/**
 * Trekne line icons as plain geometry, rendered by the web <IconSprite> and the mobile <Icon>.
 * 24×24 viewBox, stroke 2, round caps and joins, no fill.
 */

export type IconShape =
  | { t: "path"; d: string }
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { t: "rect"; x: number; y: number; width: number; height: number; rx?: number };

const p = (d: string): IconShape => ({ t: "path", d });
const c = (cx: number, cy: number, r: number): IconShape => ({ t: "circle", cx, cy, r });

export const icons = {
  search: [c(11, 11, 7), p("m20 20-3.5-3.5")],
  camera: [p("M4 8h3l2-3h6l2 3h3v11H4z"), c(12, 13, 3.5)],
  db: [{ t: "ellipse", cx: 12, cy: 6, rx: 7, ry: 3 }, p("M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"), p("M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3")],
  shield: [p("M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"), p("m8.5 12 2.5 2.5 4.5-5")],
  spark: [p("M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z")],
  pin: [p("M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"), c(12, 9.5, 2.5)],
  route: [c(6, 19, 2), c(18, 5, 2), p("M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16")],
  leaf: [p("M6 20c-1.5-9 4-15 14-16 .5 10-5 16-14 16z"), p("M6 20c3-5 6-8 10-11")],
  users: [c(9, 8, 3.5), p("M2.5 20c.6-3.6 3.2-6 6.5-6s5.9 2.4 6.5 6"), c(17, 9, 2.5), p("M17 14c2.6 0 4.3 2 4.8 5")],
  temple: [p("M3 21h18M5 21V10M19 21V10M9 21v-6h6v6M2 10l10-6 10 6z")],
  rain: [p("M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 8a3.5 3.5 0 0 1-.5 7z"), p("m8 18-1 2M12 18l-1 2M16 18l-1 2")],
  wifioff: [p("m3 3 18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.8M19 13a10 10 0 0 0-2.4-1.7M2 9.5A15 15 0 0 1 7 6.6M22 9.5A15 15 0 0 0 11 5.1"), c(12, 20, 0.8)],
  calendar: [{ t: "rect", x: 4, y: 5, width: 16, height: 15, rx: 3 }, p("M4 10h16M9 3v4M15 3v4"), p("M10.5 14.5h2v3")],
  arrow: [p("M5 12h14M13 6l6 6-6 6")],
  check: [p("m5 12 4.5 4.5L19 7")],
  backpack: [p("M6 9a6 6 0 0 1 12 0v11H6z"), p("M10 3.5h4M6 14h12M10 14v3")],
  store: [p("M4 10v10h16V10M3 4h18l-1 5a3 3 0 0 1-5.5 1A3 3 0 0 1 12 11a3 3 0 0 1-2.5-1A3 3 0 0 1 4 9z"), p("M10 20v-5h4v5")],
  chart: [p("M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6")],
  phone: [{ t: "rect", x: 7, y: 2.5, width: 10, height: 19, rx: 2.5 }, p("M11 18.5h2")],
  id: [{ t: "rect", x: 3, y: 5, width: 18, height: 14, rx: 3 }, c(9, 11, 2.2), p("M5.5 16c.6-1.6 1.9-2.4 3.5-2.4s2.9.8 3.5 2.4M15 10h3M15 13h3")],
  shirt: [p("M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z")],
  rupee: [p("M6 4h12M6 9h12M9 4c6 0 6 9 0 9H6l8 7")],
  chat: [p("M4 18V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8z"), p("M15 5.5 18.5 9M9 10h.01M12 10h.01")],
  eye: [p("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"), c(12, 12, 3)],
  // Added for the app and CRM, drawn in the same style.
  globe: [c(12, 12, 9), p("M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z")],
  map: [p("M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"), p("M9 4v13.5M15 6.5V20")],
  home: [p("M4 11 12 4l8 7v9h-5v-6H9v6H4z")],
  user: [c(12, 8, 4), p("M4 21c.8-4.2 4-7 8-7s7.2 2.8 8 7")],
  plus: [p("M12 5v14M5 12h14")],
  close: [p("M6 6l12 12M18 6 6 18")],
  logout: [p("M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10")],
  alert: [p("M12 4 2.5 20h19z"), p("M12 10v4M12 17h.01")],
  key: [c(8, 15, 4), p("m11 12 9-9M17 6l3 3M14 9l2 2")],
  sphere: [c(12, 12, 9), { t: "ellipse", cx: 12, cy: 12, rx: 9, ry: 3.5 }, p("M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9")],
  chevron: [p("m6 9 6 6 6-6")],
  chevronRight: [p("m9 6 6 6-6 6")],
  filter: [p("M4 5h16l-6 7.5V19l-4 1.5v-8z")],
  menu: [p("M4 7h16M4 12h16M4 17h16")],
  clock: [c(12, 12, 9), p("M12 7v5l3 2")],
  flag: [p("M5 21V4M5 4h11l-2 4 2 4H5")],
  eyeoff: [p("m3 3 18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.3 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.8-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2")],
  info: [c(12, 12, 9), p("M12 11v5M12 8h.01")],
  boat: [p("M3 15h18l-3 5H6z"), p("M12 4v11M12 5l6 8h-6")],
  car: [p("M5 16V11l2-5h10l2 5v5z"), p("M5 11h14M5 16v2M19 16v2"), c(8, 13.5, 0.6), c(16, 13.5, 0.6)],
  trash: [p("M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13")],
} as const satisfies Record<string, readonly IconShape[]>;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];
