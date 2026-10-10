# trekne.in

Marketing and discovery website for **Trekne — Know Before You Go**: Ranger-verified, AI-powered travel intelligence for Northeast India.

Built with Next.js (App Router) + TypeScript, ready to deploy on Vercel. Frontend only for now — no database connection.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Deploy

Push to GitHub and import the repo in Vercel (framework preset: Next.js). No environment variables are required yet.

## Structure

```
app/
  layout.tsx         fonts (Bricolage Grotesque, Figtree, JetBrains Mono), metadata, icon sprite
  page.tsx           composes the landing page sections
  globals.css        brand tokens (light + dark) and all section styles
  icon.svg           favicon (mascot)
components/          one file per section + shared bits (Icon, Eyes, SiteState)
lib/
  destinations.ts    SIMULATED pilot data for Nongriat, Nohkalikai, Dawki
  shapes.ts          sunburst + decorative QR generators
```

## Brand

| Token  | Hex       | Use                                  |
| ------ | --------- | ------------------------------------ |
| Orange | `#FF6A2B` | Primary, mascot, hero sky            |
| Yellow | `#FFC21A` | Sun, highlights, pending status      |
| Blue   | `#7090E4` | Hills, official (IMD) status         |
| Green  | `#2DC56E` | CTA, verified status                 |
| Ink    | `#10131F` | Text, deep sections                  |

The mascot's eyes (`components/Eyes.tsx`) follow the cursor — "know before you go".

## Connecting Supabase later

- Replace the body of `getDestinations()` in `lib/destinations.ts` with a Supabase query; the components consume the same `Destination` type.
- The waitlist form in `components/JoinCta.tsx` has a `TODO` where an insert into a `waitlist` table goes. It currently validates input and tells the visitor nothing was saved.
- `.env.example` lists the variables you'll need.
