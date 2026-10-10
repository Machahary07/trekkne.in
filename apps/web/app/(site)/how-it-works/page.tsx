import type { Metadata } from "next";
import { HowItWorks } from "@/components/HowItWorks";
import { OurPromise } from "@/components/OurPromise";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "How it works",
  description: "How a Ranger's field report is logged, verified and turned into a travel advisory on Trekne.",
};

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <OurPromise />
      <JoinCta />
    </>
  );
}
