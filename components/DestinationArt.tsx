import type { DestinationKey } from "@/lib/destinations";

/** Flat illustrations for each pilot destination (placeholder until real photography). */
export function DestinationArt({ dest, className = "art" }: { dest: DestinationKey; className?: string }) {
  const common = { className, viewBox: "0 0 500 300", preserveAspectRatio: "xMidYMid slice", "aria-hidden": true } as const;

  if (dest === "nohkalikai") {
    return (
      <svg {...common}>
        <rect width="500" height="300" fill="#7090E4" />
        <g fill="#fff" opacity=".9">
          <rect x="60" y="40" width="110" height="30" rx="15" />
          <rect x="90" y="24" width="56" height="32" rx="16" />
          <rect x="330" y="56" width="90" height="26" rx="13" />
        </g>
        <path d="M0 90h200l20 210H0z" fill="#2A3C8F" />
        <path d="M500 110H270l-16 190h246z" fill="#1F2D6B" />
        <path d="M212 92h28c-6 60 6 130-2 190h-30c8-60-4-130 4-190z" fill="#fff" />
        <ellipse cx="228" cy="282" rx="80" ry="22" fill="#5FD3C6" />
        <ellipse cx="228" cy="272" rx="70" ry="14" fill="#fff" opacity=".55" />
        <path d="M0 90h200" stroke="#2DC56E" strokeWidth="10" />
        <path d="M270 110h230" stroke="#2DC56E" strokeWidth="10" />
      </svg>
    );
  }

  if (dest === "dawki") {
    return (
      <svg {...common}>
        <rect width="500" height="300" fill="#7FDCCB" />
        <g fill="#5FBFAE">
          <circle cx="60" cy="250" r="16" />
          <circle cx="96" cy="270" r="10" />
          <circle cx="420" cy="60" r="18" />
          <circle cx="452" cy="90" r="11" />
          <circle cx="380" cy="250" r="14" />
          <circle cx="140" cy="60" r="12" />
        </g>
        <path d="M0 0h70c-20 100 10 200-10 300H0z" fill="#1B8A4C" />
        <path d="M500 0h-60c16 100-12 200 8 300h52z" fill="#1B8A4C" />
        {/* the boat's shadow on the riverbed — Umngot's famous "floating boat" */}
        <path d="M150 190h200l-30 26H180z" fill="#10131F" opacity=".22" />
        <path d="M140 128h220l-34 30H172z" fill="#FF6A2B" />
        <path d="M172 158h154" stroke="#E9541A" strokeWidth="4" />
        <circle cx="250" cy="118" r="10" fill="#10131F" />
        <path d="M240 128h20v-4h-20z" fill="#FFC21A" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect width="500" height="300" fill="#2DC56E" />
      <circle cx="410" cy="70" r="40" fill="#FFC21A" />
      <path d="M0 140c80-50 150-40 220-12s140-50 280-12v184H0z" fill="#1B8A4C" />
      <path d="M0 230h500v70H0z" fill="#7090E4" />
      <path d="M0 248c50-8 100 8 150 0s100 8 150 0 100 8 200 0" stroke="#fff" strokeWidth="3" fill="none" opacity=".5" />
      <path d="M40 222Q250 90 460 222" stroke="#6B3E26" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M40 164Q250 40 460 164" stroke="#6B3E26" strokeWidth="11" fill="none" strokeLinecap="round" />
      <g stroke="#6B3E26" strokeWidth="3.5" opacity=".8">
        <path d="M100 190v-40M150 162v-36M200 146v-36M250 140v-36M300 146v-36M350 162v-36M400 190v-40" />
      </g>
      <rect y="90" width="42" height="160" fill="#10131F" opacity=".9" />
      <rect x="458" y="90" width="42" height="160" fill="#10131F" opacity=".9" />
    </svg>
  );
}
