# Supabase migrations (draft)

**DRAFT ONLY — DO NOT APPLY until CA explicit OK.**

These SQL files sketch `profiles`, `entitlements`, pricing / film access, and
basic RLS (SOU-8 / SOU-13 / SOU-14). They are **not applied** by CI or local
scripts. Do not run against production.

Env names (see repo-root `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (test key id, public)
- `RAZORPAY_KEY_SECRET` (test secret, server only)
- `RAZORPAY_WEBHOOK_SECRET` (webhook HMAC, server only; optional until CA configures webhook)

Wire live Supabase clients in `apps/*/lib/supabase.ts` only when CA Staging
keys are present. Until then, apps soft-fail (return `null`) and show a clear
staging message.

## Applied on staging (CA)

As of SOU-14 work: CA has applied `20260925_0001_profiles.sql` and
`20260925_0002_entitlements.sql` on staging Supabase (`jmoody…`). Do **not**
rewrite those files in a breaking way.

## SOU-14 — `20260925_0003_access_model.sql` (DRAFT — CA apply only)

Additive migration for Free / Members / Special pay:

1. `pricing_settings` singleton (`id=1`): `member_price_cents` default `49900`
   (₹499.00), `member_currency` default `INR`. Authenticated SELECT; writes via
   service role only.
2. `entitlements.kind` (`member` | `special_pay` | `admin_grant`); film_ref
   relaxed so `kind=member` may have both `film_id` and `film_slug` null.
3. `film_access` table: slug + `access_rule` + `special_pay_price_cents` so
   Admin Studio can persist access/pricing before full films CMS is DB-backed.

**CA:** apply `0003` on staging only after review. No FilmyAI production.
Checkout / Razorpay is SOU-15 — this migration does not add payment tables.


## SOU-15 — `20260925_0004_razorpay_orders.sql` (DRAFT — CA apply only)

Additive migration for Razorpay **test-mode** Member + Special-pay checkout:

1. `payment_orders` table: `user_id` (nullable FK → auth.users), `stub_email`,
   `kind` (`member` | `special_pay`), `film_slug`, `amount_cents`, `currency`
   default `INR`, `razorpay_order_id` (unique), `razorpay_payment_id`,
   `status` (`created` | `paid` | `failed`), `entitlement_id`, `raw_notes`.
2. Indexes on `razorpay_order_id`, `user_id`, `status`.
3. RLS enabled; **no client write policies** — service role only.

**Staging only. Razorpay test mode. No production / no live charges.**

Webhook URL for CA/DevOps (viewer staging):

- `https://project-xdwxk.vercel.app/api/webhooks/razorpay`
- Also any viewer alias host + `/api/webhooks/razorpay`

**CA:** apply `0004` on staging after review. DevOps: set Razorpay test env on
filmyai-staging Production and redeploy viewer so `NEXT_PUBLIC_RAZORPAY_KEY_ID`
is baked in. Checkout soft-fails (503 + mock-grant fallback) until keys land.

## Seed path (admin CMS — SOU-13)

Password belongs in the Supabase dashboard / secret manager only — **never** in
git, Linear, PR text, or chat.

1. CA creates Auth user for `filmyaidev@sound-matrix.com` (password via secure path).
2. After `20260925_0001_profiles.sql` is applied (CA OK), the `handle_new_user`
   trigger inserts `public.profiles` with default `role = 'viewer'`.
3. Elevate with service-role or SQL dashboard:
   `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'filmyaidev@sound-matrix.com');`
4. Client RLS cannot self-elevate `role` (`profiles_update_own` + trigger).

## DevOps note (admin HTTPS)

Separate Vercel project for `apps/admin` (Root Directory `apps/admin`, branch
`staging`), same env names as viewer. Migrations remain draft until CA OK
(except where CA already applied 0001/0002 on staging).
