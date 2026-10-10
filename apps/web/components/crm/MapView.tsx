"use client";

import { useEffect, useRef } from "react";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  color: string;
  title: string;
  body?: string;
  href?: string;
  shape?: "dot" | "square";
  small?: boolean;
}

const NER_BOUNDS: [[number, number], [number, number]] = [[88.0, 21.9], [97.4, 29.5]];

function styleUrl() {
  const dark = document.documentElement.dataset.theme === "dark" ||
    (document.documentElement.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  return `https://tiles.openfreemap.org/styles/${dark ? "dark" : "positron"}`;
}

/** MapLibre map of the Northeast with coloured markers. `onPick` makes clicks set a location. */
export function MapView({ points, height = 420, onPick, focus }: {
  points: MapPoint[];
  height?: number | string;
  onPick?: (lat: number, lng: number) => void;
  focus?: { lat: number; lng: number; zoom?: number };
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;

  const draw = () => {
    const m = map.current;
    const ml = lib.current;
    if (!m || !ml) return;
    markers.current.forEach((k) => k.remove());
    markers.current = points.map((p) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `mk${p.shape === "square" ? " sq" : ""}${p.small ? " sm" : ""}`;
      dot.style.background = p.color;
      dot.setAttribute("aria-label", p.title);
      const html = document.createElement("div");
      const b = document.createElement("b");
      b.textContent = p.title;
      html.append(b);
      if (p.body) {
        const s = document.createElement("div");
        s.textContent = p.body;
        html.append(s);
      }
      if (p.href) {
        const a = document.createElement("a");
        a.href = p.href;
        a.textContent = "Open →";
        html.append(a);
      }
      return new ml.Marker({ element: dot })
        .setLngLat([p.lng, p.lat])
        .setPopup(new ml.Popup({ offset: 14, closeButton: false }).setDOMContent(html))
        .addTo(m);
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled || !el.current) return;
      lib.current = ml;
      const m = new ml.Map({
        container: el.current,
        style: styleUrl(),
        bounds: focus ? undefined : NER_BOUNDS,
        center: focus ? [focus.lng, focus.lat] : undefined,
        zoom: focus ? focus.zoom ?? 10 : undefined,
        fitBoundsOptions: { padding: 24 },
        attributionControl: { compact: true },
      });
      m.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
      m.on("click", (e) => pick.current?.(e.lngLat.lat, e.lngLat.lng));
      if (onPick) m.getCanvas().style.cursor = "crosshair";
      map.current = m;
      m.once("load", draw);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(draw, [points]);

  return <div ref={el} className="map" style={{ height }} />;
}
