import Link from "next/link";
import { LEVEL_COLOR, SENSITIVITY_LEVEL, SUITABILITY_LABEL, SUITABILITY_LEVEL, brand, pressureLevel, type IconName } from "@trekne/brand";
import { Icon } from "@/components/Icon";
import { MapView, type MapPoint } from "@/components/crm/MapView";
import { LevelPill, PageHead, StatusPill, ago, fmtDate, fmtNum, todayIST } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

interface Stats {
  total_users: number;
  new_users_7d: number;
  users_by_role: { role: string; name: string; color: string; count: number }[];
  pending_reports: number;
  pending_panoramas: number;
  pending_requests: number;
  pending_proposals: number;
  upcoming_trips: number;
  waitlist: number;
  signups_30d: { day: string; n: number }[];
  reports_30d: { category: string; n: number }[];
}

export default async function Dashboard() {
  const staff = await requirePerm();
  const supabase = await supabaseServer();
  const today = todayIST();
  const in60 = new Date(Date.parse(today) + 60 * 864e5).toISOString().slice(0, 10);

  const [statsRes, overviewRes, eventsRes, reportsRes] = await Promise.all([
    staff.can("analytics.read") ? supabase.rpc("crm_stats") : Promise.resolve({ data: null }),
    supabase.rpc("destination_overview", { on_day: today }),
    supabase.from("events").select("id,name,community,state_code,starts_on,ends_on,visitor_impact,destination_id").eq("is_published", true)
      .gte("ends_on", today).lte("starts_on", in60).order("starts_on").limit(6),
    staff.can("reports.moderate")
      ? supabase.from("reports").select("id,body,category,status,source_label,created_at,destinations(name)").eq("status", "pending").order("created_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: null }),
  ]);
  const stats = statsRes.data as Stats | null;
  const overview = [...(overviewRes.data ?? [])].sort((a, b) => b.risk_score - a.risk_score);
  const names = new Map(overview.map((d) => [d.id, d.name]));

  const points: MapPoint[] = overview.map((d) => ({
    id: d.id, lat: d.lat, lng: d.lng, color: LEVEL_COLOR[d.risk_level] ?? brand.blue, title: d.name,
    body: `Risk ${d.risk_score} · ${d.expected == null ? "no count" : `${fmtNum(d.expected)} / ${fmtNum(d.capacity)} expected`}`,
    href: staff.can("destinations.manage") ? `/super/destinations/${d.id}` : undefined,
  }));

  const kpis: { k: string; v: number; d: string; icon: IconName; href?: string; attn?: boolean }[] = stats ? [
    { k: "Users", v: stats.total_users, d: `+${stats.new_users_7d} this week`, icon: "users", href: staff.can("users.read") ? "/super/users" : undefined },
    { k: "Reports to review", v: stats.pending_reports, d: "Ranger & traveller", icon: "shield", href: "/super/reports", attn: stats.pending_reports > 0 },
    { k: "360 scenes", v: stats.pending_panoramas, d: "awaiting review", icon: "sphere", href: "/super/scenes", attn: stats.pending_panoramas > 0 },
    { k: "Role requests", v: stats.pending_requests, d: "Ranger, community, business", icon: "id", href: "/super/users?tab=requests", attn: stats.pending_requests > 0 },
    { k: "Planned trips", v: stats.upcoming_trips, d: "upcoming", icon: "route", href: staff.can("trips.read_all") ? "/super/planning" : undefined },
    { k: "Waitlist", v: stats.waitlist, d: "sign-ups", icon: "chat", href: staff.can("waitlist.read") ? "/super/waitlist" : undefined },
  ] : [];

  const maxSign = Math.max(1, ...(stats?.signups_30d.map((s) => s.n) ?? [1]));
  const maxRole = Math.max(1, ...(stats?.users_by_role.map((r) => r.count) ?? [1]));
  const highRisk = overview.filter((d) => d.risk_level === "high").length;

  return (
    <>
      <PageHead
        title={`Hello, ${staff.profile.full_name.split(" ")[0] || "there"}`}
        sub={`${fmtDate(today)} · ${overview.length} destinations across the Northeast · ${highRisk} at high eco-risk today`}
      >
        <Link className="btn btn-ghost btn-sm" href="/super/map"><Icon name="map" />Open live map</Link>
      </PageHead>

      {kpis.length > 0 && (
        <div className="kpis">
          {kpis.map((k) => {
            const body = (<>
              <span className="k"><Icon name={k.icon} />{k.k}</span>
              <span className="v">{fmtNum(k.v)}</span>
              <span className="d">{k.d}</span>
            </>);
            return k.href
              ? <Link key={k.k} className={`kpi${k.attn ? " attn" : ""}`} href={k.href}>{body}</Link>
              : <div key={k.k} className="kpi">{body}</div>;
          })}
        </div>
      )}

      <div className="split" style={{ marginBottom: 14 }}>
        <section className="card">
          <div className="card-head"><h2>Eco-risk today</h2><p>Sensitivity + visitor load + season + verified issues</p></div>
          <MapView points={points} height={430} />
          <div className="legend">
            <span><i style={{ background: brand.green }} />Low (&lt;35)</span>
            <span><i style={{ background: brand.yellow }} />Moderate (35–59)</span>
            <span><i style={{ background: brand.orange }} />High (60+)</span>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>Festivals ahead</h2><p>Next 60 days</p></div>
          {eventsRes.data?.length ? (
            <ul className="list">
              {eventsRes.data.map((e) => (
                <li key={e.id}>
                  <Icon name="calendar" />
                  <div className="grow">
                    <b>{e.name}</b>
                    <div className="meta">
                      {fmtDate(e.starts_on)}{e.ends_on !== e.starts_on && ` – ${fmtDate(e.ends_on)}`} · {e.community} · {e.state_code}
                      {e.destination_id && names.get(e.destination_id) && ` · ${names.get(e.destination_id)}`}
                    </div>
                  </div>
                  <LevelPill level={SENSITIVITY_LEVEL[e.visitor_impact]} label={`${e.visitor_impact} impact`} />
                </li>
              ))}
            </ul>
          ) : <p className="empty">No festivals in the next 60 days.</p>}
        </section>
      </div>

      <section className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <h2>Pressure against carrying capacity</h2>
          <p>Expected = typical count for this weekday + planned trips · line marks capacity</p>
        </div>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr><th>Destination</th><th>Load today</th><th className="num">Expected</th><th className="num">Capacity</th><th>Season</th><th>Eco-risk</th></tr>
            </thead>
            <tbody>
              {overview.map((d) => {
                const lvl = pressureLevel(d.load_ratio);
                return (
                  <tr key={d.id}>
                    <td className="who">
                      {staff.can("destinations.manage") ? <Link href={`/super/destinations/${d.id}`}>{d.name}</Link> : <b>{d.name}</b>}
                      <span>{d.district} · {d.state_code}{d.is_lesser_known && " · lesser-known"}</span>
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div className="meter" title={d.load_ratio == null ? "No reliable count" : `${Math.round(d.load_ratio * 100)}% of capacity`}>
                        <i style={{ width: `${Math.min(100, ((d.load_ratio ?? 0) / 1.5) * 100)}%`, background: LEVEL_COLOR[lvl] ?? "transparent" }} />
                        <b />
                      </div>
                    </td>
                    <td className="num">{fmtNum(d.expected)}{d.planned > 0 && <small className="sub"> (+{d.planned} planned)</small>}</td>
                    <td className="num">{fmtNum(d.capacity)}</td>
                    <td>{d.suitability ? <LevelPill level={SUITABILITY_LEVEL[d.suitability]} label={SUITABILITY_LABEL[d.suitability]} /> : "—"}</td>
                    <td><LevelPill level={d.risk_level} label={`${d.risk_score} · ${d.risk_level === "high" ? "High" : d.risk_level === "warn" ? "Moderate" : "Low"}`} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid g-3">
        {stats && (
          <section className="card">
            <div className="card-head"><h2>Sign-ups</h2><p>Last 30 days</p></div>
            <div className="bars" role="img" aria-label={`Sign-ups over the last 30 days, ${stats.signups_30d.reduce((a, s) => a + s.n, 0)} in total`}>
              {stats.signups_30d.map((s) => (
                <span key={s.day} style={{ height: `${(s.n / maxSign) * 100}%` }} data-tip={`${fmtDate(s.day)} · ${s.n}`} />
              ))}
            </div>
            <div className="axis"><span>{fmtDate(stats.signups_30d[0]?.day ?? today)}</span><span>Today</span></div>
          </section>
        )}
        {stats && (
          <section className="card">
            <div className="card-head"><h2>Accounts by role</h2></div>
            <div className="hbars">
              {stats.users_by_role.map((r) => (
                <div className="hbar" key={r.role}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><i className="role-dot" style={{ background: r.color }} />{r.name}</span>
                  <div className="meter"><i style={{ width: `${(r.count / maxRole) * 100}%`, background: brand.blue }} /></div>
                  <span className="num">{r.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        {reportsRes.data && (
          <section className="card">
            <div className="card-head"><h2>Waiting for review</h2><Link className="sub" href="/super/reports">All reports →</Link></div>
            {reportsRes.data.length ? (
              <ul className="list">
                {reportsRes.data.map((r) => (
                  <li key={r.id}>
                    <div className="grow">
                      <b style={{ fontWeight: 600 }}>{r.body}</b>
                      <div className="meta">{r.destinations?.name} · {r.source_label} · {ago(r.created_at)}</div>
                    </div>
                    <StatusPill status={r.status} />
                  </li>
                ))}
              </ul>
            ) : <p className="empty">All caught up.</p>}
          </section>
        )}
      </div>
    </>
  );
}
