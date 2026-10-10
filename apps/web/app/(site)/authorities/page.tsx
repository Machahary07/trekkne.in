import type { Metadata } from "next";
import Link from "next/link";
import { pressureLevel, type IconName } from "@trekne/brand";
import { Icon } from "@/components/Icon";
import { PressureHeatmap } from "@/components/plan/PressureHeatmap";
import { NOTICE_LABEL, addDays, fmtDay, getCalendar, getNotices, getPressureGrid, getRecurringIssues, todayIST } from "@/lib/public-data";
import "@/components/plan/plan.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "For authorities & communities",
  description: "Visitor pressure against carrying capacity, recurring issues and suggested actions for tourism departments, planners and village councils in Northeast India.",
};

interface Action { icon: IconName; tone: "high" | "warn"; title: string; text: string; source: string }

const CATEGORY_WORD: Record<string, string> = {
  waste: "waste", crowd: "crowding", road: "road access", closure: "closures", wildlife: "wildlife", heritage: "heritage damage", trail: "trail condition",
};

export default async function AuthoritiesPage() {
  const today = todayIST();
  const [{ dates, grids }, issues, notices, { events }] = await Promise.all([getPressureGrid(14), getRecurringIssues(30), getNotices(), getCalendar()]);
  const now = grids[0] ?? [];

  const overToday = now.filter((o) => pressureLevel(o.load_ratio == null ? null : Number(o.load_ratio)) === "high").length;
  const highRisk = now.filter((o) => o.risk_level === "high").length;
  const festivals = events.filter((e) => e.starts_on <= addDays(today, 30)).length;

  // Rule-based suggestions from the same data planners see. Each names its evidence.
  const actions: Action[] = [];
  for (const p of now) {
    const hot = dates.filter((_, i) => {
      const o = grids[i]?.find((x) => x.id === p.id);
      return o && !o.community_closed && pressureLevel(o.load_ratio == null ? null : Number(o.load_ratio)) === "high";
    });
    if (hot.length >= 2) {
      actions.push({
        icon: "clock", tone: "high", title: `Timed entry slots at ${p.name}`,
        text: `Expected visitors pass the agreed capacity of ${p.capacity}/day on ${hot.length} of the next 14 days (${hot.slice(0, 3).map((d) => fmtDay(d, { weekday: "short", day: "numeric" })).join(", ")}${hot.length > 3 ? "…" : ""}). Release slots and point overflow to quieter places nearby.`,
        source: "Pressure forecast · counts simulated",
      });
    }
    if (p.suitability === "poor" && (p.expected ?? 0) > 0 && !p.community_closed) {
      actions.push({ icon: "rain", tone: "warn", title: `Seasonal advisory for ${p.name}`, text: "This is a poor month for access, yet visitors are still expected. Publish a seasonal advisory or restrict the riskiest stretches.", source: "Season calendar" });
    }
  }
  for (const i of issues.filter((x) => x.reports >= 2)) {
    actions.push({
      icon: i.category === "waste" ? "trash" : i.category === "road" ? "car" : "alert", tone: "warn",
      title: `Recurring ${CATEGORY_WORD[i.category] ?? i.category} at ${i.name}`,
      text: `${i.reports} verified reports in 30 days. ${i.category === "waste" ? "Add collection points and fund a village clean-up rota." : i.category === "crowd" ? "Stagger arrivals and add stewards at peak hours." : "Schedule a site inspection with the local council."}`,
      source: "Verified Ranger and official reports",
    });
  }
  for (const e of events.filter((x) => (x.visitor_impact === "high" || x.visitor_impact === "critical") && x.starts_on <= addDays(today, 45))) {
    actions.push({ icon: "calendar", tone: "warn", title: `Prepare for ${e.name}`, text: `High visitor impact from ${fmtDay(e.starts_on)}. Coordinate shuttles, waste stations and stewards with the ${e.community} community.`, source: "Festival calendar" });
  }

  return (
    <>
      <section aria-labelledby="auth-h">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">For authorities, planners & communities</span>
            <h1 id="auth-h" style={{ fontSize: "clamp(42px, 6vw, 80px)", fontWeight: 800 }}>See the pressure before it becomes damage.</h1>
            <p>
              The same data travellers plan with gives tourism departments and village councils a view across every site: who is
              coming, when places pass their carrying capacity, which problems keep returning, and what to do about it.
            </p>
          </div>

          <div className="kpis-row pl-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", marginBottom: 16 }}>
            {([
              ["pin", "Places tracked", now.length, "across the Northeast"],
              ["users", "Over capacity today", overToday, "expected ≥ 90% of capacity"],
              ["leaf", "High eco-risk today", highRisk, "score 60+ of 100"],
              ["flag", "Community notices", notices.length, "closures, sacred days, rules"],
              ["calendar", "Festivals in 30 days", festivals, "that change visitor flow"],
            ] as const).map(([icon, k, v, d]) => (
              <div key={k} className="pl-card" style={{ gap: 6 }}>
                <span className="pl-kicker"><Icon name={icon} />{k}</span>
                <span style={{ font: "800 40px/1 var(--display)", letterSpacing: "-.04em" }}>{v}</span>
                <span className="pl-mono">{d}</span>
              </div>
            ))}
          </div>

          <div className="pl-card" style={{ marginBottom: 16 }}>
            <div className="pl-between">
              <h3>Visitor pressure, next 14 days</h3>
              <span className="pl-mono">Expected visitors as % of each site&rsquo;s agreed daily capacity</span>
            </div>
            <PressureHeatmap dates={dates} grids={grids} />
          </div>

          <div className="pl-grid pl-2">
            <div className="pl-card">
              <h3>Suggested actions</h3>
              <p className="pl-sub">Generated from the forecast, the season calendar and verified reports. Each one shows its evidence.</p>
              <ul className="pl-list">
                {actions.slice(0, 8).map((a, i) => (
                  <li key={i}>
                    <span className="pl-ic" style={{ background: a.tone === "high" ? "var(--orange)" : "var(--yellow)" }}><Icon name={a.icon} /></span>
                    <div><b>{a.title}</b><p className="pl-sub" style={{ fontSize: 14 }}>{a.text}</p><span className="pl-mono">{a.source}</span></div>
                  </li>
                ))}
                {!actions.length && <li><Icon name="check" /><div>No action needed in the next two weeks.</div></li>}
              </ul>
            </div>
            <div className="pl-card">
              <h3>Verified issues, last 30 days</h3>
              <p className="pl-sub">Verified and official reports only, most frequent first. Unconfirmed traveller reports never count; two or more in a month become a suggested action.</p>
              <ul className="pl-list">
                {issues.slice(0, 8).map((i) => (
                  <li key={`${i.destination_id}-${i.category}`}>
                    <Icon name={i.category === "waste" ? "trash" : i.category === "road" ? "car" : i.category === "crowd" ? "users" : "alert"} />
                    <div>
                      <b><Link href={`/places/${i.slug}`} style={{ color: "inherit" }}>{i.name}</Link> · {CATEGORY_WORD[i.category] ?? i.category}</b>
                      <span className="pl-mono">{i.reports} report{i.reports === 1 ? "" : "s"} · last {fmtDay(i.last_at.slice(0, 10))} · {i.state_code}</span>
                    </div>
                  </li>
                ))}
                {!issues.length && <li><Icon name="check" /><div>No verified issues in the last 30 days.</div></li>}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="comm-h">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Community controls</span>
            <h2 id="comm-h">The village decides, and the platform listens.</h2>
            <p>
              Community stewards, approved by Trekne, use the app to declare closures and sacred days, set visitor rules and approve
              how their heritage is described. A closure goes live straight away: it marks the place closed, removes it from
              suggestions and warns every traveller with it in their plan.
            </p>
          </div>
          <div className="pl-grid pl-2" style={{ alignItems: "start" }}>
            <div className="pl-phone" aria-label="Preview of the community screen in the Trekne app">
              <div>
                <span className="pl-mono" style={{ color: "#586078" }}>Community · Nongriat Dorbar</span>
                <h4>Declare a notice</h4>
                <div className="mseg"><span>Sacred day</span><span>Closure</span><span>Rule</span></div>
                <div className="mc"><span style={{ color: "#586078" }}>Place</span><b>Double-Decker Root Bridge</b></div>
                <div className="mc"><span style={{ color: "#586078" }}>Dates</span><b>{fmtDay(addDays(today, 9), { weekday: "short", day: "numeric", month: "short" })}</b></div>
                <div className="mc"><span style={{ color: "#586078" }}>Message to visitors</span><b>Village prayer day: trail closed to visitors</b></div>
                <div className="mbtn">Publish to travellers</div>
                <div className="mc"><b>Heritage descriptions</b><span>Mawphlang Sacred Grove · <b style={{ color: "#1B8A4C" }}>Approved</b></span><span>Nartiang Monoliths · Awaiting your review</span></div>
              </div>
            </div>
            <div className="pl-card">
              <h3>Live community notices</h3>
              <ul className="pl-list">
                {notices.map((n) => (
                  <li key={n.id}>
                    <Icon name={n.kind === "closure" || n.kind === "sacred_day" ? "flag" : "info"} />
                    <div>
                      <b>{n.title}</b>
                      <span className="pl-mono">
                        {NOTICE_LABEL[n.kind]} · {n.destinations ? <Link href={`/places/${n.destinations.slug}`}>{n.destinations.name}</Link> : null} · {fmtDay(n.starts_on)}{n.ends_on !== n.starts_on ? `–${fmtDay(n.ends_on)}` : ""}
                      </span>
                      <span className="pl-mono">{n.community}</span>
                    </div>
                  </li>
                ))}
                {!notices.length && <li><Icon name="info" /><div>No notices in force.</div></li>}
              </ul>
              <p className="pl-note"><Icon name="shield" />Sample notices are illustrative. Real ones come from approved community stewards.</p>
              <div className="pl-row">
                <Link className="btn btn-ink btn-sm" href="/super"><Icon name="key" />Staff sign in</Link>
                <Link className="btn btn-ghost btn-sm" href="/#join">Request access for your department or council</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
