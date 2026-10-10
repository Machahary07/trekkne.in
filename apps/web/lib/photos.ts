/**
 * Bundled place photos from Wikimedia Commons, all freely licensed. CC BY and CC BY-SA require attribution, so
 * anywhere a photo is shown large (the explorer detail panel) also shows `credit` + `license` linking to `sourceUrl`.
 * A photo set in the CRM (`destinations.cover_url`) takes precedence.
 */
export interface PlacePhoto {
  src: string;
  alt: string;
  credit: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

const CC_BY_2 = "https://creativecommons.org/licenses/by/2.0/";
const CC_BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0/";
const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const PHOTOS: Record<string, PlacePhoto> = {
  nongriat: {
    src: "/destinations/nongriat.jpg", alt: "The two-level living root bridge at Nongriat spanning a rocky stream in dense forest",
    credit: "Vinayak Hegde", license: "CC BY 2.0", licenseUrl: CC_BY_2, sourceUrl: commons("A_double_decker_living_bridge_in_Meghalaya,_December_2011.jpg"),
  },
  nohkalikai: {
    src: "/destinations/nohkalikai.jpg", alt: "Nohkalikai Falls plunging from a forested cliff into a turquoise pool far below",
    credit: "Vikramjit Kakati", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("NohKaLikai_Falls_V2_Wiki.jpg"),
  },
  dawki: {
    src: "/destinations/dawki.jpg", alt: "A wooden boat on the still green Umngot river near Dawki, with a suspension bridge and forested banks behind",
    credit: "Vikramjit Kakati", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Umngot_river,_Dawki.jpg"),
  },
  majuli: {
    src: "/destinations/majuli.jpg", alt: "Sunset over the Brahmaputra at Majuli, with fishing nets and a line of trees reflected in still water",
    credit: "Udit Kapoor", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Majuli_-_The_largest_river_island.jpg"),
  },
  kaziranga: {
    src: "/destinations/kaziranga.jpg", alt: "A one-horned rhinoceros walking through tall grass in Kaziranga National Park",
    credit: "Tisha Mukherjee", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4,
    sourceUrl: commons("Indian_rhinoceros_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_07.jpg"),
  },
  ziro: {
    src: "/destinations/ziro.jpg", alt: "Paddy fields and wet meadows in the Ziro valley under a bright sky with pine-covered hills",
    credit: "Arunachal2007", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Ziro_valley_of_Aruncahl_in_summer_season.jpg"),
  },
  tawang: {
    src: "/destinations/tawang.jpg", alt: "Tawang Monastery spread along a forested ridge below a tall mountain peak",
    credit: "Chandrasen31", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Tawang_Monastery_from_a_distance.jpg"),
  },
  dzukou: {
    src: "/destinations/dzukou.jpg", alt: "Rolling green hills of the Dzükou Valley under low cloud",
    credit: "Samudra Bikash Hazarika (edit by UnpetitproleX)", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4,
    sourceUrl: commons("Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_(edit).jpg"),
  },
  khonoma: {
    src: "/destinations/khonoma.jpg", alt: "Khonoma village built along a hilltop, surrounded by forested mountains",
    credit: "Joli Rumi", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Khonoma_village,_Nagaland,_India.jpg"),
  },
  loktak: {
    src: "/destinations/loktak.jpg", alt: "A wooded island rising from the calm water of Loktak Lake",
    credit: "ch_15march", license: "CC BY 2.0", licenseUrl: CC_BY_2, sourceUrl: commons("Loktak_Lake_Manipur_08.jpg"),
  },
  phawngpui: {
    src: "/destinations/phawngpui.jpg", alt: "Golden grass, rock pools and scattered trees on Phawngpui, the Blue Mountain",
    credit: "Garima Singh", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Phawngpui_national_park.jpg"),
  },
  unakoti: {
    src: "/destinations/unakoti.jpg", alt: "Large rock-cut faces and figures carved into a mossy hillside at Unakoti",
    credit: "Dr. Srimanta Ray", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("A_View_of_Unakoti,_Tripura.jpg"),
  },
  tsomgo: {
    src: "/destinations/tsomgo.jpg", alt: "Snow-dusted mountains reflected in the still water of Tsomgo Lake",
    credit: "Kuldeepburjbhalaike", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Changu_(Tsomgo)_Lake.jpg"),
  },
  "krang-suri": {
    src: "/destinations/krang-suri.jpg", alt: "Krang Suri waterfall pouring over a rock ledge into a turquoise pool",
    credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Near_Krang_Suri_Waterfall.jpg"),
  },
  laitlum: {
    src: "/destinations/laitlum.jpg", alt: "Layered green ridges and deep gorges seen from the edge of Laitlum Canyon",
    credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: CC_BY_SA_4, sourceUrl: commons("Laitlum_Canyon_(3).jpg"),
  },
};

/**
 * Extra photos for each place's gallery, from Wikimedia Commons (freely licensed; credits shown in the gallery).
 * Served from Wikimedia's image servers at 1280px rather than bundled, to keep the repo small.
 */
export const GALLERY: Record<string, PlacePhoto[]> = {
  nongriat: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg/1280px-Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg", alt: "Root bridges over a clear stream at Nongriat", credit: "Arshiya Urveeja Bose", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Living_root_bridges,_Nongriat_village,_Meghalaya2.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7323.jpg/1280px-Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7323.jpg", alt: "Tangled roots forming the double-decker bridge", credit: "PJeganathan", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district,_Meghalaya_JEG7323.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7329.jpg/1280px-Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7329.jpg", alt: "A root bridge walkway through dense forest", credit: "PJeganathan", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district,_Meghalaya_JEG7329.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7417.jpg/1280px-Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district%2C_Meghalaya_JEG7417.jpg", alt: "Roots of the living bridge arching over a rocky stream", credit: "PJeganathan", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district,_Meghalaya_JEG7417.jpg" },
  ],
  nohkalikai: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Nohkalikai_Falls_%282%29.jpg/1280px-Nohkalikai_Falls_%282%29.jpg", alt: "Nohkalikai Falls dropping past sheer cliffs into its turquoise pool", credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Nohkalikai_Falls_(2).jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Powerful_Nohkalikai_Waterfall.jpg/1280px-Powerful_Nohkalikai_Waterfall.jpg", alt: "Nohkalikai Falls seen from the viewpoint edge in mist", credit: "Photos Worldwide", license: "CC0", licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en", sourceUrl: "https://commons.wikimedia.org/wiki/File:Powerful_Nohkalikai_Waterfall.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Nohkalikai_Falls_of_Cherrapunji_in_summer.jpg/1280px-Nohkalikai_Falls_of_Cherrapunji_in_summer.jpg", alt: "Nohkalikai Falls in full flow beside red cliffs", credit: "Jyotishkardey", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Nohkalikai_Falls_of_Cherrapunji_in_summer.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Nohkalikai_Falls_Cherrapunji.JPG/1280px-Nohkalikai_Falls_Cherrapunji.JPG", alt: "Clouds drifting past the cliffs around Nohkalikai Falls", credit: "Kunal Dalui", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Nohkalikai_Falls_Cherrapunji.JPG" },
  ],
  dawki: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Dawki_Bridge_from_Umngot_River_%282%29.jpg/1280px-Dawki_Bridge_from_Umngot_River_%282%29.jpg", alt: "The suspension bridge over the Umngot river at Dawki", credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dawki_Bridge_from_Umngot_River_(2).jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Dawki_Bridge_over_Umngot_river.jpg/1280px-Dawki_Bridge_over_Umngot_river.jpg", alt: "Walking across the Dawki suspension bridge", credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dawki_Bridge_over_Umngot_river.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Umngot_River_View_%282%29.jpg/1280px-Umngot_River_View_%282%29.jpg", alt: "Boats on the still Umngot river between forested hills", credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Umngot_River_View_(2).jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Dawki_River%2C_Meghalaya.jpg/1280px-Dawki_River%2C_Meghalaya.jpg", alt: "A boat heading down the clear Umngot river toward the bridge", credit: "Madhumita Das", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dawki_River,_Meghalaya.jpg" },
  ],
  majuli: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Doriya_ghat_of_Majuli_2.jpg/1280px-Doriya_ghat_of_Majuli_2.jpg", alt: "Wetlands and green banks on Majuli island", credit: "Nayan j Nath", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Doriya_ghat_of_Majuli_2.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Majuli%2C_the_river_island_of_Assam.jpg/1280px-Majuli%2C_the_river_island_of_Assam.jpg", alt: "A stilt hut over still water on Majuli at dawn", credit: "Sanghamitra Bordoloi", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Majuli,_the_river_island_of_Assam.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/The_Masks_of_Majuli_-_the_Ganesha.jpg/1280px-The_Masks_of_Majuli_-_the_Ganesha.jpg", alt: "A hand-made Ganesha mask from Majuli's mask-making tradition", credit: "Afughat", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Masks_of_Majuli_-_the_Ganesha.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/The_Masks_of_Majuli_%2897160%29.jpg/1280px-The_Masks_of_Majuli_%2897160%29.jpg", alt: "A painted mask from Majuli's mask-making tradition", credit: "Afughat", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Masks_of_Majuli_(97160).jpg" },
  ],
  kaziranga: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Indian_elephant_at_Kaziranga_National_Park%2C_Assam%2C_India.jpg/1280px-Indian_elephant_at_Kaziranga_National_Park%2C_Assam%2C_India.jpg", alt: "An elephant standing in tall grass at Kaziranga", credit: "Rohit Sharma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_elephant_at_Kaziranga_National_Park,_Assam,_India.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_06.jpg/1280px-Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_06.jpg", alt: "Two young elephants in Kaziranga National Park", credit: "Tisha Mukherjee", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_06.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Barasingha_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_06.jpg/1280px-Barasingha_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_06.jpg", alt: "A swamp deer (barasingha) in the Kaziranga wetlands", credit: "Tisha Mukherjee", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Barasingha_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_06.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Black-necked_Stork_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_04.jpg/1280px-Black-necked_Stork_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_04.jpg", alt: "A black-necked stork wading at Kaziranga", credit: "Tisha Mukherjee", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Black-necked_Stork_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_04.jpg" },
  ],
  ziro: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/A_bird_eye_view_of_%22Ziro%22_town.jpg/1280px-A_bird_eye_view_of_%22Ziro%22_town.jpg", alt: "Ziro valley farmland and the town below forested hills", credit: "Arunachal2007", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:A_bird_eye_view_of_%22Ziro%22_town.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/A_section_of_Ziro_valley.jpg/1280px-A_section_of_Ziro_valley.jpg", alt: "Green paddy fields winding through the Ziro valley", credit: "Arunachal2007", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:A_section_of_Ziro_valley.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/A_cross_section_of_luch_green_valley_of_Ziro.jpg/1280px-A_cross_section_of_luch_green_valley_of_Ziro.jpg", alt: "A village set among paddy fields in the Ziro valley", credit: "Arunachal2007", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:A_cross_section_of_luch_green_valley_of_Ziro.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/APATANI_House.jpg/1280px-APATANI_House.jpg", alt: "A traditional Apatani bamboo house in Ziro", credit: "Anand Explore", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:APATANI_House.jpg" },
  ],
  tawang: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Tawang_Monastery_%28Tibetan_Buddhist%29.jpg/1280px-Tawang_Monastery_%28Tibetan_Buddhist%29.jpg", alt: "Tawang Monastery on its ridge at dusk below the peaks", credit: "Vikramjit Kakati", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tawang_Monastery_(Tibetan_Buddhist).jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Tawang_Monastery%2C_Arunachal_Pradesh.jpg/1280px-Tawang_Monastery%2C_Arunachal_Pradesh.jpg", alt: "The main hall of Tawang Monastery and its courtyard", credit: "J P Dutt", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tawang_Monastery,_Arunachal_Pradesh.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Main_temple_%28Dukhang%29_of_Tawang_monastery_with_Buddha_image_in_a_lotus_position.jpg/1280px-Main_temple_%28Dukhang%29_of_Tawang_monastery_with_Buddha_image_in_a_lotus_position.jpg", alt: "The prayer hall inside Tawang Monastery", credit: "Rohit Sharma", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Main_temple_(Dukhang)_of_Tawang_monastery_with_Buddha_image_in_a_lotus_position.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Tawang_Monastery_view.jpg/1280px-Tawang_Monastery_view.jpg", alt: "The monastery's buildings stretched along the Tawang ridge", credit: "Kingshuk Mondal", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tawang_Monastery_view.jpg" },
  ],
  dzukou: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Dzukou_Lily_01.jpg/1280px-Dzukou_Lily_01.jpg", alt: "A pink Dzükou lily in bloom above the valley", credit: "Ganesh Mohan T", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dzukou_Lily_01.jpg" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/d/de/Dz%C3%BCkou_Valley%2C_Viswema%2C_Nagaland_50.jpg", alt: "Bamboo-covered slopes of the Dzükou Valley under a blue sky", credit: "পাপৰি বৰা", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dz%C3%BCkou_Valley,_Viswema,_Nagaland_50.jpg" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Dz%C3%BCkou_Valley%2C_Viswema%2C_Nagaland_27.jpg", alt: "Sunset over the hills at Dzükou", credit: "পাপৰি বৰা", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dz%C3%BCkou_Valley,_Viswema,_Nagaland_27.jpg" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/8/83/Dz%C3%BCkou_Valley%2C_Viswema%2C_Nagaland_12.jpg", alt: "Golden grass on a Dzükou hillside", credit: "পাপৰি বৰা", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dz%C3%BCkou_Valley,_Viswema,_Nagaland_12.jpg" },
  ],
  khonoma: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/View_of_Khonoma_%282024%29.jpg/1280px-View_of_Khonoma_%282024%29.jpg", alt: "A stone path leading into Khonoma village", credit: "Ly.n0m", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:View_of_Khonoma_(2024).jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Khonoma_14.jpg/1280px-Khonoma_14.jpg", alt: "A traditional morung (community house) in Khonoma", credit: "Girish Mohan P K", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Khonoma_14.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Khonoma_13.jpg/1280px-Khonoma_13.jpg", alt: "Houses on a green slope in Khonoma", credit: "Girish Mohan P K", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Khonoma_13.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Khonoma_04.jpg/1280px-Khonoma_04.jpg", alt: "A carved wooden gate shelter in Khonoma", credit: "Girish Mohan P K", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Khonoma_04.jpg" },
  ],
  loktak: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Floating_biomasses_%28%22Phumdi%22_or_%22Phumthi%22_or_%22Phum%22_in_Classical_Meitei_language%29_%26_islands_in_the_Loktak_Lake_%28alias_%22Meitei_Sea%22%29_-_World%27s_only_floating_lake_-_in_Kangleipak_%28Manipur%29_03.jpg/1280px-thumbnail.jpg", alt: "Floating phumdis on Loktak Lake", credit: "Haoreima", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Floating_biomasses_(%22Phumdi%22_or_%22Phumthi%22_or_%22Phum%22_in_Classical_Meitei_language)_%26_islands_in_the_Loktak_Lake_(alias_%22Meitei_Sea%22)_-_World%27s_only_floating_lake_-_in_Kangleipak_(Manipur)_03.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Boats_%26_other_watercrafts_-_Inland_water_navigation_or_inland_waterway_transport_%28IWT%29_activities_in_the_Loktak_Lake_%28alias_%22Meitei_Sea%22%29_-_world%27s_only_floating_lake_-_in_Kangleipak_%28Manipur%29_01.jpg/1280px-thumbnail.jpg", alt: "A fisherman's boat on Loktak Lake", credit: "Haoreima", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Boats_%26_other_watercrafts_-_Inland_water_navigation_or_inland_waterway_transport_(IWT)_activities_in_the_Loktak_Lake_(alias_%22Meitei_Sea%22)_-_world%27s_only_floating_lake_-_in_Kangleipak_(Manipur)_01.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Boats_%26_other_watercrafts_in_a_port_-_Inland_water_navigation_or_inland_waterway_transport_%28IWT%29_activities_in_the_Loktak_Lake_%28alias_%22Meitei_Sea%22%29_-_world%27s_only_floating_lake_-_in_Kangleipak_%28Manipur%29_03.jpg/1280px-thumbnail.jpg", alt: "A jetty with boats on Loktak Lake", credit: "Haoreima", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Boats_%26_other_watercrafts_in_a_port_-_Inland_water_navigation_or_inland_waterway_transport_(IWT)_activities_in_the_Loktak_Lake_(alias_%22Meitei_Sea%22)_-_world%27s_only_floating_lake_-_in_Kangleipak_(Manipur)_03.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Boats_%26_other_watercrafts_in_a_port_-_Inland_water_navigation_or_inland_waterway_transport_%28IWT%29_activities_in_the_Loktak_Lake_%28alias_%22Meitei_Sea%22%29_-_world%27s_only_floating_lake_-_in_Kangleipak_%28Manipur%29_10.jpg/1280px-thumbnail.jpg", alt: "Boats moored at a Loktak Lake jetty", credit: "Haoreima", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Boats_%26_other_watercrafts_in_a_port_-_Inland_water_navigation_or_inland_waterway_transport_(IWT)_activities_in_the_Loktak_Lake_(alias_%22Meitei_Sea%22)_-_world%27s_only_floating_lake_-_in_Kangleipak_(Manipur)_10.jpg" },
  ],
  phawngpui: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Plant_Orchid_Dendrobium_infundibulum_IMG_7598.jpg/1280px-Plant_Orchid_Dendrobium_infundibulum_IMG_7598.jpg", alt: "A white orchid that grows on Phawngpui", credit: "Rohit Naniwadekar", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Plant_Orchid_Dendrobium_infundibulum_IMG_7598.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Red-billed_Blue_Magpie_the_royal_ribbon_of_the_Himalayas_painted_in_shades_of_blue_and_fire_06.jpg/1280px-Red-billed_Blue_Magpie_the_royal_ribbon_of_the_Himalayas_painted_in_shades_of_blue_and_fire_06.jpg", alt: "Red-billed blue magpies, birds of the Phawngpui forests", credit: "Shiv's fotografia", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Red-billed_Blue_Magpie_the_royal_ribbon_of_the_Himalayas_painted_in_shades_of_blue_and_fire_06.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Pin-striped_Tit-babbler_Macronus_gularis_by_Dr._Raju_Kasambe_%2845%29.jpg/1280px-Pin-striped_Tit-babbler_Macronus_gularis_by_Dr._Raju_Kasambe_%2845%29.jpg", alt: "A pin-striped tit-babbler, one of Phawngpui's forest birds", credit: "Dr. Raju Kasambe", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pin-striped_Tit-babbler_Macronus_gularis_by_Dr._Raju_Kasambe_(45).jpg" },
  ],
  unakoti: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Unakoti-2.jpg/1280px-Unakoti-2.jpg", alt: "Carved faces on the rock face at Unakoti", credit: "Sanjibroy56", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Unakoti-2.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Unakoti-4.jpg/1280px-Unakoti-4.jpg", alt: "A large carved head at Unakoti", credit: "Sanjibroy56", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Unakoti-4.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Hindu_Dieties_on_Unakoti_hills_Tripura_India.jpg/1280px-Hindu_Dieties_on_Unakoti_hills_Tripura_India.jpg", alt: "A row of rock-cut deities on the Unakoti hillside", credit: "Photos Worldwide", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Hindu_Dieties_on_Unakoti_hills_Tripura_India.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Unakoti_1.jpg/1280px-Unakoti_1.jpg", alt: "Detail of an ancient carving at Unakoti", credit: "Barunghosh", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Unakoti_1.jpg" },
  ],
  tsomgo: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Tsomgo_Lake_%28Changu_Lake%29_in_Gangtok_district.jpg/1280px-Tsomgo_Lake_%28Changu_Lake%29_in_Gangtok_district.jpg", alt: "Tsomgo Lake in a deep blue valley under a clear sky", credit: "Laluttam", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tsomgo_Lake_(Changu_Lake)_in_Gangtok_district.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Tsongmo_Lake_or_Changu_Lake_-_East_Sikkim.jpg/1280px-Tsongmo_Lake_or_Changu_Lake_-_East_Sikkim.jpg", alt: "Snow on the slopes above turquoise Tsomgo Lake", credit: "Indrajit Das", license: "CC BY 3.0", licenseUrl: "https://creativecommons.org/licenses/by/3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tsongmo_Lake_or_Changu_Lake_-_East_Sikkim.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Tsomgo_Lake_in_October_month.jpg/1280px-Tsomgo_Lake_in_October_month.jpg", alt: "Tsomgo Lake with mountains behind the lakeside path", credit: "Vijayanand7", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tsomgo_Lake_in_October_month.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Tsomgo_Lake_alias_Tsongmo_Lake_or_Changgu_Lake_in_East_Sikkim_01.jpg/1280px-Tsomgo_Lake_alias_Tsongmo_Lake_or_Changgu_Lake_in_East_Sikkim_01.jpg", alt: "A wide view of Tsomgo Lake and the ridges around it", credit: "Amitabha Gupta", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tsomgo_Lake_alias_Tsongmo_Lake_or_Changgu_Lake_in_East_Sikkim_01.jpg" },
  ],
  "krang-suri": [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Krang_Suri_Waterfall.jpg/1280px-Krang_Suri_Waterfall.jpg", alt: "Krang Suri waterfall and pools seen from the forest above", credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Krang_Suri_Waterfall.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Krang_Suri_Waterfall_%286%29.jpg/1280px-Krang_Suri_Waterfall_%286%29.jpg", alt: "Krang Suri falls spilling over a wide rock ledge", credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Krang_Suri_Waterfall_(6).jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Krang_Suri_Falls.jpg/1280px-Krang_Suri_Falls.jpg", alt: "The turquoise pool at the foot of Krang Suri falls", credit: "Abhimanyu Pathak", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Krang_Suri_Falls.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Krang_Suri_Falls_2.jpg/1280px-Krang_Suri_Falls_2.jpg", alt: "Twin streams of Krang Suri falling into a clear pool", credit: "Vikrantdhiman189381", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Krang_Suri_Falls_2.jpg" },
  ],
  laitlum: [
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Laitlum_Canyon.jpg/1280px-Laitlum_Canyon.jpg", alt: "A sweeping view of the Laitlum canyon rim", credit: "ANKAN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Laitlum_Canyon.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Laitlum%2C_Shillong_in_2026.jpg/1280px-Laitlum%2C_Shillong_in_2026.jpg", alt: "Clouds rolling over the green ridges at Laitlum", credit: "JyotiPN", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Laitlum,_Shillong_in_2026.jpg" },
    { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Rocky_valley_and_terraced_fields_near_Laitlum_Canyon%2C_Shillong%2C_Meghalaya_-_25_April_2026.jpg/1280px-Rocky_valley_and_terraced_fields_near_Laitlum_Canyon%2C_Shillong%2C_Meghalaya_-_25_April_2026.jpg", alt: "Terraced fields near Laitlum under a hazy sky", credit: "Aiban-03", license: "CC0", licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en", sourceUrl: "https://commons.wikimedia.org/wiki/File:Rocky_valley_and_terraced_fields_near_Laitlum_Canyon,_Shillong,_Meghalaya_-_25_April_2026.jpg" },
  ],
};

/** Main photo first, then the gallery extras. */
export const placeGallery = (slug: string): PlacePhoto[] => [...(PHOTOS[slug] ? [PHOTOS[slug]] : []), ...(GALLERY[slug] ?? [])];

/** A place's photo, preferring the one set in the CRM, or null if it has none yet. */
export const placePhoto = (slug: string, cover?: string | null) => cover || PHOTOS[slug]?.src || null;

/** Attribution for a bundled photo (null for CRM-uploaded covers, which carry their own rights). */
export const photoCredit = (slug: string, cover?: string | null) => (cover ? null : PHOTOS[slug] ?? null);

/** A small, optimised version for thumbnails and card backgrounds (local files go through next/image). */
export const photoThumb = (src: string, width = 640) =>
  src.startsWith("/") ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75` : src;
