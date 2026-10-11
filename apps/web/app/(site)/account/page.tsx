import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { REPORT_LABEL, pressureLevel, type Level } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";
import { Icon } from "@/components/Icon";
import { RangerRequest } from "@/components/account/RangerRequest";
import { TripActions } from "@/components/account/TripActions";
import { SignOutButton } from "@/components/crm/SignOutButton";
import { getStaff } from "@/lib/auth";
import { photoThumb, placePhoto } from "@/lib/photos";
import { STATE_NAMES } from "@/lib/states";
import { supabaseServer } from "@/lib/supabase/server";
import { addDays, todayIST } from "@/lib/trip";
import { FORECAST_DAYS, getForecast, type DayForecast } from "@/lib/weather";
import { TripWeather, type TripWeatherDay } from "@/components/account/TripWeather";
// Small buttons and status pills (.btn-sm, .pl-pill) are shared with the planner.
import "@/components/plan/plan.css";
import "./account.css";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

type Tab = "trips" | "work" | "profile";
const fmt = (iso: string, o: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", o);
const REPORT_LEVEL: Record<string, Level> = { verified: "good", official: "good", pending: "warn", unverified: "none", rejected: "high" };
const SCENE_LABEL: Record<string, string> = { pending: "Pending review", published: "Published", rejected: "Rejected" };
const SCENE_LEVEL: Record<string, Level> = { published: "good", pending: "warn", rejected: "high" };

interface StopCheck { level: Level; text: string }

/** Today's check for one stop on one day: closures first, then crowding (adding the group if the trip isn't counted yet), then season. */
function checkStop(o: DestinationOverview | undefined, party: number, counted: boolean): StopCheck {
  if (!o) return { level: "none", text: "Not checked yet" };
  if (o.community_closed) return { level: "high", text: o.notice ?? "Closed by the community" };
  if (o.expected != null && o.capacity) {
    const lvl = pressureLevel((o.expected + (counted ? 0 : party)) / o.capacity);
    if (lvl === "high") return { level: "high", text: "Over capacity" };
    if (o.suitability === "poor") return { level: "high", text: "Poor season" };
    return { level: lvl, text: lvl === "warn" ? "Busy" : "Comfortable" };
  }
  if (o.suitability === "poor") return { level: "high", text: "Poor season" };
  return { level: "none", text: "Crowding not verified" };
}

export default async function Account({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await getStaff();
  if (!me) redirect("/login?next=/account");
  const { profile, role, can } = me;
  const isRanger = profile.role === "ranger";
  const pending = profile.requested_role === "ranger";
  const since = new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const today = todayIST();

  const sb = await supabaseServer();
  const [trips, reports, scenes, counts] = await Promise.all([
    sb.from("trips").select("id,title,start_date,end_date,party_size,status,trip_stops(id,day,position,destination_id,destinations(name,slug,state_code,cover_url,lat,lng))").order("start_date"),
    sb.from("reports").select("id,body,category,status,created_at,destinations(name,slug)").eq("author_id", profile.id).order("created_at", { ascending: false }).limit(30),
    sb.from("panoramas").select("id,title,status,frame_count,created_at,destinations(name,slug)").eq("author_id", profile.id).order("created_at", { ascending: false }).limit(20),
    sb.from("visitor_counts").select("day,visitors,source,destinations(name,slug)").eq("recorded_by", profile.id).order("day", { ascending: false }).limit(20),
  ]);
  const myTrips = trips.data ?? [];
  const myReports = reports.data ?? [];
  const myScenes = scenes.data ?? [];
  const myCounts = counts.data ?? [];
  const hasWork = isRanger || myReports.length > 0 || myScenes.length > 0 || myCounts.length > 0;

  const q = (await searchParams).tab;
  const tab: Tab = q === "profile" ? "profile" : q === "work" && hasWork ? "work" : "trips";

  // Check upcoming stops against each day's conditions (one overview per distinct day, capped).
  const upcoming = myTrips.filter((t) => t.end_date >= today && t.status !== "cancelled");
  const days = [...new Set(upcoming.flatMap((t) => t.trip_stops.map((s) => s.day)))].filter((d) => d >= today).sort().slice(0, 21);
  const overviews = tab === "trips"
    ? Object.fromEntries(await Promise.all(days.map(async (d) => {
        const { data } = await sb.rpc("destination_overview", { on_day: d });
        return [d, new Map((data ?? []).map((o) => [o.id, o]))] as const;
      })))
    : {};
  // Forecast for the first stop of each upcoming day (Open-Meteo, up to 16 days ahead), fetched once per place.
  const firstStops = upcoming.flatMap((t) => [...new Set(t.trip_stops.map((s) => s.day))].map((day) =>
    t.trip_stops.filter((s) => s.day === day).sort((a, b) => a.position - b.position)[0])).filter((s) => s.day >= today && s.destinations);
  const wxPlaces = [...new Map(firstStops.map((s) => [s.destination_id, s])).values()];
  const forecasts = tab === "trips"
    ? new Map(await Promise.all(wxPlaces.map(async (s) => {
        const days = firstStops.filter((x) => x.destination_id === s.destination_id).map((x) => x.day).sort();
        return [s.destination_id, await getForecast(s.destinations!.lat, s.destinations!.lng, days[0], days[days.length - 1], today)] as const;
      })))
    : new Map<string, Map<string, DayForecast>>();
  const forecastEnd = addDays(today, FORECAST_DAYS - 1);
  const past = myTrips.filter((t) => t.end_date < today || t.status === "cancelled").reverse();

  const tabs: { key: Tab; label: string; icon: "route" | "flag" | "user"; count?: number }[] = [
    { key: "trips", label: "My trips", icon: "route", count: myTrips.length },
    ...(hasWork ? [{ key: "work" as const, label: "Field work", icon: "flag" as const, count: myReports.length + myScenes.length }] : []),
    { key: "profile", label: "Profile", icon: "user" },
  ];

  return (
    <section aria-labelledby="acct-h">
      <div className="wrap acct">
        <div className="acct-top">
          <div className="sec-head">
            <span className="eyebrow">Your account</span>
            <h1 id="acct-h">{profile.full_name ? `Hi, ${profile.full_name.split(" ")[0]}.` : "Hi there."}</h1>
          </div>
          <nav className="acct-tabs" aria-label="Account sections">
            {tabs.map((t) => (
              <Link key={t.key} href={`/account?tab=${t.key}`} aria-current={tab === t.key ? "page" : undefined}>
                <Icon name={t.icon} />{t.label}{t.count ? <span className="acct-count">{t.count}</span> : null}
              </Link>
            ))}
          </nav>
        </div>

        {tab === "trips" && (
          <div className="acct-stack">
            <div className="acct-bar">
              <p>Saved trips start as drafts. <b>Confirm</b> one when you&rsquo;re going: your group then counts toward each place&rsquo;s expected visitors, which is what tourism authorities use to plan for crowding.</p>
              <Link className="btn btn-green" href="/planner"><Icon name="plus" />Plan a new trip</Link>
            </div>

            {upcoming.length === 0 && (
              <div className="acct-empty">
                <Icon name="route" />
                <b>No upcoming trips.</b>
                <span>Plan one in the planner and press <i>Save trip</i>. It shows up here, checked against each day&rsquo;s conditions.</span>
              </div>
            )}

            {upcoming.map((t) => {
              const confirmed = t.status === "planned";
              const n = Math.round((Date.parse(t.end_date) - Date.parse(t.start_date)) / 864e5) + 1;
              const byDay = Array.from({ length: n }, (_, i) => addDays(t.start_date, i)).map((day) => ({
                day,
                stops: t.trip_stops.filter((s) => s.day === day).sort((a, b) => a.position - b.position),
              }));
              const checks = t.trip_stops.map((s) => checkStop(overviews[s.day]?.get(s.destination_id), t.party_size, confirmed));
              const issues = checks.filter((c) => c.level === "high").length;
              // Weather panel: the first upcoming stop of each day (past days are left out).
              const wxDays: TripWeatherDay[] = byDay.filter(({ day }) => day >= today).map(({ day, stops }) => {
                const forecast = stops[0] ? forecasts.get(stops[0].destination_id)?.get(day) ?? null : null;
                return {
                  day, label: `Day ${byDay.findIndex((x) => x.day === day) + 1}`,
                  date: fmt(day, { weekday: "short", day: "numeric", month: "short" }),
                  place: stops[0]?.destinations?.name ?? null, forecast,
                  missing: forecast ? undefined : !stops[0] ? "free" : day > forecastEnd ? "later" : "unavailable",
                };
              });
              // The whole card carries the first stop's photo, like the planner's stop cards.
              const cover = byDay.flatMap((d) => d.stops).map((s) => s.destinations && placePhoto(s.destinations.slug, s.destinations.cover_url)).find(Boolean);
              return (
                <article key={t.id} className="trip" data-img={cover ? "" : undefined}
                  style={cover ? ({ "--img": `url("${photoThumb(cover, 1920)}")` } as React.CSSProperties) : undefined}>
                  <div className="trip-main">
                    <div className="trip-head">
                      <div>
                        <h2>{t.title}</h2>
                        <span className="trip-meta">
                          <span><Icon name="calendar" />{fmt(t.start_date)}{n > 1 && ` – ${fmt(t.end_date)}`} · {n} day{n > 1 ? "s" : ""}</span>
                          <span><Icon name="users" />{t.party_size} traveller{t.party_size > 1 ? "s" : ""}</span>
                        </span>
                      </div>
                      <div className="trip-status">
                        {confirmed
                          ? <span className="st verified">Confirmed · counts toward crowding</span>
                          : <span className="st pending">Draft · not counted yet</span>}
                        {issues > 0 && <span className="pl-pill l-high"><i />{issues} stop{issues > 1 ? "s" : ""} to rethink</span>}
                      </div>
                    </div>
                    <div className="trip-row">
                      <ol className="trip-days">
                        {byDay.map(({ day, stops }, i) => (
                          <li key={day}>
                            <span className="trip-day"><b>Day {i + 1}</b>{fmt(day, { weekday: "short", day: "numeric", month: "short" })}</span>
                            {stops.length ? (
                              <ul>
                                {stops.map((s) => {
                                  const c = checkStop(overviews[s.day]?.get(s.destination_id), t.party_size, confirmed);
                                  return (
                                    <li key={s.id}>
                                      <Link href={`/places/${s.destinations?.slug}`}>{s.destinations?.name ?? "A place"}</Link>
                                      <span className={`trip-check l-${c.level}`}><i />{c.text}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : <span className="trip-free">Free day</span>}
                          </li>
                        ))}
                      </ol>
                      <TripWeather days={wxDays} readoutSlot={`wx-${t.id}`} />
                    </div>
                    <div className="trip-foot">
                      <TripActions id={t.id} confirmed={confirmed} past={false} />
                      {/* the weather card's selected hour reads out here, beside the buttons */}
                      <span className="trip-wx-slot" id={`wx-${t.id}`} />
                    </div>
                  </div>
                </article>
              );
            })}

            {past.length > 0 && (
              <details className="acct-past">
                <summary>Past and cancelled trips ({past.length})</summary>
                <ul>
                  {past.map((t) => (
                    <li key={t.id}>
                      <b>{t.title}</b>
                      <span>{fmt(t.start_date)} – {fmt(t.end_date, { day: "numeric", month: "short", year: "numeric" })} · {t.trip_stops.length} stop{t.trip_stops.length === 1 ? "" : "s"}</span>
                      <TripActions id={t.id} confirmed={t.status === "planned"} past />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {tab === "work" && (
          <div className="acct-stack">
            <div className="acct-bar">
              <p>Your field work and where it is in review. File reports, 360 scenes and visitor counts from the <b>Trekne app</b>: it needs GPS, the camera and works offline.</p>
            </div>
            <div className="acct-kpis">
              {([["Verified", myReports.filter((r) => r.status === "verified" || r.status === "official").length, "good"],
                 ["Pending review", myReports.filter((r) => r.status === "pending").length, "warn"],
                 ["Rejected", myReports.filter((r) => r.status === "rejected").length, "high"],
                 ["360 scenes published", myScenes.filter((s) => s.status === "published").length, "good"]] as const).map(([k, v, l]) => (
                <div key={k} className="acct-kpi"><b className={`l-${l}`}>{v}</b><span>{k}</span></div>
              ))}
            </div>

            <div className="acct-cols">
              <div className="acct-card">
                <h2>Field reports</h2>
                {myReports.length ? (
                  <ul className="work-list">
                    {myReports.map((r) => (
                      <li key={r.id}>
                        <span className={`trip-check l-${REPORT_LEVEL[r.status] ?? "none"}`}><i />{REPORT_LABEL[r.status as keyof typeof REPORT_LABEL] ?? r.status}</span>
                        <p>{r.body}</p>
                        <span className="work-meta">{r.destinations?.name ?? "—"} · {r.category} · {fmt(r.created_at.slice(0, 10))}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="acct-muted">No reports yet.</p>}
              </div>
              <div className="acct-stack">
                <div className="acct-card">
                  <h2>360 scenes</h2>
                  {myScenes.length ? (
                    <ul className="work-list">
                      {myScenes.map((s) => (
                        <li key={s.id}>
                          <span className={`trip-check l-${SCENE_LEVEL[s.status] ?? "none"}`}><i />{SCENE_LABEL[s.status] ?? s.status}</span>
                          <p>{s.title || s.destinations?.name || "Untitled scene"}</p>
                          <span className="work-meta">{s.destinations?.name ?? "—"} · {s.frame_count} photos · {fmt(s.created_at.slice(0, 10))}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="acct-muted">No 360 scenes yet.</p>}
                </div>
                <div className="acct-card">
                  <h2>Visitor counts</h2>
                  {myCounts.length ? (
                    <table className="work-table">
                      <thead><tr><th>Day</th><th>Place</th><th>Visitors</th></tr></thead>
                      <tbody>
                        {myCounts.map((c) => (
                          <tr key={`${c.day}-${c.destinations?.slug}`}>
                            <td className="mono">{fmt(c.day)}</td><td>{c.destinations?.name ?? "—"}</td><td className="mono">{c.visitors.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="acct-muted">No visitor counts logged yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="acct-grid">
            <div className="acct-card">
              <dl className="acct-facts">
                <div><dt>Email</dt><dd>{profile.email}</dd></div>
                <div><dt>Role</dt><dd>{role.name}</dd></div>
                {profile.home_state && <div><dt>Home state</dt><dd>{STATE_NAMES[profile.home_state] ?? profile.home_state}</dd></div>}
                <div><dt>Member since</dt><dd>{since}</dd></div>
              </dl>
              {!profile.is_active && (
                <p className="acct-err"><Icon name="alert" />This account is deactivated. Contact the Trekne team if you think that&rsquo;s a mistake.</p>
              )}
              <div className="acct-row">
                {can("crm.access") && <Link className="btn btn-ink" href="/super/dashboard"><Icon name="chart" />Open the CRM</Link>}
                <SignOutButton className="btn btn-ghost" to="/" />
              </div>
            </div>

            <div className={`acct-card ${isRanger ? "is-ranger" : ""}`}>
              <span className="acct-ic"><Icon name="shield" /></span>
              {isRanger ? (
                <>
                  <h2>You&rsquo;re a Ranger.</h2>
                  <p>Field reports, 360 capture and visitor counts are in the Trekne app. Sign in there with this email and password. Track their review status under <Link href="/account?tab=work">Field work</Link>.</p>
                </>
              ) : pending ? (
                <>
                  <h2>Ranger request <span className="st pending">Pending review</span></h2>
                  <p>The Trekne team reviews requests in the CRM. Once approved, the Ranger tools unlock in the Trekne app.</p>
                  <div className="acct-row"><RangerRequest userId={profile.id} pending /></div>
                </>
              ) : profile.role === "traveller" ? (
                <>
                  <h2>Know a place well?</h2>
                  <p>Rangers report trail, road and crowd conditions from the field so travellers know before they go.</p>
                  <div className="acct-row">
                    <RangerRequest userId={profile.id} pending={false} />
                    <Link className="btn btn-ghost" href="/rangers">What Rangers do</Link>
                  </div>
                </>
              ) : (
                <>
                  <h2>{role.name}</h2>
                  <p>{role.description || "Your role is managed by the Trekne team."}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
