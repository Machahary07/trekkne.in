import { Icon } from "./Icon";
import { burstPath } from "@/lib/shapes";

export function OurPromise() {
  return (
    <section aria-labelledby="promise-h">
      <div className="wrap">
        <div className="promise">
          <svg className="sun" viewBox="0 0 120 120" aria-hidden="true"><path d={burstPath(60, 50, 26)} fill="#FFC21A" /></svg>
          <span className="eyebrow">Our promise</span>
          <h2 id="promise-h">More tourism is not the goal. <em>Better tourism</em> is.</h2>
          <div className="commit">
            <div>
              <b><Icon name="leaf" />Protect the land</b>
              <p>When a waterfall is under pressure, we suggest a quieter day or a suitable alternative, never a sacred grove or a protected forest.</p>
            </div>
            <div>
              <b><Icon name="temple" />Respect the people</b>
              <p>Communities decide how their festivals, customs and heritage sites are shown. Photography rules and ceremonies come first.</p>
            </div>
            <div>
              <b><Icon name="eye" />Show our working</b>
              <p>Every advisory carries its source, its verification status and its timestamp. Stale reports expire. AI never has the final word on safety.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
