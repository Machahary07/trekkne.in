import Image from "next/image";
import { Icon } from "../Icon";
import type { Destination } from "@/lib/destinations";

/**
 * Cinematic destination photo. All photos are stacked and cross-faded so
 * switching tabs never flashes an empty frame.
 */
export function DestinationPhoto({ destinations, active }: { destinations: Destination[]; active: Destination }) {
  return (
    <figure className="dp">
      {destinations.map((x) => (
        <Image
          key={x.key}
          src={x.photo.src}
          alt={x.key === active.key ? x.photo.alt : ""}
          aria-hidden={x.key !== active.key || undefined}
          fill
          sizes="(max-width: 980px) 100vw, 60vw"
          className="dp-img"
          data-active={x.key === active.key || undefined}
          style={{ objectPosition: x.photo.focus }}
        />
      ))}
      <div className="dp-shade" aria-hidden="true" />

      <div className="dp-top">
        <span className="dp-chip"><Icon name="pin" />{active.place}</span>
      </div>

      <figcaption className="dp-bottom" key={active.key}>
        <h3 className="dp-name">{active.name}</h3>
        <dl className="dp-facts">
          {active.facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <ul className="dp-ind" aria-label="Conditions at a glance">
          {active.indicators.map((ind) => (
            <li key={ind.label} title={`${ind.source} · ${ind.updated}`}>
              <i className={`lvl ${ind.level}`} />
              <span>{ind.label}</span>
              <b>{ind.value}</b>
            </li>
          ))}
        </ul>
        <p className="dp-credit">
          Photo: <a href={active.photo.sourceUrl} target="_blank" rel="noopener noreferrer">{active.photo.credit}</a> ·{" "}
          <a href={active.photo.licenseUrl} target="_blank" rel="noopener noreferrer">{active.photo.license}</a>
        </p>
      </figcaption>

    </figure>
  );
}
