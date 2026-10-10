/** Star/sunburst path centred in a 120×120 box. */
export function burstPath(outer: number, inner: number, points: number, c = 60): string {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    d += `${i ? "L" : "M"}${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}`;
  }
  return d + "Z";
}

/**
 * Decorative QR-style module grid for the Ranger ID mockup (not a scannable code).
 * Deterministic so server and client render the same markup.
 */
export function qrModules(seed = 142, size = 25): Array<[number, number]> {
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) if (!inFinder(x, y) && rnd() > 0.52) cells.push([x, y]);
  return cells;
}
