"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVEL_COLOR, brand } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";
import { MapView, type MapPoint } from "./MapView";

type Loc = { name: string; lat: number; lng: number } | null;
interface Props {
  day: string;
  destinations: DestinationOverview[];
  heritage: { id: string; name: string; site_type: string; community: string; lat: number | null; lng: number | null; photography: string; restricted: boolean }[];
  reports: { id: string; body: string; category: string; status: string; lat: number | null; lng: number | null; dest: Loc }[];
  scenes: { id: string; title: string; lat: number | null; lng: number | null; status: string; dest: Loc }[];
  canEdit: boolean;
}

const LAYERS = [
  { key: "dest", label: "Destinations", color: brand.green },
  { key: "heritage", label: "Heritage sites", color: brand.ink },
  { key: "reports", label: "Field reports", color: brand.blue },
  { key: "scenes", label: "360 scenes", color: brand.orangeDeep },
] as const;
type Layer = (typeof LAYERS)[number]["key"];

/** Small deterministic offset so a report without GPS doesn't hide its destination marker. */
const jitter = (id: string) => ((parseInt(id.slice(0, 4), 16) % 100) - 50) / 4000;

export function LiveMap({ day, destinations, heritage, reports, scenes, canEdit }: Props) {
  const router = useRouter();
  const [on, setOn] = useState<Record<Layer, boolean>>({ dest: true, heritage: true, reports: true, scenes: true });

  const points = useMemo(() => {
    const pts: MapPoint[] = [];
    if (on.dest) destinations.forEach((d) => pts.push({
      id: d.id, lat: d.lat, lng: d.lng, color: LEVEL_COLOR[d.risk_level] ?? brand.blue, title: d.name,
      body: `Eco-risk ${d.risk_score}/100 · ${d.expected == null ? "no visitor count" : `${d.expected} of ${d.capacity ?? "?"} capacity`}`,
      href: canEdit ? `/super/destinations/${d.id}` : undefined,
    }));
    if (on.heritage) heritage.forEach((h) => h.lat != null && h.lng != null && pts.push({
      id: h.id, lat: h.lat, lng: h.lng, color: brand.ink, shape: "square", small: true, title: h.name,
      body: `${h.site_type} · ${h.community} · photography: ${h.photography}${h.restricted ? " · restricted areas" : ""}`,
    }));
    if (on.reports) reports.forEach((r) => {
      const lat = r.lat ?? (r.dest ? r.dest.lat + jitter(r.id) : null);
      const lng = r.lng ?? (r.dest ? r.dest.lng + jitter(r.id.slice(4)) : null);
      if (lat != null && lng != null) pts.push({ id: r.id, lat, lng, color: brand.blue, small: true, title: `${r.category} · ${r.status}`, body: r.body, href: "/super/reports" });
    });
    if (on.scenes) scenes.forEach((s) => {
      const lat = s.lat ?? s.dest?.lat;
      const lng = s.lng ?? s.dest?.lng;
      if (lat != null && lng != null) pts.push({ id: s.id, lat, lng, color: brand.orangeDeep, shape: "square", title: s.title || "360 scene", body: `${s.dest?.name ?? ""} · ${s.status}`, href: `/super/scenes?open=${s.id}` });
    });
    return pts;
  }, [on, destinations, heritage, reports, scenes, canEdit]);

  return (
    <section className="card">
      <div className="toolbar">
        {LAYERS.map((l) => (
          <label key={l.key} className="check" style={{ marginRight: 10 }}>
            <input type="checkbox" checked={on[l.key]} onChange={(e) => setOn({ ...on, [l.key]: e.target.checked })} />
            <i className="role-dot" style={{ background: l.color }} />{l.label}
          </label>
        ))}
        <label className="field" style={{ marginLeft: "auto", gridAutoFlow: "column", alignItems: "center" }}>
          <span>Planning day</span>
          <input className="input" type="date" value={day} onChange={(e) => router.push(`/super/map?day=${e.target.value}`)} style={{ width: "auto" }} />
        </label>
      </div>
      <MapView points={points} height="calc(100dvh - 250px)" />
      <div className="legend">
        <span>Destination colour = eco-risk on the planning day:</span>
        <span><i style={{ background: brand.green }} />Low</span>
        <span><i style={{ background: brand.yellow }} />Moderate</span>
        <span><i style={{ background: brand.orange }} />High</span>
      </div>
    </section>
  );
}
