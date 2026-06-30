# Product Overview

## Project Name

Working Title: GOAT Builder

Alternative Names:

* NBA GOAT Builder
* Build-A-GOAT
* HoopLab
* Dynasty Draft
* Basketball DNA
* Legacy Lab

---

# Vision

GOAT Builder is a basketball strategy game inspired by the NBA community trend of building hypothetical all-time players.

Players are presented with random NBA teams and eras. For each round, they must select a player from the available pool and use one aspect of that player's game to build a custom basketball player.

The goal is to create the greatest basketball player of all time by strategically combining elite skills from NBA history.

The experience should feel similar to:

* 82-0
* NBA 2K attribute building
* Fantasy sports drafting
* Daily challenge puzzle games

The game should be easy to learn, fast to play, and highly shareable.

---

# Core Gameplay Loop

1. Start a new game.
2. Random team is selected.
3. Random era is selected.
4. A skill category is selected.
5. User chooses a player from the available player pool.
6. That player's rating is applied to the user's custom player.
7. Repeat for all categories.
8. Calculate final overall score.
9. Determine win/loss.
10. Show completed GOAT player card.
11. Allow sharing results.

Typical game length should be 2-5 minutes.

---

# Example Round

Random Team:
Miami Heat

Random Era:
2010s

Category:
Defense

Available Players:

* LeBron James
* Dwyane Wade
* Chris Bosh
* Jimmy Butler
* Bam Adebayo

User Selection:
LeBron James

Result:
Defense = 94

The category is now locked and cannot be selected again.

---

# MVP Goal

The MVP should focus entirely on the core gameplay experience.

The MVP does NOT require:

* User accounts
* Multiplayer
* Leaderboards
* Daily challenges
* Mobile applications
* Social features

The MVP should answer one question:

"Is the game fun?"

---

# Categories

Initial MVP categories:

* Athleticism
* Shooting
* Finishing
* Playmaking
* Defense

Future categories may include:

* Rebounding
* Size
* Basketball IQ
* Clutch
* Leadership
* Perimeter Defense
* Interior Defense
* Passing
* Ball Handling

---

# Win Condition

After all categories have been selected:

Final Score =
Athleticism +
Shooting +
Finishing +
Playmaking +
Defense

Example:

Athleticism: 99
Shooting: 95
Finishing: 98
Playmaking: 97
Defense: 94

Total:
483

Game Result:
Win

Exact win thresholds will be tuned during testing.

---

# Data Model Philosophy

The application must support multiple versions of the same player.

Examples:

* 2000s Cavaliers LeBron
* 2010s Heat LeBron
* 2010s Cavaliers LeBron
* 2020s Lakers LeBron

Each version may have different ratings.

The game should treat each version as a unique playable entity.

---

# Database Entities

## Team

Represents an NBA franchise.

Examples:

* Lakers
* Celtics
* Heat
* Bulls

---

## Era

Represents a gameplay era.

Examples:

* 1980s
* 1990s
* 2000s
* 2010s
* 2020s

---

## Player

Represents a real-world NBA player.

Examples:

* Michael Jordan
* LeBron James
* Kobe Bryant

A player should only exist once in the database.

---

## Player Version

Represents a specific version of a player.

Examples:

* 1990s Bulls Jordan
* 2000s Lakers Kobe
* 2010s Heat LeBron
* 2020s Lakers LeBron

This is the primary gameplay entity.

---

## Player Attributes

Stores ratings for a player version.

Example:

2010s Heat LeBron

* Athleticism: 99
* Shooting: 84
* Finishing: 98
* Playmaking: 94
* Defense: 94

---

# MVP Database Structure

Tables:

* teams
* eras
* players
* player_versions
* player_attributes

No game history tables are required for MVP.

Game state can be stored in client-side application state.

## MVP Data Population

The database schema should represent the future production model from the start.

For MVP, the database does not need a complete historical NBA dataset. Use a small, curated seed dataset with enough teams, eras, players, player versions, and attributes to make the core game loop playable.

Seeded MVP data should be treated as temporary bootstrap content, not as fake product rules. The app should access it through the same data-access layer that will later read the full real dataset.

Future work can expand or replace the seed data with real production data without changing the gameplay model.

---

# Technology Stack

Frontend:

* Next.js
* React
* TypeScript
* Tailwind CSS

Backend:

* Next.js API Routes

Database:

* Supabase PostgreSQL

Authentication:

* None for MVP

Hosting:

* Vercel

---

# UX Principles

The application should feel:

* Fast
* Simple
* Competitive
* Addictive
* Shareable

Avoid:

* Long forms
* Excessive clicks
* Complex onboarding

A user should be able to start a game within seconds.

---

# Future Features

## Daily Challenge

Every user receives the same spins each day.

Users compare scores.

---

## Leaderboards

Track:

* Highest score ever
* Daily scores
* Weekly scores

---

## User Accounts

Allow:

* Saved games
* Statistics
* Achievement tracking

---

## Multiplayer

Friends build players using the same spins.

Highest score wins.

---

## Shareable Result Cards

Generate an image displaying:

* Selected players
* Category scores
* Final GOAT score
* Win/Loss result

Optimized for social sharing.

---

# Success Criteria

The MVP is successful if:

1. Users understand the game immediately.
2. Users finish a full game.
3. Users want to play again.
4. Users share results with friends.
5. The game is enjoyable before adding any social features.

Fun and replayability are more important than technical complexity.
