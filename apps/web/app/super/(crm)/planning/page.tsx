import { Fragment } from "react";
import Link from "next/link";
import { LEVEL_COLOR, brand, pressureLevel } from "@trekne/brand";
import { PageHead, ago, fmtDate, todayIST } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

const DAYS = 14;

export default async function Planning() {
  await requirePerm("trips.read_all");
  const supabase = await supabaseServer();
  const start = todayIST();
  const days = Array.from({ length: DAYS }, (_, i) => new Date(Date.parse(start) + i * 864e5).toISOString().slice(0, 10));

  const [grids, { data: trips }, { data: events }] = await Promise.all([
    Promise.all(days.map((d) => supabase.rpc("destination_overview", { on_day: d }))),
    supabase.from("trips").select("id,title,start_date,end_date,party_size,status,created_at,owner:profiles(full_name,email),trip_stops(day,destinations(name))")
      .in("status", ["planned", "draft"]).gte("end_date", start).order("start_date").limit(50),
    supabase.from("events").select("name,starts_on,ends_on,visitor_impact,destination_id,state_code").eq("is_published", true).lte("starts_on", days[DAYS - 1]).gte("ends_on", start),
  ]);
  const dests = (grids[0].data ?? []).map((d) => ({ id: d.id, name: d.name, state: d.state_code, cap: d.capacity }));
  const cell = (di: number, id: string) => grids[di].data?.find((x) => x.id === id);

  return (
    <>
      <PageHead title="Visitor pressure" sub="Expected visitors against carrying capacity for the next two weeks: typical counts for that weekday plus trips travellers have planned in the app." />
      <section className="card" style={{ marginBottom: 14 }}>
        <div className="card-head"><h2>Next {DAYS} days</h2><p>Cell = % of capacity · ★ = festival</p></div>
        <div className="table-wrap">
          <div style={{ display: "grid", gridTemplateColumns: `minmax(170px, 1.4fr) repeat(${DAYS}, minmax(44px, 1fr))`, gap: 3, minWidth: 820 }}>
            <span />
            {days.map((d) => (
              <span key={d} className="mono sub" style={{ textAlign: "center", fontSize: 11 }}>
                {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "narrow" })}<br />{d.slice(8)}
              </span>
            ))}
            {dests.map((d) => (
              <Fragment key={d.id}>
                <span style={{ fontWeight: 600, fontSize: 14, alignSelf: "center" }}>{d.name} <span className="sub">{d.state}</span></span>
                {days.map((day, di) => {
                  const c = cell(di, d.id);
                  const lvl = pressureLevel(c?.load_ratio);
                  const fest = events?.some((e) => (e.destination_id === d.id || (!e.destination_id && e.state_code === d.state)) && e.starts_on <= day && e.ends_on >= day);
                  return (
                    <span key={day} title={`${d.name} · ${fmtDate(day)} · ${c?.expected ?? "no count"} expected of ${d.cap ?? "?"}${c?.planned ? ` (${c.planned} planned)` : ""}`}
                      style={{
                        height: 34, borderRadius: 6, display: "grid", placeItems: "center", font: "600 11.5px/1 var(--mono)",
                        background: lvl === "none" ? "var(--chip)" : LEVEL_COLOR[lvl]!, color: lvl === "none" ? "var(--muted)" : brand.ink,
                      }}>
                      {c?.load_ratio != null ? Math.round(c.load_ratio * 100) : "–"}{fest && "★"}
                    </span>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="legend">
          <span><i style={{ background: brand.green }} />Under 60%</span>
          <span><i style={{ background: brand.yellow }} />60–89%</span>
          <span><i style={{ background: brand.orange }} />90%+ of capacity</span>
          <span><i style={{ background: "var(--chip)" }} />No reliable count</span>
        </div>
      </section>

      <section className="card">
        <div className="card-head"><h2>Upcoming trips</h2><p>Planned in the Trekne app</p></div>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Trip</th><th>Dates</th><th className="num">Party</th><th>Stops</th><th>Status</th></tr></thead>
            <tbody>
              {trips?.map((t) => (
                <tr key={t.id}>
                  <td className="who"><b>{t.title}</b><span>{t.owner?.full_name || t.owner?.email} · created {ago(t.created_at)}</span></td>
                  <td className="mono" style={{ fontSize: 13 }}>{fmtDate(t.start_date)} – {fmtDate(t.end_date)}</td>
                  <td className="num">{t.party_size}</td>
                  <td>{t.trip_stops.map((s) => s.destinations?.name).filter(Boolean).join(" → ") || "—"}</td>
                  <td><span className={`pill ${t.status === "planned" ? "st-verified" : ""}`}><i />{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!trips?.length && <p className="empty">No upcoming trips yet. They appear here when travellers plan in the app. <Link href="/super/map">Open the map</Link></p>}
        </div>
      </section>
    </>
  );
}
