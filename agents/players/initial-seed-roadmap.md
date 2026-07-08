# Initial Seed Roadmap

## Goal

Turn the current sample dataset into a full-game player dataset without creating an unmaintainable hand-entered rating spreadsheet.

## Recommended Phases

### Phase 1: Data Model Prep

Keep current app tables working, but plan supporting metadata.

Deliverables:

* Document chosen data source.
* Define player-version grouping rules.
* Define formula version `gf_attributes_v1`.
* Define star pool, role pool, and chaos pool.
* Add future story for mode eligibility metadata.

No UI changes are required in this phase.

### Phase 2: Offline Seed Generator Prototype

Build an offline script that can import a CSV/source export and produce candidate player versions.

Inputs:

```text

player season stats
advanced stats
awards
team/franchise mapping
playoff stats if available

```

Outputs:

```text

players
player_versions
player_attributes
mode eligibility
review flags

```

The first generator can write markdown/CSV reports before it writes SQL.

### Phase 3: First Real Expansion Batch

Start with a controlled, fun set:

```text

Teams:
Lakers, Celtics, Bulls, Heat, Warriors, Spurs, Pistons, Knicks

Eras:
1980s, 1990s, 2000s, 2010s, 2020s

Targets:
6-10 star-pool versions per populated team-era
6-10 role-pool versions per populated team-era

```

Expected size:

```text

300-600 player versions depending on franchise-era coverage

```

This is enough to validate Easy, Hard, and early Ball Knowledge.

### Phase 4: Review And Tune

Generate review reports:

* Top 25 ratings per attribute.
* Highest total ratings.
* Lowest total ratings in active pools.
* Team-era pool counts.
* Role-pool candidates with star-like totals.
* Star-pool candidates with weak totals.
* Duplicate player versions with suspiciously identical ratings.

Review these before seeding the app.

### Phase 5: Full Franchise Coverage

Expand to all 30 teams.

Targets:

```text

minimum:
  1,200 player versions

strong:
  1,800-2,400 player versions

```

Only mark a team-era spin active for a mode once it meets the minimum pool size.

### Phase 6: Mode-Specific Curation

After ratings feel good:

* Add Hard mode visibility rules.
* Add Ball Knowledge role-pool filters.
* Add all-time franchise role-player pools.
* Add Attribute First or Blind Draft experiments.

## First Stories To Create

Suggested story order:

1. Player data source and seed generator design.
2. Rating calculation prototype.
3. Player version candidate generation.
4. Mode eligibility metadata.
5. Expanded seed batch 1.
6. Easy/Hard mode selector.
7. Ball Knowledge mode pool.
8. Attribute visibility variants.

## Concrete Data Decisions Needed

Before implementation, decide:

* Source of truth for season stats.
* Whether source data can be used in production.
* Whether to include playoffs in base ratings or as a modifier.
* Minimum minutes for player-version eligibility.
* Whether team history follows modern franchise names at first.
* Whether to support pre-1980s players in the first full-data pass.
* Whether AI review is advisory only or can write adjustment drafts.

## Recommended Answers

Initial answers:

```text

source of truth:
  Basketball-Reference/Stathead export or licensed source for history; nba_api for modern support

playoffs:
  use as a pool/importance modifier first, not base ratings

minimum minutes:
  2,000 team-era minutes for star pool
  1,000 team-era minutes for role pool

franchise history:
  modern franchise identity first, historical labels later

pre-1980:
  defer until the 1980s-2020s pipeline works

AI review:
  advisory and structured; human approval for meaningful changes

```

## File Placement Recommendation

Runtime app data stays where it is:

* `src/data/game-data.ts`
* `src/data/seed/game-data.ts`
* `src/lib/supabase/queries/game-data.ts`
* `supabase/seed.sql`

Attribute generation logic should eventually live in:

* `src/lib/attributes`

Offline one-time or repeatable data generation scripts could live in a future:

* `tools/player-seeding`

Generated reports can live in a future:

* `agents/players/reports`

Do not put large generated datasets directly in `agents/players`. Keep this folder for decisions, research, and review summaries.

## Suggested Generated Report Format

```text

# Rating Review Report: gf_attributes_v1

Source snapshot:
Generated at:
Teams:
Eras:
Player versions:

## Pool Coverage

team | era | star count | role count | active modes | warnings

## Attribute Leaders

attribute | player version | calculated | adjustment | final | notes

## Review Queue

player version | issue | suggested reviewer action

```

## Early Validation Checklist

Before merging a large seed batch:

* Every active team-era has enough eligible players.
* Every player version has all five ratings.
* Easy mode has exact visible ratings.
* Hard mode hides exact ratings before lock.
* Ball Knowledge excludes obvious stars.
* Ratings look believable for top 25 per category.
* Generated SQL can reset the local database.
* TypeScript fallback data stays aligned with SQL seed data if still required.
* E2E deterministic random sequences still land on valid pools.

## Open Product Questions

These should be answered before implementation stories get too large:

* Should final score compare across modes, or should each mode have its own rank thresholds?
* Should player images/headshots be included in the first full-data pass?
* Should the same real player be usable in multiple versions in one game?
* Should role-player mode reveal archetypes before ratings?
* Should Hard hide all numbers or show rating tiers?
* Should team/era combinations with weak pools be skipped or filled with all-time fallback players?

## Strong Recommendation

Build the full-data system as an offline pipeline first.

The app should consume final player versions and ratings. It should not calculate thousands of ratings at runtime, call third-party stat APIs during gameplay, or depend on AI responses while a user is playing.

