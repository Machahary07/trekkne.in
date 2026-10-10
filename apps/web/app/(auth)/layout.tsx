import type { Metadata } from "next";
// Same split-screen sign-in styles as the /super staff login.
import "../super/crm.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
