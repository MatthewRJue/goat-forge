# Game Modes Research

## Recommendation

Keep the current core loop as the default, but treat game modes as different pool and visibility rules.

The clean model:

```text

same player versions
same attributes
different eligibility pools
different visibility rules
different spin/randomization rules
different scoring modifiers

```

This avoids duplicating ratings per mode.

## Base Mode Dimensions

A mode can vary along these axes:

* Which player pool is eligible.
* Whether attributes are visible.
* Whether team/era are spun.
* Whether the player is chosen before the attribute or the attribute before the player.
* Whether respins are available.
* Whether category choices are locked normally.
* Whether the same player can appear in multiple versions.
* Whether scoring has bonuses or penalties.

## Proposed Core Modes

### Easy

Intent:

* Casual, readable, and satisfying.
* Best first-time player experience.
* Stars are visible and attributes are shown.

Rules:

```text

pool: star_pool
team spin: yes
era spin: yes
attributes visible: yes
respins: normal
player choice: user selects from team-era pool
attribute choice: user chooses any unlocked category

```

Recommended pool:

* Top 6-10 players per populated team-era.
* Strong preference for recognizable stars.
* Include elite non-stars only if they are important to that team-era.

Why it works:

* The player learns the game.
* The decision is still strategic because categories lock.
* Bad choices feel understandable.

### Hard

Intent:

* Same recognizable players, but requires memory and basketball intuition.
* The user must know or infer which attribute is best.

Rules:

```text

pool: star_pool
team spin: yes
era spin: yes
attributes visible: no before selection
attributes revealed: after category is applied, or after player selection depending on tuning
respins: normal or reduced

```

Recommended variant:

* Hide exact numbers.
* Optionally show vague labels after selecting a player:

```text

Elite, Great, Good, Average, Weak

```

This may be more fun than fully blind play because it preserves some strategy without turning every click into trivia.

### Ball Knowledge

Intent:

* Deep-cut mode for fans who know role players, specialists, and team history.
* Stars are blocked.
* The fun is identifying specialist value.

Rules:

```text

pool: role_pool
team spin: yes
era spin: configurable
attributes visible: hidden or partially visible
respins: normal, possibly more generous
star players: excluded

```

Recommendation:

* Start with team + era Ball Knowledge.
* Add all-time team Ball Knowledge as a later variant.

Why team + era first:

* It matches the existing core loop.
* It makes player identity more meaningful.
* It prevents the pool from being too random.
* It lets fans reason about specific teams and decades.

Why all-time team should also exist:

* It is cleaner for franchises with thin era history.
* It allows better role-player depth.
* It is easier to fill early.

Best long-term shape:

```text

Ball Knowledge: Team Era
Ball Knowledge: Franchise All-Time

```

### Ball Knowledge Eligibility

Do not define it only as "one All-Star or fewer."

Use this:

```text

eligible if:
  not a clear franchise/league star
  career All-Star selections <= 1
  career All-NBA selections = 0
  MVP top-10 finishes = 0
  not NBA 75 unless manually allowed
  not Hall of Fame unless manually allowed
  meaningful team-era minutes
  clear specialist, rotation, or playoff identity

```

Manual exceptions are important. Some one-time All-Stars are remembered as role players; some zero-time All-Stars were star-level.

## Improvements To The Suggested Modes

### Attribute Visibility Gradient

Instead of only visible/hidden, support visibility levels:

```text

exact:
  Shooting 94

tier:
  Shooting: Elite

rank:
  This is the player's 2nd-best attribute

hidden:
  no rating shown until locked

misdirection:
  show only one hint, such as archetype or position

```

This gives more tuning room.

### Mode Difficulty Should Affect Scoring

If Hard hides attributes, players should get a score multiplier or badge.

Example:

```text

Easy: final score as-is
Hard: final score + 10 badge bonus
Ball Knowledge: final score + specialist bonus

```

Avoid changing attribute ratings by mode. Change final scoring or badges instead.

### Role-Player Specialist Bonus

Ball Knowledge should reward finding role-player strengths.

Example:

```text

if selected rating >= 88
and player is role_pool eligible
and selected category matches archetype:
  +3 specialist bonus

```

This lets a Shane Battier or Robert Horry type feel useful without needing inflated total ratings.

## Additional Game Mode Ideas

### Blind Draft

Rules:

```text

team/era spin: no
player offered randomly
attribute visible: hidden
user chooses which category to assign
reveal after lock

```

Why it could be good:

* Fast.
* Highly replayable.
* Good mobile mode.
* Less dependent on fully populated team-era pools.

Risk:

* Can feel random if there are no hints.

Fix:

* Show team, era, position, and archetype.

### Attribute First

Rules:

```text

category is spun first
then team/era/player pool appears
user must choose the best player for that category

```

