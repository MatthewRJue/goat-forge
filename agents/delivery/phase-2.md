# Phase 2 Plan

## Purpose

This document defines the delivery plan for Phase 2 of GOAT Builder.

The MVP proves the core game loop. Phase 2 should make that loop more polished, accessible, and usable across real player environments before expanding into larger product systems.

Phase 2 focuses on:

* A defined light and dark theme system.
* Light mode as the default app presentation.
* Player list filtering and sorting.
* Spin and respin result animations.
* Mobile compatibility and responsive-development safeguards.

---

# Phase Status

PLANNING

The MVP is complete. Phase 2 stories should build on the completed MVP baseline without reopening MVP scope unless a regression is discovered.

---

# Phase 2 Product Goal

Phase 2 should answer:

> Can GOAT Builder feel polished, responsive, and comfortable enough for repeated play on desktop and mobile?

This phase is not about adding accounts, saved games, leaderboards, daily challenges, or social systems. Those may come later, but Phase 2 should first strengthen the core play surface.

---

# Guiding Principles

* Keep the game playable without authentication.
* Keep the player-first gameplay flow created during MVP.
* Keep the player list visible during attribute selection.
* Prefer reusable design tokens over hard-coded visual values.
* Prefer responsive web implementation over native mobile work.
* Keep animations deterministic enough that tests do not rely on fixed sleeps.
* Honor reduced-motion preferences when adding motion.

---

# Phase 2 Scope

## 1. Theme System

Goal:

Define first-class light and dark mode themes for the app.

Requirements:

* The app must support both light mode and dark mode.
* The app should default to the user's browser or operating-system color-scheme preference using the standard `prefers-color-scheme` media query.
* If no user preference is available, the app should use light mode.
* The current dark visual scheme should be preserved as the dark mode baseline.
* A new light mode palette should become the default presentation for users with no dark preference.
* Theme palettes should be defined in dedicated theme files.
* App colors should be referenced through theme tokens, CSS custom properties, Tailwind theme tokens, or typed constants instead of hard-coded color values in components.
* Theme naming should describe semantic roles such as background, foreground, surface, border, accent, action, muted text, success, warning, and danger.
* Theme implementation should keep future UI work from reintroducing raw hex, rgba, or one-off color values in React components.

Implementation guidance:

* Prefer CSS custom properties as the runtime theme contract.
* Keep the base `:root` palette light.
* Use `@media (prefers-color-scheme: dark)` for the default dark-mode selection.
* If a manual theme toggle is added later, it should override the system preference with an explicit app-level attribute such as `data-theme`.
* Keep palette definitions near global styling, such as `src/app/globals.css` or a dedicated imported theme stylesheet, unless the project introduces a clearer style organization.

Out of scope for the first theme story:

* Full brand redesign.
* Multiple accent themes.
* User profile theme persistence.

## 2. Light Mode Default

Goal:

Make light mode the default visual experience while preserving the current look as dark mode.

Requirements:

* The app should render in light mode when the system preference is light or unavailable.
* The app should render in dark mode when the system preference is dark.
* Existing dark colors should be mapped into the dark palette rather than deleted.
* All main app surfaces should be reviewed in both themes:
  * Home screen.
  * Game screen.
  * Player list.
  * Build progress.
  * Spin and respin controls.
  * Final results.
* Text, buttons, cards, disabled states, selected states, and focus states should be readable in both themes.

Acceptance direction:

* No core game surface should depend on a color that only works in dark mode.
* Light mode should feel like the primary product experience, not an inverted afterthought.

## 3. Player Filtering And Sorting

Goal:

Help users find useful players in the active player pool.

Requirements:

* Add a player-name search input.
* Search should filter players by visible player name.
* Add a position dropdown that filters players to a selected position.
* Add a sort dropdown.
* Default sorting should be alphabetical by player name.
* Sort options should include each playable attribute:
  * Athleticism
  * Shooting
  * Finishing
  * Playmaking
  * Defense
* Attribute sorting should order players by the selected attribute descending.
* Filtering and sorting should apply only to the currently eligible player pool for the active team and era.
* Previously selected player versions must remain excluded before user-facing filtering and sorting are applied.
* Filters should not hide the build progress or attribute selection controls.
* Empty filtered states should tell the player that no players match the current filters and should allow them to clear or adjust filters.

Implementation guidance:

