# Story 001: Project Foundation

## Status

NOT_STARTED

Allowed statuses:

* NOT_STARTED - Work has not begun.
* IN_PROGRESS - Work is actively being implemented.
* BLOCKED - Work cannot continue until a blocker is resolved.
* PARTIALLY_COMPLETE - Some scope is complete, but remaining work is still required.
* COMPLETE - All acceptance criteria are met and verified.

## Story Dependencies

Stories that must be completed before this story can be worked or finished:

* None

## Goal

Establish the MVP app foundation, folder structure, test tooling, and lightweight app shell that later gameplay stories can build on safely.

## User Story

As an implementation agent, I want the project structure and tooling in place, so that later stories can add gameplay without reworking basic setup.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/delivery/README.md
* agents/product/overview.md
* agents/architecture/project-structure.md
* agents/architecture/tech-stack.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Review the relevant local Next.js docs in `node_modules/next/dist/docs/` before changing route, layout, config, or component conventions.
* Align the source tree with `agents/architecture/project-structure.md` for MVP folders.
* Keep the initial routes thin and focused on composing screens.
* Add or confirm package scripts for linting, unit tests, and E2E tests.
* Add Vitest and Playwright configuration if missing.
* Create top-level `testing/unit`, `testing/e2e`, `testing/fixtures`, and `testing/utils` folders.
* Preserve a simple home page with GOAT Builder branding, a brief explanation, and a Start Game entry point.
* Keep authentication, accounts, leaderboards, and saved games out of the foundation.

## Acceptance Criteria

* The project has the recommended MVP folder structure needed by later stories.
* `npm run lint` exists and runs against the project.
* `npm run test:unit` exists for Vitest unit tests.
* `npm run test:e2e` exists for Playwright E2E tests.
* Playwright is configured to run against the local Next.js app and reuse an existing server locally when possible.
* The home page loads without requiring login.
* No Supabase queries, scoring rules, or gameplay decisions are implemented directly in route files.

## Implementation Notes

Use `src/lib` for business logic, `src/components/game` for game-specific UI, and `src/components/results` for result UI. The current app may start with a simple single-page shell, but create clear homes for the logic and tests that later stories will fill in.

Game logic should use injectable randomness once it is added. Do not call `Math.random()` directly from core game modules in later stories.

## Tests / Verification

* Run `npm run lint`.
* Run `npm run test:unit`.
* Run `npm run test:e2e` once a minimal Playwright smoke test exists.
* Manually load the home page and confirm the initial app shell renders.

## Out of Scope

* Seed data beyond tiny test fixtures required by tooling checks.
* Full game state reducer behavior.
* Supabase production data setup.
* Final results, scoring, rankings, or replay behavior.
