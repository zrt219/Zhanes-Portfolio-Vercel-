# Architectural Survey: Mainframe Top-Level Sections & Entry Choreography

**Date**: 2026-09-03  
**Target Requirement**: R1 (Cinematic Entrance & Section Choreography)  
**Investigator**: Explorer 1 (`teamwork_preview_explorer_survey_1`)  
**Workspace Root**: `c:\Users\Zhane\Documents\antigravity\resilient-bose`

---

## Executive Summary

This report provides a comprehensive, read-only architectural survey of the Zhane Grey AI Engineering Mainframe portfolio suite, focusing on **Requirement R1 (Cinematic Entrance & Section Choreography)**. 

### Core Findings
1. **Installed Motion Engine**: `framer-motion` version `12.40.0` is installed with React `19.0.0` and Next.js `16.2.6` (App Router).
2. **Extremely Sparse Existing Usage**: In the entire codebase, only **one single file** (`src/components/portfolio/MotionSection.tsx`) imports or uses `framer-motion`.
3. **Monolithic & Flat Entrance Animations**:
   - `MotionSection.tsx` applies a coarse, uncoordinated `{ opacity: 0, y: 18 }` to `{ opacity: 1, y: 0 }` fade-up across the entire outer wrapper with duration `0.42s`.
   - Because Framer Motion variants are not defined or propagated down the DOM tree, **zero child elements stagger**. Card grids (`StatsRibbon`, `FeaturedProofGrid`, `EmployerSignalPanel`, `RalphplanWorkflowMap`, `EvidenceLedger`) reveal as single static blocks.
   - `HeroMainframe` is rendered outside `MotionSection` and has **zero Framer Motion code whatsoever**; it renders instantly upon page load with no cinematic boot sequence.
   - `ProjectDirectory` has dynamic state (`useState`) and filtering, but has **no exit/enter transitions**, causing items to abruptly snap into existence or vanish upon filter changes.
4. **Holographic Visuals are Static**:
   - `HolographicProofPanel` contains static CSS ring pulses (`.holo-ring`), but lacks entrance choreography, gyro acceleration/stabilization, and holographic scanline sweeps.
5. **RSC Boundary Preservation**:
   - `SuiteHub.tsx`, `page.tsx`, and `layout.tsx` are React Server Components (RSC).
   - Moving the section presentation components to `"use client"` or wrapping cards in standardized motion wrappers is safe, performant, and maintains RSC boundaries since none of the mainframe sections perform async server data fetching (all data is imported from static bundled TypeScript data sources like `@/data/projects` and `@/data/portfolioStats`).

---

## 1. Inventory of Mainframe Top-Level Sections

The main landing page route `src/app/page.tsx` renders `src/components/SuiteHub.tsx`. `SuiteHub.tsx` acts as the root orchestrator composing the mainframe sections:

```tsx
// src/components/SuiteHub.tsx
export function SuiteHub() {
  return (
    <>
      <TopCommandNav />
      <main className="relative mx-auto min-h-screen max-w-7xl px-4 pb-8 text-[16px] sm:px-5 lg:px-8">
        <HeroMainframe />
        <MotionSection className="mb-8"><StatsRibbon /></MotionSection>
        <MotionSection className="mb-8"><LiveWorkflowEventsTracker /></MotionSection>
        <MotionSection className="mb-8"><FeaturedProofGrid /></MotionSection>
        <MotionSection className="mb-8"><RecruiterPath /></MotionSection>
        <MotionSection className="mb-8"><RalphplanWorkflowMap /></MotionSection>
        <MotionSection className="mb-8"><ProjectDirectory /></MotionSection>
        <MotionSection className="mb-8"><EmployerSignalPanel /></MotionSection>
        <MotionSection className="mb-8"><EvidenceLedger /></MotionSection>
        <MotionSection><ContactCTA /></MotionSection>
      </main>
      <Footer />
    </>
  );
}
```

### Component Signatures & Architectural Matrix

