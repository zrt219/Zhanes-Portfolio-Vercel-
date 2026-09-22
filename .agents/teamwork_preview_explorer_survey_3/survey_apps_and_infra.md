# Architectural Survey Report: Modals, Drawers, Build Doctor & Verification Infrastructure

**Target Application**: Zhane Grey AI Engineering Mainframe & Vercel Build Doctor Suite  
**Scope**: Requirements R3 (Modals, Drawers & Application State Transitions) and R4 (Accessibility, RSC Boundaries & Verification Infrastructure)  
**Investigator**: Codebase Explorer 3  
**Date**: September 3, 2026  
**Status**: COMPLETE (Read-Only Architectural Investigation)

---

## 1. Executive Summary

A comprehensive architectural investigation was conducted across the modal, drawer, diagnostic pipeline, and verification systems of the Zhane Grey AI Engineering Mainframe and Vercel Build Doctor application. 

### Key Findings:
1. **Framer Motion Underutilization**: While `framer-motion` is installed at version `^12.40.0` alongside React 19 and Next.js 16, it is currently imported in **only a single file** across the entire project (`src/components/portfolio/MotionSection.tsx`).
2. **Missing Overlay Choreography (R3)**: Both `TrackerEvidenceDrawer` and `CommandPalette` currently render using abrupt conditional short-circuits (`if (!open) return null;` and `{open ? <div ... /> : null}`). Neither uses `AnimatePresence`, resulting in zero entry/exit sliding, zero backdrop blur dissipation, and jarring binary unmounting.
3. **Missing State Transitions & Accordions (R3)**: `BuildDoctorApp` abruptly swaps between placeholder dashed boxes and diagnostic sections without pipeline transition choreography. The 5 diagnostic cards in `DiagnosisPanel` are static, and the confidence progress bar is a static CSS width. Solution cards in `SuggestedSolutionsPanel` lack accordion expand/collapse reveals, and Step 4 lacks fluid patch review tab switching.
4. **Clean RSC Architecture with Minimal Leaks (R4)**: The Next.js App Router tree strictly segregates Server Components (`src/app/page.tsx`, `SuiteHub.tsx`, `TopCommandNav.tsx`, `src/app/projects/[slug]/page.tsx`) from Client Components. Server Components are passed as `children` to `<MotionSection>` client wrappers. However, `DiagnosisPanel.tsx` is currently missing `"use client"` and must declare it before adopting Framer Motion hooks.
5. **Reduced-Motion Gap (R4)**: `src/app/globals.css` contains a `@media (prefers-reduced-motion: reduce)` rule for CSS animations, but Framer Motion's JavaScript inline transforms (`scale`, `x`, `y`, spring physics) bypass CSS rules unless explicitly governed by `useReducedMotion()`.
6. **Robust Verification Infra & Critical E2E Invariants**: All 32 Vitest tests, 45,000 deterministic audit checks, and TypeScript checks (`tsc --noEmit`) pass with 0 errors. Playwright E2E tests (`e2e/build-doctor.spec.ts`) strictly assert accessibility roles (`dialog`, `heading`), specific text selectors, and unmount states (`await expect(drawer).toHaveCount(0)`). Any motion enhancement must preserve these exact semantic roles and lifecycle unmount invariants.

---

## 2. Requirement R3: Detailed Component Breakdown

### 2.1 TrackerEvidenceDrawer (`src/components/portfolio/TrackerEvidenceDrawer.tsx`)
- **Call Site**: Rendered at `src/components/portfolio/LiveWorkflowEventsTracker.tsx:310`:
  ```tsx
  <TrackerEvidenceDrawer sources={snapshot.evidenceSources} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
  ```
- **Current Implementation**:
  - Direct short-circuit at line 16: `if (!open) return null;`
  - Fixed backdrop: `<div className="fixed inset-0 z-[70] bg-black/70 px-4 py-6 backdrop-blur-sm" ...>`
  - Aside panel: `<aside role="dialog" aria-modal="true" aria-labelledby="tracker-evidence-title" className="ml-auto flex max-h-full w-full max-w-xl ...">`
  - Evidence list: `sources.map(...)` renders static `<article>` cards.
