-- ============================================================
-- Trekne core schema
-- Sustainable tourism, eco-risk and cultural heritage intelligence for NER.
-- Roles are data (roles + permissions tables), checked through has_perm().
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- enums ----------
create type public.level as enum ('good', 'warn', 'high', 'none');
create type public.sensitivity as enum ('low', 'medium', 'high', 'critical');
create type public.suitability as enum ('good', 'fair', 'poor', 'closed');
create type public.report_status as enum ('pending', 'verified', 'official', 'unverified', 'rejected');
create type public.report_category as enum ('road', 'trail', 'weather', 'waste', 'crowd', 'closure', 'wildlife', 'heritage');
create type public.trip_status as enum ('draft', 'planned', 'completed', 'cancelled');
create type public.review_status as enum ('pending', 'published', 'rejected');

-- ---------- reference ----------
create table public.states (
  code text primary key,
  name text not null,
  sort smallint not null default 0
);

create table public.permissions (
  key text primary key,
  label text not null,
  grp text not null,
  description text not null default ''
);

create table public.roles (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,30}$'),
  name text not null,
  description text not null default '',
  permissions text[] not null default '{}',
  rank int not null check (rank between 1 and 100),
  color text not null default '#7090E4',
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- people ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role text not null default 'traveller' references public.roles (key) on update cascade,
  requested_role text check (requested_role in ('ranger', 'community', 'business')),
  home_state text references public.states (code),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.profiles (role);

