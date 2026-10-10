export interface Pt {
  x: number;
  y: number;
}

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Smooth SVG path through points (Catmull–Rom converted to cubic Béziers).
 * `from`/`to` draw only that stretch of the same curve, so highlighted
 * segments sit exactly on top of the full line.
 */
export function smoothPath(pts: Pt[], from = 0, to = pts.length - 1): string {
  if (pts.length < 2 || from >= to) return "";
  let d = `M${r(pts[from].x)} ${r(pts[from].y)}`;
  for (let i = from; i < to; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(p2.x)} ${r(p2.y)}`;
  }
  return d;
}
