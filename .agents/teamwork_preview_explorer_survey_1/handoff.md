# Handoff Report: Mainframe Top-Level Sections & Entry Choreography

**Agent Role**: Codebase Explorer 1 (Mainframe Top-Level Sections & Entry Choreography)  
**Date**: 2026-09-03  
**Deliverable Path**: `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_explorer_survey_1\survey_mainframe_sections.md`  

---

## 1. Observation

1. **Framer Motion Dependency**:
   - `package.json` line 20:
     ```json
     "framer-motion": "^12.40.0",
     ```
   - React version in `package.json` line 23: `"react": "^19.0.0"`.
   - Next.js version in `package.json` line 22: `"next": "^16.2.6"`.
2. **Single Existing Usage of Framer Motion**:
   - Running `grep_search` across `src/` for `"framer-motion"` returned exactly one file:
     `src/components/portfolio/MotionSection.tsx:3`:
     ```tsx
     import { motion, useReducedMotion } from "framer-motion";
     ```
   - No other component in the repository imports or utilizes Framer Motion.
3. **Existing MotionSection Implementation**:
   - `src/components/portfolio/MotionSection.tsx` lines 11-25:
     ```tsx
     export function MotionSection({ children, className }: MotionSectionProps) {
       const reduceMotion = useReducedMotion();

       return (
         <motion.div
           className={className}
           initial={reduceMotion ? false : { opacity: 0, y: 18 }}
           whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
           viewport={{ once: true, amount: 0.16 }}
           transition={{ duration: 0.42, ease: "easeOut" }}
         >
           {children}
         </motion.div>
       );
     }
     ```
4. **HeroMainframe Completely Static**:
   - In `src/components/SuiteHub.tsx` line 20:
     ```tsx
     <HeroMainframe />
     ```
     `HeroMainframe` is rendered outside `MotionSection` and is a Server Component with zero animation code. It renders immediately upon initial page load without entrance coordination.
5. **Mainframe Sections Lack Staggered Variants**:
   - `StatsRibbon` (`src/components/portfolio/StatsRibbon.tsx`): 8 stat cards render simultaneously as a single block inside `MotionSection`.
   - `FeaturedProofGrid` (`src/components/portfolio/FeaturedProofGrid.tsx`): 3-column project grid with signature project reveals all at once with flat fade.
   - `RalphplanWorkflowMap` (`src/components/portfolio/RalphplanWorkflowMap.tsx`): 8 workflow steps (01-08) and 3 subagent lanes render statically without directional flow.
   - `ProjectDirectory` (`src/components/portfolio/ProjectDirectory.tsx`): Has `"use client"` and state (`useState`), but changes to search/filter immediately mount/unmount DOM nodes without `AnimatePresence` or layout transitions.
   - `EmployerSignalPanel` (`src/components/portfolio/EmployerSignalPanel.tsx`): Split grid (editorial left, 6 capability cards right) reveals as a single coarse box.
   - `EvidenceLedger` (`src/components/portfolio/EvidenceLedger.tsx`): 4 primary evidence rows and 4 suite app cards reveal simultaneously.
6. **Holographic Visuals**:
   - `HolographicProofPanel` (`src/components/portfolio/HolographicProofPanel.tsx`): Central gyro has static CSS rings (`.holo-ring`), but lacks entrance spin-up/scaling or scanline sweeps.
7. **Test Suite Baseline**:
   - Running `npm test`:
     ```
     ✓ src/test/portfolio-data-integrity.test.ts (4 tests)
     ✓ src/test/build-doctor.test.ts (28 tests)
     Test Files  2 passed (2) | Tests  32 passed (32)
     ```
   - Running `npm run typecheck`: Exited with code 0 (0 errors).

---

## 2. Logic Chain

