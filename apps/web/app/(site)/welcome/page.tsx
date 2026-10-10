import type { Metadata } from "next";
import Link from "next/link";
import { Eyes } from "@/components/Eyes";
import { Icon } from "@/components/Icon";
import "@/components/plan/plan.css";

export const metadata: Metadata = { title: "Email confirmed", robots: { index: false } };

export default function Welcome() {
  return (
    <section aria-labelledby="welcome-h">
      <div className="wrap">
        <div className="pl-hero" style={{ minHeight: 360, alignContent: "center" }}>
          <Eyes />
          <h1 id="welcome-h">You&rsquo;re in.</h1>
          <p>Your email is confirmed. Go back to the Trekne app and sign in with the same email and password to start planning.</p>
          <div className="pl-row">
            <Link className="btn btn-ink" href="/planner"><Icon name="route" />Try the planner on the web</Link>
            <Link className="btn btn-ghost" href="/destinations">Browse places</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