- **Identified Gaps**:
  - **No `AnimatePresence`**: When `open` flips to `false`, the component immediately returns `null`, causing the DOM element to vanish instantly with no exit transition.
  - **No Slide Animation**: The drawer does not slide in from `x: "100%"` to `x: 0` or slide out on close.
  - **No Backdrop Dissipation**: The backdrop blur and dark overlay pop in/out instantly.
  - **No Staggered Entrances**: Evidence source entries appear all at once rather than cascading smoothly.
  - **Accessibility Gap**: There is **no `Escape` key listener** inside `TrackerEvidenceDrawer`! (CommandPalette has one, but TrackerEvidenceDrawer does not).
- **Proposed Motion Architecture**:
  - Encapsulate `<AnimatePresence>` inside `TrackerEvidenceDrawer`:
    ```tsx
    <AnimatePresence>
      {open && (
        <motion.div
          key="drawer-backdrop"
          className="fixed inset-0 z-[70] bg-black/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.aside
            key="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tracker-evidence-title"
            initial={{ x: shouldReduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: shouldReduceMotion ? 0 : "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-lg border border-cyan/35 bg-[#07111f] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
          >
            {/* Header */}
            {/* Evidence items with stagger container variants */}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
    ```
  - Add `useEffect` listening for `Escape` to call `onClose()`.

---

### 2.2 CommandPalette (`src/components/portfolio/CommandPalette.tsx`)
- **Call Site**: Rendered in `src/components/portfolio/TopCommandNav.tsx:50`:
  ```tsx
  <CommandPalette />
  ```
- **Current Implementation**:
  - Controlled by internal state: `const [open, setOpen] = useState(false);`
  - Toggle triggers: Nav button and global shortcut `Ctrl+K` / `Cmd+K`.
  - Lines 116-165: `{open ? <div ref={dialogRef} ...> ... </div> : null}`
- **Identified Gaps**:
  - **No `AnimatePresence`**: Toggling `open` causes instantaneous mounting/unmounting.
  - **No Spring Scale Expansion**: The palette does not expand outward (e.g. `scale: 0.95, opacity: 0` -> `scale: 1, opacity: 1`).
  - **No Active Selection Highlight Morphing**: The actions list only uses static CSS `:hover` styling (`hover:border-cyan/35 hover:bg-cyan/10`). There is no animated selection pill or `layoutId` indicator.
  - **No Keyboard Arrow Navigation**: Users cannot navigate results using `ArrowUp` / `ArrowDown` keys or select with `Enter`. Only mouse clicking is supported.
  - **No Search Highlight Morphing**: As the user types, filtered items update without animated highlight feedback.
- **Proposed Motion Architecture**:
  - Wrap the overlay with `<AnimatePresence>`:
    ```tsx
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-[80] bg-obsidian/75 p-4 backdrop-blur-md"
        >
          <motion.div
            key="palette-dialog"
            initial={{ scale: shouldReduceMotion ? 1 : 0.94, opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: shouldReduceMotion ? 1 : 0.94, opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ type: "spring", damping: 26, stiffness: 350 }}
            className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-lg border border-cyan/35 bg-[#07111d] shadow-glow"
          >
            {/* Input Header */}
            {/* Action List with activeIndex keyboard support and layoutId="activePaletteItem" indicator */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    ```
  - Introduce `activeIndex` state with `ArrowDown`/`ArrowUp`/`Enter` handling.
  - Render an active background indicator `<motion.div layoutId="paletteActiveItem" className="absolute inset-0 rounded-md border border-cyan/40 bg-cyan/10" />`.

---

### 2.3 BuildDoctorApp (`src/components/BuildDoctorApp.tsx`)
- **Page Entry**: `src/app/build-doctor/page.tsx`
- **Current Implementation**:
  - Manages the entire 5-step diagnostic pipeline:
    - Step 1: `LogInput` & `SampleLogPicker`
    - Step 2: `DiagnosisPanel` (or dashed placeholder)
    - Step 3: `TraceTimeline` + `EvidenceTable` (or dashed placeholder)
    - Step 4: `PatchDraftPanel` + `SuggestedSolutionsPanel` + `AiPatchReviewPanel` + `FixPlan` (or dashed placeholder)
    - Step 5: `IncidentReport` (or dashed placeholder)
