# Trekne — platform plan

**Problem statement (PS_CIVICTECH):** NER Sustainable Tourism, Eco-Risk & Cultural Heritage Intelligence Platform.
A prototype that supports *sustainable tourism planning* (not just discovery) by organising destination and cultural
information, considering accessibility and seasons, identifying eco-risks, and protecting communities and heritage —
adaptable across all eight NER states.

## How the build maps to the problem statement

| Focus area | Where it lives |
| --- | --- |
| Established **and lesser-known** destinations | `destinations.is_lesser_known`; the app's Home "Quieter, lesser-known" card; `suggest_alternatives()` prefers them |
| Accessibility, transport, seasons, infrastructure, connectivity | `destinations.access` (road, transport, signal, medical distance, permits), `seasonal_conditions` (12-month suitability), shown in the app and editable in the CRM |
| Environmental & ecological risk | `destination_overview()` computes an **explainable eco-risk score** (sensitivity + visitor load + season + verified issues), shown as a breakdown in the app and on the CRM map |
| Visitor pressure & **carrying capacity** | `carrying_capacity` per destination, `visitor_counts` (entry records, official, Ranger estimates), plus **planned trips** add to expected load; CRM "Visitor pressure" heat-grid for the next 14 days |
| Communities, indigenous practices, heritage | `heritage_sites` (photography rules, restricted areas, guidelines), `destinations.etiquette`, **Community steward** role that proposes protocols and events for staff review |
| Festivals, weather, changing conditions | `events` with visitor impact; Ranger **field reports** (moderated) and **360 scenes** of current conditions; indicators per destination |
| Useful for tourists, communities, authorities, planners | Roles: traveller, ranger, community, business, **tourism authority**, moderator, admin, super admin, each with its own tools |
| Planning, not discovery alone | Trip planner checks every stop against capacity, season, festivals and risk, and offers one-tap swaps to lower-pressure alternatives; confirmed trips feed the authorities' pressure forecast |
| Adaptable across states and ecosystems | States, ecosystems, destination types, roles and permissions are all **data**, not code. Sample data covers all eight states |

## Architecture

```
apps/web         Next.js 16: trekne.in (marketing + live destination intelligence) and the CRM at /super
apps/mobile      Expo SDK 57 app: Tourist + Ranger modes
packages/brand   colours (light/dark), fonts, radii, icons, status semantics shared by web and app
packages/db      generated Supabase types + panorama orientation maths
packages/viewer  three.js 360 viewer used by the CRM, the site and (via a DOM component) the app
supabase/        migrations: the only place the schema changes
```

Supabase project: **trekne.in** (org `new`, ref `yhrloltsznexpxuwyjhr`, Singapore).

## Roles

| Role | Rank | Can |
| --- | --- | --- |
| Super admin | 100 | Everything, including roles and other admins. Fixed. |
| Admin | 90 | Run the platform: users, destinations, heritage, events, moderation |
| Moderator | 60 | Verify / reject reports and 360 scenes, view users, dashboards |
| Tourism authority | 50 | Dashboards, carrying capacity, seasons, events, visitor counts, all trips |
| Community steward | 30 | Propose heritage protocols and events, file reports, log visitors |
| Ranger | 20 | Field reports, 360 scenes, visitor counts |
| Business | 15 | (listings: next phase) |
| Traveller | 10 | Plan trips, read verified advisories, file traveller reports |

- People can only manage users and grant roles **below their own rank**; the database enforces it (`set_user_role`, `invite_staff`).
- Staff join by **invite**: CRM → Users → Staff invites. They sign up at `/super` with that email and get the role.
- Travellers can **request** ranger / community / business from the app; staff approve in CRM → Users → Role requests.
- Every role change, invite and deactivation is written to `audit_log` by the database.

## 360 scenes without a 360 camera

1. Ranger picks a destination → **Capture 360 view**.
2. The app fuses gyroscope + gravity into an orientation (gimbal-free), shows target dots, and auto-captures when the ring
   is on a dot, level and still. Quick ring = 12 photos; full sphere = 29.
3. Photos + their orientation quaternions go to the offline outbox, then upload to the private `panoramas` bucket.
4. Moderators review in CRM → 360 scenes and publish. Published scenes show on the destination page in the app.
5. The viewer places each photo on a sphere by its orientation with feathered edges (no server-side stitching). Small
   seams are expected; equirectangular stitching is a possible later step.

## Status

Done (on branch `vee`):
- Schema, roles, RLS, storage, eco-risk and alternatives functions, sample data for 8 states
- CRM at `/super`: dashboard, live map, destinations editor, visitor-pressure grid, festivals, heritage, report
  moderation (realtime), 360 review, users / role requests / invites, roles & permission matrix, waitlist, audit log
- Website reads pilot destinations from Supabase; waitlist form saves
- App: sign-in with role request, Home, Explore (map + list), destination detail, trip planner with sustainability checks,
  Ranger hub, field reports (GPS, photos, offline), 360 capture and viewer, visitor counts, profile

Next:
1. Test the 360 capture on real iPhone and Android devices and tune `DEFAULT_FOV` and the gravity-sign handling.
2. Replace sample capacities, counts and festival dates with figures from tourism departments and village councils.
3. Add live weather (IMD / Open-Meteo) to indicators and the risk score.
4. AI advisories: a Supabase Edge Function that drafts each destination's advisory from verified reports, indicators
   and events, for staff to approve.
5. Public 360 viewer and destination pages on trekne.in.
6. Business listings and guide bookings (phase 4).
7. EAS builds for TestFlight / Play internal testing.

## Rules for working together

- Schema changes only through `supabase/migrations/` in a PR, reviewed by the other person, then `supabase db push`.
- Run `npm run db:types` after every migration and commit the regenerated types.
- Only the anon key goes in clients. The service-role key never goes in the app, the site bundle or git.
