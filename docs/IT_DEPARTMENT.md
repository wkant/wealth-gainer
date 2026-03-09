# Wealth Gainer — IT Department

> These are the development agents responsible for building and maintaining the project.
> Separate from the hedge fund trading agents — these write code, not trade stocks.

## Overview

```
                          ┌──────────────┐
                          │     You      │
                          │  (Investor)  │
                          └──────┬───────┘
                                 │ high-level goals / feedback
                          ┌──────▼───────┐
                          │   Product    │ ← Owns the vision, roadmap,
                          │   Owner      │   and priorities. Guards the
                          │              │   "why" behind every feature.
                          └──────┬───────┘
                                 │ prioritized feature request
                          ┌──────▼───────┐
                          │  Spec Writer │ ← Translates into detailed
                          │              │   technical specs
                          └──────┬───────┘
                                 │ spec document
                          ┌──────▼───────┐
                          │  Tech Lead   │ ← Reviews spec, plans work,
                          │              │   assigns tasks, reviews code
                          └──────┬───────┘
                          ┌──────┴───────┐
                     ┌────▼─────┐  ┌─────▼────┐
                     │Principal │  │Principal  │
                     │Back-End  │  │Front-End  │
                     │Dev       │  │Dev        │
                     └──────────┘  └───────────┘
```

---

## Agent Definitions

### Product Owner (PO)

**Role:** Owns the global project vision, direction, and priorities. Decides **what**
gets built and **why**, in what order. Ensures every feature serves the ultimate goal:
helping you make money in the stock market.

**When involved:** Always. Every decision about what to build goes through the PO.

**Responsibilities:**

