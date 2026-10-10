import { UsersBoard } from "@/components/crm/UsersBoard";
import { PageHead } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Users({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; role?: string }> }) {
  const staff = await requirePerm("users.read");
  const { tab = "all", q, role } = await searchParams;
  const supabase = await supabaseServer();

  let query = supabase.from("profiles").select("id,email,full_name,phone,role,requested_role,is_active,home_state,created_at").order("created_at", { ascending: false }).limit(200);
  if (tab === "requests") query = query.not("requested_role", "is", null);
  if (role) query = query.eq("role", role);
  if (q) query = query.or(`full_name.ilike.%${q.replace(/[,()]/g, "")}%,email.ilike.%${q.replace(/[,()]/g, "")}%`);

  const [{ data: users }, { data: roles }, invites] = await Promise.all([
    query,
    supabase.from("roles").select("key,name,color,rank").order("rank", { ascending: false }),
    staff.can("users.manage") ? supabase.from("staff_invites").select("*").order("created_at", { ascending: false }) : Promise.resolve({ data: null }),
  ]);

  return (
    <>
      <PageHead title="Users" sub="Every account across the app, website and CRM. You can manage people and grant roles below your own rank." />
      <UsersBoard
        tab={tab === "requests" || tab === "invites" ? tab : "all"}
        q={q ?? ""}
        roleFilter={role ?? ""}
        users={users ?? []}
        roles={roles ?? []}
        invites={invites.data ?? []}
        me={{ id: staff.profile.id, rank: staff.role.rank, isSuper: staff.can("*"), canManage: staff.can("users.manage") }}
      />
    </>
  );
}
