# Project: Framer Motion Elevation Suite

## Architecture
- **Framework & Core**: Next.js 16.2.6 (App Router), React 19, Framer Motion v12.40.0, Tailwind CSS.
- **RSC Architecture**: Page components (`src/app/page.tsx`, `src/app/suite/page.tsx`) and high-level hubs (`SuiteHub.tsx`) remain React Server Components. Interactive sections and motion leaf nodes are designated `"use client"`.
- **Shared Motion Engine**: Centralized in `src/lib/motion.ts`, providing spring presets (`snappySpring`, `cinematicSpring`, `softSpring`), stagger sequences, reduced-motion fallbacks, and motion configuration.
- **Micro-Interaction Subsystem**: Reusable 3D tilt tracking (`use3DTilt.ts`, `TiltCard.tsx`), neon glow borders (`NeonBorderGlow.tsx`), tactile spring buttons (`SpringButton.tsx`), and scanline pulse accents. Overlays strictly enforce `pointer-events: none`.
- **Overlays & Application State**: Modals and drawers (`TrackerEvidenceDrawer.tsx`, `CommandPalette.tsx`) governed by `<AnimatePresence>` for exit/entrance physics. `BuildDoctorApp.tsx` and `DiagnosisPanel.tsx` morph state smoothly between idle, analyzing, diagnosed, and patch review.
- **Accessibility & Reduced Motion**: Universal integration with `prefers-reduced-motion: reduce` and `useReducedMotion()`. Motion components fall back to instant transitions and zero 3D tilt while maintaining zero Cumulative Layout Shift (CLS).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Motion Engine & Core Presets | Centralized `src/lib/motion.ts` with spring physics, stagger timings, reduced-motion fallbacks, and `<MotionConfig>` | M1 | Survey 1, 2, 3 |
| F2 | Mainframe Hero & Stats Choreography | Staggered entrance, holographic title glow, and telemetry metric cascades in `HeroMainframe.tsx` & `StatsRibbon.tsx` | M1 | Survey 1 |
| F3 | Proof & Workflow Section Cascades | Staggered card reveals in `FeaturedProofGrid.tsx`, step node choreography in `RalphplanWorkflowMap.tsx`, and pulse glow in `HolographicProofPanel.tsx` | M1 | Survey 1 |
| F4 | Directory & Ledger Section Reveals | Smooth filter list morphing in `ProjectDirectory.tsx`, signal card staggers in `EmployerSignalPanel.tsx`, and log entrance cascade in `EvidenceLedger.tsx` | M1 | Survey 1 |
| F5 | Tactile 3D Tilt Dynamics & Specular Glare | Reusable `use3DTilt` hook and `TiltCard` component with pitch/yaw tracking, dynamic glare reflection, and reduced-motion bypass | M2 | Survey 2 |
| F6 | Neon Glow Borders, Spring Buttons & Scanlines | Neon perimeter glow wrapper (`NeonBorderGlow.tsx`), tactile spring feedback (`SpringButton.tsx`), and pulse scanline indicators | M2 | Survey 2 |
| F7 | Fluid Modals & Drawers with AnimatePresence | Slide-over drawer with backdrop blur dissipation in `TrackerEvidenceDrawer.tsx`; spring expansion and query morphing in `CommandPalette.tsx` | M3 | Survey 3 |
| F8 | Build Doctor Diagnostic Pipeline Transitions | Animated state morphs between analysis, diagnosis, and fix plan in `BuildDoctorApp.tsx` & `DiagnosisPanel.tsx`, including scanlines & spring confidence bars | M3 | Survey 3 |
| F9 | Solution Accordions & Patch Review Morphing | Fluid accordion collapse/expand reveals in `SuggestedSolutionsPanel.tsx` and animated patch review tab switches | M3 | Survey 3 |
| F10 | Comprehensive Test Suite & Verification | Automated test suites for motion hooks, reduced motion toggles, RSC boundary compliance, zero CLS, and 100% test passing rate | M4 / Test Track | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| Test | E2E Testing Track | Design & implement motion test suites, reduced motion tests, and test runner harness; publish TEST_READY.md | none | IN_PROGRESS |
| M1 | Cinematic Entrance & Section Choreography | Features F1, F2, F3, F4: Motion engine core, Hero, Stats, Proof, Workflow, Directory, Signal, and Ledger section choreography | none | DONE |
| M2 | Interactive Micro-Interactions, 3D Tilts & Glowing Trails | Features F5, F6: Reusable 3D tilt dynamics, neon perimeter glow, tactile spring buttons, and telemetry scanline pulses across cards and badges | M1 | DONE |
| M3 | Fluid Modals, Drawers & Application State Transitions | Features F7, F8, F9: AnimatePresence integration for TrackerEvidenceDrawer & CommandPalette, BuildDoctorApp state morphs, scanline progress, and solution accordions | M1, M2 | DONE |
| M4 | Accessibility, Reduced-Motion & Final Hardening | Feature F10: 100% pass across vitest & e2e test suites, 0 TypeScript diagnostics, zero CLS, and adversarial coverage hardening | M1, M2, M3, Test | DONE |

