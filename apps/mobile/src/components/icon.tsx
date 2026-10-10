import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { icons, type IconName } from "@trekne/brand";

/** The site's line icons, drawn from the same geometry (24×24, stroke 2, round caps). */
export function Icon({ name, size = 22, color = "#10131F", strokeWidth = 2 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name].map((s, i) => {
        switch (s.t) {
          case "path": return <Path key={i} d={s.d} {...common} />;
          case "circle": return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...common} />;
          case "ellipse": return <Ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />;
          case "rect": return <Rect key={i} x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common} />;
        }
      })}
    </Svg>
  );
}
export type { IconName };
