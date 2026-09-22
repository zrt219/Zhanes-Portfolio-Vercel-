# BRIEFING — 2026-09-03T08:38:39Z

## Mission
Design the concrete implementation blueprint for Feature F2: Mainframe Hero & Stats Choreography (`HeroMainframe.tsx` and `StatsRibbon.tsx`).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_explorer_m1_2
- Original parent: aa33b717-979f-4831-833f-d7f67b78a29e
- Milestone: Milestone 1 (Feature F2)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement source code
- Design concrete implementation blueprints with exact before/after snippets, variants, physics, and line numbers
- Preserve all existing DOM structure, test IDs, accessibility roles, and styling
- Strictly honor reduced-motion fallbacks (`opacity: 1`, no translate/scale)
- Preserve React Server Component boundaries and ensure zero layout shift (CLS)

## Current Parent
- Conversation ID: aa33b717-979f-4831-833f-d7f67b78a29e
- Updated: not yet

## Investigation State
- **Explored paths**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `teamwork_preview_explorer_survey_1/survey_mainframe_sections.md`
- **Key findings**: `HeroMainframe` has zero framer-motion code, renders as an RSC, needs `"use client"` and staggered entrance cascade. `StatsRibbon` is currently wrapped by `MotionSection` but all cards reveal simultaneously with flat linear transition.
- **Unexplored areas**: Direct examination of `HeroMainframe.tsx`, `StatsRibbon.tsx`, `HolographicProofPanel.tsx`, existing tests, and data models.

## Key Decisions Made
- Initializing investigation of source files and test suites.

## Artifact Index
- `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_explorer_m1_2\design_hero_stats.md` — Feature F2 implementation blueprint
- `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_explorer_m1_2\handoff.md` — 5-component handoff report
