-- ============================================================
-- Community controls + planning that respects them.
--  * community_notices: closures, sacred days, restrictions declared by community stewards
--  * heritage endorsement: communities sign off on how their heritage is shown
--  * destination_overview / suggest_alternatives now treat community closures as closed
--  * recurring_issues(): verified problems per destination, for the authority view
-- ============================================================

create type public.notice_kind as enum ('closure', 'sacred_day', 'restriction', 'advisory');

create table public.community_notices (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations (id) on delete cascade,
  kind public.notice_kind not null,
  title text not null check (length(title) between 3 and 120),
  body text not null default '' check (length(body) <= 1000),
  starts_on date not null,
  ends_on date not null,
  community text not null default '',
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index on public.community_notices (destination_id, starts_on, ends_on);

alter table public.community_notices enable row level security;
grant select on public.community_notices to anon;
grant select, insert, update, delete on public.community_notices to authenticated;

-- Communities decide: a steward's notice goes live immediately. Staff can switch one off.
create policy "notices readable" on public.community_notices for select
  using (is_active or author_id = auth.uid() or public.has_perm('destinations.manage'));
create policy "notices declared" on public.community_notices for insert to authenticated
  with check ((public.has_perm('heritage.propose') or public.has_perm('destinations.manage')) and author_id = auth.uid());
create policy "notices edited" on public.community_notices for update to authenticated
  using (author_id = auth.uid() or public.has_perm('destinations.manage'))
  with check (author_id = auth.uid() or public.has_perm('destinations.manage'));
create policy "notices removed" on public.community_notices for delete to authenticated
  using (author_id = auth.uid() or public.has_perm('destinations.manage'));

alter publication supabase_realtime add table public.community_notices;

-- ---------- heritage endorsement ----------
alter table public.heritage_sites
  add column community_endorsed_at timestamptz,
  add column community_endorsed_by uuid references public.profiles (id) on delete set null;

create or replace function public.endorse_heritage(site uuid, endorse boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (public.has_perm('heritage.propose') or public.has_perm('heritage.manage')) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  update public.heritage_sites
     set community_endorsed_at = case when endorse then now() end,
         community_endorsed_by = case when endorse then auth.uid() end
   where id = site;
  perform public.log_action(case when endorse then 'heritage.endorse' else 'heritage.unendorse' end, site::text);
end $$;
revoke execute on function public.endorse_heritage(uuid, boolean) from public, anon;
grant execute on function public.endorse_heritage(uuid, boolean) to authenticated;

-- ---------- planning functions (return type changes, so drop + recreate) ----------
drop function public.suggest_alternatives(uuid, date, int);
drop function public.destination_overview(date);

create function public.destination_overview(on_day date default current_date)
returns table (
  id uuid, slug text, name text, state_code text, district text, kind text, ecosystem text,
  lat float8, lng float8, sensitivity public.sensitivity, is_lesser_known boolean,
  capacity int, counted int, planned int, expected int, load_ratio numeric,
  suitability public.suitability, open_issues int,
  risk_sensitivity int, risk_pressure int, risk_season int, risk_issues int,
  risk_score int, risk_level public.level,
  community_closed boolean, notice text
)
language sql stable security definer set search_path = '' as $$
  with base as (
    select d.*,
      coalesce(
        (select vc.visitors from public.visitor_counts vc where vc.destination_id = d.id and vc.day = on_day),
        (select round(avg(vc.visitors))::int from public.visitor_counts vc
          where vc.destination_id = d.id and vc.day between on_day - 56 and on_day - 1
            and extract(isodow from vc.day) = extract(isodow from on_day))
      ) as v_counted,
      (select coalesce(sum(t.party_size), 0)::int from public.trip_stops ts join public.trips t on t.id = ts.trip_id
        where ts.destination_id = d.id and ts.day = on_day and t.status = 'planned') as v_planned,
      (select sc.suitability from public.seasonal_conditions sc
        where sc.destination_id = d.id and sc.month = extract(month from on_day)) as v_suit,
      (select count(*)::int from public.reports r
        where r.destination_id = d.id and r.status in ('verified', 'official')
          and r.category in ('waste', 'closure', 'crowd', 'road', 'wildlife', 'heritage')
          and r.created_at > now() - interval '7 days') as v_issues,
      exists (select 1 from public.community_notices n
        where n.destination_id = d.id and n.is_active and n.kind in ('closure', 'sacred_day')
          and on_day between n.starts_on and n.ends_on) as v_closed,
      (select n.title from public.community_notices n
        where n.destination_id = d.id and n.is_active and on_day between n.starts_on and n.ends_on
        order by (n.kind in ('closure', 'sacred_day')) desc, n.created_at desc limit 1) as v_notice
    from public.destinations d
    where d.is_published
  ), scored as (
    select b.*,
      case when b.v_counted is null and b.v_planned = 0 then null else coalesce(b.v_counted, 0) + b.v_planned end as v_expected,
      case b.sensitivity when 'low' then 10 when 'medium' then 20 when 'high' then 35 else 45 end as p_sens,
      case when b.v_closed then 25
        else case b.v_suit when 'good' then 0 when 'fair' then 6 when 'poor' then 14 when 'closed' then 25 else 5 end end as p_season,
      least(b.v_issues * 4, 12) as p_issues
    from base b
  ), final as (
    select s.*,
      case when s.v_expected is null or s.carrying_capacity is null then null
        else round(s.v_expected::numeric / s.carrying_capacity, 2) end as v_ratio
    from scored s
  ), totals as (
    select f.*, f.p_sens + coalesce(round(least(f.v_ratio, 1.5) / 1.5 * 30)::int, 0) + f.p_season + f.p_issues as v_score
    from final f
  )
  select o.id, o.slug, o.name, o.state_code, o.district, o.kind, o.ecosystem, o.lat, o.lng, o.sensitivity, o.is_lesser_known,
    o.carrying_capacity, o.v_counted, o.v_planned, o.v_expected, o.v_ratio,
    case when o.v_closed then 'closed'::public.suitability else o.v_suit end,
    o.v_issues, o.p_sens, coalesce(round(least(o.v_ratio, 1.5) / 1.5 * 30)::int, 0), o.p_season, o.p_issues,
    least(100, o.v_score),
    case when o.v_score >= 60 then 'high' when o.v_score >= 35 then 'warn' else 'good' end::public.level,
    o.v_closed, o.v_notice
  from totals o;
$$;

create function public.suggest_alternatives(dest uuid, on_day date default current_date, max_results int default 3)
returns table (id uuid, slug text, name text, state_code text, distance_km int, risk_score int, load_ratio numeric, suitability public.suitability, is_lesser_known boolean)
language sql stable security definer set search_path = '' as $$
  with ov as (select * from public.destination_overview(on_day)),
  origin as (select * from ov where ov.id = dest)
  select o.id, o.slug, o.name, o.state_code,
    round(public.distance_km(origin.lat, origin.lng, o.lat, o.lng))::int,
    o.risk_score, o.load_ratio, o.suitability, o.is_lesser_known
  from ov o, origin
  where o.id <> dest
    and not o.community_closed
    and (o.suitability is null or o.suitability in ('good', 'fair'))
    and o.risk_score < origin.risk_score
    and (o.load_ratio is null or o.load_ratio < 0.8)
  order by (o.state_code = origin.state_code) desc, o.is_lesser_known desc,
    public.distance_km(origin.lat, origin.lng, o.lat, o.lng), o.risk_score
  limit max_results;
$$;

-- Verified problems that keep coming back, for planners. Aggregates only, so public.
create function public.recurring_issues(window_days int default 30)
returns table (destination_id uuid, slug text, name text, state_code text, category public.report_category, reports int, last_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select d.id, d.slug, d.name, d.state_code, r.category, count(*)::int, max(r.created_at)
  from public.reports r join public.destinations d on d.id = r.destination_id
  where d.is_published and r.status in ('verified', 'official')
    and r.category in ('waste', 'closure', 'crowd', 'road', 'wildlife', 'heritage', 'trail')
    and r.created_at > now() - make_interval(days => least(greatest(window_days, 1), 365))
  group by d.id, d.slug, d.name, d.state_code, r.category
  order by count(*) desc, max(r.created_at) desc;
$$;

-- ---------- sample notices + endorsements (illustrative, like the rest of the seed) ----------
insert into public.community_notices (destination_id, kind, title, body, starts_on, ends_on, community)
select d.id, n.kind::public.notice_kind, n.title, n.body, current_date + n.s, current_date + n.e, n.community
from (values
  ('nongriat', 'sacred_day', 'Village prayer day: trail closed to visitors', 'Nongriat holds a community prayer day. The steps below Tyrna are closed to visitors; homestay guests already in the village may stay.', 9, 9, 'Nongriat Dorbar (sample)'),
  ('dzukou', 'restriction', 'Fire ban in the valley', 'No fires anywhere outside the rest-house kitchen while the grass is dry. Village volunteers patrol the trail.', 0, 30, 'Viswema Village Council (sample)'),
  ('khonoma', 'advisory', 'Walk with a village guide', 'Khonoma asks every group to walk with a registered village guide this season.', 0, 60, 'Khonoma Village Council (sample)'),
  ('majuli', 'closure', 'Satra closed for Raas preparations', 'Auniati Satra is closed to visitors while performers rehearse. Other satras stay open.', 40, 42, 'Auniati Satra (sample)')
) as n(slug, kind, title, body, s, e, community)
join public.destinations d on d.slug = n.slug;

update public.heritage_sites set community_endorsed_at = now()
where name in ('Mawphlang Sacred Grove', 'Umshiang Double-Decker Bridge', 'Khonoma Morung', 'Hong Village');
