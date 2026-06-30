# Attribute Calculation System

## Purpose

This document defines how player ratings are generated for GOAT Builder.

The goal is to create a scalable system capable of generating ratings for thousands of player versions without requiring manual rating entry.

Ratings should be:

* Consistent
* Repeatable
* Explainable
* Easy to tune
* Comparable across eras

The system should use historical NBA statistics to generate attribute ratings automatically.

Manual adjustments should only be used for obvious outliers.

---

# Design Philosophy

GOAT Builder is not attempting to perfectly recreate NBA 2K ratings.

Instead, the goal is to create a fun and balanced game system that rewards basketball knowledge while maintaining historical accuracy.

The rating system should:

1. Reward elite players.
2. Differentiate great players from good players.
3. Account for era differences.
4. Produce ratings that feel intuitive to basketball fans.

---

# Core Categories

The MVP includes five attributes:

```text
Athleticism
Shooting
Finishing
Playmaking
Defense
```

Each player version will have a rating from:

```text
0 - 99
```

In practice, most playable players should fall between:

```text
70 - 99
```

---

# Era Normalization

Raw statistics should never be compared directly across eras.

Example:

```text
2020 Stephen Curry
3PM = 5.3

1993 Michael Jordan
3PM = 1.2
```

Direct comparison is misleading because the league environment was different.

Instead, player statistics should be converted into era-based percentiles.

Example:

```text
Stephen Curry
3P Volume Percentile = 99

Michael Jordan
3P Volume Percentile = 70
```

All rating calculations should use percentiles rather than raw values whenever possible.

---

# Rating Generation Process

## Step 1

Gather statistical inputs.

## Step 2

Convert each statistical category into an era percentile.

## Step 3

Calculate attribute scores using weighted formulas.

## Step 4

Apply manual adjustments if necessary.

## Step 5

Store final ratings in the database.

---

# Attribute Formulas

## Shooting

### Inputs

```text
3P%
3PA Per Game
FT%
True Shooting %
```

### Formula

```text
35%  Three Point Percentage
25%  Three Point Volume
20%  Free Throw Percentage
20%  True Shooting Percentage
```

### Calculation

```text
Shooting =
(
0.35 × 3P% Percentile
+
0.25 × 3PA Percentile
+
0.20 × FT% Percentile
+
0.20 × TS% Percentile
)
```

### Example Targets

```text
Stephen Curry 2010s = 99
Ray Allen 2000s = 96
Klay Thompson 2010s = 94
LeBron James 2010s = 84
Shaquille O'Neal 2000s = 45
```

---

## Finishing

### Inputs

```text
2P%
FG%
True Shooting %
Free Throw Attempts
Points Per Game
```

### Formula

```text
30%  Two Point Percentage
25%  True Shooting Percentage
20%  Free Throw Attempts
15%  Field Goal Percentage
10%  Points Per Game
```

### Calculation

```text
Finishing =
(
0.30 × 2P% Percentile
+
0.25 × TS% Percentile
+
0.20 × FTA Percentile
+
0.15 × FG% Percentile
+
0.10 × PPG Percentile
)
```

### Example Targets

```text
Shaquille O'Neal 2000s = 99
LeBron James 2010s = 98
Giannis Antetokounmpo 2020s = 98
Stephen Curry 2010s = 82
```

---

## Playmaking

### Inputs

```text
Assists Per Game
Assist Percentage
Assist-To-Turnover Ratio
Usage Adjusted Creation Metrics
```

### Formula

```text
40% Assists Per Game
30% Assist Percentage
20% Assist-To-Turnover Ratio
10% Creation Metrics
```

### Calculation

```text
Playmaking =
(
0.40 × APG Percentile
+
0.30 × AST% Percentile
+
0.20 × AST/TOV Percentile
+
0.10 × Creation Percentile
)
```

### Example Targets

```text
Magic Johnson 1980s = 99
Steve Nash 2000s = 98
LeBron James 2020s = 96
Shaquille O'Neal 2000s = 55
```