- **Identified Gaps**:
  - **Binary Step Transitions**: When `diagnosis` is populated by `diagnose()`, steps 2 through 4 instantly flip from empty placeholder boxes to full rendered components with zero transition physics.
  - **No Scanline Progress Indicators**: When `loading === true`, `aiReviewLoading === true`, or `reportLoading === true`, there is no holographic scanline sweep or active pipeline progress bar indicating diagnostic analysis.
  - **Monolithic Step 4 Layout**: All four sub-panels in Step 4 are vertically stacked across ~2,500 vertical pixels without accordion reveals or tab switching.
- **Proposed Motion Architecture**:
  - **Pipeline Progress Scanline**: An animated glowing gradient beam that sweeps across the header of the currently executing step during `loading`, `aiReviewLoading`, and `reportLoading`.
  - **Step Reveal Choreography**: Use `motion.div` with staggered reveal variants for newly diagnosed sections:
    ```tsx
    const stepVariants = {
      hidden: { opacity: 0, y: 16 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.35, ease: "easeOut" },
      }),
    };
    ```
  - Animated morphing between placeholder state and active diagnostic panel using `<AnimatePresence mode="wait">`.

---

### 2.4 DiagnosisPanel (`src/components/DiagnosisPanel.tsx`)
- **Current Implementation**:
  - Renders root-cause title, status chip, and 5 metric cards (`Likely root cause`, `Confidence`, `Affected subsystem`, `Secret scan`, `Report readiness`).
  - Confidence meter at line 38 is a static inline style:
    ```tsx
    <div className="h-2 rounded-full border border-cyan/70 bg-cyan/45" style={{ width: `${percent}%` }} />
    ```
- **Identified Gaps**:
  - Confidence bar does not animate or fill up when diagnosis is generated.
  - No pulse/scanline accents across the 5 metric cards.
  - Missing `"use client"` directive in the file.
- **Proposed Motion Architecture**:
  - Add `"use client"` directive.
  - Animate confidence bar with spring physics:
    ```tsx
    <motion.div
      className="h-2 rounded-full border border-cyan/70 bg-cyan/45"
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ type: "spring", damping: 20, stiffness: 120, delay: 0.1 }}
    />
    ```
  - Stagger entrance of the 5 cards with subtle hover scale/glow (`whileHover={{ y: -2, borderColor: "rgba(109,216,255,0.4)" }}`).

---

### 2.5 SuggestedSolutionsPanel (`src/components/SuggestedSolutionsPanel.tsx`)
- **Current Implementation**:
  - Renders an array of deterministic solution suggestions:
    - Summary & When to use
    - Environment variables
    - Implementation steps
    - Code snippet
    - Verification commands
  - All cards and all child details are permanently expanded by default.
  - Selection button toggles `selectedSuggestionIds`.
- **Identified Gaps**:
  - **No Accordion Reveals**: The solution cards have no accordion expand/collapse functionality. Every card takes 400+ vertical pixels, overwhelming the screen.
  - **No Height Morphing**: Expanding/collapsing sections should smoothly interpolate height using `motion.div` with `initial={{ height: 0, opacity: 0 }}` and `animate={{ height: "auto", opacity: 1 }}`.
  - **No Card Selection Dynamics**: Selecting a solution card simply swaps CSS classes (`border-cyan/65 bg-cyan/10` vs `border-white/10 bg-black/25`) with no spring bounce or checkmark morph.
- **Proposed Motion Architecture**:
  - Implement collapsible accordion reveals for card details (steps, env variables, snippet, commands), allowing users to expand/collapse with fluid height animations.
  - Add tactile spring feedback on selection: `whileTap={{ scale: 0.98 }}` and an animated spring checkmark indicator.

---

### 2.6 Patch Review Tabs
- **Location**: Step 4 of `BuildDoctorApp.tsx` (lines 488–516).
- **Current Implementation**:
  - Vertically stacks four separate panels:
    1. `<PatchDraftPanel diagnosis={diagnosis} />`
    2. `<SuggestedSolutionsPanel diagnosis={diagnosis} ... />`
    3. `<AiPatchReviewPanel diagnosis={diagnosis} ... />`
    4. `<FixPlan diagnosis={diagnosis} compact />`
