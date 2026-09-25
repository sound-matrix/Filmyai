# Supabase migrations (draft)

**Draft only — apply after CA Staging keys land + DevOps approve.**

These SQL files sketch `profiles`, `entitlements`, and basic RLS for SOU-8.
They are **not applied** by CI or local scripts. Do not run against production.

Env names (see repo-root `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Wire live Supabase clients in `apps/*/lib/supabase.ts` only when CA Staging
keys are present. Until then, apps soft-fail (return `null`) and use UI stubs.