create table public.staff_invites (
  email text primary key check (email = lower(email)),
  role text not null references public.roles (key) on update cascade on delete cascade,
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references public.profiles (id) on delete set null,
  action text not null,
  target text,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on public.audit_log (created_at desc);

-- ---------- places ----------
create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  state_code text not null references public.states (code),
  district text not null default '',
  place text not null default '',
  kind text not null default 'nature' check (kind in ('nature', 'cultural', 'heritage', 'eco', 'adventure', 'village', 'wildlife')),
  ecosystem text not null default '',
  lat double precision not null,
  lng double precision not null,
  summary text not null default '',
  culture text not null default '',
  etiquette text[] not null default '{}',
  facts jsonb not null default '[]',
  aliases text[] not null default '{}',
  is_lesser_known boolean not null default false,
  sensitivity public.sensitivity not null default 'medium',
  carrying_capacity int check (carrying_capacity > 0),
  -- {road, transport[], nearest_town, distance_km, connectivity, medical_km, permit}
  access jsonb not null default '{}',
  cover_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index on public.destinations (state_code);

create table public.seasonal_conditions (
  destination_id uuid not null references public.destinations (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  suitability public.suitability not null,
  note text not null default '',
  primary key (destination_id, month)
);

create table public.indicators (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations (id) on delete cascade,
  kind text not null check (kind in ('weather', 'access', 'eco', 'pressure', 'waste', 'water', 'landslide', 'wildlife', 'connectivity')),
  label text not null,
  value text not null,
  level public.level not null default 'none',
  source text not null default '',
  updated_at timestamptz not null default now(),
  unique (destination_id, kind)
);

create table public.recommendations (
  destination_id uuid primary key references public.destinations (id) on delete cascade,
  body text not null,
  meta text not null default '',
  generated_at timestamptz not null default now()
);

create table public.visitor_counts (
  destination_id uuid not null references public.destinations (id) on delete cascade,
  day date not null,
  visitors int not null check (visitors >= 0),
  source text not null default 'ranger_estimate' check (source in ('entry_records', 'ranger_estimate', 'official', 'simulated')),
  recorded_by uuid references public.profiles (id) on delete set null,
  primary key (destination_id, day)
);

create table public.heritage_sites (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations (id) on delete set null,
  state_code text not null references public.states (code),
  name text not null,
  site_type text not null default '',
  community text not null default '',
  description text not null default '',
  protection text not null default 'Unlisted',
  lat double precision,
  lng double precision,
  photography text not null default 'ask' check (photography in ('allowed', 'ask', 'forbidden')),
  restricted boolean not null default false,
  guidelines text[] not null default '{}',
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  community text not null default '',
  state_code text not null references public.states (code),
  destination_id uuid references public.destinations (id) on delete set null,
  starts_on date not null,
  ends_on date not null,
  description text not null default '',
  visitor_impact public.sensitivity not null default 'medium',
  open_to_visitors boolean not null default true,
  etiquette text[] not null default '{}',
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index on public.events (starts_on);

-- ---------- field intelligence ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid unique, -- set by the app so offline retries are idempotent
  destination_id uuid not null references public.destinations (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  category public.report_category not null,
  body text not null check (length(body) between 3 and 2000),
  lat double precision,
  lng double precision,
  accuracy_m real,
  captured_at timestamptz not null default now(),
  status public.report_status not null default 'pending',
  source text not null default 'traveller' check (source in ('ranger', 'traveller', 'official', 'staff')),
  source_label text not null default '',
  moderated_by uuid references public.profiles (id) on delete set null,
  moderated_at timestamptz,
  moderation_note text,
  created_at timestamptz not null default now()
);
create index on public.reports (destination_id, created_at desc);
create index on public.reports (status);

create table public.report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Phone-captured 360 scenes: frames placed on a sphere by device orientation.
create table public.panoramas (
  id uuid primary key default gen_random_uuid(),
  client_id uuid unique,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  title text not null default '',
  lat double precision,
  lng double precision,
  hfov real not null default 53,
  vfov real not null default 67,
  -- [{ i, path, q: [x, y, z, w] }] where q is the device orientation (W3C frame) at capture
  frames jsonb not null default '[]',
  frame_count int not null default 0,
  cover_path text,
  status public.review_status not null default 'pending',
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on public.panoramas (destination_id, created_at desc);

-- ---------- planning ----------
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  title text not null default 'My trip',
  start_date date not null,
  end_date date not null,
  party_size int not null default 1 check (party_size between 1 and 60),
  status public.trip_status not null default 'draft',
  notes text not null default '',
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index on public.trips (owner_id);

create table public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  day date not null,
  position int not null default 0,
  note text not null default ''
);
create index on public.trip_stops (destination_id, day);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  contact text not null check (length(contact) between 5 and 200),
  role text not null default 'traveller' check (role in ('traveller', 'ranger', 'business')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Authorisation helpers
-- ============================================================
create or replace function public.has_perm(p text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles pr join public.roles r on r.key = pr.role
    where pr.id = auth.uid() and pr.is_active
      and ('*' = any (r.permissions) or p = any (r.permissions))
  );
$$;

create or replace function public.my_rank()
returns int language sql stable security definer set search_path = '' as $$
  select coalesce((
    select r.rank from public.profiles pr join public.roles r on r.key = pr.role
    where pr.id = auth.uid() and pr.is_active
  ), 0);
$$;

create or replace function public.log_action(p_action text, p_target text, p_detail jsonb default '{}')
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_log (actor, action, target, detail) values (auth.uid(), p_action, p_target, p_detail);
$$;
revoke execute on function public.log_action(text, text, jsonb) from public, anon, authenticated;

-- New auth user -> profile. Staff invites decide the role; everyone else starts as traveller
-- and may request ranger / community / business, which staff approve in the CRM.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  inv public.staff_invites;
  req text := new.raw_user_meta_data ->> 'requested_role';
begin
  select * into inv from public.staff_invites where email = lower(new.email) and accepted_at is null;
  if req is not null and req not in ('ranger', 'community', 'business') then req := null; end if;

  insert into public.profiles (id, email, full_name, phone, role, requested_role)
  values (
    new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.phone,
    coalesce(inv.role, 'traveller'), case when inv.role is null then req end
  );

  if inv.email is not null then
    update public.staff_invites set accepted_at = now() where email = inv.email;
    insert into public.audit_log (actor, action, target, detail)
    values (new.id, 'invite.accepted', new.id::text, jsonb_build_object('role', inv.role));
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- staff RPCs (rank-checked: you can only manage people and roles below you) ----------
create or replace function public.set_user_role(target uuid, new_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  me int := public.my_rank();
  is_super boolean := public.has_perm('*');
  cur_rank int; new_rank int; old_role text;
begin
  if not public.has_perm('users.manage') then raise exception 'Not allowed' using errcode = '42501'; end if;
  if target = auth.uid() then raise exception 'You cannot change your own role' using errcode = '42501'; end if;
  select pr.role, r.rank into old_role, cur_rank from public.profiles pr join public.roles r on r.key = pr.role where pr.id = target;
  if old_role is null then raise exception 'User not found'; end if;
  select rank into new_rank from public.roles where key = new_role;
  if new_rank is null then raise exception 'Unknown role %', new_role; end if;
  if not is_super and (cur_rank >= me or new_rank >= me) then
    raise exception 'You can only manage roles below your own' using errcode = '42501';
  end if;
  update public.profiles set role = new_role, requested_role = null where id = target;
  perform public.log_action('user.role', target::text, jsonb_build_object('from', old_role, 'to', new_role));
end $$;

create or replace function public.set_user_active(target uuid, active boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare cur_rank int;
begin
  if not public.has_perm('users.manage') then raise exception 'Not allowed' using errcode = '42501'; end if;
  if target = auth.uid() then raise exception 'You cannot deactivate yourself' using errcode = '42501'; end if;
  select r.rank into cur_rank from public.profiles pr join public.roles r on r.key = pr.role where pr.id = target;
  if not public.has_perm('*') and cur_rank >= public.my_rank() then
    raise exception 'You can only manage users below your own role' using errcode = '42501';
  end if;
  update public.profiles set is_active = active where id = target;
  perform public.log_action(case when active then 'user.activate' else 'user.deactivate' end, target::text);
end $$;

create or replace function public.decline_role_request(target uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_perm('users.manage') then raise exception 'Not allowed' using errcode = '42501'; end if;
  update public.profiles set requested_role = null where id = target;
  perform public.log_action('user.request_declined', target::text);
end $$;

-- Invite someone by email with a staff role. If they already have an account it applies immediately.
create or replace function public.invite_staff(p_email text, p_role text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  e text := lower(trim(p_email));
  r_rank int;
  existing uuid;
begin
  if not public.has_perm('users.manage') then raise exception 'Not allowed' using errcode = '42501'; end if;
  select rank into r_rank from public.roles where key = p_role;
  if r_rank is null then raise exception 'Unknown role %', p_role; end if;
  if not public.has_perm('*') and r_rank >= public.my_rank() then
    raise exception 'You can only grant roles below your own' using errcode = '42501';
  end if;
  select id into existing from public.profiles where email = e;
  if existing is not null then
    perform public.set_user_role(existing, p_role);
    return 'applied';
  end if;
  insert into public.staff_invites (email, role, invited_by) values (e, p_role, auth.uid())
  on conflict (email) do update set role = excluded.role, invited_by = excluded.invited_by, accepted_at = null;
  perform public.log_action('invite.create', e, jsonb_build_object('role', p_role));
  return 'invited';
end $$;

-- ---------- triggers ----------
create or replace function public.touch_updated()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
create trigger destinations_touch before update on public.destinations
  for each row execute function public.touch_updated();

-- Roles: super_admin is immutable, system roles can't be deleted, and nobody edits roles at/above their rank.
create or replace function public.guard_roles()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    if old.is_system then raise exception 'System roles cannot be deleted'; end if;
    perform public.log_action('role.delete', old.key);
    return old;
  end if;
  if tg_op = 'UPDATE' and old.key = 'super_admin' then raise exception 'super_admin cannot be edited'; end if;
  if new.rank >= 100 then raise exception 'Rank must be below 100'; end if;
  if tg_op = 'UPDATE' then new.is_system := old.is_system; new.key := old.key;
  else new.is_system := false; end if;
  perform public.log_action('role.' || lower(tg_op), new.key, jsonb_build_object('permissions', new.permissions, 'rank', new.rank));
  return new;
end $$;
create trigger roles_guard before insert or update or delete on public.roles
  for each row when (pg_trigger_depth() = 0) execute function public.guard_roles();

-- Reports: authors can't self-verify. Rangers' reports enter moderation as field reports.
create or replace function public.reports_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.author_id := auth.uid();
  if public.has_perm('reports.moderate') then
    new.source := case when new.source = 'official' then 'official' else 'staff' end;
  else
    new.status := 'pending';
    new.source := case when public.has_perm('reports.field') then 'ranger' else 'traveller' end;
    new.moderated_by := null; new.moderated_at := null; new.moderation_note := null;
  end if;
  if new.source_label = '' then
    new.source_label := initcap(new.source);
  end if;
  return new;
end $$;
create trigger reports_insert before insert on public.reports
  for each row execute function public.reports_before_insert();

create or replace function public.reports_before_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.moderated_by := auth.uid();
    new.moderated_at := now();
  end if;
  return new;
end $$;
create trigger reports_update before update on public.reports
  for each row execute function public.reports_before_update();

-- Community proposals for heritage sites and events stay unpublished until staff approve.
create or replace function public.force_unpublished()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_perm(tg_argv[0]) then new.is_published := false; end if;
  return new;
end $$;
create trigger heritage_publish before insert on public.heritage_sites
  for each row execute function public.force_unpublished('heritage.manage');
create trigger events_publish before insert on public.events
  for each row execute function public.force_unpublished('events.manage');

-- ============================================================
-- Planning intelligence
-- ============================================================
create or replace function public.distance_km(lat1 float8, lng1 float8, lat2 float8, lng2 float8)
returns float8 language sql immutable set search_path = '' as $$
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- Per-destination load, season fit and an explainable eco-risk score for a given day.
-- Security definer so planned-trip demand counts every traveller's trips, but only aggregates leave.
create or replace function public.destination_overview(on_day date default current_date)
returns table (
  id uuid, slug text, name text, state_code text, district text, kind text, ecosystem text,
  lat float8, lng float8, sensitivity public.sensitivity, is_lesser_known boolean,
  capacity int, counted int, planned int, expected int, load_ratio numeric,
  suitability public.suitability, open_issues int,
  risk_sensitivity int, risk_pressure int, risk_season int, risk_issues int,
  risk_score int, risk_level public.level
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
          and r.created_at > now() - interval '7 days') as v_issues
    from public.destinations d
    where d.is_published
  ), scored as (
    select b.*,
      case when b.v_counted is null and b.v_planned = 0 then null else coalesce(b.v_counted, 0) + b.v_planned end as v_expected,
      case b.sensitivity when 'low' then 10 when 'medium' then 20 when 'high' then 35 else 45 end as p_sens,
      case b.v_suit when 'good' then 0 when 'fair' then 6 when 'poor' then 14 when 'closed' then 25 else 5 end as p_season,
      least(b.v_issues * 4, 12) as p_issues
    from base b
  ), final as (
    select s.*,
      case when s.v_expected is null or s.carrying_capacity is null then null
        else round(s.v_expected::numeric / s.carrying_capacity, 2) end as v_ratio
    from scored s
  )
  select f.id, f.slug, f.name, f.state_code, f.district, f.kind, f.ecosystem, f.lat, f.lng, f.sensitivity, f.is_lesser_known,
    f.carrying_capacity, f.v_counted, f.v_planned, f.v_expected, f.v_ratio, f.v_suit, f.v_issues,
    f.p_sens,
    coalesce(round(least(f.v_ratio, 1.5) / 1.5 * 30)::int, 0),
    f.p_season, f.p_issues,
    least(100, f.p_sens + coalesce(round(least(f.v_ratio, 1.5) / 1.5 * 30)::int, 0) + f.p_season + f.p_issues),
    case
      when least(100, f.p_sens + coalesce(round(least(f.v_ratio, 1.5) / 1.5 * 30)::int, 0) + f.p_season + f.p_issues) >= 60 then 'high'
      when least(100, f.p_sens + coalesce(round(least(f.v_ratio, 1.5) / 1.5 * 30)::int, 0) + f.p_season + f.p_issues) >= 35 then 'warn'
      else 'good'
    end::public.level
  from final f;
$$;

-- Lower-pressure alternatives for a destination on a day: same state first, lesser-known first, then nearest.
create or replace function public.suggest_alternatives(dest uuid, on_day date default current_date, max_results int default 3)
returns table (id uuid, slug text, name text, state_code text, distance_km int, risk_score int, load_ratio numeric, suitability public.suitability, is_lesser_known boolean)
language sql stable security definer set search_path = '' as $$
  with ov as (select * from public.destination_overview(on_day)),
  origin as (select * from ov where ov.id = dest)
  select o.id, o.slug, o.name, o.state_code,
    round(public.distance_km(origin.lat, origin.lng, o.lat, o.lng))::int,
    o.risk_score, o.load_ratio, o.suitability, o.is_lesser_known
  from ov o, origin
  where o.id <> dest
    and (o.suitability is null or o.suitability in ('good', 'fair'))
    and o.risk_score < origin.risk_score
    and (o.load_ratio is null or o.load_ratio < 0.8)
  order by (o.state_code = origin.state_code) desc, o.is_lesser_known desc,
    public.distance_km(origin.lat, origin.lng, o.lat, o.lng), o.risk_score
  limit max_results;
$$;

-- CRM headline numbers.
create or replace function public.crm_stats()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.has_perm('analytics.read') then raise exception 'Not allowed' using errcode = '42501'; end if;
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'new_users_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'users_by_role', (select coalesce(jsonb_agg(jsonb_build_object('role', r.key, 'name', r.name, 'color', r.color, 'count', coalesce(c.n, 0)) order by r.rank desc), '[]')
      from public.roles r left join (select role, count(*) n from public.profiles group by role) c on c.role = r.key),
    'pending_reports', (select count(*) from public.reports where status = 'pending'),
    'pending_panoramas', (select count(*) from public.panoramas where status = 'pending'),
    'pending_requests', (select count(*) from public.profiles where requested_role is not null),
    'pending_proposals', (select count(*) from public.heritage_sites where not is_published) + (select count(*) from public.events where not is_published),
    'upcoming_trips', (select count(*) from public.trips where status = 'planned' and end_date >= current_date),
    'waitlist', (select count(*) from public.waitlist),
    'signups_30d', (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'n', (select count(*) from public.profiles p where p.created_at::date = d::date)) order by d), '[]')
      from generate_series(current_date - 29, current_date, interval '1 day') d),
    'reports_30d', (select coalesce(jsonb_agg(jsonb_build_object('category', category, 'n', n)), '[]')
      from (select category, count(*) n from public.reports where created_at > now() - interval '30 days' group by category) x)
  ) into result;
  return result;
end $$;

-- ============================================================
-- Grants + Row Level Security
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant insert on public.waitlist to anon;
revoke select on public.waitlist from anon;
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url, home_state, requested_role) on public.profiles to authenticated;
revoke insert, update, delete on public.audit_log from authenticated;

alter table public.states enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.staff_invites enable row level security;
alter table public.audit_log enable row level security;
alter table public.destinations enable row level security;
alter table public.seasonal_conditions enable row level security;
alter table public.indicators enable row level security;
alter table public.recommendations enable row level security;
alter table public.visitor_counts enable row level security;
alter table public.heritage_sites enable row level security;
alter table public.events enable row level security;
alter table public.reports enable row level security;
alter table public.report_photos enable row level security;
alter table public.panoramas enable row level security;
alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.waitlist enable row level security;

-- reference
create policy "states readable" on public.states for select using (true);
create policy "permissions readable" on public.permissions for select using (true);
create policy "roles readable" on public.roles for select using (true);
create policy "roles managed" on public.roles for all to authenticated
  using (public.has_perm('roles.manage')) with check (public.has_perm('roles.manage'));

-- people
create policy "own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_perm('users.read'));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "invites managed" on public.staff_invites for all to authenticated
  using (public.has_perm('users.manage')) with check (public.has_perm('users.manage'));
create policy "audit readable" on public.audit_log for select to authenticated
  using (public.has_perm('users.manage'));

-- places: public reads published; staff with the permission write
create policy "destinations readable" on public.destinations for select
  using (is_published or public.has_perm('destinations.manage'));
create policy "destinations managed" on public.destinations for all to authenticated
  using (public.has_perm('destinations.manage')) with check (public.has_perm('destinations.manage'));

create policy "seasons readable" on public.seasonal_conditions for select using (true);
create policy "seasons managed" on public.seasonal_conditions for all to authenticated
  using (public.has_perm('destinations.manage')) with check (public.has_perm('destinations.manage'));
create policy "indicators readable" on public.indicators for select using (true);
create policy "indicators managed" on public.indicators for all to authenticated
  using (public.has_perm('destinations.manage')) with check (public.has_perm('destinations.manage'));
create policy "recommendations readable" on public.recommendations for select using (true);
create policy "recommendations managed" on public.recommendations for all to authenticated
  using (public.has_perm('destinations.manage')) with check (public.has_perm('destinations.manage'));

create policy "counts readable" on public.visitor_counts for select using (true);
create policy "counts logged" on public.visitor_counts for insert to authenticated
  with check (public.has_perm('visitors.log') and recorded_by = auth.uid());
create policy "counts managed" on public.visitor_counts for all to authenticated
  using (public.has_perm('destinations.manage')) with check (public.has_perm('destinations.manage'));

create policy "heritage readable" on public.heritage_sites for select
  using (is_published or created_by = auth.uid() or public.has_perm('heritage.manage'));
create policy "heritage proposed" on public.heritage_sites for insert to authenticated
  with check (public.has_perm('heritage.manage') or public.has_perm('heritage.propose'));
create policy "heritage managed" on public.heritage_sites for update to authenticated
  using (public.has_perm('heritage.manage')) with check (public.has_perm('heritage.manage'));
create policy "heritage deleted" on public.heritage_sites for delete to authenticated
  using (public.has_perm('heritage.manage'));

create policy "events readable" on public.events for select
  using (is_published or created_by = auth.uid() or public.has_perm('events.manage'));
create policy "events proposed" on public.events for insert to authenticated
  with check (public.has_perm('events.manage') or public.has_perm('heritage.propose'));
create policy "events managed" on public.events for update to authenticated
  using (public.has_perm('events.manage')) with check (public.has_perm('events.manage'));
create policy "events deleted" on public.events for delete to authenticated
  using (public.has_perm('events.manage'));

-- field intelligence
create policy "reports readable" on public.reports for select
  using (status in ('verified', 'official', 'unverified') or author_id = auth.uid() or public.has_perm('reports.moderate'));
create policy "reports created" on public.reports for insert to authenticated with check (true);
create policy "reports moderated" on public.reports for update to authenticated
  using (public.has_perm('reports.moderate')) with check (public.has_perm('reports.moderate'));
create policy "reports deleted" on public.reports for delete to authenticated
  using (public.has_perm('reports.moderate'));

create policy "report photos readable" on public.report_photos for select
  using (exists (select 1 from public.reports r where r.id = report_id));
create policy "report photos added" on public.report_photos for insert to authenticated
  with check (exists (select 1 from public.reports r where r.id = report_id and r.author_id = auth.uid()));

create policy "panoramas readable" on public.panoramas for select
  using (status = 'published' or author_id = auth.uid() or public.has_perm('reports.moderate'));
create policy "panoramas created" on public.panoramas for insert to authenticated
  with check (public.has_perm('panoramas.create') and author_id = auth.uid() and status = 'pending');
create policy "panoramas finished by author" on public.panoramas for update to authenticated
  using (author_id = auth.uid() and status = 'pending') with check (author_id = auth.uid() and status = 'pending');
create policy "panoramas moderated" on public.panoramas for update to authenticated
  using (public.has_perm('reports.moderate')) with check (public.has_perm('reports.moderate'));
create policy "panoramas deleted" on public.panoramas for delete to authenticated
  using (author_id = auth.uid() or public.has_perm('reports.moderate'));

-- planning
create policy "own trips" on public.trips for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "staff read trips" on public.trips for select to authenticated
  using (public.has_perm('trips.read_all'));
create policy "own trip stops" on public.trip_stops for all to authenticated
  using (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = auth.uid()));
