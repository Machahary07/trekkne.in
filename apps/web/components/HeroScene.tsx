// The home hero landscape: Northeast hills with a monastery, tea gardens, a village,
// a river, trekkers and wildlife. The card crops the top of this art on wide screens,
// so the sky stays empty up there and every detail sits in the lower part of the viewBox.

type PersonProps = { x: number; y: number; s?: number; top: string; skin?: string; pack?: string; basket?: boolean; staff?: boolean; hat?: boolean; flip?: boolean };

/** A tiny person, feet at (x, y). */
function Person({ x, y, s = 1, top, skin = "#8A5A3C", pack, basket, staff, hat, flip }: PersonProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {basket && <path d="M2-25L13-28 9-11 3-12Z" fill="#C28F3C" stroke="#6B4A1A" strokeWidth=".8" />}
      {pack && <rect x="-9" y="-23" width="6" height="11" rx="2" fill={pack} />}
      <path d="M-3 0L-2-10M3 0L2-10" stroke="#10131F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-5-10L-4-22Q0-25 4-22L5-10Z" fill={top} />
      {staff && <path d="M7-20L9 1" stroke="#6B4A1A" strokeWidth="1.6" strokeLinecap="round" />}
      <circle cy="-27" r="4" fill={skin} />
      <path d="M-4-28Q0-33 4-28Q2-30 0-30Q-2-30-4-28Z" fill="#1A1210" />
      {hat && (
        <>
          <ellipse cy="-30" rx="8" ry="2.2" fill="#EBC07A" />
          <path d="M-4-31L0-36 4-31Z" fill="#D2343C" />
        </>
      )}
    </g>
  );
}

function StiltHouse({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-18 0V-12M-6 0V-12M6 0V-12M18 0V-12" stroke="#6B4A1A" strokeWidth="2.2" />
      <rect x="-22" y="-28" width="44" height="16" fill="#D9A65A" stroke="#6B4A1A" strokeWidth="1.2" />
      <path d="M-22-24H22M-22-20H22M-22-16H22" stroke="#B9853E" strokeWidth=".8" />
      <rect x="-4" y="-25" width="8" height="13" fill="#6B4A1A" />
      <path d="M-30-27L0-46 30-27Z" fill="#C28F3C" stroke="#6B4A1A" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M-22-31L0-44M-12-29L0-38M22-31L0-44" stroke="#9A6A22" strokeWidth=".8" />
    </g>
  );
}

function Pine({ x, y, s = 1, fill = "#1F6B3E" }: { x: number; y: number; s?: number; fill?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0-58L12-34H6L16-16H8L20 0H-20L-8-16H-16L-6-34H-12Z" fill={fill} />;
}

/** One-horned rhino, side view, feet at (x, y). */
function Rhino({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-28-10C-26-26 10-30 22-20C30-14 30-4 26 2V8H20V2H-4V8H-10V2H-18V8H-24V0C-28-2-30-6-28-10Z" fill="#7D89A7" stroke="#3E4865" strokeWidth="1.2" />
      <path d="M-26-14C-34-16-42-12-44-6C-46-2-44 2-38 2C-32 2-28 0-24-4Z" fill="#7D89A7" stroke="#3E4865" strokeWidth="1.2" />
      <path d="M-42-6C-46-12-46-18-43-22C-41-17-38-12-36-9Z" fill="#5A5248" />
      <path d="M-8-26C-10-14-8-4-6 2M10-26C14-16 14-6 12 2" stroke="#3E4865" strokeWidth="1.2" fill="none" />
      <circle cx="-34" cy="-8" r="1.3" fill="#10131F" />
    </g>
  );
}

/** Asian elephant, side view, feet at (x, y). */
function Elephant({ x, y, s = 1, flip }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-24-12C-24-34 16-38 24-22C28-14 26-4 22 0V10H16V2H2V10H-4V2H-12V10H-18V0C-22-2-24-6-24-12Z" fill="#8C8F9E" stroke="#4E5160" strokeWidth="1.2" />
      <path d="M20-26C30-28 36-20 34-10C33-2 30 6 34 10H29C26 6 26 0 26-6C26-12 24-16 20-18Z" fill="#8C8F9E" stroke="#4E5160" strokeWidth="1.2" />
      <path d="M12-26C8-20 8-12 14-8C18-12 18-20 16-26Z" fill="#7A7D8C" />
      <circle cx="26" cy="-20" r="1.3" fill="#10131F" />
    </g>
  );
}

