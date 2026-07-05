# Story 016: Theme Tokens and Light/Dark Mode

## Status

COMPLETE

Allowed statuses:

* NOT_STARTED - Work has not begun.
* IN_PROGRESS - Work is actively being implemented.
* BLOCKED - Work cannot continue until a blocker is resolved.
* PARTIALLY_COMPLETE - Some scope is complete, but remaining work is still required.
* COMPLETE - All acceptance criteria are met and verified.

## Story Dependencies

Stories that must be completed before this story can be worked or finished:

* Story 015: Inline Build Progress Attribute Selection

## Goal

Define first-class light and dark theme tokens so app surfaces can use semantic color roles instead of hard-coded component colors.

## User Story

As a player, I want the app to respect my system light or dark preference, so that GOAT Builder feels comfortable in different viewing environments.

## Context

Relevant docs:

* agents/delivery/phase-2.md
* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/tech-stack.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md
* node_modules/next/dist/docs/ for any Next.js route, layout, metadata, or client/server boundary changes

## Scope

* Define semantic theme roles for background, foreground, surface, border, accent, action, muted text, success, warning, and danger.
* Keep the base `:root` palette light.
* Add dark-mode token values through the standard `prefers-color-scheme: dark` media query.
* Preserve the current dark visual scheme as the dark-mode baseline where practical.
* Move app-level color references toward theme tokens, CSS custom properties, Tailwind theme tokens, or typed constants.
* Keep theme definitions near global styling unless a clearer style organization already exists.
* Add safeguards or review notes that discourage raw hex, rgba, or one-off color values in React components.

## Acceptance Criteria

* The app exposes a semantic theme contract for the core color roles listed in the Phase 2 plan.
* Light mode is the base theme when no dark system preference is available.
* Dark mode is selected automatically when the browser or operating system reports a dark color-scheme preference.
* Existing dark colors are mapped into dark theme tokens rather than discarded without review.
* Core app surfaces can reference theme tokens instead of component-local raw color values.
* React components touched by this story do not introduce new raw hex, rgba, or one-off color values.
* The app remains visually readable after switching between light and dark system preferences.

## Implementation Notes

Prefer CSS custom properties as the runtime theme contract. If Tailwind token integration is already used or clearly helpful, keep the CSS custom properties as the source of truth and map Tailwind-facing names to those semantic roles.

Do not add a manual theme toggle in this story. If a manual toggle is added later, it should override system preference through an explicit app-level attribute such as `data-theme`.

Read the relevant local Next.js docs before changing layout, route, metadata, or client/server component boundaries.

## Tests / Verification

* Run `npm run lint`.
* Run `npm run test:unit` if token helpers or theme constants are added.
* Run `npm run test:e2e` if visible app surfaces or layout behavior change.
* Manually verify the home, game, and results surfaces in both light and dark system color preferences.
* Verify no newly touched React component depends on raw hard-coded colors.
* Run `git diff --check`.

## Out of Scope

* Full brand redesign.
* Multiple accent themes.
* Manual theme toggle.
* User profile theme persistence.
* Mobile layout overhaul beyond preventing theme-related regressions.
