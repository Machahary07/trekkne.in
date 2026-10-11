import type { ImageSourcePropType } from "react-native";

/**
 * Place photos, bundled at phone size (900px). Same Wikimedia Commons photos as the website
 * (apps/web/lib/photos.ts, which holds the full credits and source links). CC BY / CC BY-SA:
 * show `credit` + `license` wherever a photo is shown large.
 */
export interface PlacePhoto { src: ImageSourcePropType; alt: string; credit: string; license: string }

export const PHOTOS: Record<string, PlacePhoto> = {
  "nongriat": { src: require("@/assets/places/nongriat.jpg"), alt: "The two-level living root bridge at Nongriat spanning a rocky stream in dense forest", credit: "Vinayak Hegde", license: "CC BY 2.0" },
  "nohkalikai": { src: require("@/assets/places/nohkalikai.jpg"), alt: "Nohkalikai Falls plunging from a forested cliff into a turquoise pool far below", credit: "Vikramjit Kakati", license: "CC BY-SA 4.0" },
  "dawki": { src: require("@/assets/places/dawki.jpg"), alt: "A wooden boat on the still green Umngot river near Dawki, with a suspension bridge and forested banks behind", credit: "Vikramjit Kakati", license: "CC BY-SA 4.0" },
  "majuli": { src: require("@/assets/places/majuli.jpg"), alt: "Sunset over the Brahmaputra at Majuli, with fishing nets and a line of trees reflected in still water", credit: "Udit Kapoor", license: "CC BY-SA 4.0" },
  "kaziranga": { src: require("@/assets/places/kaziranga.jpg"), alt: "A one-horned rhinoceros walking through tall grass in Kaziranga National Park", credit: "Tisha Mukherjee", license: "CC BY-SA 4.0" },
  "ziro": { src: require("@/assets/places/ziro.jpg"), alt: "Paddy fields and wet meadows in the Ziro valley under a bright sky with pine-covered hills", credit: "Arunachal2007", license: "CC BY-SA 4.0" },
  "tawang": { src: require("@/assets/places/tawang.jpg"), alt: "Tawang Monastery spread along a forested ridge below a tall mountain peak", credit: "Chandrasen31", license: "CC BY-SA 4.0" },
  "dzukou": { src: require("@/assets/places/dzukou.jpg"), alt: "Rolling green hills of the Dzükou Valley under low cloud", credit: "Samudra Bikash Hazarika (edit by UnpetitproleX)", license: "CC BY-SA 4.0" },
  "khonoma": { src: require("@/assets/places/khonoma.jpg"), alt: "Khonoma village built along a hilltop, surrounded by forested mountains", credit: "Joli Rumi", license: "CC BY-SA 4.0" },
  "loktak": { src: require("@/assets/places/loktak.jpg"), alt: "A wooded island rising from the calm water of Loktak Lake", credit: "ch_15march", license: "CC BY 2.0" },
  "phawngpui": { src: require("@/assets/places/phawngpui.jpg"), alt: "Golden grass, rock pools and scattered trees on Phawngpui, the Blue Mountain", credit: "Garima Singh", license: "CC BY-SA 4.0" },
  "unakoti": { src: require("@/assets/places/unakoti.jpg"), alt: "Large rock-cut faces and figures carved into a mossy hillside at Unakoti", credit: "Dr. Srimanta Ray", license: "CC BY-SA 4.0" },
  "tsomgo": { src: require("@/assets/places/tsomgo.jpg"), alt: "Snow-dusted mountains reflected in the still water of Tsomgo Lake", credit: "Kuldeepburjbhalaike", license: "CC BY-SA 4.0" },
  "krang-suri": { src: require("@/assets/places/krang-suri.jpg"), alt: "Krang Suri waterfall pouring over a rock ledge into a turquoise pool", credit: "ANKAN", license: "CC BY-SA 4.0" },
  "laitlum": { src: require("@/assets/places/laitlum.jpg"), alt: "Layered green ridges and deep gorges seen from the edge of Laitlum Canyon", credit: "ANKAN", license: "CC BY-SA 4.0" },
};

export const photoFor = (slug: string | null | undefined): PlacePhoto | null => (slug ? PHOTOS[slug] ?? null : null);
