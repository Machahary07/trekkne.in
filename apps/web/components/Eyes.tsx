import type { CSSProperties } from "react";

/** The Trekne mascot's eyes. Pupils follow the pointer via <EyeTracker>. */
export function Eyes({ style, className = "eyes" }: { style?: CSSProperties; className?: string }) {
  return (
    <div className={className} style={style} aria-hidden="true">
      <span className="eye"><span className="pupil" /></span>
      <span className="eye"><span className="pupil" /></span>
    </div>
  );
}

export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 40 30" aria-hidden="true">
      <path d="M2 30a18 18 0 0 1 36 0z" fill="#FF6A2B" />
      <circle cx="13.5" cy="20" r="5.5" fill="#fff" />
      <circle cx="26.5" cy="20" r="5.5" fill="#fff" />
      <circle cx="14.5" cy="20.5" r="2.8" fill="#10131F" />
      <circle cx="27.5" cy="20.5" r="2.8" fill="#10131F" />
    </svg>
  );
}

export function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Trekne home">
      <LogoMark />
      trekne
    </a>
  );
}
