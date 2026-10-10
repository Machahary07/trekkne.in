# Trekne — platform plan

Three clients, one backend:

| Client | What it is | Owner |
| --- | --- | --- |
| **Website** (trekne.in) | Public marketing + destination intelligence (Next.js, Vercel) | friend |
| **CRM / admin** | Staff tool: moderate Ranger reports, edit destinations, manage Rangers, waitlist, businesses | friend |
| **Mobile app** | Expo app (iOS + Android): Tourist mode and Ranger mode | vee |
| **Supabase** | Postgres + Auth + Storage + Realtime, project `trekne.in` (org `new`, ref `exwxtsbjiqkxzqzqummc`, ap-southeast-1) | shared |

The app must look identical to the site: same colors, fonts, icons, radii and motion feel. To make that hold over time, the design tokens and icon paths live in **one shared package** that both web and mobile import, rather than being copied.

---

## 1. Repo layout (proposed)

Move to a small npm-workspaces monorepo:

```
trekne.in/
  apps/
    web/            current Next.js site (moved from repo root) + CRM under /admin
    mobile/         Expo app (Expo Router)
  packages/
    brand/          tokens.ts (colors light/dark, fonts, radii, spacing), icons.ts (SVG path data)
    db/             generated Supabase types + shared query helpers / zod schemas
  supabase/
    migrations/     the ONLY place schema changes happen
    seed.sql        pilot data (Nongriat, Nohkalikai, Dawki)
    config.toml
  docs/
```

Why:
- `packages/brand` is how "exact same UI" stays true: change a hex once, both apps get it.
- `packages/db` gives web, CRM and mobile the same generated types, so a schema change breaks the build in every client instead of failing at runtime.
- CRM as `/admin` routes inside the Next app = one deploy, one auth setup. It can be split out later if needed.

Cost of the move: the site goes from repo root to `apps/web`, so Vercel's **Root Directory** setting must change to `apps/web`, and any open branches need a rebase. Do it once, early, before both of you have lots of in-flight work.

> Note: if `apps/mobile` were dropped into the current root instead, the Next `tsconfig.json` (`include: **/*.ts`) would type-check the Expo code and break `next build`. Avoid that layout.

---

## 2. Supabase

### Setup steps
1. `supabase login` with the account that owns org **new**. The CLI on vee's machine is currently logged into an account whose project list does **not** include `trekne.in`, so this has to happen first.
2. `supabase init` at repo root, then `supabase link --project-ref exwxtsbjiqkxzqzqummc`.
3. Write migrations locally (`supabase migration new <name>`), test with `supabase start` / `supabase db reset`, push with `supabase db push`.
4. `supabase gen types typescript --linked > packages/db/database.types.ts` after every migration.

### Rules for two people on one database
- **No schema edits in the dashboard on production.** All changes go through `supabase/migrations/` in a PR.
- Each migration is reviewed by the other person before `db push`.
- Clients only ever get the **anon/publishable key**. The service-role key never goes in the app, the website bundle or git. It lives only in server env (Vercel server functions / Edge Functions).
- Env vars: web uses `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`; mobile uses `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Real values go in `.env.local`, which is git-ignored.

### Schema v1 (derived from what the site already models)

```
profiles          id (= auth.users.id), full_name, phone, avatar_path,
                  role: traveller | ranger | moderator | admin   (default traveller)
                  ranger_status: applied | approved | suspended | null
destinations      id, slug (nongriat…), name, place, state, district, lat, lng,
                  facts jsonb, culture, aliases text[], is_published, updated_at
indicators        id, destination_id, kind, label, value,
                  level: good | warn | high | none, source, updated_at
reports           id, client_id (uuid, unique: idempotent offline upload),
                  destination_id, ranger_id, category: road | trail | weather | waste | crowd | closure,
                  text, lat, lng, accuracy_m, captured_at,
                  status: pending | verified | official | unverified | rejected,
                  moderated_by, moderated_at, created_at
