-- ============================================================
-- Business waitlist for features that follow the planner (Homestays, Shop local markets).
--  * who: name + business name
--  * how to reach them: email, phone or both (`contact` keeps the primary one for the CRM list)
--  * kind: what they'd list
-- ============================================================

alter table public.waitlist
  add column name text check (name is null or length(name) between 2 and 120),
  add column business text check (business is null or length(business) between 2 and 160),
  add column email text check (email is null or (length(email) <= 200 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  add column phone text check (phone is null or phone ~ '^\+?[0-9 -]{10,15}$'),
  add column kind text check (kind is null or kind in ('homestay', 'shop', 'guide', 'other'));
