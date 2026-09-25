-- DRAFT ONLY — apply after CA Staging keys + DevOps approve.
-- entitlements: one-time / admin-grant catalog access (pricing TBD).

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  film_id uuid null,
  film_slug text null,
  reason text not null default '',
  granted_by text not null default 'admin'
    check (granted_by in ('admin', 'purchase', 'promo', 'mock')),
  created_at timestamptz not null default now(),
  expires_at timestamptz null,
  constraint entitlements_film_ref check (film_id is not null or film_slug is not null)
);

create index if not exists entitlements_user_id_idx on public.entitlements (user_id);
create index if not exists entitlements_film_slug_idx on public.entitlements (film_slug);

alter table public.entitlements enable row level security;

-- Users read own entitlements.
create policy "entitlements_select_own"
  on public.entitlements for select
  using (auth.uid() = user_id);

-- Inserts/updates/deletes: admin studio via service role (bypasses RLS).
-- Authenticated clients must not self-grant until purchase flow exists.
