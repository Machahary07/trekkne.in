import { Icon, type IconName } from "./Icon";

const STEPS: Array<{ who: string; icon: IconName; bg: string; fg?: string; title: string; text: string }> = [
  { who: "Ranger", icon: "camera", bg: "var(--orange)", title: "Reports from the field", text: "Photo, GPS pin and a note, saved offline if there’s no signal." },
  { who: "Trekne", icon: "db", bg: "var(--yellow)", title: "Logged as pending", text: "Time, place, reporter and evidence are stored. Nothing goes public yet." },
  { who: "Moderator", icon: "shield", bg: "var(--green)", title: "Checked and verified", text: "Evidence reviewed, duplicates merged, conflicts resolved or confirmed again." },
  { who: "AI", icon: "spark", bg: "var(--blue)", title: "Advice updates", text: "Combined with IMD weather and maps, always with sources and timestamps." },
  { who: "You", icon: "pin", bg: "var(--text)", fg: "var(--bg)", title: "Know before you go", text: "The same advisory appears on the website and in the app, instantly." },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">How it works</span>
          <h2 id="how-h">From a Ranger’s phone to your plan.</h2>
          <p>A guide spots a landslide on the trail at 9 am. By lunch, every traveller heading there knows. Here’s how one report travels.</p>
        </div>
        <ol className="flow">
          {STEPS.map((s) => (
            <li key={s.who}>
              <span className="ic" style={{ background: s.bg, color: s.fg }}><Icon name={s.icon} /></span>
              <span className="who">{s.who}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
