# Original User Request

## 2026-09-03T08:31:24Z

Deploy a full team of agents to comprehensively elevate Framer Motion across the entire Zhane Grey AI Engineering Mainframe and Build Doctor application suite. Transform the application with a cinematic and expressive technical aesthetic featuring bold staggered entrances, 3D card tilt dynamics, holographic scanline morphs, glowing trail effects, fluid modal and drawer choreographies, and rock-solid reduced-motion fallbacks without compromising performance or React Server Component boundaries.

Working directory: c:/Users/Zhane/Documents/antigravity/resilient-bose
Integrity mode: development

## Requirements

### R1. Cinematic Entrance & Section Choreography
Implement expressive, staggered entrance and reveal choreography across all top-level mainframe sections and child cards (`HeroMainframe`, `StatsRibbon`, `FeaturedProofGrid`, `RalphplanWorkflowMap`, `ProjectDirectory`, `EmployerSignalPanel`, `EvidenceLedger`). Replace basic flat reveals with multi-layered spring physics, staggered item reveal cascades, and viewport-triggered holographic accents.

### R2. Interactive Micro-Interactions, 3D Tilts & Glowing Trails
Upgrade interactive surfaces (proof cards, project filters, metric badges, command triggers, buttons, and diagnosis chips) with tactile micro-interactions: responsive 3D tilt tracking or spring-based cursor engagement, fluid hover states with glowing neon borders/trails, and animated scanline/pulse states on active or focused elements.

### R3. Fluid Modals, Drawers & Application State Transitions
Integrate fluid motion choreography into application workflows and overlays:
- `TrackerEvidenceDrawer`: Smooth slide, backdrop blur dissipation, and staggered evidence log entry appearance using `AnimatePresence`.
- `CommandPalette`: Cinematic spring expansion, search query highlight morphing, and selection navigation animations.
- `BuildDoctorApp` & `DiagnosisPanel`: Animated pipeline state changes, diagnostic progress scan lines, fluid solution card accordion reveals, and patch review tab switches.

### R4. Accessibility, RSC Boundary Compliance & Verification
Ensure all animated components strictly honor `prefers-reduced-motion: reduce` by cleanly rendering static, instant layouts with zero disorienting movement. Preserve React Server Component boundaries, avoid hydration mismatches, ensure zero cumulative layout shift (CLS), and verify that all automated test suites and TypeScript checks pass cleanly.

## Acceptance Criteria

### Visual & Interactive Motion Quality
- [ ] Mainframe hero, stats ribbon, and proof sections execute coordinated, staggered entrance choreography on scroll/view.
- [ ] Actionable cards across `FeaturedProofGrid` and `ProjectDirectory` feature spring hover feedback, glowing border/pulse accents, or 3D cursor-aware tilt dynamics.
- [ ] `TrackerEvidenceDrawer` and `CommandPalette` enter and exit cleanly using `AnimatePresence` with calibrated ease curves and zero layout jumping.
- [ ] Build Doctor diagnostic steps and solution cards transition smoothly between analysis, diagnosis, and fix plan states.

### Quality, Accessibility & Stability
- [ ] Toggling reduced motion (`useReducedMotion` or `prefers-reduced-motion`) instantly disables intense transitions and 3D tilts across all updated components without breaking layouts.
- [ ] Next.js client component directives (`"use client"`) are properly scoped to interactive leaf nodes, maintaining RSC performance.
- [ ] `npm test` executes with 100% of tests passing.
- [ ] `npm run typecheck` passes with 0 TypeScript diagnostics.
