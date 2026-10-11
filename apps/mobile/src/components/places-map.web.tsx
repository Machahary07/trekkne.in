import { View } from "react-native";
import type { DestinationOverview } from "@trekne/db";
import { useBrand } from "@/lib/theme";
import { Icon } from "./icon";
import { T } from "./ui";

/** react-native-maps has no web build; the map lives on trekne.in/destinations for browsers. */
export function PlacesMap({ places }: { places: DestinationOverview[]; onOpen: (slug: string) => void }) {
  const b = useBrand();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 }}>
      <Icon name="map" size={40} color={b.muted} />
      <T v="h3">Map is in the phone app</T>
      <T muted style={{ textAlign: "center" }}>{places.length} places · open trekne.in/destinations for the web map.</T>
    </View>
  );
}