- **Critical Architectural & Testing Consideration**:
  - `e2e/build-doctor.spec.ts` (lines 437–450) executes a sequential verification script expecting all four panels:
    - Checks `Safe patch draft` heading
    - Checks `Suggested solutions` heading
    - Clicks `Autofill Fix Plan` button
    - Clicks `Copy commands` button
    - Checks `Live DeepSeek review` heading
    - Clicks `Run DeepSeek review` button
  - **If tab switching completely unmounts hidden tabs**, `e2e/build-doctor.spec.ts` will fail when it attempts to click buttons on an unmounted panel!
- **Recommended Tab Architecture**:
  - Introduce an expressive patch review tab bar with tabs:
    - `All Review Modules` (Default active tab — keeps all 4 modules rendered for complete review and backward-compatibility with E2E automation)
    - `Safe Patch Draft`
    - `Solution Cards`
    - `DeepSeek Review`
    - `Remediation Plan`
  - When switching tabs, render a floating cyan glow pill under the active tab with `layoutId="activePatchReviewTab"`.
  - When an individual tab is selected, smoothly highlight or filter the view using `AnimatePresence mode="wait"`.

---

## 3. Requirement R4: RSC Boundaries & Hydration Architecture

### 3.1 Server Component vs Client Component Breakdown

| File / Component | Type | Directive | Notes |
| :--- | :--- | :--- | :--- |
| `src/app/page.tsx` | Server Component | None | Top-level home route |
| `src/app/layout.tsx` | Server Component | None | Root layout with meta |
| `src/components/SuiteHub.tsx` | Server Component | None | Composes portfolio sections |
| `src/components/portfolio/MotionSection.tsx` | Client Component | `"use client"` | Wraps server children in motion |
| `src/components/portfolio/TopCommandNav.tsx` | Server Component | None | Static nav links + CommandPalette |
| `src/components/portfolio/CommandPalette.tsx` | Client Component | `"use client"` | Interactive overlay |
| `src/components/portfolio/LiveWorkflowEventsTracker.tsx`| Client Component | `"use client"` | Interactive scrubber & state |
| `src/components/portfolio/TrackerEvidenceDrawer.tsx` | Client Component | `"use client"` | Interactive drawer |
| `src/components/portfolio/ProjectDirectory.tsx` | Client Component | `"use client"` | Search & filter tags |
| `src/components/portfolio/CopyEmailButton.tsx` | Client Component | `"use client"` | Clipboard interaction |
| `src/app/build-doctor/page.tsx` | Server Component | None | Renders BuildDoctorApp |
| `src/components/BuildDoctorApp.tsx` | Client Component | `"use client"` | Full diagnostic workflow |
| `src/components/DiagnosisPanel.tsx` | Needs Directive | *Needs `"use client"`*| Currently lacks directive |
| `src/components/SuggestedSolutionsPanel.tsx` | Client Component | `"use client"` | Accordion & selection state |
| `src/components/AiPatchReviewPanel.tsx` | Client Leaf | *Needs `"use client"`*| Inherited from parent |
| `src/components/PatchDraftPanel.tsx` | Client Leaf | *Needs `"use client"`*| Inherited from parent |
| `src/components/IncidentReport.tsx` | Client Component | `"use client"` | Copy & download report |
| `src/app/case-study/page.tsx` | Server Component | None | Runs evals during SSR |
| `src/app/projects/[slug]/page.tsx` | Server Component | None | Dynamic static param route |

### 3.2 Preserving RSC Composition Performance
- Next.js allows Client Components to receive Server Components as `children` without converting those children into Client Components.
- `<MotionSection className="..."> {children} </MotionSection>` is the gold standard for this pattern in `SuiteHub.tsx`.
- Client directives (`"use client"`) must strictly remain at interactive leaf nodes.

### 3.3 Hydration Mismatch & CLS Mitigation
- **Avoid Random Keys**: Do not generate random animation delays or IDs during render (`Math.random()` will cause React 19 hydration mismatches).
- **Zero CLS on Exit**: Elements wrapped in `AnimatePresence` must have explicit sizing or `overflow: hidden` containers during exit collapse so text reflow does not trigger layout shift.
- **Fixed Overlays**: Drawers and palettes use `position: fixed; inset: 0`, completely removing them from the normal document flow and preventing any cumulative layout shift (CLS = 0).

---

## 4. Accessibility & Reduced-Motion Architecture

