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
- Links: Plan a trip · Destinations · Homestays · Shop · About Trekne (`/about`; `/how-it-works` redirects there). Homestays and Shop carry a yellow `.soon-tag` ("Soon") until they launch. Rangers, Authorities, Roadmap and "List your business" live in the footer.
- Links are pills; current page = `--chip` background (`aria-current="page"`).
- ≤1180px: round `.menu-btn` opens a `.sheet` (big display-font links, portalled to body).
- Rightmost: round `.acct-btn` (`components/AccountMenu.tsx`) opens a `.dd-menu` anchored to its right edge: Sign in / Create account when signed out, Your account / Sign out when signed in (button turns orange).
- Public login is `/login` (Traveller / Ranger tabs, `?mode=up`, `?as=ranger`); it reuses the `/super` `.auth` split layout. Staff still sign in at `/super`.

### Native controls
- No native `<select>` or date inputs on the site: use `Dropdown` and `DatePicker`.
- Scrollbars are thin and orange everywhere (`scrollbar-color` plus WebKit thumbs in `globals.css`).

### Dropdown, `components/Dropdown.tsx`
- Not portalled. Menu is `position: absolute; top: calc(100% + 10px)`, always **below** its trigger and attached to it.
- Options have coloured 38px icon tiles (yellow / green / blue), title + small muted description, green check when selected.
- `className="dd-pill"`: theme-coloured pill trigger for normal surfaces. `placeholder` + empty value makes a picker ("+ Add a place…").
- Options can carry a `dot` (level colour), and type-ahead jumps by first letters.
- `layout="grid"` (planner): the menu stretches across the nearest positioned box with an orange frame, options become cards
  (up to four per row) filled with the place photo (`lib/photos.ts`) or a flat brand colour by kind, with `meta` chips.
- Planner stop cards (`.pln-stop[data-img]`) use the same photo + ink scrim with white text; the alternatives panel stays solid.

### Destinations explorer, `components/explore/`
- Every published place, from the database. Filters (search, state, month, sort, good-season, lesser-known), a card grid,
  a MapLibre map and a detail panel share one selection: hover a card to lift its pin, click a pin to select its card.
- `?place=slug` selects a place. On phones the map is behind a List/Map toggle and details open as a bottom sheet.
- Load MapLibre via `lib/maplibre.ts` (sets the worker URL; without it no tiles render). Don't give markers a `position`.

### Place page, `app/(site)/places/[slug]` + `components/place/`
- Photo mosaic (one large, four small, "View all N photos") opening a full-screen viewer (arrows, swipe, Esc, thumbnails).
  Phones get a swipeable strip.
- Then: title + "Add to a trip" / "See on the map", community notices, four "at a glance" tiles (eco-risk, crowding,
  this month's season, access), main content beside a sticky "Plan your visit" column.
- Photos come from `lib/photos.ts` (`placeGallery`): the bundled main photo plus Wikimedia Commons extras. Every photo
  shows its credit and licence in the viewer and in "Photo credits" at the bottom. Keep that when adding photos.

### Date picker, `components/DatePicker.tsx`
- Pill trigger (`.trip-pill.trip-date`) showing "Sun, 18 Oct"; opens a `.cal` month grid (Monday first, past days struck through, today ringed).
- The trip's days are tinted orange, with the start day solid orange; a footer reads "3-day trip: 18 Oct – 20 Oct".
- The one exception to "not portalled": the hero clips its overflow, so `.cal` is portalled to `<body>` and placed below the pill, or above it when there isn't room, in page coordinates.
- Keyboard: arrows move by day/week, PageUp/PageDown by month, Enter picks, Escape closes.

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
- On the sign-in pages (`/login`, `/super`) `PasswordField` sets `data-eyes` on `.auth`: `closed` while typing a password squeezes both eyes into an ink line; `peek` (password shown) keeps one eye shut and opens the other. The mobile app's `Eyes` (`apps/mobile/src/components/mascot.tsx`) mirrors this with the same curves and timings (ink line, pupil fade, springy open, 7 s blink); keep the two in step.

### Signature blocks
- **Hero:** orange sky gradient card, `--r-xl`, fills the viewport minus header and one gutter. Everything centred: giant 2-colour headline (ink + white), planning-first search ("Plan a trip" → `/planner?add=<slug>&start=&days=&party=`), a row of white trip pills under it (start date, days and travellers steppers; on phones the date takes a full row and the steppers show icons), then a "check today's conditions" link, hills art at the bottom, a centred row of floating white advisory chips: a warning (orange), a caution (yellow) and a clear, good-to-visit forecast (green).
- **Bento:** mixed-size tiles, some solid brand colour (orange, blue), some white. Alive by design (`components/bento/`): tiles rise in staggered as they enter view; the trio chats in speech bubbles on a loop (tap a character to make it jump and speak); the calendar app icon rings and drops a push-style trip alert per tap, counting its badge down; orbit icons circle, the dome rises on hover; the scene drifts; the Ranger blinks, and his hidden hand swings up from the shoulder (fixed pivot) to wave once on entering view and for as long as the tile is hovered; the "Coming soon on iOS / Android" badges carry the real Apple and Google Play logos; the search pill types place names; Field notes rotates local tips (tap for the next). Auto-advancing bits run only while on screen, hold for 8 s after a tap, and never auto-advance under reduced motion.
- **Pillars:** 4 solid colour cards (orange, green, yellow, blue) with white circular icon badge.
- **How it works trail** (`HowItWorks.tsx`, `.trail`): one report's journey as a winding ink road with marching yellow dashes and five numbered colour stops, cards alternating above and below the road (subgrid). Each column draws its own road slice so they join at the column edges. ≤980px it becomes a vertical road with cards on the right. The last stop (the live advisory) pings green. Scroll lights it: `TrailScroll` sets `--p` (0→1); an orange copy of the road is revealed left to right and each stop/card lights up as the fill reaches it. On desktops ≥981×760 the stage is sticky inside a 260svh wrapper, so the section holds until the road is lit edge to edge; elsewhere it fills as the trail passes 80% of the viewport. Without JS `--p` is 1 (fully drawn).
- **About ecosystem** (`AboutHero.tsx`, `.eco`): square `--deep` panel, orange mascot core, four linked role nodes (Rangers, Travellers, Authorities, Businesses) joined by flowing dashed spokes. Beside it a big headline and a row of stat tiles with brand-colour dots. (`.orbit` is taken by the bento tile.)
- **Coming soon** (`ComingSoon.tsx`, `.soon`): for features that follow the planner (`/homestays`, `/shop`). Flat brand-colour block with a "Coming soon" ink badge, big ink headline, morphing blob with eyes and two floating `.live-chip`s; three planned-feature cards tagged `.st.unverified` "Planned"; a mini road (live planner → Homestays → Shop). No sample listings: these are previews, not fake data.
- **Business waitlist** (`BusinessWaitlist.tsx`, `.lw`): surface card with name, business name, a "what you'd list" `Dropdown` and email + phone (either or both). Writes to `waitlist` with `role = 'business'`. Used on `/homestays`, `/shop` and `/business`.
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
- Ambient: chips bob (6s), eyes blink (7s), CTA blob morphs (12s), promise sun spins (48s).
- In-view entrances: drop `<InViewFlag />` inside a block; it sets `data-armed` / `data-in` on the parent for CSS (e.g. the promise sun pops in with a bounce). Animate with individual `rotate` / `scale` properties so ambient and entrance animations don't fight over `transform`.
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
