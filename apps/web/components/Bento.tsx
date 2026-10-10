import { Icon } from "./Icon";
import { Eyes } from "./Eyes";
import { DestinationArt } from "./DestinationArt";
import { DestinationLink } from "./SiteState";
import { InViewFlag } from "./InViewFlag";
import { TrioCast } from "./bento/TrioCast";
import { TripAlerts } from "./bento/TripAlerts";
import { TypeSearch } from "./bento/TypeSearch";
import { FieldNotes } from "./bento/FieldNotes";

export function Bento() {
  return (
    <section aria-labelledby="meet-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Meet Trekne</span>
          <h2 id="meet-h">One network. Every trail, checked by locals.</h2>
        </div>

        <div className="bento">
          <article className="tile t-a">
            <InViewFlag />
            <TrioCast />
            <div>
              <h3>Travellers, Rangers and communities, on one map.</h3>
              <p>Locals report what they see. Moderators verify it. AI turns it into advice you can trust.</p>
            </div>
          </article>

          <article className="tile t-b">
            <InViewFlag />
            <TripAlerts />
            <p>Alerts for your exact trip dates</p>
          </article>

          <article className="tile t-c">
            <InViewFlag />
            <div className="orbit" aria-hidden="true">
              <span><Icon name="backpack" /></span>
              <span><Icon name="rain" /></span>
              <span><Icon name="spark" /></span>
            </div>
            <h3>Know before you go</h3>
            <div className="badges">
              <div className="store"><Icon name="phone" /><div><small>Coming soon on</small><strong>iOS</strong></div></div>
              <div className="store"><Icon name="phone" /><div><small>Coming soon on</small><strong>Android</strong></div></div>
            </div>
            <div className="dome" aria-hidden="true"><Eyes /></div>
          </article>

          <article className="tile t-d">
            <InViewFlag />
            <DestinationArt dest="nongriat" className="scene" />
            <DestinationLink to="nongriat" className="glass-pill">
              <Icon name="route" />Explore Living Root Bridges
            </DestinationLink>
          </article>

          <article className="tile t-e" aria-label="Trekne Ranger">
            <InViewFlag />
            <RangerPortrait />
          </article>

          <article className="tile t-f">
            <InViewFlag />
            <div className="float-tags" aria-hidden="true">
              <span className="tag" style={{ left: 14, top: 16, transform: "rotate(-6deg)" }}><Icon name="check" />Verified 2h ago</span>
              <span className="tag" style={{ right: 18, top: 30, transform: "rotate(5deg)" }}><Icon name="route" />~3,000 steps</span>
              <span className="tag" style={{ left: 30, bottom: 18, transform: "rotate(4deg)" }}><Icon name="rain" />Oct–Apr</span>
              <span className="tag" style={{ right: 24, bottom: 28, transform: "rotate(-5deg)" }}><Icon name="users" />Local guide</span>
            </div>
            <div className="scallop">
              <div className="lobes" aria-hidden="true"><i /><i /><i /><i /></div>
              <p>Where are you travelling next?</p>
              <TypeSearch />
            </div>
          </article>

          <article className="tile t-g">
            <InViewFlag />
            <div className="bubble" aria-hidden="true"><Icon name="chat" /></div>
            <FieldNotes />
            <h3>Field notes</h3>
            <p>Seasonal guides, local customs and travel mistakes to avoid, written with the people who live there.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function RangerPortrait() {
  return (
    <svg className="blobwin" viewBox="0 0 300 286" aria-hidden="true">
      <defs>
        <clipPath id="blobclip">
          <path d="M60 40C110-5 200 0 250 40s60 140 20 190-150 70-210 30S-10 150 10 100 30 65 60 40z" />
        </clipPath>
      </defs>
      <g clipPath="url(#blobclip)">
        <rect width="300" height="286" fill="#FFF4D6" />
        <circle className="r-sun" cx="240" cy="70" r="40" fill="#FFC21A" />
        <path d="M0 210c60-30 120-20 170-30s90 10 130 0v110H0z" fill="#2DC56E" />
        <path d="M88 286c0-60 28-92 62-92s62 32 62 92z" fill="#FF6A2B" />
        <path d="M150 196v90" stroke="#E9541A" strokeWidth="4" />
        <rect x="164" y="220" width="30" height="20" rx="4" fill="#fff" />
        <path d="M170 230h18" stroke="#10131F" strokeWidth="3" />
        <rect x="138" y="170" width="24" height="30" fill="#8A5A3C" />
        <ellipse cx="150" cy="140" rx="40" ry="44" fill="#9C6644" />
        <path d="M106 124c0-30 20-48 44-48s44 18 44 48z" fill="#10131F" />
        <path d="M150 124h62c4 0 4 10-2 10h-60z" fill="#10131F" />
        <text x="150" y="114" fontFamily="var(--font-display), Arial Black, sans-serif" fontWeight="800" fontSize="20" fill="#FF6A2B" textAnchor="middle">T</text>
        <g className="r-eyes">
          <circle cx="136" cy="146" r="5" fill="#10131F" />
          <circle cx="164" cy="146" r="5" fill="#10131F" />
        </g>
        <path d="M140 162q10 8 20 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