report_photos     id, report_id, storage_path        (Storage bucket: report-photos, private)
advisories        id, destination_id, source (e.g. IMD), title, body, valid_from, valid_to
recommendations   id, destination_id, text, meta, generated_at      (AI summary per destination)
waitlist          id, contact, role: traveller | ranger | business, created_at
```

Phase 4 (bookings & business) adds `businesses`, `guide_profiles`, `bookings`, `payouts`. Leave them out of v1.

### Row Level Security (on for every table)
- **Public (anon):** read published `destinations`, `indicators`, `advisories`, `recommendations`, and `reports` where status is `verified` or `official`. Insert-only on `waitlist`.
- **Ranger:** insert own `reports` (a trigger forces `status = 'pending'` and `ranger_id = auth.uid()`), read own reports in any status, upload to own folder in `report-photos`.
- **Moderator / admin (CRM):** read everything, update report status, edit destinations / indicators / advisories.
- Role check via a `security definer` helper, e.g. `public.has_role('moderator')`, which reads `profiles.role`. Users can never update their own `role`.

### Auth
- Mobile: phone OTP or email OTP, plus Google sign-in. **Phone OTP needs a paid SMS provider** (Twilio / MSG91 / etc.), so this is a decision to make (see §6).
- CRM: email + password or magic link, staff accounts only, gated by `has_role('moderator')`.
- One account, two modes: Ranger mode unlocks only when `ranger_status = 'approved'`.

---

## 3. Design parity: web → Expo

Source of truth today: [`app/globals.css`](../app/globals.css), [`app/layout.tsx`](../app/layout.tsx), [`components/Icon.tsx`](../components/Icon.tsx), [`components/Eyes.tsx`](../components/Eyes.tsx). These move into `packages/brand`.

### Colors (exact hexes)

| Token | Light | Dark |
| --- | --- | --- |
| orange / orange-deep | `#FF6A2B` / `#E9541A` | same |
| yellow | `#FFC21A` | same |
| blue | `#7090E4` | same |
| green | `#2DC56E` | same |
| ink | `#10131F` | same |
| bg | `#EEF2F7` | `#0C0F17` |
| surface | `#FFFFFF` | `#161A25` |
| surface-2 | `#F5F7FB` | `#1C2130` |
| text | `#10131F` | `#EEF1F7` |
| muted | `#586078` | `#A3ABBD` |
| line | `#DCE2EC` | `#2A3042` |
| chip | `#E4E9F2` | `#252B3C` |
| deep / deep-text / deep-muted | `#10131F` / `#F3F5FA` / `#A9B0C2` | `#1A1F2E` / same / same |
| hero sky | `#FF7A34` | same |

React Native has no `color-mix()`. The status chip tints (`verified` = green 22% over surface, `official` = blue 24%, `guide-note` = blue 16%) get precomputed as hexes per theme in `tokens.ts`. The app follows the system theme via `useColorScheme()`, the same as the site's `prefers-color-scheme`.

### Typography

| Role | Web | Expo package |
| --- | --- | --- |
| Display (h1–h4, logo, big numbers) | Bricolage Grotesque 700/800, letter-spacing −0.03em (hero −0.055em), line-height 1 | `@expo-google-fonts/bricolage-grotesque` |
| Body | Figtree 400/500/600/700, 17px / 1.6 | `@expo-google-fonts/figtree` |
| Mono (GPS, timestamps) | JetBrains Mono 500, 12.5px | `@expo-google-fonts/jetbrains-mono` |

Translation notes:
- RN `letterSpacing` is in points, not em. Tokens expose a helper: `tracking(-0.03, fontSize)` returns `-0.03 * fontSize`.
- RN needs one font family per weight (`Figtree_600SemiBold` etc.); typography tokens map weight → family name so screens never hardcode fonts.
- The web uses Bricolage's variable optical-size axis (`opsz`). The Expo static font files use the default optical size, so very large display text will look slightly different. Check it on device, and bundle the variable TTF if the difference shows.

