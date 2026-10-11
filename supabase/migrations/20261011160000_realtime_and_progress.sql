-- ============================================================
-- Realtime everywhere + per-user progress for the app's gamified profile.
-- ============================================================

-- Broadcast changes for every table the website, app and CRM display.
-- Realtime respects RLS: a subscriber only receives rows they can select.
do $$
declare t text;
begin
  foreach t in array array[
    'destinations', 'seasonal_conditions', 'indicators', 'recommendations', 'visitor_counts',
    'heritage_sites', 'events', 'trips', 'trip_stops', 'profiles', 'roles', 'staff_invites', 'waitlist', 'audit_log',
    'reports', 'panoramas', 'community_notices'
  ] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Counts behind the signed-in user's points, level and badges. Only their own activity.
-- Points reward accuracy and care, not volume: verified reports and lower-pressure choices count most.
create or replace function public.my_progress()
returns jsonb language sql stable security definer set search_path = '' as $$
  with me as (select auth.uid() as id),
  stops as (
    select ts.destination_id, ts.day, d.is_lesser_known, d.state_code,
      (select sc.suitability from public.seasonal_conditions sc
        where sc.destination_id = d.id and sc.month = extract(month from ts.day)) as suit
    from public.trip_stops ts
    join public.trips t on t.id = ts.trip_id
    join public.destinations d on d.id = ts.destination_id
    where t.owner_id = (select id from me) and t.status in ('planned', 'completed')
  )
  select jsonb_build_object(
    'trips_planned', (select count(*) from public.trips where owner_id = (select id from me) and status in ('planned', 'completed')),
    'stops', (select count(*) from stops),
    'lesser_known_stops', (select count(*) from stops where is_lesser_known),
    'good_season_stops', (select count(*) from stops where suit = 'good'),
    'states', (select count(distinct state_code) from stops),
    'reports', (select count(*) from public.reports where author_id = (select id from me)),
    'reports_verified', (select count(*) from public.reports where author_id = (select id from me) and status in ('verified', 'official')),
    'scenes_published', (select count(*) from public.panoramas where author_id = (select id from me) and status = 'published'),
    'notices', (select count(*) from public.community_notices where author_id = (select id from me)),
    'endorsements', (select count(*) from public.heritage_sites where community_endorsed_by = (select id from me)),
    'counts_logged', (select count(*) from public.visitor_counts where recorded_by = (select id from me))
  )
  where auth.uid() is not null;
$$;
revoke execute on function public.my_progress() from public, anon;
grant execute on function public.my_progress() to authenticated;
