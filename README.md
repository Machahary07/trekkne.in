# trekne.in

**Trekne — Know Before You Go.** Sustainable tourism, eco-risk and cultural heritage intelligence for Northeast India.

| App | Path | What |
| --- | --- | --- |
| Website + CRM | `apps/web` | Next.js 16. trekne.in, and the staff CRM at **/super** |
| Mobile | `apps/mobile` | Expo SDK 57. Tourist and Ranger modes, 360 capture |
| Brand | `packages/brand` | Colours, fonts, icons shared by web and app |
| DB | `packages/db` | Generated Supabase types, panorama maths |
| Viewer | `packages/viewer` | three.js 360 viewer (CRM, site and app) |
| Database | `supabase/` | Migrations for the `trekne.in` Supabase project |

See [docs/PLAN.md](docs/PLAN.md) for how this maps to the problem statement, roles and next steps, and
[DESIGN.md](DESIGN.md) for the design system (tokens, components, patterns).

## Website

Planning-first: the trip planner and destination guide come first; Homestays and Shop are coming-soon pages
that collect a business waitlist.

| Route | What |
| --- | --- |
| `/` | Hero with planning search (place, start date, days, travellers), live bento, Destination Intelligence |
| `/planner` | Trip planner (`?add=<slug>&start=&days=&party=`) |
| `/destinations` | Explorer: filters, card grid and MapLibre map sharing one selection (`?place=slug`) |
| `/places/[slug]` | Place page: photo mosaic + viewer, notices, at-a-glance tiles, "Plan your visit" |
| `/about` | About Trekne (`/how-it-works` redirects here) |
| `/homestays`, `/shop` | Coming soon, with business waitlist |
| `/business` | "List your business" waitlist (name, business, email/phone, kind) |
| `/login`, `/account` | Public sign-in (Traveller / Ranger) and account page |
| `/rangers`, `/authorities`, `/roadmap` | Linked from the footer |
| `/super` | Staff CRM (waitlist, map, places) |

## Setup

```bash
pnpm install               # once, at the repo root (pnpm workspaces; pnpm 10, see packageManager)
pnpm add <pkg> --filter @trekne/web          # add a web dependency
cd apps/mobile && pnpm exec expo install <pkg>  # add a mobile dependency (SDK-matched)
```

Create the env files (both are git-ignored). Use the **anon / publishable** key from Supabase → Project Settings → API:

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://yhrloltsznexpxuwyjhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# apps/mobile/.env.local
EXPO_PUBLIC_SUPABASE_URL=https://yhrloltsznexpxuwyjhr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Run

```bash
pnpm web         # http://localhost:3000, CRM at http://localhost:3000/super
pnpm mobile      # Expo dev server; scan the QR code with Expo Go
```

The 360 capture needs a real phone (camera + gyroscope). Simulators can't run it.

## Database

```bash
supabase link --project-ref yhrloltsznexpxuwyjhr
supabase migration new <name>      # write SQL in supabase/migrations/
supabase db push                   # apply to the project
pnpm db:types                      # regenerate packages/db/src/database.types.ts
```

## Deploy (Vercel)

Vercel detects pnpm from `pnpm-lock.yaml`.

In the Vercel project set **Root Directory = `apps/web`** and add the two `NEXT_PUBLIC_SUPABASE_*` variables.
Run `supabase db push` before deploying when new migrations land (e.g. `20261011150000_business_waitlist.sql`).

## Brand

| Token  | Hex       | Use                                  |
| ------ | --------- | ------------------------------------ |
| Orange | `#FF6A2B` | Primary, mascot, hero sky            |
| Yellow | `#FFC21A` | Sun, highlights, pending status      |
| Blue   | `#7090E4` | Hills, official (IMD) status         |
| Green  | `#2DC56E` | CTA, verified status                 |
| Ink    | `#10131F` | Text, deep sections                  |

Defined once in `packages/brand/src/tokens.ts`; `apps/web/app/globals.css` mirrors it as CSS variables.
