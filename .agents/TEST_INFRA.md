# E2E Test Infra: Framer Motion Elevation Suite

## Test Philosophy
- Opaque-box, requirement-driven, accessible motion validation.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinations + Reduced Motion Workload Testing.
- Zero regression on existing test suite: all 32 existing tests must pass 100%.
- Zero TypeScript diagnostics: `npm run typecheck` must pass with 0 errors.

## Feature Inventory & Test Matrix
| # | Feature | Requirement | Tier 1 (Unit/Feature) | Tier 2 (Boundaries) | Tier 3 (Interactions) | Tier 4 (E2E Scenarios) |
|---|---------|-------------|:---------------------:|:-------------------:|:---------------------:|:----------------------:|
| F1 | Motion Engine & Spring Presets | R1, R4 | ≥5 | ≥5 | ✓ | ✓ |
| F2 | Hero & Stats Choreography | R1 | ≥5 | ≥5 | ✓ | ✓ |
| F3 | Proof & Workflow Section Cascades | R1 | ≥5 | ≥5 | ✓ | ✓ |
| F4 | Directory & Ledger Section Reveals | R1 | ≥5 | ≥5 | ✓ | ✓ |
| F5 | 3D Tilt Dynamics & Cursor Glare | R2 | ≥5 | ≥5 | ✓ | ✓ |
| F6 | Neon Glow Borders & Spring Buttons | R2 | ≥5 | ≥5 | ✓ | ✓ |
| F7 | Fluid Modals & Drawers with AnimatePresence | R3 | ≥5 | ≥5 | ✓ | ✓ |
| F8 | Build Doctor Pipeline Transitions | R3 | ≥5 | ≥5 | ✓ | ✓ |
| F9 | Solution Accordions & Patch Tabs | R3 | ≥5 | ≥5 | ✓ | ✓ |
| F10 | Accessibility & Reduced Motion Hardening | R4 | ≥5 | ≥5 | ✓ | ✓ |

## Test Architecture
- **Unit & Integration Runner**: Vitest (`npm test`). Fast, in-memory, component & hook testing.
- **Type Checker**: TypeScript (`npm run typecheck`).
- **E2E Integration Runner**: Playwright (`npx playwright test`).
- **Test File Locations**:
  - `tests/motion/motion-engine.test.ts` — Tests for `src/lib/motion.ts`, spring configs, stagger helpers, and reduced motion fallback generators.
  - `tests/motion/reduced-motion.test.ts` — Tests verifying `useSafeReducedMotion()` and component variants under both normal and reduced-motion states.
  - `tests/motion/tilt-card.test.ts` — Tests for `use3DTilt`, `TiltCard`, mouse tracking calculations, boundary clamping, and glare layer attributes.
  - `tests/motion/overlays.test.ts` — Tests for `TrackerEvidenceDrawer` and `CommandPalette` enter/exit behavior, Escape key handling, and backdrop attributes.
  - `tests/motion/build-doctor-motion.test.ts` — Tests for Build Doctor accordion reveals, tab switching, and state transitions.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Target |
|---|----------|--------------------|--------|
| S1 | Mainframe Full Page Scroll & Stagger | F1, F2, F3, F4 | All sections mount and enter with smooth cascading variants |
| S2 | Proof Card 3D Interaction & Glare | F5, F6 | Mouse movement computes pitch/yaw without layout jumping or blocking click events |
| S3 | Evidence Drawer Slide & Dismiss | F7, F10 | Drawer slides out smoothly on trigger, closes on backdrop click and Escape |
| S4 | Command Palette Spring Morph | F7, F10 | Palette opens with spring scale/fade, arrow keys navigate items, closes cleanly |
| S5 | Build Doctor Diagnosis & Accordion Expansion | F8, F9 | User diagnoses log, solutions render with fluid accordion reveals, tabs switch cleanly |
| S6 | Universal Reduced Motion User Session | F1, F5, F7, F10 | Simulation with `prefers-reduced-motion: reduce` confirms instant zero-motion transitions and CLS = 0 |

## Publication Signal
When test suites are fully implemented and verified, the test track publishes `TEST_READY.md` to trigger final E2E gating.
