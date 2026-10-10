import { RolesBoard } from "@/components/crm/RolesBoard";
import { PageHead } from "@/components/crm/ui";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Roles() {
  await requirePerm("roles.manage");
  const supabase = await supabaseServer();
  const [{ data: roles }, { data: perms }, { data: profiles }] = await Promise.all([
    supabase.from("roles").select("*").order("rank", { ascending: false }),
    supabase.from("permissions").select("*").order("grp"),
    supabase.from("profiles").select("role"),
  ]);
  const counts: Record<string, number> = {};
  profiles?.forEach((p) => { counts[p.role] = (counts[p.role] ?? 0) + 1; });

  return (
    <>
      <PageHead title="Roles & permissions" sub="Roles are ranked: people can only manage roles and users below their own rank. Super admin is fixed." />
      <RolesBoard roles={roles ?? []} perms={perms ?? []} counts={counts} />
    </>
  );
}
