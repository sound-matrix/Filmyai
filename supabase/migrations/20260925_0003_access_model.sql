-- =============================================================================
-- DRAFT ONLY — CA applies to staging Supabase (jmoody) after review.
-- SOU-14: Free / Members / Special pay access model.
-- Additive on top of applied 0001_profiles + 0002_entitlements. Do NOT rewrite
-- 0002 in place. No production. No Razorpay / checkout (SOU-15).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- pricing_settings: singleton member subscription price (admin-editable)
-- Default 49900 = ₹499.00 INR (staging placeholder; change anytime in Studio).
-- ---------------------------------------------------------------------------
create table if not exists public.pricing_settings (
  id int primary key default 1 check (id = 1),
  member_price_cents int not null default 49900 check (member_price_cents >= 0),
  member_currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

insert into public.pricing_settings (id, member_price_cents, member_currency)
values (1, 49900, 'INR')
on conflict (id) do nothing;

alter table public.pricing_settings enable row level security;

-- Authenticated users may read member price (viewer CTAs). Writes: service role only.
drop policy if exists "pricing_settings_select_authenticated" on public.pricing_settings;
create policy "pricing_settings_select_authenticated"
  on public.pricing_settings for select
  to authenticated
  using (true);

-- No client insert/update/delete policies — admin PATCH uses service-role key.

-- ---------------------------------------------------------------------------
-- entitlements: add kind; relax film_ref for catalog-wide member entitlements
-- ---------------------------------------------------------------------------
alter table public.entitlements
  add column if not exists kind text not null default 'admin_grant';

-- Ensure check constraint on kind (drop+recreate if re-applied).
alter table public.entitlements drop constraint if exists entitlements_kind_check;
alter table public.entitlements
  add constraint entitlements_kind_check
  check (kind in ('member', 'special_pay', 'admin_grant'));

-- Replace film_ref: member may have both film_id and film_slug null;
-- special_pay / admin_grant still require a film ref.
alter table public.entitlements drop constraint if exists entitlements_film_ref;
alter table public.entitlements
  add constraint entitlements_film_ref check (
    (kind = 'member')
    or (film_id is not null or film_slug is not null)
  );

create index if not exists entitlements_kind_idx on public.entitlements (kind);
create index if not exists entitlements_user_kind_idx on public.entitlements (user_id, kind);

-- ---------------------------------------------------------------------------
-- film_access: access_rule + special_pay price keyed by slug
-- Admin can persist pricing even while films CMS remains local Studio state.
-- ---------------------------------------------------------------------------
create table if not exists public.film_access (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  access_rule text not null default 'free'
    check (access_rule in ('free', 'members', 'special_pay')),
  special_pay_price_cents int null check (
    special_pay_price_cents is null or special_pay_price_cents >= 0
  ),
  updated_at timestamptz not null default now(),
  constraint film_access_special_pay_price check (
    access_rule <> 'special_pay'
    or (special_pay_price_cents is not null and special_pay_price_cents > 0)
  )
);

create index if not exists film_access_access_rule_idx on public.film_access (access_rule);

alter table public.film_access enable row level security;

-- Public/authenticated read so viewer can resolve gate + price display.
drop policy if exists "film_access_select_all" on public.film_access;
create policy "film_access_select_all"
  on public.film_access for select
  using (true);

-- Writes: service role only (admin Studio API upserts).

-- Optional: keep updated_at fresh on update
create or replace function public.film_access_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists film_access_touch_updated_at on public.film_access;
create trigger film_access_touch_updated_at
  before update on public.film_access
  for each row
  execute function public.film_access_touch_updated_at();

create or replace function public.pricing_settings_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pricing_settings_touch_updated_at on public.pricing_settings;
create trigger pricing_settings_touch_updated_at
  before update on public.pricing_settings
  for each row
  execute function public.pricing_settings_touch_updated_at();
