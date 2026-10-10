import { Shell, type NavItem } from "@/components/crm/Shell";
import { requirePerm } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const staff = await requirePerm();
  const supabase = await supabaseServer();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;

  const [pendingReports, pendingScenes, requests] = await Promise.all([
    staff.can("reports.moderate") ? count(supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending")) : 0,
    staff.can("reports.moderate") ? count(supabase.from("panoramas").select("id", { count: "exact", head: true }).eq("status", "pending")) : 0,
    staff.can("users.manage") ? count(supabase.from("profiles").select("id", { count: "exact", head: true }).not("requested_role", "is", null)) : 0,
  ]);

  const all: (NavItem & { perm?: string })[] = [
    { group: "Overview", href: "/super/dashboard", label: "Dashboard", icon: "chart" },
    { group: "Overview", href: "/super/map", label: "Live map", icon: "map" },
    { group: "Planning", href: "/super/destinations", label: "Destinations", icon: "pin", perm: "destinations.manage" },
    { group: "Planning", href: "/super/planning", label: "Visitor pressure", icon: "users", perm: "trips.read_all" },
    { group: "Planning", href: "/super/events", label: "Festivals & events", icon: "calendar", perm: "events.manage" },
    { group: "Planning", href: "/super/heritage", label: "Heritage sites", icon: "temple", perm: "heritage.manage" },
    { group: "Planning", href: "/super/notices", label: "Community notices", icon: "flag", perm: "destinations.manage" },
    { group: "Field", href: "/super/reports", label: "Reports", icon: "shield", perm: "reports.moderate", count: pendingReports },
    { group: "Field", href: "/super/scenes", label: "360 scenes", icon: "sphere", perm: "reports.moderate", count: pendingScenes },
    { group: "People", href: "/super/users", label: "Users", icon: "user", perm: "users.read", count: requests },
    { group: "People", href: "/super/roles", label: "Roles", icon: "key", perm: "roles.manage" },
    { group: "People", href: "/super/waitlist", label: "Waitlist", icon: "chat", perm: "waitlist.read" },
    { group: "People", href: "/super/audit", label: "Audit log", icon: "db", perm: "users.manage" },
  ];
  const nav = all.filter((n) => !n.perm || staff.can(n.perm)).map(({ perm: _perm, ...n }) => n);

  return (
    <Shell nav={nav} me={{ name: staff.profile.full_name || staff.profile.email || "Staff", email: staff.profile.email ?? "", role: staff.role.name, color: staff.role.color }}>
      {children}
    </Shell>
  );
}
