# GOAT Forge

GOAT Forge is a Next.js MVP for GOAT Builder, a five-round basketball roster-building game.

Project planning and implementation guidance lives in `agents/`. Start with:

```bash
agents/delivery/mvp.md
agents/product/overview.md
agents/architecture/project-structure.md
```

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

The MVP game-data tables are defined in `supabase/migrations/`, and app seed records are in `supabase/seed.sql`.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

When these variables are present outside unit tests, the game-data wrappers read from Supabase. When they are missing, the wrappers use the deterministic local seed data in `src/data/seed` as a development fallback.

To force local seed data for deterministic development or test runs:

```bash
NEXT_PUBLIC_GOAT_DATA_SOURCE=seed
```

With the Supabase CLI installed, apply the local schema and seed from a clean local database:

```bash
supabase start
supabase db reset
```

The reset command applies migrations and then runs `supabase/seed.sql`.

## Verification

Run focused checks before handing off story work:

```bash
npm run lint
npm run test:unit
npm run test:e2e
git diff --check
```