Why it could be good:

* More puzzle-like.
* Reduces analysis paralysis.
* Creates sharper category knowledge tests.

Example:

```text

Need: Defense
Spin: 2010s Warriors
Choices: Draymond Green, Klay Thompson, Andre Iguodala, Andrew Bogut

```

### Franchise Builder

Rules:

```text

choose one franchise
build all five attributes using only that franchise's history
era may spin or be user-selected

```

Why it could be good:

* Great for sharing and fandom.
* Easier to package as "Build the best Lakers GOAT."
* Gives each team identity.

Variants:

* Lakers-only all time.
* One franchise, no repeats.
* One franchise, no Hall of Famers.

### Era Builder

Rules:

```text

choose one era
all spins come from that decade

```

Why it could be good:

* Good for nostalgia.
* Easier to compare era knowledge.
* Makes balancing simpler because all picks are era-normalized.

### No Stars

Rules:

```text

pool: role_pool
team/era: standard
attributes: visible or tiered
scoring: specialist bonuses

```

This is the simple version of Ball Knowledge. It can be the first implementation.

### Sicko Mode

Intent:

* Deepest trivia.

Rules:

```text

pool: deep_role_pool
minimum fame tier: low
attributes: hidden
respins: none or one total
team-era combinations: only where pool depth is strong

```

This should be a later unlock/novelty mode, not the default.

### Category Auction

Rules:

```text

each round offers 3 players
user can assign one category
skipping keeps category open but burns the player

```

Why it could be good:

* Strategic tension.
* Useful for daily challenge seeds.

### Daily Challenge

Rules:

```text

same seed for everyone each day
fixed mode
share final card

```

Why it could be good:

* Very shareable.
* Adds a reason to return.
* Works especially well after the core game is stable.

MVP note:

* Product docs currently keep daily challenges future-facing. Do not implement until core data and modes are fun.

### Draft Board

Rules:

```text

show 5-8 random player cards at once
user drafts one for a category
board refreshes each round

```

Why it could be good:

* More like fantasy drafting.
* Less waiting on spin animations.
* Lets users compare choices quickly.

This could become an alternate flow if team/era spinning ever feels too restrictive.

### Compare Mode

Rules:

```text

two players shown
one category selected
user chooses who has the higher rating
correct answer earns that rating for the build

```

Why it could be good:

* Trivia plus builder.
* Good for hidden attributes.

Risk:

* Requires very trusted ratings.

### Playoff Heroes

Rules:

```text

pool: players with notable playoff roles
ratings can include playoff-weighted versions

```

Why it could be good:

* Captures players whose regular season stats understate their fame.
* Great source of role-player fun.

Need:

* Separate regular-season and playoff data handling.

## Should The Game Always Spin Team And Era?

Not necessarily.

Team/era spinning is a great default because it gives each round identity. But alternate modes can work better with random players or fixed themes.

Recommended structure:

```text

Classic modes:
  spin team and era

Fast modes:
  random player offers

Challenge modes:
  fixed seed and curated pools

Fandom modes:
  chosen team or chosen era

```

This allows experimentation without replacing the current game.

## Recommended Mode Build Order

1. Easy Classic
2. Hard Classic
3. Ball Knowledge: Team Era
4. Ball Knowledge: Franchise All-Time
5. Blind Draft
6. Franchise Builder
7. Daily Challenge

Why this order:

* Easy/Hard reuse the same star pool.
* Ball Knowledge needs more curation.
* Blind Draft can reuse all pools after ratings are trustworthy.
* Daily Challenge needs stable seeds and shareable results.

## Data Needed By Mode

```text

Easy:
  star_pool eligibility
  visible attributes

Hard:
  star_pool eligibility
  hidden/tiered attributes

Ball Knowledge:
  role_pool eligibility
  role archetypes
  star exclusion flags

Blind Draft:
  mode weights
  hints/archetypes

Franchise Builder:
  franchise identity and historical labels

Daily Challenge:
  deterministic seed generation
  fixed mode config

```

## UX Notes

Easy:

* Show exact ratings.
* Make the best option understandable.

Hard:

* Hide exact ratings.
* Reveal after lock.
* Consider tier labels if fully hidden feels too punishing.

Ball Knowledge:

* Show archetype or position.
* Consider hiding exact attributes but showing a specialty hint.
* Make the selected role player feel celebrated in the result.

Blind modes:

* Always show enough context to make the choice feel skill-based.

## Strongest New Mode Idea

The best alternate mode is probably Attribute First.

It keeps the current team/era identity but makes each round a clean puzzle:

```text

Category needed: Shooting
Team-era: 2000s Celtics
Who do you trust?

```

This could be easier to understand than the full open-ended player-then-attribute flow, and it naturally supports hidden attributes.