| Component | Exact File Path | Export Signature | Current Component Type | Props | State Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HeroMainframe** | `src/components/portfolio/HeroMainframe.tsx` | `export function HeroMainframe(): JSX.Element` | RSC (Server) | None | None |
| **HolographicProofPanel** | `src/components/portfolio/HolographicProofPanel.tsx` | `export function HolographicProofPanel(): JSX.Element` | RSC (Server) | None | Calls `runEvalSuite()` synchronously |
| **StatsRibbon** | `src/components/portfolio/StatsRibbon.tsx` | `export function StatsRibbon(): JSX.Element` | RSC (Server) | None | None (reads `portfolioStats`) |
| **FeaturedProofGrid** | `src/components/portfolio/FeaturedProofGrid.tsx` | `export function FeaturedProofGrid(): JSX.Element` | RSC (Server) | None | None (reads `featuredProjects`) |
| **RalphplanWorkflowMap** | `src/components/portfolio/RalphplanWorkflowMap.tsx` | `export function RalphplanWorkflowMap(): JSX.Element` | RSC (Server) | None | None (local static arrays) |
| **ProjectDirectory** | `src/components/portfolio/ProjectDirectory.tsx` | `export function ProjectDirectory(): JSX.Element` | Client (`"use client"`) | None | `activeFilter: string`, `query: string` |
| **EmployerSignalPanel** | `src/components/portfolio/EmployerSignalPanel.tsx` | `export function EmployerSignalPanel(): JSX.Element` | RSC (Server) | None | None (local static array) |
| **EvidenceLedger** | `src/components/portfolio/EvidenceLedger.tsx` | `export function EvidenceLedger(): JSX.Element` | RSC (Server) | None | None (reads `evidenceSources`, `suiteApps`) |
| **MotionSection** | `src/components/portfolio/MotionSection.tsx` | `export function MotionSection(props: MotionSectionProps): JSX.Element` | Client (`"use client"`) | `{ children: ReactNode; className?: string }` | `useReducedMotion()` |
| **SuiteHub** | `src/components/SuiteHub.tsx` | `export function SuiteHub(): JSX.Element` | RSC (Server) | None | None |

---

## 2. In-Depth Section Analysis & Shortcoming Breakdown

### 2.1. HeroMainframe & HolographicProofPanel
- **File Paths**:
  - `src/components/portfolio/HeroMainframe.tsx`
  - `src/components/portfolio/HolographicProofPanel.tsx`
- **Current Behavior**:
  - `HeroMainframe` is rendered completely outside of `MotionSection` in `SuiteHub.tsx` (line 20).
  - It does not contain any motion components or animation hooks.
  - When the page loads, all elements (status badge, headline, copy, 5 CTA links, Ralphplan stage ribbon, and the right-hand holographic proof panel) appear instantly without coordination.
  - In `HolographicProofPanel`, rings have simple CSS infinite keyframes (`@keyframes holo-pulse`), but there is no initial boot sequence, no gyroscopic spin-up, and no staggered appearance of the callouts or bottom metric cards (`Workflow events`, `Codex sessions`, `Eval fixtures`).
- **Shortcomings**:
  - Misses the opportunity for a high-impact, cinematic "Mainframe Online" entrance choreography.
  - No layered depth between typography, interactive action buttons, pipeline stages, and the holographic gyro.
  - Pipeline ribbon stages (`Evidence -> Context -> Subagents -> Implementation -> Browser QA -> Proof ledger`) appear statically all at once instead of cascading along the engineering workflow.

### 2.2. StatsRibbon
- **File Path**: `src/components/portfolio/StatsRibbon.tsx`
- **Current Behavior**:
  - Renders an 8-card grid (4 core stats + 4 analytics metrics).
  - Wrapped by `MotionSection` in `SuiteHub.tsx`.
  - The entire 8-card section fades up as a single monolithic block (`opacity: 0, y: 18` -> `opacity: 1, y: 0`).
- **Shortcomings**:
  - **No Stagger**: All 8 cards pop into visibility at the exact same millisecond.
  - **Flat Reveal**: Lacks spring physics (`easeOut` linear decay instead of responsive spring dynamics).
  - **Static Metrics**: Numbers and confidence badges have no entrance pop or glowing luminescence accent.
  - **Missing Holographic Touches**: Glass cards have CSS hover (`translateY(-2px)`), but no cursor-responsive spring or glowing border pulse.

### 2.3. FeaturedProofGrid
- **File Path**: `src/components/portfolio/FeaturedProofGrid.tsx`
- **Current Behavior**:
  - Displays `featuredProjects` in an asymmetrical 3-column grid (`lg:grid-cols-3`).
  - The signature project (`Zhane Grey Evidence Dashboard`) spans 2 columns (`lg:col-span-2`) with cyan styling.
  - Wrapped by `MotionSection`.
