import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteStateProvider } from "@/components/SiteState";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthHashRedirect } from "@/components/AuthHashRedirect";
import { LiveRefresh } from "@/components/LiveRefresh";

// Public data that drives what visitors see. Anyone can subscribe; RLS limits rows to published ones.
const LIVE_TABLES = ["destinations", "seasonal_conditions", "indicators", "recommendations", "visitor_counts", "heritage_sites", "events", "reports", "panoramas", "community_notices"];

/** Public marketing pages: shared header, footer and site state. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteStateProvider>
      <ScrollToTop />
      <AuthHashRedirect />
      <LiveRefresh tables={LIVE_TABLES} />
      <Header />
      <main id="top">{children}</main>
      <Footer />
    </SiteStateProvider>
  );
}
