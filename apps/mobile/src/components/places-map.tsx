import MapView, { Marker } from "react-native-maps";
import { LEVEL_COLOR, brand } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";
import { verdict } from "@/lib/glance";

/** Native map of places, pins coloured by today's verdict. */
export function PlacesMap({ places, onOpen }: { places: DestinationOverview[]; onOpen: (slug: string) => void }) {
  return (
    <MapView style={{ flex: 1 }} initialRegion={{ latitude: 25.9, longitude: 92.9, latitudeDelta: 7.5, longitudeDelta: 7.5 }}>
      {places.map((d) => (
        <Marker key={d.id} coordinate={{ latitude: d.lat, longitude: d.lng }} title={d.name} description={verdict(d).title}
          pinColor={LEVEL_COLOR[verdict(d).level] ?? brand.blue} onCalloutPress={() => onOpen(d.slug)} />
      ))}
    </MapView>
  );
}
