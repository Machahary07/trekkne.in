import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eyes, LogoMark } from "@/components/Eyes";
import { AccountLoginForm } from "@/components/account/AccountLoginForm";
import { getStaff } from "@/lib/auth";
import { safeNext } from "@/lib/landing";

export const metadata: Metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; as?: string; mode?: string; error?: string }> }) {
  const { next, as, mode, error } = await searchParams;
  if (await getStaff()) redirect(safeNext(next) ?? "/account");

  return (
    <div className="auth">
      <div className="auth-art">
        <Link className="logo" href="/" aria-label="Trekne home"><LogoMark />trekne</Link>
        <div>
          <h2>Know before <span>you go.</span></h2>
          <p style={{ marginTop: 16 }}>
            Travellers plan trips that check every stop against crowding, season and community closures. Rangers report
            conditions from the field so everyone else knows before they go.
          </p>
        </div>
        <Eyes />
      </div>
      <div className="auth-form">
        <AccountLoginForm
          key={`${mode}-${as}`}
          next={safeNext(next)}
          initialAs={as === "ranger" ? "ranger" : "traveller"}
          initialMode={mode === "up" ? "up" : "in"}
          linkError={error === "link"}
        />
      </div>
    </div>
  );
}
