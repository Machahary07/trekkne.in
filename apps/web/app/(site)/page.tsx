import { Hero } from "@/components/Hero";
import { Bento } from "@/components/Bento";
import { HowItWorks } from "@/components/HowItWorks";
import { HomeIntel } from "@/components/HomeIntel";
import { Pillars } from "@/components/Pillars";
import { Rangers } from "@/components/Rangers";
import { OurPromise } from "@/components/OurPromise";
import { Business } from "@/components/Business";
import { Roadmap } from "@/components/Roadmap";
import { JoinCta } from "@/components/JoinCta";
import { getDestinations } from "@/lib/destinations";
import { getExplore } from "@/lib/public-data";

export const revalidate = 300;

export default async function Home() {
  const [destinations, { places, events }] = await Promise.all([getDestinations(), getExplore()]);

  return (
    <>
      <Hero destinations={destinations} />
      <Bento />
      <HowItWorks />
      <HomeIntel places={places} events={events} />
      <Pillars />
      <Rangers />
      <OurPromise />
      <Business />
      <Roadmap />
      <JoinCta />
    </>
  );
}
