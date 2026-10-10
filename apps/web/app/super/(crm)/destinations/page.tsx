import Link from "next/link";
import { SENSITIVITY_LEVEL } from "@trekne/brand";
import { Icon } from "@/components/Icon";
import { LevelPill, PageHead, fmtNum, todayIST } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Destinations({ searchParams }: { searchParams: Promise<{ state?: string; q?: string }> }) {
  await requirePerm("destinations.manage");
  const { state, q } = await searchParams;
  const supabase = await supabaseServer();
  let query = supabase.from("destinations").select("id,slug,name,state_code,district,kind,sensitivity,carrying_capacity,is_published,is_lesser_known,updated_at").order("state_code").order("name");
  if (state) query = query.eq("state_code", state);
  if (q) query = query.ilike("name", `%${q}%`);
  const [{ data: rows }, { data: states }, { data: overview }] = await Promise.all([
    query,
    supabase.from("states").select("code,name").order("sort"),
    supabase.rpc("destination_overview", { on_day: todayIST() }),
  ]);
  const risk = new Map((overview ?? []).map((o) => [o.id, o]));

  return (
    <>
      <PageHead title="Destinations" sub="Profiles, carrying capacity, seasons and protocols. Changes show in the app and on trekne.in.">
        <Link className="btn btn-ink btn-sm" href="/super/destinations/new"><Icon name="plus" />New destination</Link>
      </PageHead>
      <section className="card">
        <form className="toolbar">
          <input className="input" name="q" placeholder="Search by name" defaultValue={q} />
          <select className="select" name="state" defaultValue={state ?? ""}>
            <option value="">All 8 states</option>
            {states?.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" type="submit"><Icon name="filter" />Filter</button>
        </form>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Name</th><th>Type</th><th>Sensitivity</th><th className="num">Capacity / day</th><th>Eco-risk today</th><th>Status</th></tr></thead>
            <tbody>
              {rows?.map((d) => {
                const o = risk.get(d.id);
                return (
                  <tr key={d.id}>
                    <td className="who"><Link href={`/super/destinations/${d.id}`}>{d.name}</Link><span>{d.district} · {d.state_code}{d.is_lesser_known && " · lesser-known"}</span></td>
                    <td style={{ textTransform: "capitalize" }}>{d.kind}</td>
                    <td><LevelPill level={SENSITIVITY_LEVEL[d.sensitivity]} label={d.sensitivity} /></td>
                    <td className="num">{fmtNum(d.carrying_capacity)}</td>
                    <td>{o ? <LevelPill level={o.risk_level} label={String(o.risk_score)} /> : <span className="sub">Unpublished</span>}</td>
                    <td>{d.is_published ? <span className="pill st-published"><i />Published</span> : <span className="pill"><i />Draft</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows?.length && <p className="empty">No destinations match.</p>}
        </div>
      </section>
    </>
  );
}
