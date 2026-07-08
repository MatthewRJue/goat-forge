---
name: run
description: Launch and drive GOAT Builder (GOAT Forge) to see a change working in the browser, or run its unit/e2e checks. Use when asked to run, start, or screenshot the app, or to confirm a change works for real rather than just via type-checking.
---

Project-specific launch instructions for GOAT Builder. This is picked up automatically by the general-purpose `run` skill before it falls back to generic per-project-type patterns.

## Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`. Before starting a new server, check whether one is already running on port 3000 (`lsof -i :3000`) — reuse it instead of starting a second instance.

## Data source

This repo's `.env.local` already has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, so `npm run dev` reads real seeded Supabase data by default.

To force deterministic local seed data instead (useful for reproducing an exact game state, or if Supabase is unreachable):

```bash
NEXT_PUBLIC_GOAT_DATA_SOURCE=seed npm run dev
```

Without either Supabase env var present, the game-data wrappers in `src/lib/supabase` fall back to `src/data/seed` automatically.

If you need a clean local Supabase database (schema + seed) instead of the hosted project:

```bash
supabase start
supabase db reset
```

`supabase db reset` applies `supabase/migrations/` and then runs `supabase/seed.sql`.

## Golden path to exercise after a change

Drive this full loop in the browser, not just one screen, per `agents/delivery/mvp.md`:

1. Start a new game from the home page.
2. Spin team and era; optionally use the team respin and era respin (each usable once).
3. Select a category, select a player from the pool, confirm the attribute is assigned.
4. Repeat category/player selection through all 5 rounds.
5. View the final score and rank on the results screen.
6. Use "play again" and confirm a fresh game starts.

If the change touches theming, also toggle light/dark mode. If it touches layout, also check a mobile viewport width (`agents/delivery/stories/018-mobile-compatibility-baseline.md`).

## Automated checks

```bash
npm run lint
npm run test:unit
npm run test:e2e
```

`test:e2e` runs headless Playwright against a real build of the app — use `npm run test:e2e:ui` or `npm run test:e2e:headed` when you need to watch it run.

## Build

```bash
npm run build
npm run start
```

Use this to confirm a change works in a production build, not just `next dev`.