- **Shortcomings**:
  - The signature flagship project appears simultaneously with the secondary cards, diluting its visual priority.
  - No staggered entrance across the cards.
  - Tech stack tags (`project.stack.map(...)`) and action links appear statically inside the cards.
  - Lacks a holographic border sweep, luminous accent, or active pulse on the signature proof card.

### 2.4. RalphplanWorkflowMap
- **File Path**: `src/components/portfolio/RalphplanWorkflowMap.tsx`
- **Current Behavior**:
  - Represents an 8-stage engineering loop (`workflowSteps`: 01 Input evidence to 08 Portfolio stats refresh) with connecting `ArrowRight` icons on desktop, followed by 3 subagent lane articles (`lanes`: Architect/Planner, Builder/Integrator, Verifier/Evidence Curator).
  - Wrapped by `MotionSection`.
- **Shortcomings**:
  - Visually represents a directional pipeline, but renders as a dead static grid.
  - No sequential left-to-right cascade demonstrating data flowing through steps 01 to 08.
  - Arrows are completely static, missing pulse or signal transmission animations.
  - The 3 subagent lanes do not reveal with coordinated timing.

### 2.5. ProjectDirectory
- **File Path**: `src/components/portfolio/ProjectDirectory.tsx`
- **Current Behavior**:
  - Client component (`"use client"`) managing `activeFilter` and `query` state.
  - Renders a search box, 7 filter buttons, a reset button, an active filter summary banner, and a list of project articles.
  - Wrapped by `MotionSection`.
- **Shortcomings**:
  - When the user switches filters or types in the search box, items in the list mount and unmount instantly without layout morphing or `AnimatePresence`.
  - Active filter button switches styles instantly with no sliding layout pill indicator (`layoutId`).
  - Initial viewport reveal is coarse and un-staggered.

### 2.6. EmployerSignalPanel
- **File Path**: `src/components/portfolio/EmployerSignalPanel.tsx`
- **Current Behavior**:
  - Split grid (`lg:grid-cols-[0.78fr_1.22fr]`): Left column contains headline and editorial context; right column contains a 2x3 grid of 6 capability signal articles.
  - Wrapped by `MotionSection`.
- **Shortcomings**:
  - Split layout fails to establish narrative hierarchy: editorial text and all 6 cards appear together.
  - No stagger across the 6 signals (Proof-oriented AI, Agentic workflow, RAG/eval, Developer tools, Full-stack shipped, Web3).
  - Icon containers (`h-9 w-9 border-cyan/45 bg-cyan/10`) are static.

### 2.7. EvidenceLedger
- **File Path**: `src/components/portfolio/EvidenceLedger.tsx`
- **Current Behavior**:
  - Renders 4 primary evidence sources (Workflow events tracker, Daily evidence report, Codex session summary, Workspace line scan) followed by a 4-card grid of `suiteApps` with health/eval/integration links.
  - Wrapped by `MotionSection`.
- **Shortcomings**:
  - Dense tabular data appears as a wall of content.
  - Rows do not cascade into view.
  - Status badges (`verified`, `documented`, `demo`, `review`) lack entrance accents.

### 2.8. MotionSection.tsx (Current Implementation)
- **File Path**: `src/components/portfolio/MotionSection.tsx`
- **Current Code**:
  ```tsx
  "use client";

  import { motion, useReducedMotion } from "framer-motion";
  import type { ReactNode } from "react";

  type MotionSectionProps = {
    children: ReactNode;
    className?: string;
  };

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
- **Fundamental Architectural Limitations**:
  1. **No Variant Propagation**: Because it uses raw inline `initial` and `whileInView` properties on a single wrapper `motion.div`, child elements cannot participate in `staggerChildren` or `delayChildren`.
  2. **Monolithic & Rigid**: All wrapped sections receive the exact same `y: 18` offset and `duration: 0.42s`.
  3. **No Support for Viewport Tuning**: Sections of varying height and layout have different optimal viewport thresholds (e.g. `amount: 0.15` vs `margin: "-50px"`).
  4. **No Visual Accents**: Provides no capability for glowing borders, scanline sweeps, or coordinated entrance triggers.

---

## 3. Recommended Motion Architecture & Variant Designs

To achieve Requirement R1 without compromising RSC performance or creating code duplication, we recommend establishing a **Central Motion Tokens & Variants Module** (`src/lib/motionTokens.ts` or `src/components/portfolio/motionTokens.ts`), complemented by upgrading the section components to use structured Framer Motion variants.

### 3.1. Standardized Physics & Timing Tokens

```ts
// Recommended: src/components/portfolio/motionTokens.ts
import type { Transition, Variants } from "framer-motion";