* Keep filtering and sorting rules in `src/lib/game` or a small helper that can be unit tested.
* Keep React components responsible for rendering controls and dispatching selected filter/sort state.
* If player position is not currently available in the data model, add it through the data contract before wiring the dropdown.
* Do not query Supabase directly from React components.

Testing direction:

* Unit-test search matching, position filtering, alphabetical sorting, attribute sorting, and empty results.
* E2E-test the main player-list workflow with search, position filter, and attribute sort.

## 4. Spin And Respin Animation

Goal:

Make spin and respin actions feel like game events instead of instant text updates.

Requirements:

* Clicking the spin button should show a spin animation before revealing the selected team and era.
* Clicking a team respin should animate the team result change.
* Clicking an era respin should animate the era result change.
* The animation should clearly show that a result is being generated and then settled.
* The final selected team and era should remain easy to read after the animation completes.
* Buttons should prevent duplicate clicks while their animation or state transition is in progress.
* The app should respect reduced-motion preferences.

Implementation guidance:

* Keep final game-state changes deterministic and testable.
* Do not make tests rely on exact animation timing.
* Prefer test hooks or reduced animation duration in test mode over fixed waits.
* Keep animation components in `src/components/game` unless a reusable animation primitive emerges.

Out of scope:

* Physics-heavy wheels.
* Audio effects.
* Animation libraries unless the implementation clearly needs one.

## 5. Mobile Compatibility

Goal:

Ensure the game is comfortable to play on mobile and stays compatible as future work continues.

Requirements:

* The home, game, player list, build progress, and final results screens should be usable on common mobile viewport sizes.
* Controls should have touch-friendly hit targets.
* Text should not overflow buttons, cards, or controls.
* The player list and build progress should remain accessible without awkward horizontal scrolling.
* Filtering controls should remain usable on small screens.
* Spin and respin controls should be easy to reach and should not overlap other UI.
* Layout should support both mobile and desktop without maintaining separate native apps.

Infrastructure guidance:

* Continue using responsive web implementation with Tailwind and CSS layout primitives.
* Add or update Playwright mobile viewport coverage for the core game path.
* Add regression coverage for theme rendering and responsive layout where practical.
* Prefer stable layout constraints such as grid tracks, flex wrapping, min/max widths, and fixed control dimensions.
* Avoid introducing a separate mobile framework unless responsive web constraints prove insufficient.

Testing direction:

* E2E coverage should include at least one mobile viewport for starting a game, selecting players, applying attributes, using respins, and reaching final results.
* Visual or DOM assertions should catch overlapping controls, hidden primary actions, and unusable filter controls.

---

# Recommended Story Order

Phase 2 stories should continue numbering after the current delivery stories.

Suggested order:

1. Story 016: Theme Tokens And Light/Dark Mode
2. Story 017: Light Mode UI Pass
3. Story 018: Mobile Compatibility Baseline
4. Story 019: Player Search, Position Filter, And Attribute Sort
5. Story 020: Spin And Respin Animation

Reasoning:

* Theme tokens should come first so later UI work does not add more hard-coded colors.
* The light mode pass should happen before mobile and interaction polish so both themes are tested as the UI changes.
* Mobile compatibility should be established before adding more player-list controls.
* Player filtering and sorting should happen before animation because it changes the core decision surface more deeply.
* Spin and respin animation can build on the stabilized themed, responsive game UI.

---

# Story Writing Guidance

Each Phase 2 story should use `agents/delivery/story-template.md`.

Each story should include:

* The specific Phase 2 feature it supports.
* Dependencies on prior Phase 2 stories.
* Relevant product docs.
* Relevant architecture docs.
* Relevant Next.js local docs if route, layout, metadata, or client/server boundaries change.
* Unit and E2E verification expectations.
* Mobile verification expectations when the story affects visible UI.
* Theme verification expectations when the story affects colors or visual states.

Stories should stay focused. Do not combine theme tokens, filtering, animations, and mobile infrastructure into one implementation story.

---

# Explicitly Out Of Scope For Phase 2

The following features should not be added during this phase unless this document is intentionally updated:

* User accounts.
* Saved games.
* Leaderboards.
* Daily challenges.
* Multiplayer.
* Native mobile apps.
* Social graph features.
* Full rating-generation pipeline.
* Large-scale anti-cheat systems.

These features belong to later phases after the core play surface is themed, filterable, animated, and mobile-compatible.
