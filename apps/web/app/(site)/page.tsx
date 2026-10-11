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
import { DoodleStrip } from "@/components/Doodles";
import { PlaceStrip } from "@/components/PlaceStrip";
import { getDestinations } from "@/lib/destinations";
import { getExplore } from "@/lib/public-data";

export const revalidate = 300;

export default async function Home() {
  const [destinations, { places, events }] = await Promise.all([getDestinations(), getExplore()]);

  return (
    <>
      <Hero destinations={destinations} />
      <PlaceStrip places={places} />
      <DoodleStrip band="aronai" items={["hornbill", "japi", "cherry", "gamosa", "dhol", "orchid", "rhino"]} />
      <Bento />
      <DoodleStrip band="naga" items={["flags", "gompa", "cloud", "tea", "bamboo"]} />
      <HowItWorks />
      <DoodleStrip band="gamosa" items={["mithun", "shawl", "headgear", "gate", "xorai"]} />
      <HomeIntel places={places} events={events} />
      <DoodleStrip band="puan" items={["cherry", "aronai", "pepa", "orchid", "japi"]} />
      <Pillars />
      <DoodleStrip band="moirang" items={["rhino", "bamboo", "hornbill", "tea", "gamosa"]} />
      <Rangers />
      <DoodleStrip band="dakmanda" items={["xorai", "dhol", "cloud", "aronai", "mithun"]} />
      <OurPromise />
      <DoodleStrip band="naga" items={["gate", "headgear", "flags", "shawl", "gompa"]} />
      <Business />
      <DoodleStrip band="gamosa" items={["petals", "cherry", "japi", "pepa", "orchid"]} />
      <Roadmap />
      <JoinCta />
    </>
  );
}
