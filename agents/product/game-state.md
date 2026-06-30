# Game State Specification

## Purpose

This document defines the client-side game state for the MVP version of GOAT Builder.

The MVP does not require saved games, user accounts, server-side sessions, or persistent game history.

All game state can live in React state during the active browser session.

---

# Game Structure

Each game consists of exactly five rounds.

Each round allows the user to fill one category.

The five MVP categories are:

```text
athleticism
shooting
finishing
playmaking
defense
```

Once all five categories are filled, the game is complete.

---

# State Philosophy

The game state should be:

* Easy to reason about
* Serializable
* Resettable
* Independent of the database schema
* Simple enough to store in React state
* Flexible enough to support saved sessions later

The game state should represent what is happening in the current playthrough, not the full database model.

---

# High-Level Game Status

The game should have a status field.

```ts
type GameStatus =
  | "idle"
  | "spinning"
  | "selectingCategory"
  | "selectingPlayer"
  | "roundComplete"
  | "gameComplete";
```

## Status Definitions

### idle

No active game has started.

Used on initial page load or after reset.

### spinning

The team and era wheels are being generated or animated.

### selectingCategory

The team and era have been selected.

The user must choose which unfilled category to use for the round.

### selectingPlayer

The user has selected a category.

The eligible player pool is displayed.

### roundComplete

The user has selected a player and the category has been filled.

This status may be brief and used for transition animations.

### gameComplete

All five categories are filled and the final result is shown.

---

# Core Game State Shape

```ts
type GameState = {
  status: GameStatus;

  currentRound: number;
  totalRounds: number;

  currentTeam: TeamOption | null;
  currentEra: EraOption | null;
  selectedCategory: AttributeCategory | null;

  availableCategories: AttributeCategory[];
  completedCategories: CompletedCategory[];

  usedPlayerVersionIds: string[];

  respins: RespinState;

  roundHistory: RoundResult[];

  finalScore: number | null;
  finalRank: GameRank | null;
};
```

---

# Supporting Types

## Attribute Category

```ts
type AttributeCategory =
  | "athleticism"
  | "shooting"
  | "finishing"
  | "playmaking"
  | "defense";
```

---

## Team Option

```ts
type TeamOption = {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string;
};
```

---

## Era Option

```ts
type EraOption = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
};
```

---

## Player Option

```ts
type PlayerOption = {
  playerVersionId: string;
  playerId: string;
  name: string;
  versionLabel: string;
  teamId: string;
  eraId: string;
  imageUrl?: string;

  attributes: {
    athleticism: number;
    shooting: number;
    finishing: number;
    playmaking: number;
    defense: number;
  };
};
```

---

## Completed Category

```ts
type CompletedCategory = {
  category: AttributeCategory;
  playerVersionId: string;
  playerName: string;
  playerVersionLabel: string;
  teamName: string;
  eraLabel: string;
  rating: number;
};
```

---

## Respin State

```ts
type RespinState = {
  teamRespinAvailable: boolean;
  eraRespinAvailable: boolean;

  teamRespinUsedRound: number | null;
  eraRespinUsedRound: number | null;
};
```

---

## Round Result

```ts
type RoundResult = {
  roundNumber: number;

  originalTeam: TeamOption;
  originalEra: EraOption;

  finalTeam: TeamOption;
  finalEra: EraOption;

  teamRespinUsed: boolean;
  eraRespinUsed: boolean;

  selectedCategory: AttributeCategory;

  selectedPlayerVersionId: string;
  selectedPlayerName: string;
  selectedPlayerVersionLabel: string;

  ratingApplied: number;
};
```

---

## Game Rank

```ts
type GameRank =
  | "GOAT"
  | "Hall of Fame"
  | "All-Time Great"
  | "All-Star"
  | "Starter"
  | "Role Player";
```

---

# Initial State

```ts
const initialGameState: GameState = {
  status: "idle",

  currentRound: 0,
  totalRounds: 5,

  currentTeam: null,
  currentEra: null,
  selectedCategory: null,

  availableCategories: [
    "athleticism",
    "shooting",
    "finishing",
    "playmaking",
    "defense",
  ],

  completedCategories: [],

  usedPlayerVersionIds: [],

  respins: {
    teamRespinAvailable: true,
    eraRespinAvailable: true,
    teamRespinUsedRound: null,
    eraRespinUsedRound: null,
  },

  roundHistory: [],

  finalScore: null,
  finalRank: null,
};
```

---

# Game Actions

