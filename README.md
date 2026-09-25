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

## Access model (SOU-14)

1. **Free** — guests, no sign-in required
2. **Members** — sign-in + active member entitlement; Member subscription price admin-editable in Studio (`pricing_settings`)
3. **Special pay** — per-film one-time fee; price admin-editable per film (`film_access` / Film shell)

Viewer `/watch/placeholder` has a staging-only Free / Members / Special pay toggle (content lock). Checkout uses **Razorpay test mode** (SOU-15) with mock-grant fallback when keys are missing.

Shared helper: `resolveAccessGate` in `@filmyai/shared`.

## Auth (SOU-13 admin)

Admin CMS uses live Supabase email/password when env keys are set (soft-fail otherwise). Viewer auth remains a local stub until viewer Supabase wire-up.

Draft SQL: `supabase/migrations/` — see folder README. **SOU-14 `0003_access_model` + SOU-15 `0004_razorpay_orders` are DRAFT for CA apply only** (additive on applied 0001/0002).

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
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (test mode)
- `RAZORPAY_KEY_SECRET` (test mode, server only)
- `RAZORPAY_WEBHOOK_SECRET` (optional until webhook configured)

## Scripts

```bash
pnpm dev     # parallel viewer (3000) + admin (3001)
pnpm build   # build all packages/apps
pnpm lint    # lint all packages/apps
```

## Stack

Next.js App Router · TypeScript · Tailwind · Supabase · pnpm workspaces
