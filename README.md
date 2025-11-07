# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Database (Drizzle + Supabase Pool)

- Configure your Supabase pooling URI in `.env` using `SUPABASE_DB_POOL_URL` (see `.env.example`).
- The pooled Drizzle client is exported from `server/utils/db.ts`.
- Example usage in a server route:

```ts
// server/api/health.get.ts
import { defineEventHandler } from 'h3'
import { sql } from 'drizzle-orm'
import { db } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const result = await db.execute(sql`select 1 as ok`)
  return { ok: result.rows?.[0]?.ok === 1 }
})
```

Notes:
- Uses `pg` Pool with SSL enabled; works with Supabase pgbouncer.
- Prefers `SUPABASE_DB_POOL_URL`, falls back to `DATABASE_URL`/`SUPABASE_DB_URL` if set.

### Bootstrapping schema (optional)

- Running automatic bootstrap through the pooler can fail. To initialize tables:
  1) Get your DIRECT connection string from Supabase (Project Settings → Database → Connection string → `db.<ref>.supabase.co:5432`).
  2) Put it in `.env` as `DATABASE_URL=...` (keep `SUPABASE_DB_POOL_URL` as-is for runtime).
  3) Temporarily set `NUXT_DB_BOOTSTRAP=true` and start dev once to run the SQL in `server/plugins/bootstrap-db.ts`.
  4) Remove `NUXT_DB_BOOTSTRAP` or set it to `false` after it completes.
