import type { CSSProperties } from "react";

export type IconName =
  | "search" | "camera" | "db" | "shield" | "spark" | "pin" | "route" | "leaf" | "users" | "temple"
  | "rain" | "wifioff" | "calendar" | "arrow" | "check" | "backpack" | "store" | "chart" | "phone"
  | "id" | "shirt" | "rupee" | "chat" | "eye";

export function Icon({ name, className = "ico", style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

/** Inline sprite rendered once in the root layout; <Icon> references its symbols. */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></symbol>
        <symbol id="i-camera" viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></symbol>
        <symbol id="i-db" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></symbol>
        <symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z" /></symbol>
        <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></symbol>
        <symbol id="i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" /></symbol>
        <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M6 20c-1.5-9 4-15 14-16 .5 10-5 16-14 16z" /><path d="M6 20c3-5 6-8 10-11" /></symbol>
        <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-6 6.5-6s5.9 2.4 6.5 6" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.6 0 4.3 2 4.8 5" /></symbol>
        <symbol id="i-temple" viewBox="0 0 24 24"><path d="M3 21h18M5 21V10M19 21V10M9 21v-6h6v6M2 10l10-6 10 6z" /></symbol>
        <symbol id="i-rain" viewBox="0 0 24 24"><path d="M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 8a3.5 3.5 0 0 1-.5 7z" /><path d="m8 18-1 2M12 18l-1 2M16 18l-1 2" /></symbol>
        <symbol id="i-wifioff" viewBox="0 0 24 24"><path d="m3 3 18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.8M19 13a10 10 0 0 0-2.4-1.7M2 9.5A15 15 0 0 1 7 6.6M22 9.5A15 15 0 0 0 11 5.1" /><circle cx="12" cy="20" r=".8" /></symbol>
        <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /><path d="M10.5 14.5h2v3" /></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7" /></symbol>
        <symbol id="i-backpack" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0v11H6z" /><path d="M10 3.5h4M6 14h12M10 14v3" /></symbol>
        <symbol id="i-store" viewBox="0 0 24 24"><path d="M4 10v10h16V10M3 4h18l-1 5a3 3 0 0 1-5.5 1A3 3 0 0 1 12 11a3 3 0 0 1-2.5-1A3 3 0 0 1 4 9z" /><path d="M10 20v-5h4v5" /></symbol>
        <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" /></symbol>
        <symbol id="i-phone" viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></symbol>
        <symbol id="i-id" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="11" r="2.2" /><path d="M5.5 16c.6-1.6 1.9-2.4 3.5-2.4s2.9.8 3.5 2.4M15 10h3M15 13h3" /></symbol>
        <symbol id="i-shirt" viewBox="0 0 24 24"><path d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z" /></symbol>
        <symbol id="i-rupee" viewBox="0 0 24 24"><path d="M6 4h12M6 9h12M9 4c6 0 6 9 0 9H6l8 7" /></symbol>
        <symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 18V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8z" /><path d="M15 5.5 18.5 9M9 10h.01M12 10h.01" /></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></symbol>
      </defs>
    </svg>
  );
}
