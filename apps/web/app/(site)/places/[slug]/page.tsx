import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MONTHS, SENSITIVITY_LEVEL, SUITABILITY_LABEL, pressureLevel } from "@trekne/brand";
import type { DestinationAccess } from "@trekne/db";
import { Icon } from "@/components/Icon";
import { PlaceGallery } from "@/components/place/PlaceGallery";
import { NOTICE_LABEL, STATE_NAMES, fmtDay, getNotices, publicClient, todayIST, addDays } from "@/lib/public-data";
import { placeGallery, photoThumb } from "@/lib/photos";
import "@/components/plan/plan.css";
import "@/components/place/place.css";

export const revalidate = 300;

const SIGNAL = { none: "No mobile signal", "2g": "Patchy 2G", "4g": "4G" } as const;
const PHOTO = { allowed: "Photos allowed", ask: "Ask before photos", forbidden: "No photography" } as const;
const LOAD = { good: "Comfortable", warn: "Busy", high: "Over capacity", none: "Not verified" } as const;
const RISK = { good: "Low", warn: "Moderate", high: "High", none: "Unknown" } as const;
const LEVEL_VAR = { good: "green", warn: "yellow", high: "orange", none: "chip" } as const;
const SEASON_LEVEL = { good: "good", fair: "warn", poor: "high", closed: "high" } as const;

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
  if (!data) return { title: "Place not found" };
  const cover = placeGallery(data.d.slug)[0];
  return { title: data.d.name, description: data.d.summary, openGraph: cover ? { images: [{ url: cover.src, alt: cover.alt }] } : undefined };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await loadPlace((await params).slug);
  if (!data) notFound();
  const { d, ov, seasons, rec, heritage, events, reports, notices, alts } = data;
  const access = d.access as DestinationAccess;
  const month = Number(todayIST().slice(5, 7));
  const ratio = ov?.load_ratio == null ? null : Number(ov.load_ratio);
  const loadLevel = ov?.community_closed ? "high" : pressureLevel(ratio);
  const local = [...heritage].sort((a, b) => Number(!!b.community_endorsed_at) - Number(!!a.community_endorsed_at)).slice(0, 4);
  const thisMonth = seasons.find((x) => x.month === month)?.suitability;
  const state = STATE_NAMES[d.state_code] ?? d.state_code;

  // Gallery: a CRM cover first if one is set, then the bundled photo and its Commons extras (local files go through next/image).
  const gallery = placeGallery(d.slug).map((p) => ({ ...p, src: photoThumb(p.src, 1920) }));
  const photos = d.cover_url
    ? [{ src: d.cover_url, alt: d.name, credit: "Trekne", license: "Used with permission", licenseUrl: "", sourceUrl: d.cover_url }, ...gallery]
    : gallery;

  return (
    <article className="pg" aria-labelledby="place-h">
      <div className="wrap">
        <nav className="pg-crumbs" aria-label="Breadcrumb">
          <Link href="/destinations">Destinations</Link><Icon name="chevronRight" />
          <Link href={`/destinations?place=${d.slug}`}>{state}</Link><Icon name="chevronRight" />
          <span aria-current="page">{d.name}</span>
        </nav>

        <PlaceGallery name={d.name} photos={photos} />

        <header className="pg-head">
          <div className="pg-title">
            <span className="pg-place"><Icon name="pin" />{d.place || `${d.district} · ${state}`}</span>
            <h1 id="place-h">{d.name}</h1>
            <p>{d.summary}</p>
            <div className="pg-tags">
              <span className="pl-pill" style={{ textTransform: "capitalize" }}>{d.kind}</span>
              <span className="pl-pill">{d.ecosystem}</span>
              {d.is_lesser_known && <span className="pl-pill l-good"><Icon name="leaf" />Lesser-known</span>}
              {ov?.community_closed && <span className="pl-pill l-high"><i />Closed today</span>}
            </div>
          </div>
          <div className="pg-cta">
            <Link className="btn btn-green" href={`/planner?add=${d.slug}`}><Icon name="route" />Add to a trip</Link>
            <Link className="btn btn-ghost" href={`/destinations?place=${d.slug}`}><Icon name="map" />See on the map</Link>
          </div>
        </header>

        {notices.length > 0 && (
          <div className="pg-notices" role="note">
            {notices.map((n) => (
              <div key={n.id} className="pg-notice">
                <Icon name={n.kind === "closure" || n.kind === "sacred_day" ? "alert" : "info"} />
                <div>
                  <b>{n.title}</b>
                  <span className="pl-mono">{NOTICE_LABEL[n.kind]} · {fmtDay(n.starts_on)}{n.ends_on !== n.starts_on ? `–${fmtDay(n.ends_on)}` : ""} · {n.community}</span>
                  {n.body && <p>{n.body}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="pg-glance" aria-label="Today at a glance">
          <div className="pg-stat">
            <span className="pl-kicker"><Icon name="leaf" />Eco-risk today</span>
            <b className={`pg-big l-${ov?.risk_level ?? "none"}`}>{ov ? ov.risk_score : "—"}<small>/100</small></b>
            <span>{ov ? `${RISK[ov.risk_level]} pressure on the place` : "Not computed yet"}</span>
          </div>
          <div className="pg-stat">
            <span className="pl-kicker"><Icon name="users" />Crowding today</span>
            <b className={`pg-mid l-${loadLevel}`}><i />{ov?.community_closed ? "Closed today" : LOAD[loadLevel]}</b>
            <span className="pg-track"><i style={{ width: `${Math.min(100, (ratio ?? 0) * 100)}%`, background: `var(--${LEVEL_VAR[loadLevel]})` }} /></span>
            <span className="pl-mono">{ov?.expected == null ? "No reliable count, so we don't guess" : `~${ov.expected} expected · ${ov.capacity}/day capacity`}</span>
          </div>
          <div className="pg-stat">
            <span className="pl-kicker"><Icon name="calendar" />{MONTHS[month - 1]} season</span>
            <b className={`pg-mid l-${thisMonth ? SEASON_LEVEL[thisMonth] : "none"}`}><i />{thisMonth ? SUITABILITY_LABEL[thisMonth] : "Not recorded"}</b>
            <span className="pg-months" aria-label="Season by month">
              {MONTHS.map((m, i) => {
                const s = seasons.find((x) => x.month === i + 1)?.suitability;
                return <span key={m} data-s={s ?? "none"} data-now={i + 1 === month || undefined} title={`${m}: ${s ? SUITABILITY_LABEL[s] : "not recorded"}`}><small>{m[0]}</small></span>;
              })}
            </span>
          </div>
          <div className="pg-stat">
            <span className="pl-kicker"><Icon name="route" />Access</span>
            <b className="pg-mid">{access.connectivity ? SIGNAL[access.connectivity] : "Signal not recorded"}</b>
            <span>{access.permit ? `Permit: ${access.permit}` : "No permit needed"}</span>
            {access.medical_km != null && <span className="pl-mono">Medical help ~{access.medical_km} km</span>}
          </div>
        </section>

        <div className="pg-body">
          <div className="pg-main">
            <section className="pl-card" aria-labelledby="respect-h">
              <span className="pl-kicker"><Icon name="temple" />Respect the place</span>
              <h2 id="respect-h">Before you go</h2>
              <p className="pg-lede">{d.culture}</p>
              {d.etiquette.length > 0 && <ul className="pl-guides">{d.etiquette.map((e) => <li key={e}>{e}</li>)}</ul>}
              {rec && <p className="pl-note"><Icon name="spark" />{rec.body}</p>}
            </section>

            {ov && (
              <section className="pl-card" aria-labelledby="risk-h">
                <span className="pl-kicker"><Icon name="leaf" />Why the eco-risk is {ov.risk_score}</span>
                <h2 id="risk-h">What adds up today</h2>
                <ul className="pg-parts">
                  {([["Ecosystem sensitivity", ov.risk_sensitivity, 45], ["Visitor load", ov.risk_pressure, 30], ["Season", ov.risk_season, 25], ["Verified issues", ov.risk_issues, 12]] as const).map(([k, v, max]) => (
                    <li key={k}>
                      <span>{k}</span>
                      <span className="pg-track"><i style={{ width: `${(v / max) * 100}%` }} /></span>
                      <span className="pl-mono">{v}/{max}</span>
                    </li>
                  ))}
                </ul>
                <p className="pl-note"><Icon name="info" />Visitor counts in this preview are simulated. Trips planned in Trekne are added to the expected load.</p>
              </section>
            )}

            <section className="pl-card" aria-labelledby="getting-h">
              <span className="pl-kicker"><Icon name="route" />Getting there</span>
              <h2 id="getting-h">Roads, transport and help</h2>
              <dl className="pl-kv">
                {access.road && <><dt>Road</dt><dd>{access.road}</dd></>}
                {access.transport?.length ? <><dt>Transport</dt><dd>{access.transport.join(" · ")}</dd></> : null}
                {access.nearest_town && <><dt>Nearest town</dt><dd>{access.nearest_town}{access.distance_km != null ? ` · ${access.distance_km} km` : ""}</dd></>}
                {access.connectivity && <><dt>Signal</dt><dd>{SIGNAL[access.connectivity]}</dd></>}
                {access.medical_km != null && <><dt>Medical help</dt><dd>~{access.medical_km} km</dd></>}
                {access.permit && <><dt>Permit</dt><dd>{access.permit}</dd></>}
                {d.carrying_capacity && <><dt>Capacity</dt><dd>{d.carrying_capacity.toLocaleString("en-IN")} visitors / day</dd></>}
              </dl>
            </section>

            {local.length > 0 && (
              <section className="pl-card" aria-labelledby="heritage-h">
                <span className="pl-kicker"><Icon name="temple" />Heritage in {state}</span>
                <h2 id="heritage-h">Community places nearby</h2>
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
              </section>
            )}
          </div>

          <aside className="pg-side" aria-label="Plan your visit">
            <section className="pl-card pg-plan">
              <span className="pl-kicker"><Icon name="calendar" />Plan your visit</span>
              <div className="pg-plan-group">
                <h3>Festivals nearby</h3>
                {events.length ? (
                  <ul className="pg-mini">
                    {events.map((e) => {
                      const start = new Date(e.starts_on + "T00:00:00");
                      return (
                        <li key={e.id}>
                          <span className="pg-date"><b>{start.getDate()}</b>{MONTHS[start.getMonth()]}</span>
                          <div><b>{e.name}</b><span className="pl-mono">{fmtDay(e.starts_on)}{e.ends_on !== e.starts_on ? `–${fmtDay(e.ends_on)}` : ""} · {e.community}</span></div>
                          <span className={`pl-pill l-${SENSITIVITY_LEVEL[e.visitor_impact]}`}><i />{e.visitor_impact}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="pl-sub">No festivals in the next six months.</p>}
              </div>
              <div className="pg-plan-group">
                <h3>Latest from Rangers</h3>
                {reports.length ? (
                  <ul className="pg-mini">
                    {reports.map((r) => (
                      <li key={r.id}>
                        <span className={`st ${r.status}`}>{r.status === "official" ? "Official" : "Verified"}</span>
                        <div><span>{r.body}</span><span className="pl-mono">{r.source_label}</span></div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="pl-sub">No verified reports yet.</p>}
              </div>
              <Link className="btn btn-green" href={`/planner?add=${d.slug}`}><Icon name="route" />Add to a trip</Link>
            </section>

            {alts.length > 0 && (
              <section className="pl-card pg-alts">
                <span className="pl-kicker"><Icon name="leaf" />Too busy today? Quieter options</span>
                <ul className="pg-alt-list">
                  {alts.map((a) => {
                    const cover = placeGallery(a.slug)[0];
                    return (
                      <li key={a.id}>
                        <Link href={`/places/${a.slug}`}>
                          {cover ? <img src={photoThumb(cover.src, 384)} alt="" loading="lazy" /> : <span className="pg-alt-ph"><Icon name="pin" /></span>}
                          <span><b>{a.name}</b><span className="pl-mono">{a.distance_km} km · {STATE_NAMES[a.state_code]} · eco-risk {a.risk_score}</span></span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </aside>
        </div>

        <details className="pg-credits">
          <summary>Photo credits</summary>
          <ul>
            {photos.map((p) => (
              <li key={p.src}>
                {p.alt}: <a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.credit}</a>
                {p.licenseUrl ? <>, <a href={p.licenseUrl} target="_blank" rel="noreferrer">{p.license}</a></> : <>, {p.license}</>}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </article>
  );
}