The following actions should be supported.

---

## Start Game

Begins a new game.

Expected behavior:

```text
Set status to spinning
Set currentRound to 1
Reset all previous game values
Generate team
Generate era
Move to selectingCategory
```

---

## Spin Round

Generates the team and era for the current round.

Expected behavior:

```text
Randomly select one team
Randomly select one era
Store both as original and current values
Set selectedCategory to null
Set status to selectingCategory
```

Important:

Teams and eras may repeat across rounds.

---

## Use Team Respin

Allows the user to reroll only the current team.

Can only be used if:

```text
teamRespinAvailable = true
status = selectingCategory
```

Expected behavior:

```text
Generate new team
Keep current era unchanged
Set teamRespinAvailable to false
Set teamRespinUsedRound to currentRound
```

---

## Use Era Respin

Allows the user to reroll only the current era.

Can only be used if:

```text
eraRespinAvailable = true
status = selectingCategory
```

Expected behavior:

```text
Generate new era
Keep current team unchanged
Set eraRespinAvailable to false
Set eraRespinUsedRound to currentRound
```

---

## Use Both Respins

The user may use both respins during the same round.

Expected behavior:

```text
Use Team Respin
Use Era Respin
Both respins become unavailable
Both used round values equal currentRound
```

This is allowed.

---

## Select Category

Allows the user to choose which remaining category to fill.

Can only be used if:

```text
status = selectingCategory
category exists in availableCategories
```

Expected behavior:

```text
Set selectedCategory
Set status to selectingPlayer
Fetch eligible player pool for current team and current era
Exclude player versions already in usedPlayerVersionIds
```

---

## Select Player

Allows the user to choose a player from the eligible player pool.

Can only be used if:

```text
status = selectingPlayer
selectedCategory is not null
playerVersionId is not in usedPlayerVersionIds
```

Expected behavior:

```text
Get selected player's rating for selectedCategory
Create CompletedCategory record
Add selected playerVersionId to usedPlayerVersionIds
Remove selectedCategory from availableCategories
Add RoundResult to roundHistory
Clear selectedCategory
Clear currentTeam and currentEra
```

If all categories are complete:

```text
Calculate final score
Calculate final rank
Set status to gameComplete
```

Otherwise:

```text
Increment currentRound
Set status to spinning
Start next round
```

---

# Final Score Calculation

The final score is the sum of the five completed category ratings.

```ts
function calculateFinalScore(completedCategories: CompletedCategory[]): number {
  return completedCategories.reduce((total, item) => total + item.rating, 0);
}
```

---

# Final Rank Calculation

Initial MVP thresholds:

```ts
function calculateFinalRank(score: number): GameRank {
  if (score >= 490) return "GOAT";
  if (score >= 475) return "Hall of Fame";
  if (score >= 460) return "All-Time Great";
  if (score >= 440) return "All-Star";
  if (score >= 420) return "Starter";
  return "Role Player";
}
```

Thresholds are placeholders and should be tuned after playtesting.

---

# Player Pool Query Rules

When loading eligible players, query by:

```text
currentTeam.id
currentEra.id
```

Only return:

```text
Top 20 player versions for that team and era
```

Exclude:

```text
Any playerVersionId already in usedPlayerVersionIds
```

The user should only be able to select one player version once per game.

---

# Important Edge Cases

## Respin Produces Same Result

If a respin produces the same team or era, this is allowed for MVP.

Future versions may prevent repeated respin results.

---

## No Eligible Players Found

If no eligible players are found for the current team and era:

```text
Show an error state
Allow the user to spin again without consuming a respin
```

This should be treated as a data issue.

---

## User Refreshes Page

For MVP:

```text
The game resets
```

Future versions may store game state in local storage.

---

## User Goes Back

For MVP:

```text
Users cannot undo completed picks
```

Once a player has been selected for a category, that decision is locked.

---

# State Storage

For MVP, store state using React state.

Recommended options:

```text
useReducer
Zustand
React Context + useReducer
```

Recommended approach:

```text
useReducer
```

The reducer approach is preferred because the game is action-based and has clear state transitions.

---

# Future Persistence

Future versions may persist this state to:

```text
localStorage
Supabase game_sessions
Supabase game_picks
```

The current state shape should be designed so it can later map cleanly to persistent tables.

---

# Implementation Rule

Do not store full database entities in long-term game state unless needed.

Prefer storing:

```text
IDs
Labels
Ratings
Small display fields
```

This keeps state lightweight and easy to serialize.
