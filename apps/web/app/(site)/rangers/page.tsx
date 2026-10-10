import type { Metadata } from "next";
import { Rangers } from "@/components/Rangers";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "Rangers",
  description: "Become a Trekne Ranger: local guides who report trail conditions and earn through bookings and verified reports.",
};

export default function RangersPage() {
  return (
    <>
      <Rangers />
      <JoinCta />
    </>
  );
}
