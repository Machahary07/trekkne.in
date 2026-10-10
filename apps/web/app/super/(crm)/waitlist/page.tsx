import { PageHead, ago } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Waitlist() {
  await requirePerm("waitlist.read");
  const supabase = await supabaseServer();
  const { data } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false }).limit(500);
  return (
    <>
      <PageHead title="Waitlist" sub={`${data?.length ?? 0} sign-ups from the "Join the list" form on trekne.in.`} />
      <section className="card">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Contact</th><th>I am</th><th>Joined</th></tr></thead>
            <tbody>
              {data?.map((w) => (
                <tr key={w.id}><td><b>{w.contact}</b></td><td style={{ textTransform: "capitalize" }}>{w.role}</td><td className="sub">{ago(w.created_at)}</td></tr>
              ))}
            </tbody>
          </table>
          {!data?.length && <p className="empty">No sign-ups yet.</p>}
        </div>
      </section>
    </>
  );
}
