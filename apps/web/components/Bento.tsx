import { Icon } from "./Icon";
import { Eyes } from "./Eyes";
import { DestinationArt } from "./DestinationArt";
import { DestinationLink } from "./SiteState";
import { InViewFlag } from "./InViewFlag";
import { APP_APK } from "@/lib/landing";
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
              <div className="store"><AppleLogo /><div><small>Coming soon on</small><strong>iOS</strong></div></div>
              <a className="store" href={APP_APK}><PlayLogo /><div><small>Download for</small><strong>Android</strong></div></a>
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

function AppleLogo() {
  return (
    <svg className="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

/** Google Play's four-colour triangle (brand colours, so raw hex). */
function PlayLogo() {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z" fill="#4285F4" />
      <path d="M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973z" fill="#34A853" />
      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z" fill="#FBBC04" />
      <path d="M13.544 13.056l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" fill="#EA4335" />
    </svg>
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
        {/* Pinned at the shoulder (114, 226). Hangs hidden behind the body, swings up in an arc and waves. */}
        <g className="r-arm">
          <g className="r-wave">
            <path d="M114 226 84 168" stroke="#E9541A" strokeWidth="22" strokeLinecap="round" />
            <path d="M114 226 84 168" stroke="#FF6A2B" strokeWidth="16" strokeLinecap="round" />
            <ellipse cx="80" cy="156" rx="12" ry="14" fill="#9C6644" />
            <circle cx="92" cy="162" r="5" fill="#9C6644" />
          </g>
        </g>
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
