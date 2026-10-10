import type { Metadata } from "next";
import "./crm.css";

export const metadata: Metadata = { title: "Super", robots: { index: false, follow: false } };

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  return children;
}
