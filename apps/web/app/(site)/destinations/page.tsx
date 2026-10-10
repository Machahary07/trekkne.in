import type { Metadata } from "next";
import { DestinationIntel } from "@/components/DestinationIntel";
import { Pillars } from "@/components/Pillars";
import { JoinCta } from "@/components/JoinCta";
import { getDestinations } from "@/lib/destinations";
import { AllPlaces } from "@/components/plan/AllPlaces";
import { SeasonCalendar } from "@/components/plan/SeasonCalendar";
import { getCalendar, getOverview } from "@/lib/public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Destinations",
  description: "Ranger-verified conditions for Trekne's Meghalaya pilot, plus carrying capacity, seasons and festivals for places across all eight Northeast states.",
};

export default async function DestinationsPage() {
  const [destinations, overview, { events, seasons, places }] = await Promise.all([getDestinations(), getOverview(), getCalendar()]);

  return (
    <>
      <DestinationIntel destinations={destinations} />
      {overview.length > 0 && <AllPlaces overview={overview} />}
      {places.length > 0 && <SeasonCalendar places={places} seasons={seasons} events={events} />}
      <Pillars />
      <JoinCta />
    </>
  );
}
