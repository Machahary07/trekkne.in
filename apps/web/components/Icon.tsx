import type { CSSProperties } from "react";
import { icons, iconNames, type IconName, type IconShape } from "@trekne/brand";

export type { IconName };

export function Icon({ name, className = "ico", style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

function Shape({ s }: { s: IconShape }) {
  switch (s.t) {
    case "path":
      return <path d={s.d} />;
    case "circle":
      return <circle cx={s.cx} cy={s.cy} r={s.r} />;
    case "ellipse":
      return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
    case "rect":
      return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} />;
  }
}

/** Inline sprite rendered once in the root layout; <Icon> references its symbols. Geometry lives in @trekne/brand. */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        {iconNames.map((name) => (
          <symbol key={name} id={`i-${name}`} viewBox="0 0 24 24">
            {icons[name].map((s, i) => <Shape key={i} s={s} />)}
          </symbol>
        ))}
      </defs>
    </svg>
  );
}
