import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Bento } from "@/components/Bento";
import { HowItWorks } from "@/components/HowItWorks";
import { DestinationIntel } from "@/components/DestinationIntel";
import { Pillars } from "@/components/Pillars";
import { Rangers } from "@/components/Rangers";
import { OurPromise } from "@/components/OurPromise";
import { Business } from "@/components/Business";
import { Roadmap } from "@/components/Roadmap";
import { JoinCta } from "@/components/JoinCta";
import { Footer } from "@/components/Footer";
import { SiteStateProvider } from "@/components/SiteState";
import { getDestinations } from "@/lib/destinations";

export default async function Home() {
  const destinations = await getDestinations();

  return (
    <SiteStateProvider>
      <Header />
      <main id="top">
        <Hero destinations={destinations} />
        <Bento />
        <HowItWorks />
        <DestinationIntel destinations={destinations} />
        <Pillars />
        <Rangers />
        <OurPromise />
        <Business />
        <Roadmap />
        <JoinCta />
      </main>
      <Footer />
    </SiteStateProvider>
  );
}