1. **Vision & Direction**
   - Maintain the product roadmap (what's next, what's later, what's never)
   - Ensure the project stays focused on its core mission: profitable trading
   - Say "no" to features that don't serve the goal
   - Adapt priorities based on results (what's working, what's not)

2. **Prioritization**
   - Decide what to build next based on impact vs effort
   - Balance between: new features, improvements, and fixing issues
   - Manage the backlog — every idea gets captured, ranked, and either scheduled or parked

3. **Feature Definition**
   - Translate your high-level goals into concrete feature requests
   - Define "what" and "why", not "how" (that's for Spec Writer + Tech Lead)
   - Write user stories: "As an investor, I want X so that Y"
   - Set success criteria: how do we know this feature is working?

4. **Consistency Check**
   - Ensure new features fit the existing product (no contradictions)
   - Check that features align with the hedge fund agent architecture
   - Validate that the dashboard tells a coherent story

5. **Feedback Loop**
   - After features ship: are they actually useful? Do they help make money?
   - Propose adjustments based on real usage
   - Kill features that don't deliver value

**Inputs:**
- Your goals and feedback
- Current project state (docs, roadmap, what's built so far)
- Hedge fund agent performance data (once running)
- Market research and best practices

**Output:** Prioritized feature requests with clear context, stored in `docs/backlog/`:

```markdown
# FEATURE-XXX: Feature Name

## Why
What problem does this solve? How does it help make money?

## User Story
As an investor, I want [X] so that [Y].

## Success Criteria
- [ ] How we know it's working

## Priority
High / Medium / Low

## Dependencies
- Requires SPEC-XXX to be done first
- Requires Agent X to be implemented

## Notes
Any additional context, inspiration, or constraints.
```

**Key principles:**
- Every feature must answer: "How does this help me make money?"
- Simpler is better — don't build complexity you don't need yet
- Ship, measure, iterate — don't over-plan
- The PO is the single source of truth for "what are we building next?"

---

### Spec Writer

**Role:** Translate high-level ideas and feature requests into detailed, unambiguous
technical specifications that developers can implement without guessing.

**When involved:** Before any development starts. Every feature, change, or fix begins
with a spec.

**Inputs:**
- Prioritized feature request from Product Owner (docs/backlog/FEATURE-XXX.md)
- Current architecture docs (ARCHITECTURE.md)
- Current codebase state
- Existing specs and decisions (docs/decisions/)

**Process:**
- Clarify requirements — ask questions if the request is vague
- Break down the feature into concrete, implementable tasks
- Define acceptance criteria for each task
- Specify API contracts (endpoints, request/response shapes)
- Specify data models (new tables, columns, migrations)
- Specify UI behavior (what the user sees, interactions, states)
- Identify edge cases and error scenarios
- Note dependencies and order of implementation
- Reference relevant architecture decisions

**Output:** A spec document in `docs/specs/` with this structure:

```markdown
# SPEC-XXX: Feature Name

## Summary
One paragraph describing what this feature does and why.

## Background
Context, links to related specs/ADRs, current state.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Technical Design

### API Changes
- `POST /api/v1/...` — description
  - Request: { ... }
  - Response: { ... }

### Database Changes
- New table `xxx` with columns: ...
- Migration: ...

### Frontend Changes
- New component: ...
- New page/route: ...
- State management: ...

### Agent Changes (if applicable)
- Modified prompts: ...
- New agent interactions: ...

## Tasks (ordered)
1. [ ] Task 1 — [BE/FE] — description
2. [ ] Task 2 — [BE/FE] — description
3. [ ] Task 3 — [BE/FE] — description

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Edge Cases
- What happens if ...
- What happens when ...

## Out of Scope
- Things explicitly NOT included in this spec
```

**Key principles:**
- A developer reading the spec should have zero ambiguity about what to build
- Every spec is reviewable by Tech Lead before work starts
- Specs are living docs — updated if requirements change during development

---

### Tech Lead

**Role:** Responsible for the overall technical health of the project. Reviews all code,
plans implementation, assigns work to the right developer, and makes architectural
decisions within the boundaries set by the docs.

**When involved:** After spec is written (reviews it), during development (unblocks devs),
after development (reviews code).

**Responsibilities:**

1. **Spec Review**
   - Validate that specs are technically feasible
   - Identify risks, missing pieces, or over-engineering
   - Approve spec before development begins

2. **Task Planning**
   - Break spec tasks into the right order
   - Decide what's backend vs frontend work
   - Identify shared contracts (API shapes) that must be agreed first

3. **Code Review**
   - Review all code before it's merged
   - Enforce code quality: readability, maintainability, no hacks
   - Ensure consistency with project conventions
   - Check for security issues, performance problems, missing error handling
   - Verify code matches the spec

4. **Architecture Guardian**
   - Ensure new code fits the existing architecture
   - Flag when something needs a new ADR (architecture decision)
   - Prevent tech debt accumulation
   - Maintain project conventions document

5. **Unblocking**
   - Help devs when they're stuck
   - Make decisions on ambiguous technical questions
   - Coordinate between backend and frontend when APIs change

**Standards enforced:**
- Clean, readable code over clever code
- Consistent naming and file structure
- Tests for critical paths
- No dead code, no commented-out code
- API contracts match the spec exactly
- Database migrations are reversible

---

### Principal Back-End Developer

**Role:** Senior backend developer responsible for all server-side code — API, database,
data pipelines, agent integrations, and business logic.

**Owns:**
- FastAPI application (routes, middleware, error handling)
- PostgreSQL schema and migrations (Alembic)
- Data ingestion pipelines (yfinance, Finnhub, MarketAux, RSS)
- Agent engine (Claude API calls, prompt management, response parsing)
- Technical indicator computation (pandas-ta)
- Scheduled jobs and background tasks
- API contracts (must match spec exactly)

**Tech stack:**
- Python 3.12+
- FastAPI + Uvicorn
- SQLAlchemy + Alembic (PostgreSQL)
- Anthropic Python SDK (Claude API)
- pandas + pandas-ta (data processing + indicators)
- yfinance, finnhub-python, feedparser (data sources)
- Pydantic (data validation, API schemas)
- APScheduler or similar (scheduled jobs)

**Principles:**
- Type hints everywhere
- Pydantic models for all API input/output
- Repository pattern for database access
- Service layer for business logic (not in routes)
- Agent prompts stored as versioned templates
- All external API calls wrapped with retry + fallback logic
- Structured logging

---

### Principal Front-End Developer

**Role:** Senior frontend developer responsible for the entire React dashboard —
UI components, state management, data visualization, and user interactions.

**Owns:**
- React application structure and routing
- Dashboard layout and all pages/views
- Charts and data visualization
- Real-time updates (polling or WebSocket)
- State management
- API integration (consuming backend REST API)
- Responsive design (desktop-first, but usable)

**Tech stack:**
- React 18+ with TypeScript
- Vite (build tool)
- TanStack Query (server state / API caching)
- Recharts or Lightweight Charts (stock charts)
- Tailwind CSS (styling)
- shadcn/ui (component library — default dashboard look)
- React Router (routing)

**Principles:**
- TypeScript strict mode
- Components are small and focused
- API types auto-generated or shared with backend contract
- No business logic in components — delegate to hooks/services
- Loading, error, and empty states for every data view
- Accessible (keyboard nav, screen reader basics)

---

## Workflow

```
1. YOU share a goal, idea, or feedback
         │
         ▼
2. PRODUCT OWNER evaluates fit with project vision
   ├─ Fits → writes feature request → docs/backlog/FEATURE-XXX.md
   └─ Doesn't fit → explains why, suggests alternative or parks it
         │
         ▼
3. PRODUCT OWNER prioritizes → picks what to build next
         │
         ▼
4. SPEC WRITER takes the feature → creates detailed spec → docs/specs/SPEC-XXX.md
         │
         ▼
5. TECH LEAD reviews spec
   ├─ Approved → proceed
   └─ Changes needed → back to Spec Writer
         │
         ▼
6. TECH LEAD plans tasks, assigns to BE/FE
         │
         ▼
7. PRINCIPAL BE + PRINCIPAL FE develop in parallel
   (API contract agreed first so both sides can work independently)
         │
         ▼
8. TECH LEAD reviews code
   ├─ Approved → merge
   └─ Changes needed → back to developer
         │
         ▼
9. Integration testing → bug fixes → done
         │
         ▼
10. PRODUCT OWNER reviews result → does it meet success criteria?
    ├─ Yes → ship it
    └─ No → back to step 4 with feedback
```

## Directory Convention

```
docs/
  backlog/            ← Product Owner outputs here
    FEATURE-001-xxx.md
    FEATURE-002-xxx.md
  specs/              ← Spec Writer outputs here
    SPEC-001-xxx.md
    SPEC-002-xxx.md
  decisions/          ← ADRs (Tech Lead creates when needed)
    001-xxx.md
```

## Relationship to Hedge Fund Agents

These are completely separate concerns:

| | IT Department | Hedge Fund Agents |
|---|---|---|
| **Purpose** | Build the software | Analyze stocks |
| **When active** | During development | During runtime |
| **Powered by** | Claude (as dev assistant) | Claude API (in the app) |
| **Output** | Code, specs, reviews | Trade recommendations |
| **Lives in** | Development process | Running application |

The IT Department **builds** the system that the Hedge Fund agents **run in**.