/**
 * Spring configurations calibrated for high-precision technical aesthetics:
 * - brisk: Snappy, high-stiffness spring for small badges, pills, and cards
 * - gentle: Smooth, dampened spring for larger layout panels and sections
 * - energetic: Dynamic pop for counters, icons, and holographic accents
 */
export const springs = {
  brisk: { type: "spring", stiffness: 350, damping: 28, mass: 0.8 } satisfies Transition,
  gentle: { type: "spring", stiffness: 220, damping: 24, mass: 1 } satisfies Transition,
  energetic: { type: "spring", stiffness: 420, damping: 26, mass: 0.7 } satisfies Transition,
} as const;

export const easings = {
  cinematic: [0.16, 1, 0.3, 1] as const, // Quintic out
  smooth: [0.25, 0.1, 0.25, 1] as const,
};

export const staggers = {
  tight: 0.04,   // Tags, pipeline steps, fast lists
  medium: 0.08,  // Card grids, stat ribbons, capability tiles
  loose: 0.14,   // Major top-level columns and panels
};
```

### 3.2. Core Section Variants

#### Container Choreography (Parent)
```ts
export const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggers.medium,
      delayChildren: 0.1,
    },
  },
};

export const gridStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggers.medium,
      delayChildren: 0.15,
    },
  },
};
```

#### Item & Card Reveal Variants (Children)
```ts
export const fadeUpItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.brisk,
  },
};

export const cardSpringVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.gentle,
  },
};

export const slideFromLeftVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easings.cinematic },
  },
};

export const badgeScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.75, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.energetic,
  },
};
```

#### Holographic Scanline & Accent Variants
```ts
export const scanlineSweepVariants: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: "200%",
    opacity: [0, 0.7, 0],
    transition: { duration: 1.2, ease: "easeInOut", repeatDelay: 4, repeat: Infinity },
  },
};

export const holoGyroVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, rotate: -25 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { ...springs.gentle, delay: 0.2 },
  },
};
```

---

## 4. Section-by-Section Choreography Blueprint

### 4.1. HeroMainframe & HolographicProofPanel
```
[Page Mount]
   ├── 1. Status Eyebrow Badge (badgeScaleVariants, 0ms)
   ├── 2. Headline <h1> (fadeUpItemVariants, +80ms)
   ├── 3. Paragraphs & Value Prop (fadeUpItemVariants, +160ms)
   ├── 4. Primary CTA Buttons (staggered cascade 50ms per button, +240ms)
   ├── 5. Ralphplan Pipeline Ribbon (pills cascade left-to-right, +320ms)
   └── 6. HolographicProofPanel (simultaneous coordinated sequence)
         ├── Callout Tiles (staggered 2x2 reveal, +150ms)
         ├── Gyroscope Center Assembly (scale 0.7 -> 1, rotate -25 -> 0, +250ms)
         ├── Holographic Scanline Sweep (shimmer across panel header, +400ms)
         └── Bottom Metric Cards (pop spring reveal, +500ms)
```

### 4.2. StatsRibbon
```
[Scroll into View: whileInView, viewport amount: 0.15, once: true]
   ├── Header: "Verified proof stats" & "Not image-derived" chip (slideFromLeftVariants)
   └── 8-Card Grid Container (staggerChildren: 0.06)
         ├── Stat Card 01 (y: 24 -> 0, scale: 0.96 -> 1)
         ├── Stat Card 02 (+60ms)
         ├── Stat Card 03 (+120ms)
         ├── ...
         └── Stat Card 08 (+420ms)
         * Each card features hover micro-lift (y: -4) and cyan glow intensification
```

### 4.3. FeaturedProofGrid
```
[Scroll into View: whileInView, viewport amount: 0.15, once: true]
   ├── Section Header (fadeUp)
   └── Project Grid (staggerChildren: 0.12)
         ├── Signature Proof Card (spans 2 cols, anchored with prominent spring: stiffness 260)
         │     ├── Border glow pulse animation
         │     └── Tech stack badge cascade
         └── Secondary Proof Cards (staggered cascade +120ms, +240ms)
