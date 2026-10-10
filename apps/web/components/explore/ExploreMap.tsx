"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { loadMapLibre } from "@/lib/maplibre";
import type { ExplorePlace } from "@/lib/explore";

const NER_BOUNDS: [[number, number], [number, number]] = [[88.0, 21.9], [97.4, 29.5]];

/**
 * OpenFreeMap "liberty" in both themes: hill shading, forest, rivers and readable labels suit a travel map far better
 * than the near-black dark style, and the white-ringed pins stand out on it.
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/**
 * Map of every place, linked to the card list: hovering a card lifts its pin, selecting one flies to it,
 * and clicking a pin selects its card. Pins for places outside the current filter are dimmed, not removed.
 */
export function ExploreMap({ places, visible, selected, hovered, onSelect, onHover }: {
  places: ExplorePlace[];
  visible: Set<string>;
  selected: string | null;
  hovered: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const pins = useRef(new Map<string, { marker: Marker; dot: HTMLButtonElement }>());
  const [ready, setReady] = useState(false);
  const cb = useRef({ onSelect, onHover });
  cb.current = { onSelect, onHover };
  const sel = useRef(selected);
  sel.current = selected;

  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | undefined;
    (async () => {
      const ml = await loadMapLibre();
      if (cancelled || !el.current) return;
      const m = new ml.Map({
        container: el.current,
        style: STYLE_URL,
        bounds: NER_BOUNDS,
        fitBoundsOptions: { padding: 20 },
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      m.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
      map.current = m;
      places.forEach((p) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "xm";
        dot.dataset.level = p.community_closed ? "high" : p.risk_level;
        dot.setAttribute("aria-label", `${p.name}, ${p.district}`);
        const tag = document.createElement("span");
        tag.className = "xm-tag";
        tag.textContent = p.name;
        dot.append(tag);
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          cb.current.onSelect(p.id);
        });
        dot.addEventListener("pointerenter", () => cb.current.onHover(p.id));
        dot.addEventListener("pointerleave", () => cb.current.onHover(null));
        const marker = new ml.Marker({ element: dot }).setLngLat([p.lng, p.lat]).addTo(m);
        pins.current.set(p.id, { marker, dot });
      });
      setReady(true);
      // The map can start hidden (phone "List" view) or change size with the layout; keep its canvas and pins in step.
      // With nothing selected, refit to the whole region once it has a real size.
      ro = new ResizeObserver(([entry]) => {
        m.resize();
        if (!sel.current && entry.contentRect.width > 0) m.fitBounds(NER_BOUNDS, { padding: 20, animate: false });
      });
      ro.observe(el.current);
    })();
    const all = pins.current;
    return () => {
      cancelled = true;
      ro?.disconnect();
      all.clear();
      map.current?.remove();
      map.current = null;
    };
    // Places are fixed for the page's lifetime; filters only change `visible`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect selection, hover and filtering on the pins without rebuilding them.
  useEffect(() => {
    pins.current.forEach(({ dot, marker }, id) => {
      dot.toggleAttribute("data-selected", id === selected);
      dot.toggleAttribute("data-hovered", id === hovered);
      dot.toggleAttribute("data-dim", !visible.has(id));
      dot.tabIndex = visible.has(id) ? 0 : -1;
      marker.getElement().style.zIndex = id === selected ? "3" : id === hovered ? "2" : "1";
    });
  }, [ready, selected, hovered, visible]);

  useEffect(() => {
    if (!ready) return;
    const p = places.find((x) => x.id === selected);
    if (p && map.current) map.current.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.current.getZoom(), 7), speed: 1.4 });
    else if (!p && map.current) map.current.fitBounds(NER_BOUNDS, { padding: 20 });
  }, [ready, selected, places]);

  return <div ref={el} className="xp-map" role="region" aria-label="Map of places. Select a pin to see its details." />;
}
