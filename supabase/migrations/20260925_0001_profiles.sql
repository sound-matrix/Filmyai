-- =============================================================================
-- DRAFT ONLY — DO NOT APPLY until CA explicit OK.
-- profiles: extends auth.users with role + display name.
-- SOU-13 hardens client update so users cannot elevate their own role.
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users read own profile.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users may update own display_name / timestamps only.
-- WITH CHECK requires role to match the existing row so clients cannot
-- self-elevate to admin via profiles_update_own.
-- Role changes: service-role key or SQL dashboard only (RLS bypass).
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Defense in depth: block role mutation for non-service JWTs even if a
-- future policy is looser. Service-role / postgres still can change role.
create or replace function public.profiles_enforce_role_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text := coalesce(
    auth.jwt() ->> 'role',
    current_setting('request.jwt.claim.role', true),
    ''
  );
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    -- Block anon/authenticated JWT clients only.
    -- Allow service_role and raw SQL dashboard (no JWT) for CA seed elevation.
    if jwt_role in ('authenticated', 'anon') then
      raise exception 'profiles.role can only be changed via service role / SQL dashboard';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role_immutable on public.profiles;
create trigger profiles_enforce_role_immutable
  before update on public.profiles
  for each row
  execute function public.profiles_enforce_role_immutable();

-- Auto-insert a profiles row when an Auth user is created (default role viewer).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'viewer',
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Admin studio writes: prefer SUPABASE_SERVICE_ROLE_KEY on trusted server.
-- Do not grant broad admin policies to the anon/authenticated JWT until
-- role claims are verified. Service role bypasses RLS.

-- =============================================================================
-- SEED PATH (staging) — DRAFT / docs only. NEVER put passwords in SQL, git,
-- Linear, PR bodies, or chat. DO NOT APPLY this migration until CA OK.
--
-- 1. CA creates Auth user in Supabase Dashboard (Authentication → Users)
--    for email: filmyaidev@sound-matrix.com
--    Password: set via dashboard / secret manager ONLY (not here).
-- 2. Trigger above inserts profiles row with role = 'viewer' (or insert
--    manually if trigger not yet applied).
-- 3. Elevate with service-role client or SQL as postgres/service_role:
--      update public.profiles
--      set role = 'admin'
--      where id = (select id from auth.users where email = 'filmyaidev@sound-matrix.com');
-- 4. Confirm: select id, role from public.profiles where …
-- =============================================================================