## Interface Contracts
### `src/lib/motion.ts` ↔ Mainframe & Build Doctor Components
- **Exports**:
  - `SPRING_PRESETS`: `{ snappy, cinematic, soft, bounce }`
  - `STAGGER_PRESETS`: `{ container, fastContainer, item, fadeInScale }`
  - `getReducedMotionVariants(defaultVariants, isReducedMotion)`
  - `useSafeReducedMotion()`: hook returning boolean with hydration safety
  - `MotionRootConfig`: `<MotionConfig reducedMotion="user">` wrapper

### `use3DTilt.ts` & `TiltCard.tsx` ↔ Interactive Cards
- **Contract**:
  - `TiltCardProps`: `{ children, maxTilt?: number, glare?: boolean, className?: string, onClick?: () => void }`
  - `use3DTilt(ref, options)`: returns `{ x, y, rotateX, rotateY, glareOpacity, glareX, glareY, handleMouseMove, handleMouseEnter, handleMouseLeave }`
  - Invariant: `glare` layer has `pointer-events: none` and `overflow-hidden`.

### `TrackerEvidenceDrawer.tsx` & `CommandPalette.tsx` ↔ App Layout
- **Contract**:
  - Accepts `open: boolean`, `onClose: () => void`.
  - Wrapped internally in `<AnimatePresence mode="wait">` (or standard `AnimatePresence`).
  - Backdrop and panel animate synchronously.
  - Keyboard listener: `Escape` triggers `onClose`.

## Code Layout
- `src/lib/motion.ts` — Core animation configurations, variants, and spring presets
- `src/components/motion/` — Reusable motion primitives (`TiltCard.tsx`, `NeonBorderGlow.tsx`, `SpringButton.tsx`, `ScanlineOverlay.tsx`, `MotionConfigWrapper.tsx`)
- `src/components/portfolio/` — Mainframe top-level sections (`HeroMainframe.tsx`, `StatsRibbon.tsx`, `FeaturedProofGrid.tsx`, `RalphplanWorkflowMap.tsx`, `ProjectDirectory.tsx`, `EmployerSignalPanel.tsx`, `EvidenceLedger.tsx`, `MotionSection.tsx`, `TrackerEvidenceDrawer.tsx`, `CommandPalette.tsx`)
- `src/components/doctor/` — Build Doctor application components (`BuildDoctorApp.tsx`, `DiagnosisPanel.tsx`, `SuggestedSolutionsPanel.tsx`, `PatchDraftPanel.tsx`, `AiPatchReviewPanel.tsx`, `FixPlan.tsx`)
- `tests/` & `tests/motion/` — Unit and integration tests for motion primitives, accessibility, and reduced-motion states
- `e2e/` — End-to-end integration tests for Build Doctor, Command Palette, and Mainframe flows
