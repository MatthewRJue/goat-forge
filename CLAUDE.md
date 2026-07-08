# GOAT Builder — Project Context

GOAT Builder (working name "GOAT Forge") is a Next.js MVP for a five-round basketball roster-building game.

## This Is Not The Next.js You Know

This project runs Next.js 16.2.9. APIs, conventions, and file structure may differ from training data. Before writing Next.js code (routes, layouts, route handlers, server/client component boundaries, metadata, images, config, caching, data fetching), search the local docs:

```bash
rg <topic> node_modules/next/dist/docs/
```

Do not assume a remembered Next.js API or file convention is current for this repo. Heed deprecation notices in those docs.

## Where Project Knowledge Lives

All product, architecture, and delivery planning lives in `agents/`. Read the relevant docs before changing code — do not duplicate their content here or in stories; link to the source doc instead.

* `agents/product/` — vision, gameplay rules, game state, attribute calculation logic.
* `agents/architecture/` — tech stack, project structure/folder conventions, database schema, testing specs (`agents/architecture/testing/`).
* `agents/delivery/` — MVP scope (`mvp.md`, status COMPLETE), Phase 2 plan (`phase-2.md`, status PLANNING), story workflow (`README.md`, `story-template.md`), implementation stories (`stories/`).
* `agents/players/` — research on scaling from seed data to a full player-version database. Planning only, not yet implemented.

For any non-trivial task, start with:

1. `agents/delivery/mvp.md` or `agents/delivery/phase-2.md` (whichever is in scope)
2. The specific story in `agents/delivery/stories/`, if one exists
3. `agents/architecture/project-structure.md`
4. Any product/architecture doc specific to the task area

## Current Phase

MVP is complete. Active work is Phase 2: theming (light/dark), player list filtering/sorting, spin/respin animations, and mobile compatibility. See `agents/delivery/phase-2.md`. Phase 2 does not add accounts, saved games, leaderboards, daily challenges, or social systems.

## Folder Conventions (see `agents/architecture/project-structure.md` for full detail)

* Routes (`src/app`) stay thin — compose UI, delegate logic to `src/lib`.
* Game rules/state live in `src/lib/game` (framework-light, injectable randomness, no `Math.random()` calls directly).
* Scoring in `src/lib/scoring`, attribute calculation in `src/lib/attributes`.
* Supabase access only through wrapper functions in `src/lib/supabase` — never call Supabase directly from components or the game reducer.
* `src/components/game` and `src/components/results` hold feature-specific UI; `src/components/ui` holds generic, reusable presentational components — only promote a component there after real reuse, not preemptively.
* `src/data/seed` is temporary local seed data standing in for Supabase; UI must not import it directly.
* Filenames: lowercase kebab-case. React component names: PascalCase.
* Import direction: `app` → `components`/`lib`; `components` → `lib`/`types`; `lib` → `types`. Never import `src/app` into `components` or `lib`.

## Testing

* Unit tests (Vitest) under `testing/unit/`, mirroring `src/lib` structure. Component tests may colocate with components. See `agents/architecture/testing/unit-test.md`.
* E2E tests (Playwright) under `testing/e2e/`. See `agents/architecture/testing/e2e-test.md`.
* Test-only fixtures in `testing/fixtures/` — never production Supabase data.
* Commands: `npm run test:unit`, `npm run test:e2e`, `npm run lint`.

## Custom Subagents

Project-specific subagents live in `.claude/agents/`:

* `ui-agent` — React/Tailwind UI in `src/components` and `src/app`.
* `docs-writer` — planning docs and stories in `agents/`.
* `story-implementer` — implements a story from `agents/delivery/stories/` end-to-end (state/logic, data access, UI, tests).
* `code-reviewer` — reviews a diff against this file's architecture rules (Supabase boundary, injectable randomness, import direction, route thinness, testing coverage, MVP/Phase 2 scope). Review-only, does not edit code.

## Skills

* `.claude/skills/run/` — project-specific launch instructions (dev server, data source/seed fallback, golden-path verification, test/build commands). Picked up automatically by the generic `run` skill.

## Documentation Rules

When a change affects project structure, update `agents/architecture/project-structure.md`. When creating a story that adds new folders, reference that doc in the story. When a structure decision conflicts with an older doc, the project-structure doc wins — update the older doc to match.
