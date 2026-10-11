import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";
import { Eyes } from "./Eyes";
import { Doodle, PrayerFlags, TextileBand, type DoodleName, type Textile } from "./Doodles";
import { CherryBranch } from "./SakuraSky";
import { PHOTOS } from "@/lib/photos";

type NeState = {
  name: string;
  note: string;
  doodle: DoodleName;
  /** A bundled place photo (lib/photos.ts) fills the card; the doodle sits small in one corner. */
  photo: string;
  corner: "tl" | "tr" | "bl" | "br";
  /** The state's weave along the bottom of the card; Buddhist-belt states get prayer flags instead. */
  weave?: { kind: Textile; label: string };
  flags?: boolean;
  /** Pilot states get a wide, solid-colour card. */
  pilot?: boolean;
  color: string;
  rot: number;
};

// Order fills a 4-column grid: Assam (2) + 2, then 2 + Meghalaya (2), then 2 + the Ranger card (2).
const STATES: NeState[] = [
  { name: "Assam", pilot: true, color: "var(--orange)", rot: -6, doodle: "rhino", photo: "kaziranga", corner: "tr", weave: { kind: "gamosa", label: "Gamosa" },
    note: "One-horned rhinos in Kaziranga, tea gardens on every hill, Bihu drums in April and the red-and-white gamosa." },
  { name: "Arunachal Pradesh", color: "var(--blue)", rot: 8, doodle: "mithun", photo: "tawang", corner: "bl", flags: true,
    note: "Tawang Monastery, prayer flags on the high passes and the mithun, the state animal." },
  { name: "Nagaland", color: "var(--yellow)", rot: -10, doodle: "headgear", photo: "khonoma", corner: "tl", weave: { kind: "naga", label: "Naga shawl" },
    note: "Khonoma, a village that chose to protect its forests, the Hornbill Festival every December and warrior shawls." },
  { name: "Manipur", color: "var(--green)", rot: 7, doodle: "sangai", photo: "loktak", corner: "br", weave: { kind: "moirang", label: "Moirang phee" },
    note: "The sangai, a dancing deer found only on the floating meadows of Loktak Lake." },
  { name: "Mizoram", color: "var(--orange)", rot: -7, doodle: "bamboo", photo: "phawngpui", corner: "tl", weave: { kind: "puan", label: "Puan" },
    note: "Phawngpui, the Blue Mountain, Cheraw, the bamboo dance, and the hand-woven puan." },
  { name: "Meghalaya", pilot: true, color: "var(--blue)", rot: 6, doodle: "cloud", photo: "nongriat", corner: "br", weave: { kind: "dakmanda", label: "Dakmanda" },
    note: "The abode of clouds: living root bridges, rain-fed waterfalls and Shillong's cherry blossoms in November." },
  { name: "Tripura", color: "var(--yellow)", rot: -8, doodle: "palace", photo: "unakoti", corner: "tr", weave: { kind: "risa", label: "Risa" },
    note: "The rock carvings of Unakoti, Ujjayanta Palace in Agartala and fine bamboo and cane craft." },
  { name: "Sikkim", color: "var(--green)", rot: 9, doodle: "gompa", photo: "tsomgo", corner: "br", flags: true,
    note: "Tsomgo Lake high on the Nathu La road, monasteries on the ridgelines and prayer flags in the wind." },
];

export function AboutStates() {
  return (
    <section className="ne" aria-labelledby="ne-h">
      <div className="wrap ne-wrap">
        <CherryBranch className="ne-branch" />
        <div className="sec-head">
          <span className="eyebrow">Where we work</span>
          <h2 id="ne-h">Rooted in all <em>eight states.</em></h2>
          <p>
            Trekne is built in the Northeast, for the Northeast. Each state&apos;s festivals, customs and protected places are part
            of the data, so the advice you get respects the people who live there.
          </p>
        </div>

        <ul className="ne-grid">
          {STATES.map((s, i) => (
            <li
              key={s.name}
              className="ne-card"
              data-pilot={s.pilot || undefined}
              style={{ "--c": s.color, "--rot": `${s.rot}deg`, "--i": i } as CSSProperties}
            >
              <div className="ne-art" data-band={s.weave ? "" : undefined}>
                <Image src={PHOTOS[s.photo].src} alt={PHOTOS[s.photo].alt} fill sizes="(max-width: 560px) 100vw, (max-width: 1080px) 50vw, 25vw" />
                {s.flags && <PrayerFlags className="ne-flags" count={7} />}
                <span className="ne-sticker" data-corner={s.corner}>
                  <Doodle name={s.doodle} className={`d-${s.doodle}`} />
                </span>
                {s.weave && <TextileBand kind={s.weave.kind} className="ne-band" />}
              </div>
              <div className="ne-body">
                <h3>
                  {s.name}
                  {s.pilot && <span className="ne-tag">Pilot state</span>}
                </h3>
                <p>{s.note}</p>
                {s.weave && <small className="ne-weave">Weave · {s.weave.label}</small>}
                <a className="ne-credit" href={PHOTOS[s.photo].sourceUrl} target="_blank" rel="noreferrer">
                  Photo: {PHOTOS[s.photo].credit} · {PHOTOS[s.photo].license}
                </a>
              </div>
            </li>
          ))}
          <li className="ne-card ne-join">
            <Eyes />
            <div className="ne-body">
              <h3>Know your valley better than any map?</h3>
              <p>Rangers are locals who report what they see, and get paid for it.</p>
              <Link href="/rangers" className="btn btn-green">
                <span>Become a Ranger</span>
                <Icon name="arrow" />
              </Link>
            </div>
            <Doodle name="japi" className="ne-japi" />
          </li>
        </ul>
      </div>
    </section>
  );
}
