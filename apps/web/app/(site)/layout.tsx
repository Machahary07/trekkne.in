import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteStateProvider } from "@/components/SiteState";
import { ScrollToTop } from "@/components/ScrollToTop";

/** Public marketing pages: shared header, footer and site state. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteStateProvider>
      <ScrollToTop />
      <Header />
      <main id="top">{children}</main>
      <Footer />
    </SiteStateProvider>
  );
}
