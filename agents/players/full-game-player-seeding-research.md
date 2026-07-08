# Full Game Player Seeding Research

## Goal

GOAT Builder needs enough player versions that every team and era spin feels playable, varied, and fair.

The target is not "every NBA player ever." The target is a curated, mode-aware database of player versions that:

* Includes recognizable stars for casual play.
* Includes strong role players for deeper basketball knowledge.
* Produces enough eligible players for every team-era combination.
* Supports repeatable rating generation.
* Keeps data provenance so ratings can be explained and regenerated.

## Current State

The app already has the right base shape:

* `players` stores the person once.
* `player_versions` stores a player on a team during an era.
* `player_attributes` stores the final playable ratings for the five MVP categories.

The current seed is a small representative set. That is fine for MVP, but the full game needs two extra layers:

* A source/provenance layer for how each rating was generated.
* A mode eligibility layer for which player versions are available in Easy, Hard, Ball Knowledge, and future modes.

## Recommended Data Sources

### Primary Stats Sources

Use one of these as the main statistical source for the generator:

* Basketball-Reference and Stathead: best for historical season stats, advanced stats, awards, franchise pages, all-time indexes, and easy human audit. Useful pages include the Basketball-Reference glossary, franchise player lists, season stats, and awards indexes.
* NBA.com Stats through `nba_api`: strong for modern NBA.com tracking and official stat endpoints. The package wraps NBA.com endpoints and supports Python workflows.
* hoopR: useful R-based wrapper for NBA Stats API and ESPN data, especially if the data pipeline moves through R/tidy data tooling.
* Paid data vendors such as SportsDataIO or Sportradar: best if this becomes a commercial product and licensing, images, injury/current roster data, or service reliability matter.

### Source Links

* Basketball-Reference glossary: https://www.basketball-reference.com/about/glossary.html
* Sports Reference data use guidance: https://www.sports-reference.com/data_use.html
* Stathead Basketball: https://www.sports-reference.com/stathead/basketball/
* Basketball-Reference awards index: https://www.basketball-reference.com/awards/
* Basketball-Reference all-defensive selections: https://www.basketball-reference.com/awards/all_defense_by_player.html
* NBA.com stats glossary: https://www.nba.com/stats/help/glossary
* NBA.com year-by-year All-Defensive Teams: https://www.nba.com/news/history-all-defensive-team
* nba_api package: https://github.com/swar/nba_api
* nba_api docs: https://nba-apidocumentation.knowledgeowl.com/help
* hoopR: https://hoopr.sportsdataverse.org/
* SportsDataIO NBA API docs: https://sportsdata.io/developers/api-documentation/nba
* Sportradar NBA docs: https://developer.sportradar.com/basketball/docs/nba-ig-api-basics

## Licensing And Data Ownership Notes

Historical facts and box-score numbers are useful inputs, but the app should not blindly scrape and redistribute a third-party database without checking terms.

Recommended posture:

* For private development, use exported CSVs or controlled scripts to prototype formulas.
* Before production launch, review the terms for the chosen data source.
* Store GOAT Builder's generated ratings, not a full clone of the source database.
* Keep source references and calculation metadata so ratings are explainable.
* Avoid depending on live third-party APIs during gameplay.

## Player Version Definition

A player version should represent a meaningful basketball identity:

```text

Player + team + era + season range

Examples:
2010s Heat LeBron James, 2010-2014
2000s Lakers Kobe Bryant, 2000-2009
1980s Lakers Magic Johnson, 1980-1989
2020s Warriors Stephen Curry, 2020-2024

```

For most players, one version per team-era is enough. Create multiple versions inside the same team-era only when the player clearly changed identity:

* Young breakout version.
* Peak MVP/All-NBA version.
* Late-career role version.
* Major injury/post-injury version.

Example:

```text

1990s Magic Shaquille O'Neal, 1992-1996
2000s Lakers Shaquille O'Neal, 2000-2004
2000s Heat Shaquille O'Neal, 2004-2008

```

## Recommended Era Model

Keep the MVP decade eras for gameplay simplicity:

* 1980s
* 1990s
* 2000s
* 2010s
* 2020s

Add earlier eras later only when the formulas can handle missing stats:

