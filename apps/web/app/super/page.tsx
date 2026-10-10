import { redirect } from "next/navigation";
import { Eyes, LogoMark } from "@/components/Eyes";
import { LoginForm } from "@/components/crm/LoginForm";
import { SignOutButton } from "@/components/crm/SignOutButton";
import { getStaff } from "@/lib/auth";

export default async function SuperLogin({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const staff = await getStaff();
  const target = next?.startsWith("/super/") ? next : "/super/dashboard";
  if (staff?.can("crm.access")) redirect(target);

  return (
    <div className="auth">
      <div className="auth-art">
        <span className="logo"><LogoMark />trekne</span>
        <div>
          <h2>Plan it <span>with care.</span></h2>
          <p style={{ marginTop: 16 }}>
            Moderation, carrying capacity, heritage protocols and people, for the teams who look after Northeast India&rsquo;s places.
          </p>
        </div>
        <Eyes />
      </div>
      <div className="auth-form">
        {staff ? (
          <div style={{ width: "min(400px, 100%)", display: "grid", gap: 14 }}>
            <h1>No CRM access</h1>
            <p className="sub" style={{ fontSize: 16 }}>
              You&rsquo;re signed in as <b>{staff.profile.email}</b> with the <b>{staff.role.name}</b> role, which can&rsquo;t open the CRM.
              Ask an admin to change your role or send you a staff invite.
            </p>
            <SignOutButton className="btn btn-ink" />
          </div>
        ) : (
          <LoginForm next={target} linkError={error === "link"} />
        )}
      </div>
    </div>
  );
}
