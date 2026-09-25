# Supabase migrations (draft)

**DRAFT ONLY — DO NOT APPLY until CA explicit OK.**

These SQL files sketch `profiles`, `entitlements`, and basic RLS (SOU-8 / SOU-13).
They are **not applied** by CI or local scripts. Do not run against production.
Do not run against staging until CA signs off.

Env names (see repo-root `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Wire live Supabase clients in `apps/*/lib/supabase.ts` only when CA Staging
keys are present. Until then, apps soft-fail (return `null`) and show a clear
staging message.

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
`staging`), same env names as viewer. Migrations remain draft until CA OK.
