import { Icon } from "./Icon";
import { Eyes } from "./Eyes";
import { DestinationArt } from "./DestinationArt";
import { DestinationLink } from "./SiteState";
import { burstPath } from "@/lib/shapes";

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
            <div className="trio">
              <figure>
                <svg viewBox="0 0 120 92" aria-hidden="true">
                  <g fill="#FF6A2B">
                    <circle cx="34" cy="50" r="32" /><circle cx="86" cy="50" r="32" /><circle cx="60" cy="40" r="32" />
                    <rect x="34" y="50" width="52" height="32" />
                  </g>
                  <path d="M42 46q6 6 12 0M66 46q6 6 12 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <ellipse cx="60" cy="58" rx="5" ry="4" fill="#10131F" />
                </svg>
                <figcaption>Travellers</figcaption>
              </figure>
              <figure>
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <g fill="#7090E4">
                    <circle cx="38" cy="38" r="28" /><circle cx="82" cy="38" r="28" /><circle cx="38" cy="82" r="28" /><circle cx="82" cy="82" r="28" />
                    <rect x="34" y="34" width="52" height="52" />
                  </g>
                  <circle cx="48" cy="56" r="5" fill="#10131F" /><circle cx="72" cy="56" r="5" fill="#10131F" />
                  <path d="M50 70q10 9 20 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
                <figcaption>Rangers</figcaption>
              </figure>
              <figure>
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <path d={burstPath(58, 50, 22)} fill="#FFC21A" />
                  <path d="M40 52l9 6-9 6M80 52l-9 6 9 6" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M50 74q10 9 20 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
                <figcaption>Communities</figcaption>
              </figure>
            </div>
            <div>
              <h3>Travellers, Rangers and communities, on one map.</h3>
              <p>Locals report what they see. Moderators verify it. AI turns it into advice you can trust.</p>
            </div>
          </article>

          <article className="tile t-b">
            <div className="appicon"><Icon name="calendar" /><b>3</b></div>
            <p>Alerts for your exact trip dates</p>
          </article>

          <article className="tile t-c">
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
            <DestinationArt dest="nongriat" className="scene" />
            <DestinationLink to="nongriat" className="glass-pill">
              <Icon name="route" />Explore Living Root Bridges
            </DestinationLink>
          </article>

          <article className="tile t-e" aria-label="Trekne Ranger">
            <RangerPortrait />
          </article>

          <article className="tile t-f">
            <div className="float-tags" aria-hidden="true">
              <span className="tag" style={{ left: 14, top: 16, transform: "rotate(-6deg)" }}><Icon name="check" />Verified 2h ago</span>
              <span className="tag" style={{ right: 18, top: 30, transform: "rotate(5deg)" }}><Icon name="route" />~3,000 steps</span>
              <span className="tag" style={{ left: 30, bottom: 18, transform: "rotate(4deg)" }}><Icon name="rain" />Oct–Apr</span>
              <span className="tag" style={{ right: 24, bottom: 28, transform: "rotate(-5deg)" }}><Icon name="users" />Local guide</span>
            </div>
            <div className="scallop">
              <div className="lobes" aria-hidden="true"><i /><i /><i /><i /></div>
              <p>Where are you travelling next?</p>
              <a className="fake-input" href="#top"><Icon name="search" />Enter a trail, village or falls</a>
            </div>
          </article>

          <article className="tile t-g">
            <div className="bubble" aria-hidden="true"><Icon name="chat" /></div>
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
        <circle cx="240" cy="70" r="40" fill="#FFC21A" />
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
        <circle cx="136" cy="146" r="5" fill="#10131F" />
        <circle cx="164" cy="146" r="5" fill="#10131F" />
        <path d="M140 162q10 8 20 0" stroke="#10131F" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
