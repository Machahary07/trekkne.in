import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MONTHS, SENSITIVITY_LEVEL, SUITABILITY_LABEL, pressureLevel } from "@trekne/brand";
import type { DestinationAccess } from "@trekne/db";
import { Icon } from "@/components/Icon";
import { NOTICE_LABEL, STATE_NAMES, fmtDay, getNotices, publicClient, todayIST, addDays } from "@/lib/public-data";
import "@/components/plan/plan.css";

export const revalidate = 300;

const SIGNAL = { none: "No mobile signal", "2g": "Patchy 2G", "4g": "4G" } as const;
const PHOTO = { allowed: "Photos allowed", ask: "Ask before photos", forbidden: "No photography" } as const;
const LOAD = { good: "Comfortable", warn: "Busy", high: "Over capacity", none: "Unknown" } as const;

async function loadPlace(slug: string) {
  const sb = publicClient();
  if (!sb) return null;
  const { data: d } = await sb.from("destinations").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!d) return null;
  const today = todayIST();
  const [seasons, rec, heritage, events, reports, overview, notices] = await Promise.all([
    sb.from("seasonal_conditions").select("month,suitability").eq("destination_id", d.id),
    sb.from("recommendations").select("body,generated_at").eq("destination_id", d.id).maybeSingle(),
    sb.from("heritage_sites").select("id,name,site_type,community,photography,restricted,guidelines,community_endorsed_at").eq("is_published", true).eq("state_code", d.state_code),
    sb.from("events").select("id,name,community,starts_on,ends_on,visitor_impact,etiquette,destination_id").eq("is_published", true).eq("state_code", d.state_code).gte("ends_on", today).lte("starts_on", addDays(today, 180)).order("starts_on").limit(4),
    sb.from("reports").select("id,body,status,source_label,created_at").eq("destination_id", d.id).in("status", ["verified", "official"]).order("created_at", { ascending: false }).limit(4),
    sb.rpc("destination_overview", { on_day: today }),
    getNotices(d.id),
  ]);
  const ov = overview.data?.find((o) => o.id === d.id) ?? null;
  const alts = ov && (ov.risk_level !== "good" || ov.community_closed || pressureLevel(ov.load_ratio == null ? null : Number(ov.load_ratio)) !== "good")
    ? (await sb.rpc("suggest_alternatives", { dest: d.id, on_day: today, max_results: 3 })).data ?? []
    : [];
  return { d, seasons: seasons.data ?? [], rec: rec.data, heritage: heritage.data ?? [], events: events.data ?? [], reports: reports.data ?? [], ov, notices, alts };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = await loadPlace((await params).slug);
  return data ? { title: data.d.name, description: data.d.summary } : { title: "Place not found" };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await loadPlace((await params).slug);
  if (!data) notFound();
  const { d, ov, seasons, rec, heritage, events, reports, notices, alts } = data;
  const access = d.access as DestinationAccess;
  const month = Number(todayIST().slice(5, 7));
  const ratio = ov?.load_ratio == null ? null : Number(ov.load_ratio);
  const loadLevel = pressureLevel(ratio);
  const local = [...heritage].sort((a, b) => Number(!!b.community_endorsed_at) - Number(!!a.community_endorsed_at)).slice(0, 4);

  return (
    <section aria-labelledby="place-h">
      <div className="wrap pl-grid">
        <div className="pl-hero">
          <span className="pl-mono" style={{ color: "var(--ink)" }}>{d.place || `${d.district} · ${STATE_NAMES[d.state_code]}`}</span>
          <h1 id="place-h">{d.name}</h1>
          <p>{d.summary}</p>
          <div className="pl-row">
            <span className="pl-pill" style={{ textTransform: "capitalize" }}>{d.kind}</span>
            <span className="pl-pill">{d.ecosystem}</span>
            {d.is_lesser_known && <span className="pl-pill"><Icon name="leaf" style={{ width: 13, height: 13 }} />Lesser-known</span>}
          </div>
          <div className="pl-row">
            <Link className="btn btn-ink" href={`/planner?add=${d.slug}`}><Icon name="route" />Plan a visit</Link>
          </div>
        </div>

        {notices.length > 0 && (
          <div className="pl-card" style={{ background: "color-mix(in srgb, var(--yellow) 22%, var(--surface))" }}>
            <span className="pl-kicker"><Icon name="flag" />From the community</span>
            <ul className="pl-list">
              {notices.map((n) => (
                <li key={n.id} style={{ background: "var(--surface)" }}>
                  <Icon name={n.kind === "closure" || n.kind === "sacred_day" ? "alert" : "info"} />
                  <div>
                    <b>{n.title}</b>
                    <span className="pl-mono">{NOTICE_LABEL[n.kind]} · {fmtDay(n.starts_on)}{n.ends_on !== n.starts_on ? `–${fmtDay(n.ends_on)}` : ""} · {n.community}</span>
                    {n.body && <p className="pl-sub" style={{ marginTop: 4 }}>{n.body}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pl-grid pl-3">
          {ov && (
            <div className="pl-card">
              <span className="pl-kicker"><Icon name="users" />Visitor pressure today</span>
              <h3>{ov.community_closed ? "Closed today" : LOAD[loadLevel]}</h3>
              <div className="cap-track" style={{ position: "relative", height: 12, borderRadius: 6, background: "var(--chip)" }}>
                <i style={{ position: "absolute", inset: "0 auto 0 0", borderRadius: 6, width: `${Math.min(100, ((ratio ?? 0) / 1.5) * 100)}%`, background: `var(--${loadLevel === "high" ? "orange" : loadLevel === "warn" ? "yellow" : loadLevel === "good" ? "green" : "chip"})` }} />
                <b style={{ position: "absolute", top: -4, bottom: -4, width: 2, left: `${100 / 1.5}%`, background: "var(--text)" }} />
              </div>
              <span className="pl-mono">
                {ov.expected == null ? "No reliable count, so we don't guess" : `~${ov.expected} expected · capacity ${ov.capacity}/day · ${Math.round((ratio ?? 0) * 100)}%`}
              </span>
              <span className="pl-mono">Typical weekday count (simulated) + trips planned in Trekne</span>
            </div>
          )}
          {ov && (
            <div className="pl-card">
              <span className="pl-kicker"><Icon name="leaf" />Eco-risk today</span>
              <h3>{ov.risk_score}/100 · {ov.risk_level === "high" ? "High" : ov.risk_level === "warn" ? "Moderate" : "Low"}</h3>
              {([["Sensitivity", ov.risk_sensitivity, 45], ["Visitor load", ov.risk_pressure, 30], ["Season", ov.risk_season, 25], ["Verified issues", ov.risk_issues, 12]] as const).map(([k, v, max]) => (
                <div key={k} style={{ display: "grid", gap: 4 }}>
                  <div className="pl-between"><span style={{ fontSize: 14, fontWeight: 600 }}>{k}</span><span className="pl-mono">{v}/{max}</span></div>
                  <div className="pl-meter"><i style={{ width: `${(v / max) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
          <div className="pl-card">
            <span className="pl-kicker"><Icon name="calendar" />When to go</span>
            <div className="pl-cal" style={{ minWidth: 0, gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
              {MONTHS.map((m, i) => <span key={m} className="h">{m.slice(0, 1)}</span>)}
              {MONTHS.map((m, i) => {
                const s = seasons.find((x) => x.month === i + 1)?.suitability;
                return <span key={m} className={`c${s ? ` s-${s}` : ""}${i + 1 === month ? " now" : ""}`} title={`${m}: ${s ? SUITABILITY_LABEL[s] : "not recorded"}`} />;
              })}
            </div>
            <div className="pl-legend"><span><i className="s-good" />Good</span><span><i className="s-fair" />Fair</span><span><i className="s-poor" />Poor</span><span><i className="s-closed" />Closed</span></div>
          </div>
        </div>

        {alts.length > 0 && (
          <div className="pl-card" style={{ background: "color-mix(in srgb, var(--green) 14%, var(--surface))" }}>
            <span className="pl-kicker"><Icon name="leaf" />Too busy today? Quieter options</span>
            <ul className="pl-list">
              {alts.map((a) => (
                <li key={a.id} style={{ background: "var(--surface)" }}>
                  <Icon name="pin" />
                  <div><b><Link href={`/places/${a.slug}`} style={{ color: "inherit" }}>{a.name}</Link></b>
                    <span className="pl-mono">{a.distance_km} km away · {STATE_NAMES[a.state_code]} · eco-risk {a.risk_score}{a.is_lesser_known ? " · lesser-known" : ""}</span></div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pl-grid pl-2">
          <div className="pl-card">
            <span className="pl-kicker"><Icon name="temple" />Respect the place</span>
            <p>{d.culture}</p>
            <ul className="pl-guides">{d.etiquette.map((e) => <li key={e}>{e}</li>)}</ul>
            {rec && <p className="pl-note"><Icon name="spark" />{rec.body}</p>}
          </div>
          <div className="pl-card">
            <span className="pl-kicker"><Icon name="route" />Getting there</span>
            <dl className="pl-kv">
              {access.road && <><dt>Road</dt><dd>{access.road}</dd></>}
              {access.transport?.length ? <><dt>Transport</dt><dd>{access.transport.join(" · ")}</dd></> : null}
              {access.nearest_town && <><dt>Nearest town</dt><dd>{access.nearest_town}{access.distance_km != null ? ` · ${access.distance_km} km` : ""}</dd></>}
              {access.connectivity && <><dt>Signal</dt><dd>{SIGNAL[access.connectivity]}</dd></>}
              {access.medical_km != null && <><dt>Medical help</dt><dd>~{access.medical_km} km</dd></>}
              {access.permit && <><dt>Permit</dt><dd>{access.permit}</dd></>}
              {d.carrying_capacity && <><dt>Capacity</dt><dd>{d.carrying_capacity.toLocaleString("en-IN")} visitors / day</dd></>}
            </dl>
          </div>
        </div>

        <div className="pl-grid pl-2">
          {local.length > 0 && (
            <div className="pl-card">
              <span className="pl-kicker"><Icon name="temple" />Heritage in {STATE_NAMES[d.state_code]}</span>
              <ul className="pl-list">
                {local.map((h) => (
                  <li key={h.id}>
                    <Icon name="temple" />
                    <div>
                      <b>{h.name}</b>
                      <span className="pl-mono">{h.site_type} · {h.community} · {PHOTO[h.photography as keyof typeof PHOTO]}</span>
                      {h.community_endorsed_at && <span className="pl-pill l-good" style={{ marginTop: 6 }}><i />Approved by the community</span>}
                      {h.guidelines.map((g) => <p key={g} className="pl-sub" style={{ fontSize: 13.5 }}>• {g}</p>)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="pl-card">
            <span className="pl-kicker"><Icon name="calendar" />Festivals & field reports</span>
            <ul className="pl-list">
              {events.map((e) => (
                <li key={e.id}>
                  <Icon name="calendar" />
                  <div><b>{e.name}</b><span className="pl-mono">{fmtDay(e.starts_on)}{e.ends_on !== e.starts_on ? `–${fmtDay(e.ends_on)}` : ""} · {e.community}</span></div>
                  <span className={`pl-pill l-${SENSITIVITY_LEVEL[e.visitor_impact]}`}><i />{e.visitor_impact}</span>
                </li>
              ))}
              {reports.map((r) => (
                <li key={r.id}>
                  <span className={`st ${r.status}`}>{r.status === "official" ? "Official" : "Verified"}</span>
                  <div><b style={{ fontWeight: 600 }}>{r.body}</b><span className="pl-mono">{r.source_label}</span></div>
                </li>
              ))}
              {!events.length && !reports.length && <li><Icon name="info" /><div>No festivals or verified reports yet.</div></li>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
