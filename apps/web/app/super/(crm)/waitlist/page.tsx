import { PageHead, ago } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Waitlist() {
  await requirePerm("waitlist.read");
  const supabase = await supabaseServer();
  const { data } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false }).limit(500);
  return (
    <>
      <PageHead title="Waitlist" sub={`${data?.length ?? 0} sign-ups from the waitlist forms on trekne.in.`} />
      <section className="card">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Contact</th><th>I am</th><th>Business</th><th>Joined</th></tr></thead>
            <tbody>
              {data?.map((w) => (
                <tr key={w.id}>
                  <td>
                    {w.name && <b>{w.name}</b>}
                    <div className={w.name ? "sub" : undefined}>{w.email && w.phone ? `${w.email} · ${w.phone}` : w.contact}</div>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{w.role}</td>
                  <td>{w.business ? <>{w.business}{w.kind && <div className="sub" style={{ textTransform: "capitalize" }}>{w.kind}</div>}</> : <span className="sub">—</span>}</td>
                  <td className="sub">{ago(w.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.length && <p className="empty">No sign-ups yet.</p>}
        </div>
      </section>
    </>
  );
}
