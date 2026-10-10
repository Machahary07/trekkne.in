/**
 * Loads MapLibre with a working worker. MapLibre resolves its worker file next to its own module, but the bundler
 * doesn't emit that file, so the worker 404s and no tiles render. Point it at the same version on jsDelivr instead
 * (MapLibre wraps cross-origin worker URLs in a same-origin blob itself).
 */
export async function loadMapLibre() {
  const ml = await import("maplibre-gl");
  ml.setWorkerUrl(`https://cdn.jsdelivr.net/npm/maplibre-gl@${ml.getVersion()}/dist/maplibre-gl-worker.mjs`);
  return ml;
}