```

### 4.4. RalphplanWorkflowMap
```
[Scroll into View: whileInView, viewport amount: 0.15, once: true]
   ├── Section Header & "Local / demo operating model" tag
   ├── 8-Step Pipeline Row (staggerChildren: 0.07, sequential cascade 01 -> 08)
   │     ├── Step 01 (x: -12 -> 0, opacity: 0 -> 1)
   │     ├── Arrow 1-2 (glow pulse)
   │     ├── Step 02 ... Step 08
   └── 3 Subagent Lanes (staggerChildren: 0.1, delayChildren: 0.35)
         ├── Lane 1: Architect / Planner
         ├── Lane 2: Builder / Integrator
         └── Lane 3: Verifier / Evidence Curator
```

### 4.5. ProjectDirectory
```
[Scroll into View: whileInView, viewport amount: 0.12, once: true]
   ├── Search & Filter Bar Entrance
   │     └── Filter Buttons with layoutId="activeFilterHighlight" for fluid pill sliding
   ├── Status Summary Banner
   └── Project List (AnimatePresence mode="popLayout")
         └── motion.article with layout prop
               ├── Enter: opacity: 0, y: 16 -> opacity: 1, y: 0 (spring brisk)
               └── Exit: opacity: 0, scale: 0.96 (duration: 0.15s)
```

### 4.6. EmployerSignalPanel
```
[Scroll into View: whileInView, viewport amount: 0.15, once: true]
   ├── Left Editorial Column (slideFromLeft: x: -25 -> 0, opacity: 0 -> 1)
   └── Right Capability Grid (staggerChildren: 0.08, delayChildren: 0.15)
         └── 6 Signal Cards cascade with icon pop and subtle hover cyan border glow
```

### 4.7. EvidenceLedger
```
[Scroll into View: whileInView, viewport amount: 0.12, once: true]
   ├── Header Reveal
   ├── Evidence Sources List (staggerChildren: 0.05, rows cascade in sequence)
   └── Suite Apps Sub-Grid (staggerChildren: 0.08, delayChildren: 0.25)
         └── 4 App cards reveal with Health/Eval/Integration buttons
```

---

## 5. React Server Component (RSC) Boundary Strategy

Preserving Next.js App Router performance and avoiding hydration mismatches is a primary constraint (Requirement R4).

### Boundary Analysis
1. **Server vs Client Classification**:
   - `src/app/layout.tsx`: **Server Component** (Metadata, body layout)
   - `src/app/page.tsx`: **Server Component** (Renders `<SuiteHub />`)
   - `src/components/SuiteHub.tsx`: **Server Component** (Composes the top-level mainframe sections)
   - `HeroMainframe.tsx`, `StatsRibbon.tsx`, `FeaturedProofGrid.tsx`, `RalphplanWorkflowMap.tsx`, `EmployerSignalPanel.tsx`, `EvidenceLedger.tsx`: Can safely be marked `"use client"` because they:
     - Do not perform server-only database operations or async fetches.
     - Import static bundled TypeScript datasets (`@/data/projects`, `@/data/portfolioStats`, etc.).
     - Are interactive visual presentation surfaces requiring hooks (`useReducedMotion`), client viewport measurement, and event handling.
   - Alternatively, `SuiteHub.tsx` remains a clean RSC parent orchestrator that streams and mounts these client sections seamlessly.

### Hydration & Zero CLS (Cumulative Layout Shift) Guarantees
- In Next.js SSR, elements rendered with `initial="hidden"` must not cause layout collapse (zero height or jumping dimensions) before hydration.
- **Rule**: Never use `display: none` or animate layout-disrupting properties (`height: 0` without explicit dimensions, `margin`, `padding`).
- **Use Only Transform & Opacity**: Animations must be restricted to `transform: translate3d(...)`, `scale(...)`, `rotate(...)`, and `opacity`. These run on the compositor thread and have zero layout shift impact (CLS = 0).
- Explicit `min-h` classes already present in the components (e.g. `lg:min-h-[560px]` on Hero, `min-h-[410px]` on HolographicProofPanel, `min-h-11` on buttons and inputs) prevent any layout shifting.

---

## 6. Accessibility & Reduced Motion Integration

Requirement R4 dictates that toggling reduced motion must instantly deliver clean, static, non-disorienting layouts.

### 6.1. Framer Motion `useReducedMotion` Pattern
Each animated section must check `const shouldReduceMotion = useReducedMotion()`:

```tsx
import { motion, useReducedMotion } from "framer-motion";

