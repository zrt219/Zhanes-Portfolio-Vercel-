# Test Writer 1 Task Assignment

## Identity
- Role: E2E Testing Track Test Writer
- Working Directory: c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_test_writer_1
- Parent Conversation ID: aa33b717-979f-4831-833f-d7f67b78a29e

## Mandatory Reading
Read the original user request before starting work:
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\ORIGINAL_REQUEST.md
Also read the test infrastructure document:
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\TEST_INFRA.md
And project specification:
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\PROJECT.md

## Scope & Objectives
Design and implement the automated test suite for Framer Motion elevation across the project:
1. Examine existing tests (`tests/` directory, vitest setup in `vitest.config.ts` or `package.json`).
2. Implement comprehensive motion test files:
   - `tests/motion/motion-engine.test.ts`: Unit tests for `src/lib/motion.ts` (spring configurations, stagger presets, variant generators, reduced motion safety).
   - `tests/motion/reduced-motion.test.ts`: Unit & component tests verifying that reduced-motion mode properly disables motion and transitions instantly with zero layout shifts.
   - `tests/motion/components-motion.test.ts`: Verification of `TiltCard`, `SpringButton`, `NeonBorderGlow`, `TrackerEvidenceDrawer`, and `CommandPalette` rendering, accessibility attributes, and keyboard listeners (e.g. Escape key).
3. Ensure zero regression: all existing 32 tests must pass, and new tests must pass 100%.
4. Run `npm test` and `npm run typecheck` to verify complete pass.
5. Create `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\TEST_READY.md` summarizing coverage and test results.

## Deliverables
- Test source files in `tests/motion/`
- Test report and `handoff.md` in your working directory
- Create `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\TEST_READY.md`
- Send completion message to parent.

## 2026-09-03T08:38:39Z
You are Test Writer 1 on the E2E Testing Track for Framer Motion Elevation.
Your working directory is: c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_test_writer_1

MANDATORY FIRST STEP:
Read the original user request before starting work:
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\ORIGINAL_REQUEST.md
Also read:
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\TEST_INFRA.md
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\PROJECT.md
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_test_writer_1\DISPATCH.md

MISSION:
1. Review the existing test setup (Vitest in package.json/vitest.config.ts).
2. Author comprehensive automated test suites under `tests/motion/`:
   - `tests/motion/motion-engine.test.ts`: test spring physics configs, stagger presets, `getReducedMotionVariants`, safe reduced motion hook.
   - `tests/motion/reduced-motion.test.ts`: test that reduced motion mode collapses all motion variants to static instant layout with zero movement.
   - `tests/motion/components-motion.test.ts`: component tests verifying motion props, accessibility attributes, Escape key handlers on modals/drawers, and zero CLS guarantees.
3. Run `npm test` and `npm run typecheck` to verify that all existing 32 tests pass AND the new motion tests pass cleanly with 0 TypeScript errors.
4. When all tests pass, create `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\TEST_READY.md`.
5. Write your handoff report in your working directory and notify the parent via send_message.

