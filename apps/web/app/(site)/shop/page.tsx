import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { BusinessWaitlist } from "@/components/BusinessWaitlist";
import { JoinCta } from "@/components/JoinCta";

export const metadata: Metadata = {
  title: "Shop local markets · coming soon",
  description: "Find local markets, makers and produce in Northeast India. Coming soon to Trekne. Shops and makers can join the waitlist now.",
};

export default function ShopPage() {
  return (
    <>
      <ComingSoon
        id="shop"
        color="var(--yellow)"
        blob="var(--orange)"
        title="Shop the local market, straight from the makers."
        lede="Crafts, produce and market days from the places on your trip, so more of what you spend stays local."
        cta="List your shop"
        chips={[
          { icon: "calendar", color: "var(--blue)", label: "Market days on your route" },
          { icon: "store", color: "var(--green)", label: "Straight from the maker" },
        ]}
        features={[
          { icon: "calendar", title: "Market days", text: "Which weekly markets are on while you’re there." },
          { icon: "store", title: "Local makers", text: "Weavers, growers and craftspeople near each stop." },
          { icon: "rupee", title: "Fair to makers", text: "Clear prices, with the money going to the maker." },
        ]}
      />
      <BusinessWaitlist
        kind="shop"
        title="Sell locally? Get listed first."
        text="Market stalls, makers and small shops: leave your details and we’ll reach out before the shop opens."
      />
      <JoinCta />
    </>
  );
}
