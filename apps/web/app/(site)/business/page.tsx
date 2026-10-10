import type { Metadata } from "next";
import { Business } from "@/components/Business";
import { BusinessWaitlist } from "@/components/BusinessWaitlist";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "For business",
  description: "Guide bookings, verified listings and destination dashboards for guides, homestays and operators in Northeast India.",
};

export default function BusinessPage() {
  return (
    <>
      <Business />
      <BusinessWaitlist
        title="List your business."
        text="Homestays, shops, guides and operators: leave your details and we’ll reach out before listings open in your area."
      />
      <JoinCta />
    </>
  );
}
