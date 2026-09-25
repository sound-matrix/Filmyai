# FilmyAI

Monorepo scaffold for the FilmyAI viewer + admin studio.

**Staging-oriented only** — no production deploy config ships with this scaffold.

**Content lock:** Staging viewer/admin surfaces stay empty until org content uploads (no sample/demo films / no Drive media).

## Apps

| Package | Path | Dev port |
|---------|------|----------|
| Viewer | `apps/viewer` | 3000 |
| Admin | `apps/admin` | 3001 |
| Shared types | `packages/shared` | — |

## Auth + entitlements (SOU-8 stubs)

Viewer `/sign-in` + `/sign-up`, header Sign in / Sign out, and `/watch/placeholder` entitlement gate shells are **UI stubs** (local mock session). Admin layout has an **Admin role required** gate with a staging-only mock toggle.

Live Supabase wire only after CA Staging env keys land. Soft-fail helpers live in `apps/*/lib/supabase.ts`.

Draft SQL (not applied): `supabase/migrations/` — see folder README.

## Setup

```bash
# pnpm v9+ on PATH
cp .env.example .env.local   # fill keys locally; never commit secrets
pnpm install
pnpm build
```

Env names (do not invent real keys):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Scripts

```bash
pnpm dev     # parallel viewer (3000) + admin (3001)
pnpm build   # build all packages/apps
pnpm lint    # lint all packages/apps
```

## Stack

Next.js App Router · TypeScript · Tailwind · Supabase client stubs · pnpm workspaces
