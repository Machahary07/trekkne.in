import { PageHead, ago } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Audit() {
  await requirePerm("users.manage");
  const supabase = await supabaseServer();
  const { data } = await supabase.from("audit_log").select("id,action,target,detail,created_at,actor:profiles(full_name,email)").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageHead title="Audit log" sub="Role changes, invites, deactivations and role edits. Written by the database, so it can't be edited from the CRM." />
      <section className="card">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>
            <tbody>
              {data?.map((a) => (
                <tr key={a.id}>
                  <td className="sub" style={{ whiteSpace: "nowrap" }}>{ago(a.created_at)}</td>
                  <td>{a.actor?.full_name || a.actor?.email || "system"}</td>
                  <td><span className="pill">{a.action}</span></td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{a.target}</td>
                  <td className="mono sub" style={{ fontSize: 12 }}>{JSON.stringify(a.detail)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.length && <p className="empty">Nothing yet.</p>}
        </div>
      </section>
    </>
  );
}
