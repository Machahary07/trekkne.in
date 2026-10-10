import type { Metadata } from "next";
import { Business } from "@/components/Business";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "For business",
  description: "Guide bookings, verified listings and destination dashboards for guides, homestays and operators in Northeast India.",
};

export default function BusinessPage() {
  return (
    <>
      <Business />
      <JoinCta />
    </>
  );
}
