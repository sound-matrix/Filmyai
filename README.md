# FilmyAI

Monorepo scaffold for the FilmyAI viewer + admin studio (SOU-11).

**Staging-oriented only** — no production deploy config ships with this scaffold.

**Content lock:** Staging viewer/admin surfaces stay empty until org content uploads (no sample/demo films).

## Apps

| Package | Path | Dev port |
|---------|------|----------|
| Viewer | `apps/viewer` | 3000 |
| Admin | `apps/admin` | 3001 |
| Shared types | `packages/shared` | — |

## Setup

```bash
# pnpm v9+ on PATH
cp .env.example .env.local   # fill keys locally; never commit secrets
pnpm install
pnpm build
```

## Scripts

```bash
pnpm dev     # parallel viewer (3000) + admin (3001)
pnpm build   # build all packages/apps
pnpm lint    # lint all packages/apps
```

## Stack

Next.js App Router · TypeScript · Tailwind · Supabase client stubs · pnpm workspaces
