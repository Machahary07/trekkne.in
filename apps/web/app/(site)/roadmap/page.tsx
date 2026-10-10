import type { Metadata } from "next";
import { Roadmap } from "@/components/Roadmap";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Trekne's roadmap: a Meghalaya pilot first, then all eight states of Northeast India.",
};

export default function RoadmapPage() {
  return (
    <>
      <Roadmap />
      <JoinCta />
    </>
  );
}