1. **From Observation 2 & 3**: Because `MotionSection.tsx` only applies inline `initial` and `whileInView` styles to a single outer `motion.div` wrapper without passing Framer Motion `variants` down the tree, nested elements cannot inherit variant states. Consequently, `staggerChildren` and `delayChildren` are impossible in the current setup.
2. **From Observation 4 & 5**: The visual experience across the entire mainframe is currently flat. The user perceives either instant pops (`HeroMainframe`) or monolithic block fades (`StatsRibbon`, `FeaturedProofGrid`, `EmployerSignalPanel`). This violates the goal of Requirement R1 to provide expressive, staggered choreography with multi-layered spring physics.
3. **From Observation 1, 4, & 5**: Framer Motion v12 is fully installed and supports rich spring transitions, `staggerChildren`, `useReducedMotion`, and layout animations. Since the mainframe section components (`StatsRibbon`, `FeaturedProofGrid`, etc.) only consume static bundled TypeScript datasets and do not perform server-only async data fetches, converting these section presentation components into `"use client"` components preserves RSC boundaries (`SuiteHub.tsx` and `page.tsx` remain server components) while unlocking deep variant inheritance.
4. **From Observation 3 & 7**: Ensuring `useReducedMotion` falls back cleanly to `{ opacity: 1, y: 0, scale: 1 }` with zero transform offsets ensures that Playwright E2E tests, Vitest test suites, and users requesting reduced motion experience zero layout shift (CLS = 0) and zero accessibility regressions.

---

## 3. Caveats

1. **Sub-components under Explorer 2 and Explorer 3 Scopes**:
   - Deep 3D tilt interactions and hover cursor tracking for individual cards belong to Requirement R2 (Explorer 2's focus).
   - Modal/drawer choreography (`TrackerEvidenceDrawer`, `CommandPalette`) and Build Doctor diagnostics belong to Requirement R3 (Explorer 3's focus).
   - This survey focused strictly on top-level section choreography, entrance cascade, and variant architecture for Requirement R1, while establishing a foundation compatible with R2 and R3.
2. **Playwright E2E Animation Timing**:
   - Playwright tests in `e2e/build-doctor.spec.ts` test page headings and interactive elements. Transition durations must stay brisk (under 0.6s) to ensure fast rendering during automated test runs.

---

## 4. Conclusion

The mainframe top-level sections require a coordinated architectural upgrade to fulfill Requirement R1:
1. Establish a centralized **`motionTokens.ts`** defining calibrated springs (`springs.brisk`, `springs.gentle`), staggers, and base variants (`sectionContainerVariants`, `fadeUpItemVariants`, `cardSpringVariants`).
2. Upgrade **`HeroMainframe` & `HolographicProofPanel`** to client components with an entrance sequence: headline fade-up, CTA stagger, pipeline ribbon cascade, and holographic gyro scale/rotation stabilization.
3. Upgrade **`StatsRibbon`**, **`FeaturedProofGrid`**, **`RalphplanWorkflowMap`**, **`EmployerSignalPanel`**, and **`EvidenceLedger`** to leverage `whileInView` with viewport threshold `0.15` and staggered card cascades.
4. Enhance **`ProjectDirectory`** with `layoutId` on filter tabs and `AnimatePresence mode="popLayout"` on project items.
5. Guarantee accessibility by integrating `useReducedMotion` across all variants and wrapping the application in `<MotionConfig reducedMotion="user">`.

---

## 5. Verification Method

1. **Inspect Survey Report**:
   - Read `c:\Users\Zhane\Documents\antigravity\resilient-bose\.agents\teamwork_preview_explorer_survey_1\survey_mainframe_sections.md`.
2. **Verify Baseline Test & Typecheck Pass**:
   - Run command: `npm test` (Expect: 32 tests passing across 2 test files).
   - Run command: `npm run typecheck` (Expect: 0 TypeScript diagnostics).
3. **Invalidation Conditions**:
   - Any proposed change that causes `npm test` or `npm run typecheck` to fail.
   - Any animation that alters component text, breaks layout geometry, introduces horizontal overflow, or fails to render under `prefers-reduced-motion: reduce`.
