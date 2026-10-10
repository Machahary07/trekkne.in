import { Icon, type IconName } from "./Icon";
import Link from "next/link";
import { RANGER_SIGNUP } from "@/lib/landing";
import { PhoneModes } from "./PhoneModes";
import { qrModules } from "@/lib/shapes";

const PERKS: Array<{ icon: IconName; bg: string; title: string; text: string }> = [
  { icon: "shirt", bg: "var(--orange)", title: "Branded kit & QR ID card", text: "Travellers scan your card to see your verified profile and book you directly." },
  { icon: "rupee", bg: "var(--green)", title: "Earn for accuracy, not volume", text: "Guide bookings, plus pilot rewards like ₹20 per eligible verified report." },
  { icon: "wifioff", bg: "var(--blue)", title: "Works with no signal", text: "Reports and photos save on your phone and upload once you’re back online." },
  { icon: "shield", bg: "var(--yellow)", title: "Safety first, always", text: "You only report what you see during normal work. You never need to enter unsafe areas." },
];

export function Rangers() {
  return (
    <section id="rangers" aria-labelledby="rangers-h">
      <div className="wrap rangers">
        <div>
          <span className="eyebrow">Trekne Rangers</span>
          <h2 id="rangers-h" className="rangers-title">Local guides. Our eyes on the ground.</h2>
          <p className="lede">
            Rangers are registered guides, trekking professionals and approved locals. They keep guiding as usual and
            share what they see along the way. In return, Trekne backs them with kit, training and income.
          </p>
          <ul className="perks">
            {PERKS.map((p) => (
              <li key={p.title}>
                <span className="ic" style={{ background: p.bg }}><Icon name={p.icon} /></span>
                <div><b>{p.title}</b><span>{p.text}</span></div>
              </li>
            ))}
          </ul>
          <div className="ranger-ctas">
            <Link className="btn btn-ink" href={RANGER_SIGNUP}>Apply to be a Ranger <Icon name="arrow" /></Link>
          </div>
          <p className="fineprint">
            Incentive figures are proposed pilot rates, not guaranteed earnings. Ranger uniforms do not imply government
            authority, emergency-responder status or safety certification.
          </p>
        </div>

        <div className="stage">
          <IdCard />
          <PhoneModes />
        </div>
      </div>
    </section>
  );
}

function IdCard() {
  return (
    <div className="idcard" aria-label="Sample Ranger ID card">
      <div className="band"><span>trekne</span><small>RANGER</small></div>
      <div className="body">
        <div className="who">
          <div className="avatar">
            <svg viewBox="0 0 60 60" width="58" height="58" aria-hidden="true">
              <circle cx="30" cy="62" r="24" fill="#FF6A2B" />
              <ellipse cx="30" cy="30" rx="13" ry="14" fill="#9C6644" />
              <path d="M16 26c0-10 6-15 14-15s14 5 14 15z" fill="#10131F" />
              <circle cx="25" cy="31" r="1.8" fill="#10131F" />
              <circle cx="35" cy="31" r="1.8" fill="#10131F" />
            </svg>
          </div>
          <div><b>Sample Ranger</b><span>Verified guide · since 2026</span></div>
        </div>
        <div className="row">
          <div>
            <b>Sohra &amp; Nongriat</b>Operating area<br />
            <b className="mono id-no">TR-SOH-0142</b>Ranger ID
          </div>
          <svg className="qr" viewBox="0 0 25 25" aria-hidden="true">
            <rect width="25" height="25" fill="#fff" />
            {qrModules().map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#10131F" />)}
            {[[0, 0], [18, 0], [0, 18]].map(([x, y]) => (
              <g key={`f${x}${y}`}>
                <rect x={x} y={y} width="7" height="7" fill="#10131F" />
                <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
                <rect x={x + 2} y={y + 2} width="3" height="3" fill="#10131F" />
              </g>
            ))}
          </svg>
        </div>
        <p className="foot">Scan to check this Ranger’s profile on trekne.in. Not a government ID.</p>
      </div>
    </div>
  );
}
