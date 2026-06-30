# Delivery Docs

## Purpose

This folder defines how GOAT Builder should be implemented.

Use these docs to turn the product and architecture specifications into small, clear, buildable work items.

The delivery docs should answer:

* What is included in the MVP?
* What should be built first?
* What does each implementation story need to accomplish?
* How should an agent know when a story is complete?

---

# Folder Structure

```text
agents/delivery
+-- README.md
+-- mvp.md
+-- story-template.md
+-- stories
    +-- 001-example-story.md
```

## mvp.md

Defines the MVP scope for the project.

This is the source of truth for what should and should not be included before MVP validation.

Before implementing any story, confirm that the work supports the MVP goal:

> Is the core gameplay fun?

## stories/

Contains implementation stories.

Each story should describe one focused piece of work that can be implemented, reviewed, and verified independently.

Stories should be written as vertical slices when possible. A story should usually produce something usable, visible, or verifiable rather than only setting up hidden infrastructure.

## story-template.md

Provides the standard format for new implementation stories.

Copy this structure when creating a new story in `agents/delivery/stories/`.

---

# Recommended Reading Order

Before implementing a story, read:

1. `agents/delivery/mvp.md`
2. The specific story file in `agents/delivery/stories/`
3. `agents/architecture/project-structure.md`
4. Relevant product docs in `agents/product/`
5. Relevant architecture docs in `agents/architecture/`
6. Relevant Next.js docs in `node_modules/next/dist/docs/`

The project uses a version of Next.js with breaking changes from common assumptions. Read the relevant local Next.js docs before writing application code.

Use `rg` in `node_modules/next/dist/docs/` to find the guide for the task area, such as routes, layouts, route handlers, server/client components, metadata, images, config, caching, or data fetching.

---

# Story Naming

Story files should use a numbered prefix so the implementation order is obvious.

```text
001-project-foundation.md
002-seed-game-data.md
003-start-game-flow.md
004-team-era-spin.md
005-category-selection.md
006-player-selection.md
007-attribute-assignment.md
008-final-results.md
```

Use lowercase kebab-case filenames.

Keep numbers stable once created. If a story is removed or replaced, prefer leaving a note in the old story rather than renumbering every later story.

---

# Story Template

Use `agents/delivery/story-template.md` when creating new stories.

Each story in `agents/delivery/stories/` should follow that structure unless the work clearly needs a different format.

---

# Story Writing Guidelines

## Keep Stories Small

Each story should be small enough for an agent to complete in one focused pass.

Avoid broad stories like:

```text
Build the full game
```

Prefer focused stories like:

```text
Implement category selection for the active round
```

## Make Completion Obvious

Acceptance criteria should be concrete and testable.

Good:

```text
The user cannot select a category that has already been completed.
```

Avoid:

```text
The category UI should be good.
```

## Protect MVP Scope

If a feature is not required for MVP, keep it out of the story unless the story explicitly says otherwise.

Common post-MVP features:

* User accounts
* Saved games
* Leaderboards
* Daily challenges
* Multiplayer
* Social graph features

## Link Back to Source Docs

Stories should not redefine product or architecture decisions unless the story intentionally updates them.

When possible, link to the existing source document instead of duplicating large sections.

## Prefer Vertical Slices

When practical, a story should connect UI, state, and data together for one workflow.

For example:

```text
Start Game Flow
```

is usually better than separate stories for:

```text
Create button component
Create game state type
Create start function
```

---

# Initial Story Backlog

Suggested MVP story order:

1. Project foundation, app shell, and test tooling setup
2. Seeded MVP database data for teams, eras, player versions, and attributes
3. Start game flow
4. Team and era spin flow
5. Team and era respin behavior
6. Category selection
7. Player pool display
8. Player selection and attribute assignment
9. Round progression
10. Final score and rank calculation
11. Final results screen
12. Play again flow

These can be adjusted as the project becomes clearer, but the first implementation pass should stay focused on the playable MVP loop.
