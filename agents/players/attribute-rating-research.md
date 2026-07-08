# Attribute Rating Research

## Recommendation

Keep the product document's core approach:

```text

source stats -> era percentiles -> weighted formula -> manual adjustment -> final rating

```

This is the best fit for GOAT Builder because ratings need to be:

* Scalable across thousands of versions.
* Explainable to users and future maintainers.
* Comparable across eras.
* Easy to tune after playtesting.

## Rating Philosophy

The game should care about basketball truth, but the final output is a fun game rating.

Important consequences:

* A formula can be directionally right without being perfect.
* A rating that feels intuitive to fans is better than a statistically pure rating nobody trusts.
* Manual adjustments should fix obvious misses, not become the rating system.
* Role-player specialists need high ratings in their specialty without becoming fake superstars overall.

## Normalize First

Do not compare raw stats across eras.

Use percentile ranks inside a comparable season group:

```text

season percentile:
  player compared with all qualified players in that season

era percentile:
  weighted average of the player's season percentiles across the version's seasons

position-adjusted percentile:
  optional adjustment for categories where position context matters

```

Recommended qualification filters:

```text

season qualified:
  minutes >= 500
  or playoff minutes >= meaningful threshold

version qualified:
  total team-era minutes >= 1,000 for role pool
  total team-era minutes >= 2,000 for star pool

```

Use weighted averages by possessions or minutes so a 20-game sample does not equal a full prime season.

## Rating Transform

Percentiles alone make too many players look similar. Use a rating transform that spreads top players while keeping average rotation players playable.

Recommended transform:

```text

base_rating = 55 + 44 * (percentile ^ curve)

```

Suggested curves:

```text

star-friendly category:       curve = 0.75
balanced category:            curve = 0.90
specialist-sensitive category: curve = 0.65

```

Then clamp by pool:

```text

star pool final range: 70-99
role pool final range: 55-94
deep chaos pool range: 45-94

```

This lets an elite role shooter hit the low/mid 90s in shooting without turning him into a 96 overall player.

## Overall Guardrails

Current game score is the sum of five category ratings. That means ratings need distribution discipline.

Recommended internal tiers:

```text

99       single-category historical apex
96-98    all-time elite
92-95    elite
88-91    very good
83-87    good starter
75-82    starter/strong rotation
65-74    rotation
55-64    limited but playable
below 55 avoid for normal modes

```

Guardrails:

* No more than 1-3 players per era should have a 99 in the same attribute without review.
* A player can have an elite specialist rating and still low ratings elsewhere.
* One-way players should feel one-way.
* Bigs and guards need category formulas that avoid position bias traps.

## Proposed Formula Version 1

These formulas extend the existing `agents/product/attribute-calculation.md` notes. Exact weights should be playtested.

### Shooting

Inputs:

```text

3P% percentile
3PA rate percentile
FT% percentile
TS% percentile
eFG% percentile
midrange/free-throw proxy where available

```

Formula:

```text

shooting_raw =
  0.28 * three_point_percentage_percentile
+ 0.24 * three_point_volume_percentile
+ 0.16 * free_throw_percentage_percentile
+ 0.16 * true_shooting_percentile
+ 0.10 * effective_field_goal_percentile
+ 0.06 * shot_difficulty_or_manual_proxy

```

Notes:

* Older eras need a 3-point-era adjustment because the line did not exist for all history and early usage was low.
* FT% helps identify touch for older players and lower-volume shooters.
* Volume matters heavily; a low-volume 42 percent shooter should not rate like Stephen Curry.

### Finishing

Inputs:

```text

2P% percentile
rim attempts or 2PA percentile
FTA rate percentile
TS% percentile
points in paint/dunk proxy where available
turnover penalty for high-usage finishers

```

Formula:

```text

finishing_raw =
  0.25 * two_point_percentage_percentile
+ 0.20 * rim_or_two_point_volume_percentile
+ 0.20 * free_throw_attempt_rate_percentile
+ 0.15 * true_shooting_percentile
+ 0.10 * points_per_game_percentile
+ 0.10 * size_athletic_pressure_proxy

```

Notes:

* Bigs with elite efficiency and volume should score very high.
* Guards/wings need credit for pressure, self-created rim attempts, and free throws.
* Low-volume centers should not rate like elite finishers only because of FG%.

### Playmaking

Inputs:

```text

APG percentile
AST% percentile
AST/TOV percentile
usage-adjusted creation percentile
on-ball role proxy
position/context adjustment

```

Formula:

```text

playmaking_raw =
  0.28 * assists_per_game_percentile
+ 0.26 * assist_percentage_percentile
+ 0.18 * assist_turnover_percentile
+ 0.14 * usage_adjusted_creation_percentile
+ 0.08 * offensive_box_creation_percentile
+ 0.06 * manual_role_modifier

```

Notes:

* Passing bigs need manual or role-modifier support if the raw guard-centric stats underrate them.
* Low-turnover connectors should get some credit without passing primary creators.
* Pure usage without assists should not inflate playmaking.

### Defense

Inputs:

```text

DBPM percentile
DWS percentile
steal rate percentile
block rate percentile
All-Defense score
DPOY vote/win score
team defense impact proxy
position adjustment

```

Formula:

```text

defense_raw =
  0.20 * defensive_box_plus_minus_percentile
+ 0.16 * defensive_win_shares_percentile
+ 0.13 * steal_rate_percentile
+ 0.13 * block_rate_percentile
+ 0.14 * all_defense_score
+ 0.10 * dpoy_score
+ 0.08 * team_defense_role_proxy
+ 0.06 * manual_reputation_modifier

```

Notes:

* Defense is the category most likely to need review.
* Steals and blocks are helpful but can overrate gamblers or shot blockers with poor positioning.
* Awards can overrate reputation, so cap award-only boosts unless stats and role support them.

### Athleticism

Inputs:

```text

FTA rate percentile
rebound rate percentile
block rate percentile
steal rate percentile
2PA/rim pressure percentile
size-speed proxy
manual athleticism modifier

```

Formula:

```text

athleticism_raw =
  0.20 * free_throw_attempt_rate_percentile
+ 0.16 * rebound_rate_percentile
+ 0.16 * block_rate_percentile
+ 0.14 * steal_rate_percentile
+ 0.14 * rim_pressure_or_two_point_attempt_percentile
+ 0.10 * size_speed_proxy
+ 0.10 * manual_athleticism_modifier

```

Notes:

* Athleticism is not a pure box-score stat.
* The manual modifier is expected and should be documented.
* Do not use athleticism as a hidden "overall greatness" score.

## Specialist Handling

Specialists are essential for game modes.

Recommended specialist boost rule:

```text

if player is top 3 percent in one category input
and has enough minutes
and formula output is below 88:
  allow +2 to +5 specialist adjustment

```

Examples:

* Elite shooter with limited scoring load.
* Defensive stopper with low box-score offense.
* Rim protector with weak offensive game.
* Rebounder with limited scoring.

The boost should only affect the specialist category.

## Role-Player Rating Shape

Ball Knowledge becomes better when role players have sharp strengths and weaknesses.

Avoid smoothing every role player into:

```text

77, 77, 77, 77, 77

```

Prefer profiles like:

```text

3-and-D wing:
athleticism 78, shooting 88, finishing 74, playmaking 68, defense 90

rim protector:
athleticism 80, shooting 58, finishing 77, playmaking 55, defense 92

backup floor general:
athleticism 70, shooting 78, finishing 68, playmaking 88, defense 74

```

This creates meaningful decisions when attributes are hidden or partially hidden.

## Manual Adjustment Rules

Every adjustment should store:

```text

attribute
calculated_rating
adjustment
final_rating
reason
reviewer
source_notes
date
formula_version

```

Adjustment bands:

```text

0          formula accepted
+/- 1-2    small feel correction
+/- 3-5    significant correction, needs written reason
+/- 6-8    rare historical/context exception
+/- 9+     avoid unless the formula is wrong

```

Use a review queue instead of editing seed data directly.

## AI Review Method

AI can help with taste and consistency, but it should see the evidence.

Recommended process:

1. Generate formula ratings.
2. Find outliers using statistical checks.
3. Build a factsheet for each outlier.
4. Ask AI for review status and proposed adjustment.
5. Clamp the adjustment.
6. Human approves all medium/high-impact changes.
7. Store notes.

Outlier triggers:

* Player has a top-20 category rating that looks historically wrong.
* Player has a bottom-half category rating that contradicts reputation and evidence.
* Player total rating is higher than clear franchise stars.
* Ball Knowledge candidate looks too star-like.
* All-time star has no elite category.
* Duplicate player versions are nearly identical despite different career stages.

## Formula Versioning

Every generated rating should know which formula made it.

Example:

```text

formula_version: gf_attributes_v1
source_snapshot: basketball_reference_2026_07_seed_export
review_status: approved

```

This lets the team regenerate ratings later without losing the original rationale.

## Missing Data Strategy

Older eras will have missing stats.

Recommended fallback order:

1. Use available box stats and awards.
2. Use per-minute/per-possession estimates.
3. Use team-relative ranks.
4. Use era-specific manual modifiers.
5. Mark lower confidence.

Confidence labels:

```text

high:
  modern complete stat profile

medium:
  strong box-score and award data, limited tracking

low:
  missing major inputs, requires heavier manual review

```

## Recommended Database Extension Later

Do not rush this into the MVP schema, but plan for:

```text

player_attributes:
  keep final playable numbers

player_attribute_calculations:
  calculated values, formula inputs, source snapshot

player_attribute_adjustments:
  manual/AI/human review adjustments

player_archetypes:
  searchable labels for mode logic and UI hints

```

## Recommended Next Formula Work

Create a script that can take a CSV like:

```text

player_id
player_name
team
season
minutes
position
per_game stats
advanced stats
awards
playoffs

```

and output:

```text

player_version candidate
five calculated attributes
five final attributes
star_pool_score
role_player_score
archetype guess
review flags

```

That script should live under `src/lib/attributes` or a future `tools/player-seeding` area depending on whether it is runtime code or offline generation code.

