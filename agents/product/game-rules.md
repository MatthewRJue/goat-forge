# Game Rules Specification

## Overview

GOAT Builder is a basketball strategy game where users create the greatest player of all time by combining individual skills from NBA players across different teams and eras.

Each game consists of five rounds.

During each round:

1. A random NBA team is selected.
2. A random NBA era is selected.
3. The user selects a player from the available player pool.
4. The user chooses an unfilled attribute category for that player.
5. The selected player's rating for that category is applied to the custom player.

After all five categories have been filled, a final score is calculated and the player receives a rank.

---

# Core Concepts

## Team

A randomly selected NBA franchise.

Examples:

* Lakers
* Bulls
* Celtics
* Heat
* Spurs

Teams may appear multiple times during a single game.

---

## Era

A randomly selected basketball era.

Examples:

* 1980s
* 1990s
* 2000s
* 2010s
* 2020s

Eras may appear multiple times during a single game.

---

## Player Version

The primary gameplay entity.

A player version represents a specific player on a specific team during a specific era.

Examples:

* 1990s Bulls Jordan
* 2000s Lakers Kobe
* 2010s Heat LeBron
* 2020s Lakers LeBron

Multiple versions of the same player may exist.

Each version may have different ratings.

---

# Game Structure

## Number of Rounds

Each game consists of exactly:

```text
5 Rounds
```

Each round fills one category.

Once all categories have been filled, the game ends.

---

# Categories

The MVP includes five categories:

```text
Athleticism
Shooting
Finishing
Playmaking
Defense
```

Each category can only be filled once.

Once a category has been assigned a player, it becomes locked.

---

# Player And Attribute Selection

After the team and era are finalized, the user selects an eligible player from that team-era pool.

After choosing a player, the user selects which remaining category they wish to fill with that player's rating.

Example:

Current categories:

✓ Athleticism
✓ Shooting
□ Finishing
□ Playmaking
□ Defense

Available choices:

* Finishing
* Playmaking
* Defense

The user may choose any remaining category.

The game does not assign categories automatically.

---

# Round Flow

A standard round follows the sequence below.

## Step 1

Generate random team.

Example:

```text
Team = Miami Heat
```

## Step 2

Generate random era.

Example:

```text
Era = 2010s
```

## Step 3

Offer available respins.

## Step 4

Load player pool.

Example:

```text
2010s Heat Players
```

## Step 5

User selects player.

Example:

```text
LeBron James
```

## Step 6

User selects attribute category.

Example:

```text
Defense
```

## Step 7

Apply category value.

Example:

```text
Defense = 94
```

## Step 8

Mark category as completed.

Proceed to next round.

---

# Respins

Each game starts with:

```text
1 Team Respin
1 Era Respin
```

These are one-time resources.

Once used, they cannot be recovered during the current game.

---

## Team Respin

Allows the user to reroll the current team.

Example:

Original:

```text
Team = Hornets
Era = 2010s
```

After respin:

```text
Team = Celtics
Era = 2010s
```

Team respin becomes unavailable for the remainder of the game.

---

## Era Respin

Allows the user to reroll the current era.

Example:

Original:

```text
Team = Bulls
Era = 1980s
```

After respin:

```text
Team = Bulls
Era = 1990s
```

Era respin becomes unavailable for the remainder of the game.

---

## Combined Respins

A player may use both respins during the same round.

Example:

Original:

```text
Team = Wizards
Era = 2000s
```

User activates:

* Team Respin
* Era Respin

Result:

```text
Team = Lakers
Era = 2010s
```

Both respins are permanently consumed.

---

# Player Pool Rules

Each round generates a player pool based on:

```text
Selected Team
+
Selected Era
```

Example:

```text
2010s Miami Heat
```

The player pool contains:

```text
Top 20 Players
For That Team
Within That Era
```

The exact ranking methodology will be determined separately.

---

# Player Reuse Rules

A player version may only be selected once per game.

Example:

Selected earlier:

```text
2010s Heat LeBron
```

That player version is removed from all future selection pools.

The user cannot use the same player version for multiple categories.

---

# Duplicate Team Rules

Teams may appear multiple times during a game.

Example:

```text
Round 1
2010s Lakers

Round 4
2020s Lakers
```

This is valid.

---

# Duplicate Era Rules

Eras may appear multiple times during a game.

Example:

```text
Round 1
2010s

Round 2
2010s

Round 5
2010s
```

This is valid.

---

# Score Calculation

After all five categories are filled:

```text
Final Score =
Athleticism +
Shooting +
Finishing +
Playmaking +
Defense
```

Example:

```text
Athleticism = 99
Shooting = 97
Finishing = 95
Playmaking = 96
Defense = 92
```

Final Score:

```text
479
```

---

# Ranking System

The MVP uses score tiers.

Placeholder values:

```text
490+     GOAT
475-489  Hall of Fame
460-474  All-Time Great
440-459  All-Star
420-439  Starter
Below 420 Role Player
```

These thresholds are expected to change based on playtesting.

---

# End Game Screen

At the end of a game the user should see:

## Final Build

Example:

```text
Athleticism  - LeBron James
Shooting     - Stephen Curry
Finishing    - Shaquille O'Neal
Playmaking   - Magic Johnson
Defense      - Hakeem Olajuwon
```

## Ratings

```text
Athleticism 99
Shooting 99
Finishing 98
Playmaking 99
Defense 98
```

## Final Score

```text
493
```

## Rank

```text
GOAT
```

---

# Future Enhancements

The MVP intentionally excludes:

* Daily challenges
* User accounts
* Leaderboards
* Multiplayer
* Saved games
* Historical statistics

These may be added in future versions without changing the core gameplay loop.
