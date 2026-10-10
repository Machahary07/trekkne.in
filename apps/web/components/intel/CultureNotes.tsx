import { Icon } from "../Icon";
import type { Destination } from "@/lib/destinations";

/** Compact heritage + responsible-travel guidelines; details expand natively. */
export function CultureNotes({ culture }: Pick<Destination, "culture">) {
  return (
    <div className="cul">
      <div className="di-subhead">
        <span className="di-kicker"><Icon name="temple" />Heritage &amp; local guidelines</span>
        <span className="mono">Community-approved</span>
      </div>
      <p className="cul-summary">{culture.summary}</p>
      <div className="cul-list">
        {culture.guidelines.map((g) => (
          <details key={g.title} className="cul-item">
            <summary>
              <span className="cul-ic"><Icon name={g.icon} /></span>
              <b>{g.title}</b>
              <Icon name="chevron" className="ico cul-chev" />
            </summary>
            <p>{g.detail}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