---

## Defense

### Inputs

```text
Defensive Box Plus Minus
Defensive Win Shares
Steals
Blocks
All-Defense Selections
DPOY Voting
```

### Formula

```text
25% Defensive Box Plus Minus
20% Defensive Win Shares
15% Steals
15% Blocks
15% All-Defense Bonus
10% DPOY Bonus
```

### Calculation

```text
Defense =
(
0.25 × DBPM Percentile
+
0.20 × DWS Percentile
+
0.15 × STL Percentile
+
0.15 × BLK Percentile
+
0.15 × All-Defense Bonus
+
0.10 × DPOY Bonus
)
```

### Example Targets

```text
Hakeem Olajuwon 1990s = 99
Ben Wallace 2000s = 99
Kawhi Leonard 2010s = 97
Stephen Curry 2010s = 75
```

---

## Athleticism

### Inputs

Athleticism is difficult to estimate using box score data.

This category intentionally includes a manual component.

```text
Free Throw Attempts
Rebounds
Blocks
Steals
Two Point Attempts
Manual Modifier
```

### Formula

```text
25% Free Throw Attempts
20% Rebounds
20% Blocks
15% Steals
10% Two Point Attempts
10% Manual Modifier
```

### Calculation

```text
Athleticism =
(
0.25 × FTA Percentile
+
0.20 × REB Percentile
+
0.20 × BLK Percentile
+
0.15 × STL Percentile
+
0.10 × 2PA Percentile
+
0.10 × Manual Modifier
)
```

### Example Targets

```text
LeBron James 2000s = 99
Michael Jordan 1990s = 98
Vince Carter 2000s = 98
Nikola Jokic 2020s = 72
```

---

# Rating Scale

The following scale should be used throughout the application.

```text
99      Historically Elite
95-98   All-Time Great
90-94   Elite
85-89   Very Good
80-84   Good
70-79   Average Starter
60-69   Rotation Player
Below 60 Limited Impact
```

---

# Manual Adjustment System

Some players cannot be accurately represented through statistics alone.

Examples:

```text
Michael Jordan
LeBron James
Vince Carter
Allen Iverson
Nikola Jokic
Dennis Rodman
```

The system should allow manual adjustments.

---

## Philosophy

Manual adjustments should be rare.

The calculated score should always be the starting point.

Adjustments should only be used when the statistical model clearly produces an unrealistic result.

---

## Example

```text
Calculated Athleticism = 91

Manual Adjustment = +6

Final Athleticism = 97
```

---

# Database Structure

## MVP Storage

For MVP, the database may store only final playable ratings for the five MVP categories.

Example:

```sql
player_attributes
-----------------
player_version_id

athleticism
shooting
finishing
playmaking
defense
```

These final ratings may come from seeded data. MVP implementation does not need the full rating-generation pipeline before the game is playable.

## Future Rating Provenance

When the full attribute generation system is implemented, the database should store calculated, adjustment, and final values.

Example:

```sql
player_attributes
-----------------
player_version_id

athleticism_calculated
athleticism_adjustment
athleticism_final

shooting_calculated
shooting_adjustment
shooting_final

finishing_calculated
finishing_adjustment
finishing_final

playmaking_calculated
playmaking_adjustment
playmaking_final

defense_calculated
defense_adjustment
defense_final
```

This allows future formula changes without losing original calculations.

---

# Future Enhancements

Future versions may add:

```text
Rebounding
Basketball IQ
Leadership
Clutch
Passing
Ball Handling
Perimeter Defense
Interior Defense
Size
```

These should follow the same architecture:

1. Statistical Inputs
2. Percentile Conversion
3. Weighted Formula
4. Manual Adjustment
5. Final Rating

---

# Implementation Goals

The attribute system should:

* Scale to thousands of player versions.
* Require minimal manual maintenance.
* Produce believable ratings.
* Remain tunable over time.
* Support future categories without major redesign.

Fun gameplay should be prioritized over perfect statistical accuracy.
