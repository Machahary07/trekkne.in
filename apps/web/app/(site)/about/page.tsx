import type { Metadata } from "next";
import { AboutHero } from "@/components/AboutHero";
import { HowItWorks } from "@/components/HowItWorks";
import { OurPromise } from "@/components/OurPromise";
import { Roadmap } from "@/components/Roadmap";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "About Trekne",
  description: "What Trekne is, who it's for, and how a Ranger's field report is verified and turned into a travel advisory.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <HowItWorks />
      <OurPromise />
      <Roadmap />
      <JoinCta />
    </>
  );
}
