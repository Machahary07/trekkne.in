import type { Metadata } from "next";
import { DestinationIntel } from "@/components/DestinationIntel";
import { Pillars } from "@/components/Pillars";
import { JoinCta } from "@/components/JoinCta";
import { getDestinations } from "@/lib/destinations";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Destinations",
  description: "Ranger-verified trail, weather, access and cultural conditions for Trekne's pilot destinations in Meghalaya.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <>
      <DestinationIntel destinations={destinations} />
      <Pillars />
      <JoinCta />
    </>
  );
}