function Mithun({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-30-6C-30-20 20-22 26-12C30-6 28 4 22 6H18V16H12V6H-14V16H-20V6C-26 6-30 2-30-6Z" fill="#2A1C16" />
      <path d="M24-10C32-8 38 0 36 8L30 10C30 4 28 0 22-2Z" fill="#2A1C16" />
      <path d="M30-2C34-8 42-10 46-8M28 0C26-6 20-8 16-6" stroke="#EFE6D2" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M-20 6V14M18 6V14" stroke="#F3EBD8" strokeWidth="3" />
    </g>
  );
}

export function HeroScene() {
  const flag = ["#3E73D8", "#FBFAF6", "#D2343C", "#2DC56E", "#FFC21A"];
  return (
    <svg className="hero-art" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <circle cx="1090" cy="318" r="86" fill="#FFC21A" />
      <g fill="#fff" opacity=".9">
        <rect x="150" y="262" width="150" height="30" rx="15" /><rect x="190" y="246" width="76" height="32" rx="16" />
        <rect x="1270" y="270" width="120" height="26" rx="13" /><rect x="1300" y="256" width="60" height="28" rx="14" />
      </g>

      {/* birds: a flock drifting across, and a hornbill in flight */}
      <g className="hs-flock" fill="none" stroke="#10131F" strokeWidth="2.2" strokeLinecap="round">
        <path d="M600 280q6-6 12 0q6-6 12 0" /><path d="M630 268q5-5 10 0q5-5 10 0" /><path d="M655 286q5-5 10 0q5-5 10 0" />
        <path d="M680 272q4-4 8 0q4-4 8 0" /><path d="M576 292q5-5 10 0q5-5 10 0" />
      </g>
      <g className="hs-hornbill" transform="translate(860 300)">
        <path d="M-18 0C-10-4 4-4 14-2L22 2 14 4C4 6-10 6-18 0Z" fill="#10131F" />
        <path d="M-6-2C-14-16-24-20-34-18C-24-10-16-4-8 0Z" fill="#10131F" /><path d="M-22-14l8 4" stroke="#fff" strokeWidth="2.4" />
        <path d="M-18 0L-34 6-30 0-34-4Z" fill="#fff" stroke="#10131F" strokeWidth="1" />
        <path d="M20 0C28 0 34 4 38 8C32 6 26 5 20 4Z" fill="#FFC21A" /><path d="M20-2C26-4 32-2 34 2L22 1Z" fill="#FF8A1E" />
        <circle cx="16" cy="-1" r="1.2" fill="#D23A2E" />
      </g>

      {/* snow peaks */}
      <path d="M0 370L120 312 200 340 330 262 430 330 560 280 680 340 800 292 930 350 1040 300 1180 244 1300 310 1440 280V430H0Z" fill="#A9BCE0" />
      <g fill="#fff">
        <path d="M330 262L352 284 340 280 330 290 318 282 308 284Z" /><path d="M560 280L578 298 566 295 556 302 546 296Z" />
        <path d="M800 292L816 308 806 305 796 311 788 306Z" /><path d="M1180 244L1204 268 1190 263 1178 272 1166 264 1156 268Z" />
      </g>
      <ellipse cx="720" cy="378" rx="780" ry="30" fill="#fff" opacity=".35" />

      {/* monastery hill with prayer flags */}
      <path d="M980 430C1050 352 1130 330 1196 338C1262 346 1322 384 1370 430Z" fill="#6DBF6A" />
      <path d="M1180 258Q1140 300 1104 346M1180 258Q1224 300 1262 346" fill="none" stroke="#5A4A3A" strokeWidth="1" />
      {[0.25, 0.45, 0.65, 0.85].map((t, i) => (
        <g key={t}>
          <rect x={1180 - 76 * t - 3} y={258 + 88 * t} width="6" height="8" fill={flag[i]} />
          <rect x={1180 + 82 * t - 3} y={258 + 88 * t} width="6" height="8" fill={flag[(i + 2) % 5]} />
        </g>
      ))}
      <rect x="1150" y="306" width="60" height="32" fill="#FBF8F2" stroke="#10131F" strokeWidth="1.2" />
      <rect x="1150" y="306" width="60" height="7" fill="#8E1F2A" />
      <rect x="1160" y="320" width="7" height="9" fill="#10131F" /><rect x="1193" y="320" width="7" height="9" fill="#10131F" />
      <rect x="1175" y="322" width="10" height="16" fill="#8E1F2A" />
      <path d="M1140 308L1156 294H1204L1220 308Z" fill="#FFC21A" stroke="#7A5200" strokeWidth="1" />
      <rect x="1165" y="282" width="30" height="13" fill="#FBF8F2" stroke="#10131F" strokeWidth="1" />
      <path d="M1158 284L1170 274H1190L1202 284Z" fill="#FFC21A" stroke="#7A5200" strokeWidth="1" />
      <path d="M1180 256L1184 274H1176Z" fill="#FFC21A" /><circle cx="1180" cy="255" r="3" fill="#FFC21A" />

      {/* tea-garden hills with pickers */}
      <path d="M0 436C120 386 240 366 360 396S560 366 680 386 900 426 1040 406 1300 386 1440 406V560H0Z" fill="#8FD27A" />
      <g fill="none" stroke="#B6E6A0" strokeWidth="4" strokeLinecap="round" opacity=".8">
        <path d="M420 404c60-14 130-18 200-6M430 418c60-12 130-14 196-4M444 432c56-10 120-12 180-2M460 446c50-8 104-8 154 0" />
        <path d="M60 420c50-18 110-24 160-16M70 436c50-14 100-18 150-10" />
      </g>
      <Person x={500} y={410} top="#D2343C" basket hat />
      <Person x={548} y={414} s={0.95} top="#FFC21A" basket hat flip />
      <Person x={596} y={420} s={0.9} top="#2DC56E" basket hat />

      {/* village */}
      <StiltHouse x={170} y={430} />
      <StiltHouse x={236} y={436} s={0.85} />
      <StiltHouse x={296} y={428} s={0.95} />
      <Pine x={120} y={436} s={0.7} fill="#3E9E5A" /><Pine x={340} y={432} s={0.6} fill="#3E9E5A" />

      {/* waterfall and river */}
      <path d="M1028 400h16c4 30-2 60 3 98h-22c4-38-1-68 3-98z" fill="#fff" opacity=".92" />
      <path d="M1036 505C960 522 880 500 800 512S640 540 560 528 420 520 340 534" fill="none" stroke="#7FC8F0" strokeWidth="16" strokeLinecap="round" />
      <path d="M1036 505C960 522 880 500 800 512S640 540 560 528 420 520 340 534" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 26" opacity=".7" />
      <ellipse cx="1036" cy="505" rx="44" ry="10" fill="#fff" opacity=".55" />

      {/* mid hills, trail, trekkers and a Ranger in orange */}
      <path d="M0 486C140 446 260 456 380 436S600 456 740 466 1000 446 1140 456 1340 476 1440 466V560H0Z" fill="#3E9E5A" />
      <path d="M150 530C240 510 320 498 400 490S560 470 640 474" fill="none" stroke="#F3D9A8" strokeWidth="3" strokeDasharray="8 7" strokeLinecap="round" />
      <Person x={420} y={492} s={1.05} top="#3E73D8" pack="#FF6A2B" staff />
      <Person x={452} y={487} s={1.05} top="#F49BBE" pack="#FFC21A" />
      <Person x={492} y={482} s={1.1} top="#FF6A2B" staff flip />
      <path d="M688 524L700 532H740L752 524Z" fill="#8A4A24" stroke="#4A2410" strokeWidth="1.2" />
      <Person x={720} y={524} s={0.8} top="#FBFAF6" hat />
      <path d="M730 506L748 534" stroke="#6B4A1A" strokeWidth="1.6" />
      <Elephant x={820} y={494} s={0.9} />
      <Elephant x={858} y={498} s={0.6} />
      <Rhino x={960} y={492} s={0.9} />
      <Pine x={60} y={476} /><Pine x={96} y={470} s={0.8} /><Pine x={900} y={462} s={0.7} />
      <Pine x={1340} y={474} /><Pine x={1376} y={470} s={0.8} />

      {/* foreground: bamboo, grass and a grazing mithun */}
      <path d="M0 532C180 504 320 512 480 522S800 504 980 516 1300 530 1440 522V560H0Z" fill="#1F6B3E" />
      <g stroke="#2E8B57" strokeWidth="5" strokeLinecap="round">
        <path d="M30 548V470M44 548V460M58 548V478" /><path d="M1404 548V468M1418 548V458" />
      </g>
      <g fill="#3E9E5A">
        <path d="M44 470c14-6 30-6 44 2-16 2-30 2-44-2zM30 486c-14-6-28-4-40 4 14 2 28 0 40-4zM1418 462c-14-6-30-6-44 2 16 2 30 2 44-2z" />
      </g>
      <Mithun x={1210} y={526} />
      <path d="M0 548C300 538 600 552 900 544S1300 548 1440 546V560H0Z" fill="#10131F" />
    </svg>
  );
}
