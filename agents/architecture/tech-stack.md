# GOAT Builder Tech Stack

## Overview

GOAT Builder is a web application where users build the greatest basketball player of all time by combining attributes from NBA players across different teams and eras.

The application uses a modern TypeScript-first architecture designed to support rapid development, low operational costs, and future scalability.

---

# Core Technology Stack

## Frontend

### Next.js

**Purpose:** Full-stack web framework

Responsibilities:

* Routing
* Page rendering
* API routes
* Server components
* Client components
* Application structure

Why:

* Industry standard React framework
* Excellent developer experience
* Built-in backend capabilities
* Easy deployment
* Strong TypeScript support

---

### React

**Purpose:** UI library

Responsibilities:

* Component rendering
* State management
* User interactions
* Dynamic updates

Examples:

* Spin wheel
* Player cards
* Build summary
* Leaderboard

---

### TypeScript

**Purpose:** Type-safe JavaScript

Responsibilities:

* Type checking
* Improved maintainability
* Better editor tooling
* Reduced runtime bugs

All new code should be written in TypeScript.

---

### Tailwind CSS

**Purpose:** Styling framework

Responsibilities:

* Layouts
* Responsive design
* Component styling
* Theme management

Why:

* Fast development
* Consistent design system
* Small production bundle size

---

# Backend

## Next.js API Routes

**Purpose:** Application backend

Location:

```text
src/app/api
```

Responsibilities:

* Server-side behavior when a story explicitly requires it
* Future build validation
* Future trusted score calculation
* Future anti-cheat logic

Examples:

```text
POST /api/build
POST /api/spin
```

For MVP, prefer client-side state and local game logic unless a story explicitly needs an API route.

Post-MVP API routes may support leaderboards, daily challenges, saved builds, and competitive validation.

---

# Database

## Supabase

**Purpose:** Managed backend platform

Responsibilities:

* PostgreSQL database
* Seeded MVP game data
* Future authentication
* Future row-level security
* Future file storage
* Future realtime capabilities

Why:

* Generous free tier
* Fast setup
* Strong Next.js integration
* Minimal operational overhead

---

### PostgreSQL

Managed by Supabase.

Core data includes:

```text
teams
eras
players
player_versions
player_attributes
```

For MVP, Supabase should be populated with a small seeded dataset that exercises the core game loop. Full real data population can happen after the MVP proves the gameplay.

Post-MVP tables may include:

```text
builds
leaderboards
users
```

---

# Authentication

## MVP

The MVP does not require authentication.

Users should be able to play a complete game without registering, logging in, or creating a profile.

## Supabase Auth

Supabase Auth is a post-MVP option for features that require identity.

Responsibilities:

* User registration
* Login
* Session management
* OAuth providers (future)

Potential providers:

```text
Google
Discord
GitHub
Email/Password
```

---

# Hosting

## Vercel

Responsibilities:

* Application hosting
* CI/CD
* Preview deployments
* Production deployments

Deployment flow:

```text
GitHub
   ↓
Vercel
   ↓
Production
```

Every push to the main branch automatically deploys the application.

---

# Source Control

## Git

Responsibilities:

* Version control
* Branching
* Code history

---

## GitHub

Responsibilities:

* Repository hosting
* Pull requests
* Code reviews
* CI integration

---

# Future Additions

These technologies are not required for MVP development.

## Upstash Redis

Potential use cases:

* Leaderboard caching
* Daily challenge caching
* Rate limiting

---

## Background Jobs

Potential future options:

* Supabase Edge Functions
* Trigger.dev
* Inngest

Use cases:

* Data synchronization
* Daily challenge generation
* Analytics processing

---

# Architecture

```text
User Browser
      ↓
   Next.js
      ↓
 ┌───────────────┐
 ↓               ↓
Supabase      API Routes
(Database)        ↓
                 Supabase
```

---

# Development Principles

1. TypeScript-first development.
2. Keep architecture simple until complexity requires change.
3. Prefer Next.js API routes over a separate backend.
4. Use Supabase as the primary data platform.
5. For MVP, scoring may run locally; move trusted scoring and leaderboard logic server-side when persistence or competition features are added.
6. Build MVP functionality before optimizing for scale.
7. Maintain a clean separation between UI, business logic, and data access.

---

# MVP Stack Summary

```text
Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

Backend
- Next.js API Routes

Database
- Supabase PostgreSQL
- Seeded MVP data, expandable to real production data

Authentication
- None for MVP

Hosting
- Vercel

Version Control
- Git
- GitHub
```
