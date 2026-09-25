-- DRAFT ONLY — apply after CA Staging keys + DevOps approve.
-- profiles: extends auth.users with role + display name.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users read / update own profile.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin full access: prefer service role key for admin studio writes.
-- Do not grant broad admin policies to the anon/authenticated JWT until
-- role claims are verified. Example service-role note only:
--   SUPABASE_SERVICE_ROLE_KEY bypasses RLS — use only on trusted server.
