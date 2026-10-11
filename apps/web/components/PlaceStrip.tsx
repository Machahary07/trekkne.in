import Link from "next/link";
import type { ExplorePlace } from "@/lib/explore";
import { STATE_NAMES } from "@/lib/states";
import { Icon } from "./Icon";

/** Photo-first place cards under the hero: just the picture and its name, each opening the place page. */
export function PlaceStrip({ places }: { places: ExplorePlace[] }) {
  // 9 cards fill the grid exactly (the first is a 2×2 feature); Tawang Monastery always takes the last spot.
  const withPhoto = places.filter((p) => p.photo);
  const tawang = withPhoto.find((p) => p.slug === "tawang");
  const shown = [...withPhoto.filter((p) => p !== tawang).slice(0, tawang ? 8 : 9), ...(tawang ? [tawang] : [])];
  if (!shown.length) return null;

  return (
    <section className="place-strip" aria-labelledby="places-h">
      <div className="wrap">
        <div className="ps-head">
          <div className="sec-head">
            <span className="eyebrow">Places to go</span>
            <h2 id="places-h">Where to next?</h2>
          </div>
          <Link href="/destinations" className="btn btn-ink ps-all">
            <span>View all destinations</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <ul className="ps-grid">
          {shown.map((p) => (
            <li key={p.slug}>
              <Link href={`/places/${p.slug}`} className="ps-card" style={{ "--img": `url("${p.photo}")` } as React.CSSProperties}>
                <span className="ps-name">
                  {p.name}
                  <small>{STATE_NAMES[p.state_code] ?? p.state_code}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