* 1960s and earlier have weaker defensive, turnover, steal, block, and three-point comparability.
* 1970s introduce ABA/NBA merger context and incomplete modern stat availability.
* 1980s onward is the best starting point because the game has enough recognizable players and richer data.

## Team-Era Coverage Targets

For a full-feeling game, target at least:

```text

Easy/Hard star pool:       6-10 player versions per populated team-era
Ball Knowledge pool:       8-14 player versions per populated team-era
All-time mixed modes:     20-40 player versions per franchise

```

Minimum viable full-data target:

```text

30 franchises x 5 eras x 8 player versions = about 1,200 player versions

```

Better long-term target:

```text

30 franchises x 5 eras x 12-16 player versions = about 1,800-2,400 player versions

```

The app does not need all 2,000 at once. It should ship in coherent batches.

## Team-Era Population Rules

Some combinations will be thin or impossible:

* Newer franchises do not have 1980s history.
* Relocated franchises may need display-name decisions.
* Recent 2020s eras are still evolving.

Recommended rules:

* Only spin team-era combinations with at least the minimum eligible pool for the selected mode.
* Keep team history under the modern franchise unless the product intentionally exposes historical team names.
* Store display labels separately from franchise identity later if needed.

Examples:

```text

Franchise: Oklahoma City Thunder
Historical display possibilities: Seattle SuperSonics, Oklahoma City Thunder

Franchise: Memphis Grizzlies
Historical display possibilities: Vancouver Grizzlies, Memphis Grizzlies

```

For MVP simplicity, start with modern franchise names and add historical labels when the UI is ready.

## Selecting Players For The Main Game

Use objective selection scores first, then review.

### Star Pool Score

Use this score to pick Easy/Hard players:

```text

star_pool_score =
  0.30 * era_minutes_percentile
+ 0.25 * era_box_value_percentile
+ 0.20 * award_score
+ 0.15 * playoff_importance_score
+ 0.10 * franchise_relevance_score

```

Where:

* `era_minutes_percentile` rewards players who actually played enough.
* `era_box_value_percentile` can use BPM, WS, VORP, PER, or a blended rank depending on source availability.
* `award_score` includes MVP, All-NBA, All-Star, All-Defense, DPOY, ROY, Sixth Man, etc.
* `playoff_importance_score` rewards meaningful playoff roles.
* `franchise_relevance_score` rewards players strongly associated with that team.

This avoids overfitting to one stat and prevents short-sample stars from flooding a team-era.

### Main Pool Eligibility

For Easy/Hard:

```text

include if:
  team-era minutes >= 2,000
  and star_pool_score is top 6-10 for that team-era

also include:
  iconic players with lower minutes if they are central to that team-era

```

Examples of iconic exceptions:

* Short but memorable playoff runs.
* Injury-shortened seasons where the player clearly belongs.
* Late-season acquisition who defines the title run.

## Selecting Role Players For Ball Knowledge

Ball Knowledge should not be "bad players." It should be "players real fans remember, but casual players might not immediately identify as the best attribute choice."

Recommended definition:

```text

role_player_score =
  0.25 * minutes_role_score
+ 0.20 * starter_or_rotation_score
+ 0.20 * non_star_filter_score
+ 0.15 * specialist_score
+ 0.10 * playoff_role_score
+ 0.10 * fan_memory_score

```

### Non-Star Filter

Do not use All-Star appearances alone. It is useful, but it misses too much nuance:

* Some famous role players made one All-Star team.
* Some star-level players never made an All-Star team because of conference depth, injuries, politics, timing, or era.
* Some one-time All-Stars were briefly top options and should not feel like role-player trivia.

Recommended Ball Knowledge eligibility:

```text

eligible if:
  career All-Star selections <= 1
  and career All-NBA selections = 0
  and MVP top-10 finishes = 0
  and not on NBA 75 / Hall of Fame unless manually allowed
  and team-era usage/box-value profile is below star threshold
  and minutes role indicates real rotation importance

manual allowlist:
  famous specialists, glue players, defensive stoppers, sixth men, and playoff role heroes

manual blocklist:
  obvious stars who technically pass an awards filter

```

### Better Role Player Labels

Instead of one "role player" bucket, store role archetypes:

* Shooter
* Defensive stopper
* Rim protector
* Rebounder
* Sixth man scorer
* Connector/passer
* Hustle/energy big
* 3-and-D wing
* Backup guard
* Cult favorite