### Icons
- 24 line icons (search, camera, db, shield, spark, pin, route, leaf, users, temple, rain, wifioff, calendar, arrow, check, backpack, store, chart, phone, id, shirt, rupee, chat, eye), 24×24 viewBox, stroke 2, round caps and joins, no fill.
- Move the path data into `packages/brand/icons.ts` as plain data. The web `IconSprite` and a mobile `<Icon name size color />` (react-native-svg) both render from that one list, so the two sets stay identical.
- Mascot: `LogoMark` and `Eyes` port to react-native-svg. The 7s blink loop runs in Reanimated. On the web, pupils follow the cursor; in the app they can follow touch on the home screen.

### Shape & motion
- Radii: xl 36, lg 28, md 18, small cards 14, pills 999.
- Buttons: pill, Figtree 700 16px, padding 15×22. Variants `ink`, `green`, `ghost` (2px `line` border).
- Press feedback: the web uses `cubic-bezier(.3,1.6,.5,1)` overshoot. On mobile, use a Reanimated spring to scale 0.98 on press, plus a light haptic.
- Level dots: good = green, warn = yellow, high = orange, none = hollow ring in `muted` ("we don't guess").

---

## 4. Mobile app scope

Expo Router, latest SDK (`npx create-expo-app@latest`), TypeScript, `@supabase/supabase-js` with session storage in `expo-secure-store` / AsyncStorage.

**Tourist mode** (matches the `PhoneModes` mockup on the site)
- Home: greeting, upcoming trip card, latest verified / official updates
- Destination list + search (aliases: "root bridge" → Nongriat)
- Destination detail: facts, indicators with level dots, AI recommendation, report feed with status chips
- Book a Ranger guide: placeholder until Phase 4

**Ranger mode** (only for approved Rangers)
- New field report: destination, category grid (Road / Trail / Weather / Waste / Crowd / Closure), text, photos (`expo-camera` / `expo-image-picker`), GPS with accuracy (`expo-location`)
- **Offline first:** reports and photos queue locally (`expo-sqlite`), then upload on reconnect. `client_id` makes retries safe ("No signal. 2 reports saved…").
- My reports: status of each report (pending / verified / rejected), weekly earnings stub

**Shared:** auth, profile, mode switcher, push notifications for advisories (later).

---

## 5. Milestones

| # | Goal | Web / CRM (friend) | Mobile (vee) | Shared |
| --- | --- | --- | --- | --- |
| **M0** | Foundation | — | — | Monorepo move, `supabase link`, schema v1 migrations + RLS, seed pilot data, `packages/brand`, `packages/db` types |
| **M1** | Real data | `getDestinations()` reads Supabase, waitlist insert goes live | Scaffold app, theme + fonts + icons, auth | — |
| **M2** | Moderation loop | CRM: staff login, report moderation queue, destination editor | Tourist mode: list, detail, report feed | Storage bucket + policies |
| **M3** | Ranger network | CRM: Ranger applications / approval | Ranger mode: report form, GPS, photos, offline queue | Realtime: new pending reports appear in the CRM live |
| **M4** | Ship | — | EAS builds → TestFlight / Play internal testing | Push notifications for advisories |
| **M5** | Business | Bookings, business profiles, payments | Guide booking flow | Phase 4 tables |

---

## 6. Open decisions

1. **Monorepo move:** OK to move the site into `apps/web` now (and update Vercel's Root Directory)?
2. **Login method for the app:** phone OTP (needs a paid SMS provider), email OTP (free), Google, or a mix?
3. **CRM location:** `/admin` inside the Next app (recommended), or a separate app?
4. **Ranger payouts** (the "₹120 this week" in the mockup): in scope for the pilot, or display only?