### 4.1 The CSS Media Query Limitation
In `src/app/globals.css` (lines 142–150):
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```
While this successfully clamps standard CSS transitions and `@keyframes`, **it does not affect JavaScript-driven Framer Motion spring physics or Web Animations API transforms**.
If a user has `prefers-reduced-motion: reduce` enabled:
- A `motion.div` animating `initial={{ x: "100%" }}` to `animate={{ x: 0 }}` via a spring curve will still execute the physical motion unless explicitly checked via `useReducedMotion()`.

### 4.2 Standardized Motion Contract (`motion-utils.ts`)
To achieve 100% reduced-motion compliance across all explorer components, implement a shared motion utility:
```typescript
// Proposed helper contract for motion components
export const MOTION_TRANSITIONS = {
  springSnappy: { type: "spring", damping: 28, stiffness: 320 },
  springGentle: { type: "spring", damping: 30, stiffness: 200 },
  fadeSmooth: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  instant: { duration: 0 },
};

export function getReducedMotionVariants<T extends Record<string, any>>(
  reduceMotion: boolean | null,
  activeVariants: T,
  reducedVariants?: Partial<T>
): T {
  if (!reduceMotion) return activeVariants;
  return {
    ...activeVariants,
    ...reducedVariants,
  };
}
```
When `useReducedMotion()` is true:
- Set `x: 0`, `y: 0`, `scale: 1`.
- Replace slide/expand transitions with simple, instant opacity changes or `transition: { duration: 0 }`.

### 4.3 Keyboard & Screen Reader Accessibility
- **Focus Trapping**: `CommandPalette` already implements `trapFocus` for `Tab`/`Shift+Tab`. `TrackerEvidenceDrawer` should adopt the same pattern.
- **Escape Key Listener**: Both `TrackerEvidenceDrawer` and `CommandPalette` must listen for `Escape` to close immediately.
- **Focus Restoration**: When the drawer or palette closes, focus must return to the trigger element (`ref.current.focus()`).

---

## 5. Verification & Testing Infrastructure Audit

### 5.1 Baseline Scripts & Test Suite Audit

| Command | Harness | Scope | Current Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `npm test` | Vitest 4.1.7 | `src/test/**/*.test.ts` | **PASS (32/32)** | Runs in `node` environment in 1.02s |
| `npm run typecheck` | TypeScript 5.7.2 | `tsc --noEmit` | **PASS (0 errors)** | Zero TypeScript diagnostics |
| `npm run audit:report` | Vitest 4.1.7 | `src/audit/report-audit.test.ts` | **PASS (1/1)** | Generates audit handoff report |
| `npm run audit:security` | Vitest 4.1.7 | `src/audit/security-audit.test.ts` | **PASS (1/1)** | 4,000 security checks in 1.07s |
| `npm run audit:45k` | Vitest 4.1.7 | `src/audit/premium-audit.test.ts` | **PASS (1/1)** | 45,000 checks pass in 2.32s |
| `npm run test:e2e` | Playwright 1.60.0| `e2e/build-doctor.spec.ts` | Ready | Tests real browser DOM on port 3100 |

### 5.2 Deep Dive: Vitest Configuration (`vitest.config.ts`)
```typescript
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```
- **Crucial Observation**: Vitest runs with `environment: "node"`. There is currently **no jsdom or happy-dom** configured.
- Attempting to run React component tests with `@testing-library/react` inside the default `vitest.config.ts` will fail unless `// @vitest-environment jsdom` is specified and `jsdom` or `happy-dom` is installed.
- Fortunately, end-to-end browser verification is fully covered by Playwright.

### 5.3 Playwright E2E Invariants (`e2e/build-doctor.spec.ts`)
The 33KB Playwright test suite asserts exact interactions across the application:
1. **Command Palette assertions (lines 67–80)**:
   - `page.keyboard.press("ControlOrMeta+K")`
   - `page.getByRole("dialog", { name: "Portfolio command palette" })`
   - `page.getByLabel("Search commands").fill(...)`
   - `page.keyboard.press("Escape")` -> `await expect(dialog).toHaveCount(0)`
   *Invariant*: When closing, `AnimatePresence` must unmount the dialog completely so `toHaveCount(0)` succeeds.
2. **Evidence Drawer assertions (lines 120–126)**:
   - `page.getByRole("button", { name: "How this works" }).click()`
   - `page.getByRole("dialog", { name: "Public-safe tracker sources" })`
   - `page.getByRole("button", { name: "Close tracker evidence drawer" }).click()`
   - `await expect(drawer).toHaveCount(0)`
   *Invariant*: The dialog role and title must remain unchanged.
