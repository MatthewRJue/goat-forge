# MVP Specification

## Purpose

This document defines the Minimum Viable Product (MVP) for GOAT Builder.

The purpose of the MVP is to answer one question:

> **Is the core gameplay fun?**

Everything included in the MVP should directly support that goal.

Anything that does not improve the core gameplay experience should be deferred until after MVP validation.

---

# MVP Goals

The MVP should allow a user to:

* Start a new game
* Play all five rounds
* Build a custom GOAT player
* View their completed player
* Receive a final score
* Receive a final rank

The game should be fully playable from beginning to end without requiring an account.

---

# Primary Success Criteria

The MVP is successful if users:

* Understand the game within one minute.
* Complete an entire game.
* Feel that their decisions mattered.
* Want to immediately play another game.
* Share the game with friends.

---

# Core Gameplay

The MVP gameplay loop is:

1. Start Game
2. Spin Team
3. Spin Era
4. Optional Team Respin
5. Optional Era Respin
6. Select Category
7. Select Player
8. Apply Attribute
9. Repeat until all five categories are filled
10. Calculate Final Score
11. Display Final Build

---

# Included Features

## Home Screen

The application should include a simple landing page.

Features:

* Game logo/title
* Brief explanation
* Start Game button

No authentication required.

---

## Five Round Game

Each game consists of exactly five rounds.

Each round fills one attribute category.

The MVP categories are:

```text
Athleticism
Shooting
Finishing
Playmaking
Defense
```

---

## Random Team Generation

Each round randomly selects one NBA team.

Duplicate teams are allowed.

---

## Random Era Generation

Each round randomly selects one era.

Duplicate eras are allowed.

---

## Respins

Each game begins with:

```text
1 Team Respin
1 Era Respin
```

Rules:

* Team respin may only be used once.
* Era respin may only be used once.
* Both respins may be used during the same round.
* Once consumed, they cannot be used again.

---

## Category Selection

The user chooses which remaining category they want to fill.

Categories cannot be selected twice.

---

## Player Selection

The player pool is generated using:

```text
Selected Team
+
Selected Era
```

The pool contains:

```text
Top 20 player versions
```

for that team and era.

Previously selected player versions cannot be selected again.

---

## Attribute Assignment

Selecting a player applies that player's rating for the selected category.

Example:

```text
Category:
Defense

Player:
2010s Heat LeBron

Result:
Defense = 94
```

---

## Final Score

After all categories are filled:

```text
Final Score =
Athleticism +
Shooting +
Finishing +
Playmaking +
Defense
```

---

## Final Rank

The player receives a tier based on their score.

Initial placeholder thresholds:

```text
490+     GOAT
475-489  Hall of Fame
460-474  All-Time Great
440-459  All-Star
420-439  Starter
Below    Role Player
```

These values will be tuned through playtesting.

---

## Final Results Screen

The results screen should display:

* Selected player for each category
* Rating for each category
* Total score
* Final rank
* Play Again button

---

# Required Database Tables

The MVP requires only:

```text
teams
eras
players
player_versions
player_attributes
```

No user or gameplay history tables are required.

---

# Required Pages

The MVP should contain only a small number of pages.

## Home

Purpose:

Start a new game.

---

## Game

Purpose:

Play all five rounds.

This page contains the entire gameplay experience.

---

## Results

Purpose:

Display the completed GOAT player.

Allow the player to start another game.

---

# Visual Requirements

The MVP should prioritize clarity over visual polish.

Requirements:

* Responsive layout
* Clear typography
* NBA-inspired styling
* Smooth transitions
* Basic wheel spin animations
* Category cards
* Player cards

Avoid unnecessary animations that slow gameplay.

---

# Performance Goals

The game should:

* Load quickly.
* Feel responsive.
* Transition smoothly between rounds.
* Require minimal waiting.

Most operations should complete instantly.

---

# Explicitly Out of Scope

The following features should **not** be implemented during the MVP.

## User Accounts

No login.

No registration.

No profiles.

---

## Multiplayer

No online play.

No private rooms.

No matchmaking.

---

## Leaderboards

No global rankings.

No daily rankings.

No friend rankings.

---

## Saved Games

Games are not persisted.

Refreshing the browser resets the game.

---

## Daily Challenges

No daily seeds.

No shared challenges.

---

## Statistics

No personal statistics.

No historical performance.

---

## Achievements

No badges.

No unlockables.

No progression system.

---

## Mobile Applications

Only a responsive web application is required.

Native iOS and Android applications are future work.

---

## Social Features

No friends.

No comments.

No sharing directly to social platforms.

---

# Future MVP Enhancements

After validating the gameplay loop, likely additions include:

* Daily Challenge
* Leaderboards
* User Accounts
* Game History
* Shareable Result Cards
* Player Comparison ("Your build is most similar to...")
* Additional Attribute Categories
* Difficulty Modes
* Multiplayer

These features should not influence the MVP architecture beyond keeping the codebase extensible.

---

# Development Priorities

Implementation priority should be:

1. Database
2. Seed Data
3. Game State
4. Core Game Logic
5. UI
6. Animations
7. Polish

Gameplay correctness is more important than visual polish.

---

# Definition of Done

The MVP is complete when a user can:

* Open the website.
* Start a game.
* Play five rounds.
* Use both respins correctly.
* Build a complete player.
* Receive a score.
* Receive a rank.
* Start another game.

No additional functionality is required before the MVP is considered complete.
