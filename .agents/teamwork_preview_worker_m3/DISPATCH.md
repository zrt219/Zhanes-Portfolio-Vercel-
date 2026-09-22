## 2026-09-03T09:14:14Z

You are Worker M3 (Milestone 3 Implementation Worker: Fluid Modals, Drawers & Application State Transitions).

Working Directory:
c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_worker_m3

MANDATORY FIRST STEP - YOU MUST READ:
1. c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\ORIGINAL_REQUEST.md
2. c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\PROJECT.md
3. c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_explorer_survey_3\survey_apps_and_infra.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SCOPE OF WORK — MILESTONE M3:
Elevate application modals, drawers, and state transition workflows (Requirements R3 & R4):

1. Feature F7: Fluid Modals & Drawers with AnimatePresence
   - `src/components/portfolio/TrackerEvidenceDrawer.tsx`:
     - Wrap the modal in `<AnimatePresence>` so closing the drawer triggers a fluid exit animation rather than abruptly vanishing.
     - Backdrop: fade & blur dissipation (`initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`).
     - Panel: slide in from right (`initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}`) using `SPRING_PRESETS.cinematic`.
     - Staggered entrance for the list of evidence sources inside the drawer (`staggerChildren: 0.05`).
     - Accessibility: Add keyboard listener for `Escape` to call `onClose()`.
     - Invariants: Preserve `role="dialog"`, `aria-modal="true"`, `aria-labelledby="tracker-evidence-title"`. Ensure element unmounts when closed (`AnimatePresence` exits) so Playwright check `expect(drawer).toHaveCount(0)` passes.
   - `src/components/portfolio/CommandPalette.tsx`:
     - Wrap dialog in `<AnimatePresence>`.
     - Backdrop: smooth fade in/out.
     - Modal panel: cinematic spring expansion (`initial={{ opacity: 0, scale: 0.95, y: -16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -16 }}`).
     - Selection navigation highlight: smooth sliding pill or border indicator (`layoutId="activeCommandItem"`) on active/hovered command item.

2. Feature F8: Build Doctor Pipeline Transitions & Scanlines
   - `src/components/BuildDoctorApp.tsx`:
     - Smooth transitions between application workflow states (empty state -> diagnostic execution -> results rendered) using Framer Motion (`AnimatePresence mode="wait"` or motion wrappers).
     - Diagnostic scanline effect during active diagnosis execution.
     - Smooth scroll or reveal into Step 3 & Step 4.
   - `src/components/DiagnosisPanel.tsx`:
     - Scanline pulse on root cause assessment chip.
     - Coordinated state reveal when diagnosis completes.

3. Feature F9: Solution Accordions & Patch Review Tabs
   - `src/components/SuggestedSolutionsPanel.tsx`:
     - Fluid accordion expand/collapse reveals for solution card details and command sections using Framer Motion `<AnimatePresence>` and `motion.div` with height animation (`initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}`).
   - `src/components/AiPatchReviewPanel.tsx` & `PatchDraftPanel.tsx`:
     - Fluid animated tab switching for patch review tabs (e.g. DeepSeek review vs Fallback view) with sliding `layoutId="activePatchTab"` indicator.
     - Smooth reveal of code snippets and verification commands.

4. Testing & Verification:
   - Add unit tests for overlay variants, Escape key handling, and drawer/modal transitions in `src/test/overlays.test.ts`.
   - Run `npm run typecheck` and ensure 0 TypeScript diagnostics.
   - Run `npm test` and ensure 100% of tests pass.
   - Run `npx playwright test e2e/build-doctor.spec.ts` and ensure all 21 E2E tests pass.
   - Run `npm run build` and ensure Next.js production build succeeds with 0 errors.

DELIVERABLES:
1. Implement the code across the specified files.
2. Run `npm run typecheck`, `npm test`, `npx playwright test e2e/build-doctor.spec.ts`, and `npm run build`.
3. Write `handoff.md` in `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_worker_m3\handoff.md` with:
   - Observation: files modified, architectures implemented
   - Logic Chain: AnimatePresence semantics, exit physics, accessibility roles
   - Verification Method & Output: exact commands executed and stdout proving 100% tests pass and 0 typecheck errors
   - Conclusion & Status: DONE
4. Send completion message back to parent orchestrator.
