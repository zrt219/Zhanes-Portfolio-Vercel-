## 2026-09-03T09:37:12Z

You are Worker M4 (Milestone 4 Implementation Worker: Accessibility, Reduced-Motion & Verification Hardening).

Working Directory:
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_worker_m4

MANDATORY FIRST STEP - YOU MUST READ:
1. c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\ORIGINAL_REQUEST.md
2. c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\PROJECT.md
3. c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\TEST_INFRA.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SCOPE OF WORK — MILESTONE M4:
Universal Accessibility, Reduced-Motion Hardening, and Final Verification (Requirement R4 & Feature F10):

1. Author Dedicated Reduced-Motion Test Suite (`src/test/reduced-motion.test.ts`):
   - Test that `useSafeReducedMotion()` handles SSR safely and attaches client listeners properly.
   - Test that `getReducedMotionVariants()` neutralizes transform properties (`x`, `y`, `scale`, `rotate`, `rotateX`, `rotateY`) and collapses transition durations.
   - Test that `TiltCard` renders static non-3D elements with zero rotation and zero glare opacity when reduced motion is preferred.
   - Test that `NeonBorderGlow` suppresses pulsing glowing auras under reduced motion.
   - Test that `SpringButton` renders static `<button>` elements without hover/tap scales under reduced motion.
   - Test that `TrackerEvidenceDrawer` and `CommandPalette` disable positional sliding/scaling transitions under reduced motion while maintaining opacity fades and proper unmount lifecycles.

2. Verify RSC Boundaries & Zero Layout Shift (CLS):
   - Confirm that `src/app/page.tsx`, `src/components/SuiteHub.tsx`, `src/app/projects/[slug]/page.tsx`, and other server components do NOT declare `"use client"`.
   - Confirm that all motion components use transform/opacity animations rather than layout dimension mutations (`height`, `width` during normal layout, `margin`), guaranteeing zero unexpected Cumulative Layout Shift (CLS).

3. Publish `TEST_READY.md`:
   - Create `c:\Users\Zhane\Documents\antigravity\resilient-bose\TEST_READY.md` documenting:
     - Test runner invocation commands (`npm test`, `npm run typecheck`, `npx playwright test e2e/build-doctor.spec.ts`, `npm run audit:45k`, `npm run build`).
     - Complete test matrix covering Tiers 1-4.
     - Coverage metrics across all features F1-F10.

4. Run Full Verification:
   - `npm run typecheck` (must exit with code 0, 0 diagnostics).
   - `npm test` (must pass 100% of unit tests).
   - `npx playwright test e2e/build-doctor.spec.ts` (must pass all 21 tests).
   - `npm run build` (Next.js Turbopack build must succeed with 17/17 static pages).
   - `npm run audit:45k` (must pass 45,000 deterministic checks).

DELIVERABLES:
1. Author `src/test/reduced-motion.test.ts`.
2. Create `c:\Users\Zhane\Documents\antigravity\resilient-bose\TEST_READY.md`.
3. Run all verification commands.
4. Write `handoff.md` in `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_worker_m4\handoff.md`.
5. Send completion message back to parent orchestrator.