create policy "staff read trip stops" on public.trip_stops for select to authenticated
  using (public.has_perm('trips.read_all'));

create policy "join waitlist" on public.waitlist for insert to anon, authenticated with check (true);
create policy "staff read waitlist" on public.waitlist for select to authenticated
  using (public.has_perm('waitlist.read'));

-- ============================================================
-- Storage
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('panoramas', 'panoramas', false, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('report-photos', 'report-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Files live under <panorama id>/… or <report id>/…; access follows the parent row.
create policy "panorama frames readable" on storage.objects for select using (
  bucket_id = 'panoramas' and exists (
    select 1 from public.panoramas p where p.id::text = (storage.foldername(name))[1]
      and (p.status = 'published' or p.author_id = auth.uid() or public.has_perm('reports.moderate'))));
create policy "panorama frames uploaded" on storage.objects for insert to authenticated with check (
  bucket_id = 'panoramas' and exists (
    select 1 from public.panoramas p where p.id::text = (storage.foldername(name))[1]
      and p.author_id = auth.uid() and p.status = 'pending'));

create policy "report photos files readable" on storage.objects for select using (
  bucket_id = 'report-photos' and exists (
    select 1 from public.reports r where r.id::text = (storage.foldername(name))[1]));
create policy "report photos files uploaded" on storage.objects for insert to authenticated with check (
  bucket_id = 'report-photos' and exists (
    select 1 from public.reports r where r.id::text = (storage.foldername(name))[1] and r.author_id = auth.uid()));

create policy "avatars uploaded" on storage.objects for insert to authenticated with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars replaced" on storage.objects for update to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Live moderation queue in the CRM.
alter publication supabase_realtime add table public.reports, public.panoramas;

-- ============================================================
-- Reference data: states, permissions, system roles
-- ============================================================
insert into public.states (code, name, sort) values
  ('AS', 'Assam', 1), ('AR', 'Arunachal Pradesh', 2), ('ML', 'Meghalaya', 3), ('NL', 'Nagaland', 4),
  ('MN', 'Manipur', 5), ('MZ', 'Mizoram', 6), ('TR', 'Tripura', 7), ('SK', 'Sikkim', 8);

insert into public.permissions (key, label, grp, description) values
  ('crm.access', 'Open the CRM', 'Access', 'Sign in at /super'),
  ('analytics.read', 'View dashboards', 'Access', 'Pressure, risk and growth dashboards'),
  ('users.read', 'View users', 'People', 'See the user directory'),
  ('users.manage', 'Manage users', 'People', 'Change roles below your own, deactivate, invite staff, approve requests'),
  ('roles.manage', 'Manage roles', 'People', 'Create roles and edit their permissions'),
  ('destinations.manage', 'Manage destinations', 'Places', 'Edit destinations, carrying capacity, seasons, indicators'),
  ('heritage.manage', 'Manage heritage', 'Places', 'Publish and edit heritage sites'),
  ('heritage.propose', 'Propose heritage & events', 'Places', 'Suggest sites, festivals and protocols for staff review'),
  ('events.manage', 'Manage events', 'Places', 'Publish and edit festivals and seasonal events'),
  ('visitors.log', 'Log visitor counts', 'Field', 'Record daily visitor numbers at a destination'),
  ('reports.field', 'File field reports', 'Field', 'Reports enter moderation as Ranger reports'),
  ('panoramas.create', 'Capture 360 scenes', 'Field', 'Upload phone-captured 360 views'),
  ('reports.moderate', 'Moderate reports', 'Field', 'Verify, reject or publish reports and 360 scenes'),
  ('trips.read_all', 'View all trips', 'Planning', 'See every traveller''s planned trips'),
  ('waitlist.read', 'View waitlist', 'People', 'See waitlist sign-ups');

alter table public.roles disable trigger roles_guard;
insert into public.roles (key, name, description, permissions, rank, color, is_system) values
  ('super_admin', 'Super admin', 'Full control, including roles and other admins.', array['*'], 100, '#10131F', true),
  ('admin', 'Admin', 'Runs the platform day to day.', array['crm.access','analytics.read','users.read','users.manage','destinations.manage','heritage.manage','events.manage','visitors.log','reports.field','panoramas.create','reports.moderate','trips.read_all','waitlist.read'], 90, '#FF6A2B', true),
  ('moderator', 'Moderator', 'Verifies Ranger reports and 360 scenes.', array['crm.access','analytics.read','users.read','reports.moderate','waitlist.read'], 60, '#7090E4', true),
  ('authority', 'Tourism authority', 'Planners and destination managers: capacity, seasons, events.', array['crm.access','analytics.read','destinations.manage','events.manage','visitors.log','trips.read_all'], 50, '#2DC56E', true),
  ('community', 'Community steward', 'Local community representative: proposes heritage protocols and events.', array['heritage.propose','reports.field','visitors.log'], 30, '#FFC21A', true),
  ('ranger', 'Ranger', 'Verified local guide filing field reports and 360 scenes.', array['reports.field','panoramas.create','visitors.log'], 20, '#2DC56E', true),
  ('business', 'Business', 'Homestay, operator or guide business.', array[]::text[], 15, '#E9541A', true),
  ('traveller', 'Traveller', 'Plans trips and reads advisories.', array[]::text[], 10, '#586078', true);
alter table public.roles enable trigger roles_guard;
