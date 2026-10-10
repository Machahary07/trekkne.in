import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { BusinessWaitlist } from "@/components/BusinessWaitlist";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "Homestays · coming soon",
  description: "Book verified family homestays near the places you visit in Northeast India. Coming soon to Trekne. Hosts can join the waitlist now.",
};

export default function HomestaysPage() {
  return (
    <>
      <ComingSoon
        id="homestays"
        color="var(--blue)"
        blob="var(--yellow)"
        title="Homestays, booked with the village."
        lede="Stay with local families near the places you’re visiting, and book them right inside your Trekne plan."
        cta="List your homestay"
        chips={[
          { icon: "shield", color: "var(--green)", label: "Hosts checked in person" },
          { icon: "rupee", color: "var(--yellow)", label: "Prices shown up front" },
        ]}
        features={[
          { icon: "shield", title: "Verified hosts", text: "Every homestay visited and checked before it’s listed." },
          { icon: "calendar", title: "Fits your plan", text: "Rooms near each stop, matched to your trip dates." },
          { icon: "leaf", title: "Stay where it helps", text: "Village stays over camping in places under pressure." },
        ]}
      />
      <BusinessWaitlist
        kind="homestay"
        title="Run a homestay? Get listed first."
        text="Leave your details and we’ll reach out before homestay bookings open in your area."
      />
      <JoinCta />
    </>
  );
}