These archetypes make Ball Knowledge more fun because the user can reason from player identity instead of total fame.

## Recommended Pool Metadata

Add these fields in a future schema/story:

```text

player_versions
  source_slug
  data_confidence
  fame_tier
  role_tier
  primary_archetype
  secondary_archetype
  star_pool_eligible
  role_pool_eligible
  era_pool_weight
  version_notes

player_rating_runs
  id
  player_version_id
  source_snapshot
  formula_version
  calculated_json
  adjustment_json
  final_json
  reviewer
  review_status
  review_notes

game_mode_player_eligibility
  game_mode_id
  player_version_id
  eligibility_tier
  weight
  hidden_attributes
  created_reason

```

Keep the MVP tables simple until the actual generator exists, but this is the shape to plan toward.

## Data Pipeline

Recommended repeatable flow:

1. Import raw source data into staging tables or CSVs.
2. Normalize teams, franchises, seasons, and player IDs.
3. Group seasons into GOAT Builder player versions.
4. Compute era-relative percentiles.
5. Compute five attribute ratings.
6. Compute star/role eligibility scores.
7. Run data validation checks.
8. Run AI/human review on outliers.
9. Export final seed SQL and TypeScript fallback seed data.
10. Record formula version and source snapshot.

## Staging Tables

Use staging tables or local generated files before touching app tables:

```text

staging_player_seasons
staging_player_awards
staging_team_history
staging_player_version_candidates
generated_player_versions
generated_player_attributes
generated_mode_eligibility
rating_review_queue

```

This makes it easy to delete and regenerate without corrupting the actual game tables.

## Data Quality Gates

Every generated seed batch should pass:

* No player version without attributes.
* No mode-active team-era below minimum pool size.
* No duplicate player-version labels.
* No rating below 40 or above 99 after final clamp.
* No all-99 players unless manually approved.
* No hidden attributes in Easy mode.
* No visible attributes in Hard mode unless the selected mode allows previews.
* No Ball Knowledge player above the star threshold unless manually allowed.
* No player appears twice in the same game unless the game mode explicitly allows same-player versions.

## How AI Should Help

AI should not be the original source of facts. It should be a review assistant.

Good AI jobs:

* Explain why a calculated rating feels too high or too low.
* Compare a player version to nearby comps.
* Flag likely outliers.
* Suggest archetype labels.
* Draft review notes.
* Classify "this is a star" vs "this is a role player" using already-provided facts.

Bad AI jobs:

* Inventing stats.
* Deciding historical facts without source data.
* Writing final ratings without formula evidence.
* Scraping source sites through prompts.

## AI Review Rubric

For each player version, pass the model a compact factsheet:

```text

Player:
Team-era:
Season range:
Minutes:
Usage:
Per-game stats:
Efficiency:
Advanced stats:
Awards:
Playoff role:
Formula ratings:
Nearby comps:
Current mode eligibility:

```

Ask for structured output:

```json
{
  "review_status": "approve | adjust | needs_human",
  "suggested_adjustments": {
    "athleticism": 0,
    "shooting": 0,
    "finishing": 0,
    "playmaking": 0,
    "defense": 0
  },
  "archetypes": ["3-and-D wing"],
  "mode_notes": "Ball Knowledge eligible; not a star pool candidate.",
  "reason": "Short evidence-based explanation."
}
```

Clamp AI-suggested adjustments:

```text

normal review: +/- 3
manual human approval required: +/- 4 to +/- 7
rare exception: more than +/- 7

```

## Recommended Initial Scope

Do not try to seed every team at once. Start with a vertical slice:

```text

Teams:
Lakers, Celtics, Bulls, Heat, Warriors, Spurs, Pistons, Knicks

Eras:
1980s, 1990s, 2000s, 2010s, 2020s

Target:
8 star-pool versions and 8 role-pool versions per populated team-era

Approx size:
8 teams x 5 eras x 16 versions = up to 640 versions

```

This is enough to test the fun of every mode while keeping review possible.

## Big Recommendation

Use three gameplay pools, not one:

```text

star_pool:
  recognizable high-value players for Easy and Hard

role_pool:
  role players and specialists for Ball Knowledge

chaos_pool:
  wider playable set for novelty modes, draft modes, and daily challenges

```

Each pool should be generated from the same player-version database. Do not duplicate player rows per mode.