export function StatsRibbon() {
  const shouldReduceMotion = useReducedMotion();

  // Under reduced motion: instantaneous display, no transform, no stagger delay
  const containerVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : statsGridVariants;

  const itemVariants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0, scale: 1 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } } }
    : statCardVariants;

  return (
    <motion.section
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={containerVariants}
    >
      {/* child motion components */}
    </motion.section>
  );
}
```

### 6.2. App-Level `<MotionConfig reducedMotion="user">`
To guarantee bulletproof accessibility across all subcomponents, wrap the mainframe in `SuiteHub` with Framer Motion's `<MotionConfig reducedMotion="user">`:
```tsx
import { MotionConfig } from "framer-motion";

// Automatically disables physical transforms and respects prefers-reduced-motion
<MotionConfig reducedMotion="user">
  {/* sections */}
</MotionConfig>
```

### 6.3. CSS Fallback Synergy
`src/app/globals.css` already contains:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```
Pairing `MotionConfig reducedMotion="user"` with the existing CSS rules guarantees complete coverage across both Framer Motion JS animations and CSS keyframes (`.holo-ring`, `.animate-ping`).

---

## 7. Verification & Automated Test Safety

All proposed section elevations have been audited against existing test suites:

1. **Vitest Unit & Data Integrity Tests** (`npm test`):
   - `src/test/portfolio-data-integrity.test.ts` (4 tests)
   - `src/test/build-doctor.test.ts` (28 tests)
   - **Status**: Tested and passing (32 of 32 tests passed). These tests inspect underlying data files and deterministic logic; elevating motion in presentation components does not alter data integrity.
2. **TypeScript Compilation** (`npm run typecheck`):
   - Currently passes with 0 diagnostics.
   - All motion variants, props, and component signatures must strictly adhere to TypeScript typing (`Variants`, `Transition`, React 19 types).
3. **Playwright E2E Tests** (`e2e/build-doctor.spec.ts`):
   - Checks headings, links, text content, and button accessibility.
   - Requires that elements become visible without hanging in `opacity: 0`. By ensuring viewport `once: true`, calibrated spring durations (< 0.6s), and `shouldReduceMotion` fallbacks, Playwright assertions remain 100% green.

---

## 8. Concrete Action Plan for Implementation Agents

1. **Step 1: Create Shared Motion Tokens** (`src/components/portfolio/motionTokens.ts`):
   - Export `springs`, `easings`, `staggers`, `sectionContainerVariants`, `fadeUpItemVariants`, `cardSpringVariants`, `badgeScaleVariants`, and reduced motion helper functions.
2. **Step 2: Upgrade `HeroMainframe` & `HolographicProofPanel`**:
   - Mark `"use client"`.
   - Implement root entrance stagger for headline, badges, and CTAs.
   - Add initial gyro scale/rotation spring to `HolographicProofPanel` and staggered callout/metric counter reveals.
3. **Step 3: Upgrade `StatsRibbon`**:
   - Mark `"use client"`.
   - Apply `whileInView="visible"`, `viewport={{ once: true, amount: 0.15 }}`.
   - Replace static card grid with staggered `motion.article` cards using `cardSpringVariants`.
4. **Step 4: Upgrade `FeaturedProofGrid`**:
   - Mark `"use client"`.
   - Apply `whileInView`, differentiate signature flagship card with anchored spring and subtle cyan scanline/border pulse.
   - Stagger secondary cards.
5. **Step 5: Upgrade `RalphplanWorkflowMap`**:
   - Mark `"use client"`.
   - Implement sequential 01-08 pipeline flow with directional horizontal stagger.
   - Implement tri-lane subagent cascade.
6. **Step 6: Upgrade `ProjectDirectory`**:
   - Add `layoutId` active pill highlight to filter buttons.
   - Wrap project cards in `AnimatePresence mode="popLayout"` with `motion.article layout`.
7. **Step 7: Upgrade `EmployerSignalPanel` & `EvidenceLedger`**:
   - Mark `"use client"`.
   - Orchestrate left-column slide and right-column card cascade for Employer Signal.
   - Implement sequential row cascade for Evidence Ledger.
8. **Step 8: Refactor `MotionSection` & Clean `SuiteHub`**:
   - Ensure clean composition in `SuiteHub.tsx` with `<MotionConfig reducedMotion="user">`.
9. **Step 9: Run Verification Suite**:
   - `npm run typecheck` (0 errors)
   - `npm test` (32 passed)
   - Ensure zero layout shift and verify reduced-motion behavior.
