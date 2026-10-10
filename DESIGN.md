# Trekne design system

Read this before touching any UI in this repo (website, `/super` CRM, or the mobile app).
It describes what already exists, so new work looks like it belongs. When this file and the
code disagree, the code wins, so fix this file in the same commit.

**Brand:** Trekne, "Know Before You Go". Ranger-verified travel intelligence for Northeast India.
**Feel:** bold, friendly, clear. Big chunky display type, flat saturated colour blocks, very round
shapes, a mascot made of two big eyes. Think "playful outdoor brand" rather than "SaaS dashboard",
but always honest about data.

---

## 1. Where things live

| What | Path |
| --- | --- |
| Brand tokens (source of truth, shared web + mobile) | `packages/brand/src/tokens.ts` |
| Status / risk semantics (labels, levels) | `packages/brand/src/semantics.ts` |
| Line icon geometry | `packages/brand/src/icons.ts` |
| Web CSS tokens + all marketing-site styles | `apps/web/app/globals.css` |
| CRM (`/super`) styles | `apps/web/app/super/crm.css` |
| Destination Intelligence styles | `apps/web/components/intel/intel.css` |
| Fonts | `apps/web/app/layout.tsx` (`next/font/google`) |
| Icon component | `apps/web/components/Icon.tsx` (`<Icon name="pin" />`) |
| Mascot eyes | `apps/web/components/Eyes.tsx` + `EyeTracker.tsx` |

Styling is **plain global CSS with CSS variables**. No Tailwind, no CSS-in-JS, no UI kit.
Class names are short and semantic (`.btn`, `.tile`, `.sec-head`, `.st.verified`). Keep it that way.

If you change a colour, radius or font, change it in **both** `packages/brand/src/tokens.ts`
and `apps/web/app/globals.css`.

---

## 2. Colour

### Brand colours (same in light and dark)

| Token | Hex | Meaning / use |
| --- | --- | --- |
| `--orange` | `#FF6A2B` | Primary brand. Hero, mascot, CTA blocks, "high" risk, caution |
| `--orange-deep` | `#E9541A` | Pressed / deeper orange |
| `--yellow` | `#FFC21A` | Sun, highlights, "pending" / "moderate" |
| `--blue` | `#7090E4` | Hills, "official" (IMD / govt) source, focus ring |
| `--green` | `#2DC56E` | Main CTA (`.btn-green`), "verified", "good / low risk" |
| `--ink` | `#10131F` | Text on coloured blocks; always dark in both themes |
| `--white` | `#FFFFFF` | Text on orange, mascot eyes |

Text on any brand-colour block (orange, yellow, green, blue) is **`--ink`**, not white, except the
white accent word in big orange headlines (`.hero h1`, `.cta h2 span`).

### Theme tokens (switch between light and dark)

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#EEF2F7` | `#0C0F17` | Page background (cool grey, never pure white) |
| `--surface` | `#FFFFFF` | `#161A25` | Cards, panels |
| `--surface-2` | `#F5F7FB` | `#1C2130` | Inset areas, inputs |
| `--text` | `#10131F` | `#EEF1F7` | Body text |
| `--muted` | `#586078` | `#A3ABBD` | Secondary text, labels |
| `--line` | `#DCE2EC` | `#2A3042` | Hairlines, ghost-button rings |
| `--chip` | `#E4E9F2` | `#252B3C` | Chips, active nav pill, segmented bg |
| `--deep` | `#10131F` | `#1A1F2E` | Dark feature block (`.promise`) |

Dark mode follows `prefers-color-scheme`, and can be forced with `data-theme="dark|light"` on `<html>`.
Only redefine **tokens** in the dark blocks. Never write per-component dark-mode rules.

Tints are made with `color-mix(in srgb, var(--green) 22%, var(--surface))` so they work in both themes.

### Rules
- Use tokens, never raw hex in components (exceptions: things that sit on a fixed-colour background, like the white search bar in the orange hero, which uses `#586078` / `#7A8195`).
- Colour blocks are **flat**. The only gradients are the hero sky (`#FF6A2B → #FF8A3A → #FFB247`) and weather skies.
- No purple, no neon, no glassy gradients on UI chrome.

---

## 3. Typography

| Role | Font | CSS var | Notes |
| --- | --- | --- | --- |
| Display (all headings, big numbers, logo) | **Bricolage Grotesque** 700/800 | `--display` | Tight tracking, tight leading |
| Body / UI | **Figtree** 400–700 | `--body` | 17px / 1.6 base |
| Data, coordinates, timestamps | **JetBrains Mono** 500 | `--mono` | `.mono` = 12.5px |

Headings: `font-family: var(--display); letter-spacing: -.03em; line-height: 1; text-wrap: balance`.
Bigger headings get tighter tracking.