3. **Build Doctor Workflow assertions (lines 434–475)**:
   - Tests expect sequential headings: `TypeScript compile error`, `Local diagnostic trace`, `Safe patch draft`, `Suggested solutions`, `Live DeepSeek review`.
   *Invariant*: Introducing tabs must NOT hide these elements during automated tests (default "All Views" tab maintains 100% test compatibility).

---

## 6. Implementation Blueprint & Code Proposals

### 6.1 Proposal: `TrackerEvidenceDrawer.tsx`
```tsx
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { EvidenceSource } from "@/types/liveWorkflowTracker";
import { formatConfidence } from "@/lib/formatMetrics";
import { confidenceClass, evidenceTypeLabel } from "@/lib/trackerEvidence";
import { compactLinkClass } from "./shared";

type TrackerEvidenceDrawerProps = {
  sources: EvidenceSource[];
  open: boolean;
  onClose: () => void;
};

export function TrackerEvidenceDrawer({ sources, open, onClose }: TrackerEvidenceDrawerProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="tracker-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[70] bg-black/70 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onClick={onClose}
        >
          <motion.aside
            key="tracker-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tracker-evidence-title"
            initial={{ x: shouldReduceMotion ? 0 : "100%", opacity: shouldReduceMotion ? 0 : 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: shouldReduceMotion ? 0 : "100%", opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", damping: 28, stiffness: 280 }
            }
            className="ml-auto flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-lg border border-cyan/35 bg-[#07111f] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header and Content with staggered cards */}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 6.2 Proposal: `CommandPalette.tsx`
```tsx
// Inside CommandPalette:
<AnimatePresence>
  {open && (
    <motion.div
      key="palette-backdrop"
      ref={dialogRef}
      onKeyDown={trapFocus}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-[80] bg-obsidian/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio command palette"
    >
      <motion.div
        key="palette-box"
        initial={{ scale: shouldReduceMotion ? 1 : 0.94, opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: shouldReduceMotion ? 1 : 0.94, opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", damping: 26, stiffness: 340 }}
        className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-lg border border-cyan/35 bg-[#07111d] shadow-glow"
      >
        {/* Search header & list */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 6.3 Proposal: Diagnostic Scanline Progress Indicator
```tsx
// Reusable DiagnosticScanline for BuildDoctorApp
export function DiagnosticScanline({ active }: { active: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  if (!active || shouldReduceMotion) return null;

  return (
    <div className="relative h-1 w-full overflow-hidden bg-cyan/10">
      <motion.div
        className="absolute inset-y-0 h-full w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent shadow-[0_0_12px_rgba(109,216,255,0.8)]"
        initial={{ x: "-100%" }}
        animate={{ x: "400%" }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      />
    </div>
  );
}
```

---

## 7. Actionable Plan for Implementer Agents

1. **Step 1: Create Shared Motion Utility (`src/lib/motion.ts`)**
   - Export standard springs, eases, and a reduced-motion variant helper.
2. **Step 2: Upgrade Modals & Drawers (`TrackerEvidenceDrawer` & `CommandPalette`)**
   - Wrap both components with `<AnimatePresence>`.
   - Add slide and spring physics.
   - Add `Escape` key support to `TrackerEvidenceDrawer`.
   - Add keyboard selection and active `layoutId` pill to `CommandPalette`.
3. **Step 3: Upgrade Build Doctor App & Diagnosis Panel**
   - Add `"use client"` to `DiagnosisPanel.tsx`.
   - Animate the confidence meter bar and stagger metric cards.
   - Add `DiagnosticScanline` component to indicate pipeline activity during log diagnosis, AI review, and report generation.
4. **Step 4: Upgrade Solution Cards & Patch Review Tabs**
   - Add accordion reveals with `AnimatePresence` height morphs to `SuggestedSolutionsPanel`.
   - Implement animated tab navigation in Step 4 with "All Modules" default view to preserve E2E compatibility.
5. **Step 5: Verification Sweep**
   - Execute `npm test` (32 tests).
   - Execute `npm run typecheck` (0 errors).
   - Execute `npm run audit:45k` & `npm run audit:security`.
   - Execute `npm run test:e2e` to verify real browser animation and accessibility.
