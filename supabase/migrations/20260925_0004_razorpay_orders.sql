-- =============================================================================
-- DRAFT ONLY — CA applies to staging Supabase after review.
-- SOU-15: Razorpay TEST MODE payment_orders for Member + Special-pay checkout.
-- Staging only. No production. No live/prod Razorpay charges.
-- Additive on top of applied 0001/0002 and draft 0003. Do NOT rewrite prior
-- migrations. Service-role writes only (RLS on, no client write policies).
-- =============================================================================

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users (id) on delete set null,
  stub_email text null,
  kind text not null
    check (kind in ('member', 'special_pay')),
  film_slug text null,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'INR',
  razorpay_order_id text not null unique,
  razorpay_payment_id text null,
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed')),
  entitlement_id uuid null,
  raw_notes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_orders_special_pay_slug check (
    kind <> 'special_pay' or film_slug is not null
  )
);

comment on table public.payment_orders is
  'SOU-15 staging only — Razorpay test-mode checkout orders. No production.';

create index if not exists payment_orders_razorpay_order_id_idx
  on public.payment_orders (razorpay_order_id);
create index if not exists payment_orders_user_id_idx
  on public.payment_orders (user_id);
create index if not exists payment_orders_status_idx
  on public.payment_orders (status);

alter table public.payment_orders enable row level security;

-- No client insert/update/delete/select policies — service role only
-- (bypasses RLS). Viewer checkout APIs use SUPABASE_SERVICE_ROLE_KEY.

create or replace function public.payment_orders_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists payment_orders_touch_updated_at on public.payment_orders;
create trigger payment_orders_touch_updated_at
  before update on public.payment_orders
  for each row
  execute function public.payment_orders_touch_updated_at();