| Element | Size | Weight | Tracking | Leading |
| --- | --- | --- | --- | --- |
| Hero h1 | `clamp(50px, min(12.4vw, 15vh), 190px)` | 800 | -.055em | .86 |
| CTA h2 | `clamp(48px, 8vw, 124px)` | 800 | -.055em | .86 |
| Section h2 (`.sec-head h2`) | `clamp(38px, 5.6vw, 72px)` | 800 | -.03em | 1 |
| Card h3 | 21–32px | 700–800 | -.02em | 1–1.1 |
| Lede (`.sec-head p`, `.lede`) | `clamp(17px, 1.5vw, 19px)`, `--muted` | 400 | | max 62ch |
| Card body | 14.5–15.5px, `--muted` | 400–500 | | 1.5 |
| Eyebrow / labels | 11.5–13px uppercase | 600–700 | .08–.12em | |

**Eyebrow** (`.eyebrow`): small uppercase label with an orange dot before it. Use above section titles.

Headline trick: one word in a contrasting colour (`<span>` white on orange, `<em>` yellow on deep).

---

## 4. Shape, spacing, layout

**Radius** (everything is round):

| Token | Value | Use |
| --- | --- | --- |
| `--r-xl` | 36px | Hero, big feature blocks (`.promise`, `.cta`, `.stage`, intel panels) |
| `--r-lg` | 28px | Bento tiles, pillars, business cards, menu sheet |
| `--r-md` | 18px | Small cards, list rows, dropdown menu |
| 12–16px | | Icon tiles (`.ic`), inner chips |
| `999px` | | **All buttons, inputs, chips, tabs, search bars** |

Form fields are **fully rounded pills**, same as buttons (`border-radius: 999px`).
Only multi-line `textarea` uses 22px.

**Spacing:**
- Page gutter: `--gutter` = `clamp(16px, 2.6vw, 32px)`, **16px on desktop ≥1181px** (matches the gap above the hero). Set on `body` padding-inline.
- Content width: `.wrap` = 1280px, 1920px on desktop.
- Sections: `padding-block: clamp(64px, 9vw, 120px) 0`.
- Grid gaps: 12–16px between cards; `clamp(16px, 1.8vw, 24px)` in intel.
- Lay out with `grid`/`flex` + `gap`, not margins.

**Breakpoints** (max-width): `1180` nav → hamburger · `1080` 4-col → 2-col · `980` 2-col → 1-col ·
`820/860` CTA/footer stack · `640` phone · `560` everything 1-col · `480/420/380` tiny phone tweaks.

**Surfaces:** cards are `background: var(--surface)` with radius and **no border, no shadow**.
Shadows are only for floating things (dropdown, menu sheet, hero chips, ID card, phone mock).
Hairlines are `1.5px solid var(--line)`.

---

## 5. Components (reuse these, don't reinvent)

### Buttons, `.btn` + variant
- `.btn`: pill, `700 16px` body font, `padding: 15px 22px`, icon gap 10px.
- `.btn-green` (primary CTA, ink text) · `.btn-ink` (dark) · `.btn-ghost` (2px `--line` ring) · `.btn-orange` · `.btn-danger` · `.btn-sm` (CRM).
- **No hover effects on buttons** (no lift, no colour change). Only `:active { scale(.98) }` and `:focus-visible`.
- Icons go inside as `<Icon name="arrow" />`.

