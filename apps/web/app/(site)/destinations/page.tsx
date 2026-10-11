import type { Metadata } from "next";
import { JoinCta } from "@/components/JoinCta";
import { Explorer } from "@/components/explore/Explorer";
import { getExplore } from "@/lib/public-data";

// Always fresh: LiveRefresh re-renders this page when its data changes.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Every Trekne place across the eight Northeast states, with month-by-month seasons, today's eco-risk and crowding, community notices and festivals.",
};

export default async function DestinationsPage() {
  const { places, events, notices, reports } = await getExplore();

  return (
    <>
      <Explorer places={places} events={events} notices={notices} reports={reports} />
      <JoinCta />
    </>
  );
}
