<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context

All project planning and implementation guidance lives in `agents/`.

Read the relevant docs before changing code:

* `agents/product/` - product vision, gameplay rules, game state, and attribute logic.
* `agents/architecture/` - tech stack, project structure, database schema, and testing guidance.
* `agents/delivery/` - MVP scope, story workflow, story template, and implementation order.

For MVP work, start with:

1. `agents/delivery/mvp.md`
2. `agents/product/overview.md`
3. `agents/architecture/project-structure.md`
4. Any specific product or architecture doc related to the task.

Do not duplicate large sections from these docs in `AGENTS.md`; link to the source document instead.

# Next.js Local Docs Lookup

Before writing Next.js code, use the local docs in `node_modules/next/dist/docs/`.

Use `rg` to find the relevant guide for the task:

* Routes, layouts, pages, loading UI, or error UI - search for App Router route docs.
* Route handlers or API endpoints - search for route handler docs.
* Server and client component boundaries - search for server/client component docs.
* Metadata, images, config, caching, or data fetching - search the local docs before using remembered APIs.

Do not assume common Next.js APIs or file conventions are current for this repo.