### Chips & status (the honesty language)
- `.st.verified` (green) · `.st.official` (blue) · `.st.pending` (yellow) · `.st.unverified` (chip grey): pill + coloured dot.
- `.lvl.good/.warn/.high/.none`: 14px risk dots. **`.none` is a hollow ring = "Not verified" (we don't guess).**
- `.sim`: muted pill with yellow dot, used for "Pilot preview · simulated data".
- CRM equivalents: `.pill` + `.lvl-*` / `.st-*` in `crm.css`.
- Labels come from `semantics.ts` (`REPORT_LABEL`, `RISK_LABEL`, `SUITABILITY_LABEL`).

### Header / nav
- Sticky, translucent (`color-mix(--bg 82%)` + `blur(14px)`), **hides on scroll down, shows on scroll up** (`.site-head[data-hidden]`).
- Links are pills; current page = `--chip` background (`aria-current="page"`).
- ≤1180px: round `.menu-btn` opens a `.sheet` (big display-font links, portalled to body).

### Dropdown, `components/Dropdown.tsx`
- Not portalled. Menu is `position: absolute; top: calc(100% + 10px)`, always **below** its trigger and attached to it.
- Options have coloured 38px icon tiles (yellow / green / blue), title + small muted description, green check when selected.

### Inputs
- Pill (`999px`), `--surface-2` fill, `inset 0 0 0 1.5px var(--line)` ring, focus = `2px var(--blue)` ring. No outlines.
- Hero search: white pill with inner button on the right, soft orange-tinted shadow.

### Icons
- 24×24, stroke 2, round caps/joins, no fill (`.ico`, 22px default). Defined once in `packages/brand/src/icons.ts`.
- Add new icons there; never paste inline SVG icons or use emoji as icons.
- Icon "tiles": rounded square (12–16px radius) or circle, filled with a brand colour, ink icon inside.

### Mascot
- Two big white eyes with ink pupils that follow the pointer and blink. Lives on orange/yellow blobs (hero art, bento dome, CTA, auth page, footer wordmark where eyes are orange).
- Use it as the brand's face in empty states and big moments, not as decoration everywhere.

### Signature blocks
- **Hero:** orange sky gradient card, `--r-xl`, fills the viewport minus header and one gutter. Giant 2-colour headline (ink + white), hills art at the bottom, floating white "live" chips.
- **Bento:** mixed-size tiles, some solid brand colour (orange, blue), some white.
- **Pillars:** 4 solid colour cards (orange, green, yellow, blue) with white circular icon badge.
- **Promise:** `--deep` block, yellow `<em>` highlight, 3 columns split by translucent top rules.
- **CTA:** orange block, huge headline, white join row, yellow morphing blob with eyes.
- **Footer:** giant `trekne` wordmark with orange eyes, uppercase muted column headings.

---

## 6. Data honesty rules (non-negotiable)

Trekne's whole promise is "we don't guess". UI must show where data comes from.

- Every condition/report shows its status chip: Verified / Official / Pending review / Unverified.
- Pending and unverified reports are labelled **"Unconfirmed"** and drawn with **dashed** outlines.
- Unknown numbers render as **"Not verified"** (muted, dotted underline). Never invent a value, never show `0` for unknown.
- Caution/risk segments only come from verified or official sources.
- Visitor trends only show when a source exists.
- Route maps are **schematic** and labelled "not to scale".
- While data is simulated, keep the visible `.sim` disclaimer ("Pilot preview · simulated data, not live conditions").

---

## 7. Destination Intelligence (`components/intel/`)

Mood: Google Earth × Apple Weather × Strava. Few containers: the photo, route and weather are the
surfaces; everything else sits on the page, separated by hairlines.

- Layout: 60/40 grid (`3fr 2fr`). ≤980px becomes one column ordered: photo, weather, route, advice, environment, reports, culture.
- **Destination photo:** full-bleed `--r-xl` image, dark gradient at the bottom, giant white name, frosted-glass chips (`rgba(255,255,255,.16)` + blur).
- **Route map:** schematic SVG on a tinted `--surface-2` (green for trek, blue for river). Start = green dot, end = orange dot. Report pins are teardrop pins coloured by status; caution segments are marching orange dashes.
- **Weather:** sky-gradient panel (`data-sky` = clear/grey/wet), giant temperature, scrollable hourly strip with a temperature line and rain bars. Select by click or focus (no hover).
- Tabs: pill segmented control; active = `--text` bg with `--bg` text.

---

## 8. Motion

- Personality comes from a springy overshoot curve: `cubic-bezier(.3, 1.6, .5, 1)` (mobile: `spring` in tokens.ts).
- Entrances: `cubic-bezier(.2, .9, .25, 1.15)` rise (hero words staggered by .07s), `drop` for menus, `di-in` fade-up for swaps.
- Ambient: chips bob (6s), eyes blink (7s), CTA blob morphs (12s).
- Scroll reveals use CSS scroll-driven animations inside `@supports (animation-timeline: view())`, so content is always visible without them.
- Always respect `prefers-reduced-motion` (global kill switch at the end of `globals.css`).
- **No hover effects on buttons.** Prefer click/focus states over hover for anything interactive (touch first).

---

## 9. CRM (`/super`)

Same tokens, fonts and shapes as the site, just denser.
- Sidebar (248px, `--surface`), active item = `--text` pill. ≤900px it slides in as a drawer.
- `.card` (radius `--r-md`, padding 20), `.kpi` tiles with 36px display numbers.
- Tables: uppercase muted headers, `1.5px --line` row rules, mono for numbers.
- Pill inputs/selects, `.seg` segmented control, `.toast` pill at the bottom.

---

## 10. Accessibility & quality bar

- Focus: `outline: 3px solid var(--blue); outline-offset: 3px` on `:focus-visible`. Never remove it.
- Text on brand colours is `--ink` for contrast.
- Every icon is `aria-hidden`; buttons with only an icon need `aria-label`.
- Works at 360px wide with no horizontal scroll; check light **and** dark.
- Images through `next/image`; real content only, no lorem ipsum.

## 11. Don'ts

- Don't add Tailwind, shadcn, MUI or another UI library.
- Don't use Inter/Roboto/system fonts for headings.
- Don't add borders + shadows to every card.
- Don't add hover lifts or colour shifts to buttons.
- Don't use square corners on buttons or inputs.
- Don't show made-up numbers as facts.
- Don't use emoji as icons.
