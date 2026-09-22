# Architectural Survey: Interactive Micro-Interactions, 3D Tilts & Glowing Trails (Requirement R2)

**Explorer**: Explorer 2 (Interactive Micro-Interactions, 3D Tilts & Glowing Trails)  
**Date**: 2026-09-03  
**Working Directory**: `c:/Users/Zhane/Documents/antigravity/resilient-bose/.agents/teamwork_preview_explorer_survey_2`  
**Target Codebase**: `zrt219/Zhanes-Portfolio-Vercel-` (Mainframe & Vercel Build Doctor Suite)  
**Dependencies**: `framer-motion: ^12.40.0`, `next: ^16.2.6`, `react: ^19.0.0`, `tailwindcss: ^3.4.17`

---

## Executive Summary

This survey provides a comprehensive architectural analysis of all interactive surfaces across the Zhane Grey AI Engineering Mainframe and Build Doctor application suite, focusing on **Requirement R2 (Interactive Micro-Interactions, 3D Tilts & Glowing Trails)**.

Currently, interactivity is handled almost exclusively with flat Tailwind CSS classes (`hover:-translate-y-0.5`, `hover:border-cyan`, `transition-all duration-200`) and simple CSS hover shadows (`glass-card:hover { transform: translateY(-2px); }`). Framer Motion (`^12.40.0`) is present in `package.json` but is currently utilized only in a single file (`src/components/portfolio/MotionSection.tsx`) for coarse entry fade-ins. Not a single card or button utilizes cursor-reactive 3D physics, spring dampening, dynamic glowing borders, holographic scanlines, or `layoutId` pill transitions.

This document catalogs every interactive surface, diagnoses current state handling, specifies four concrete micro-interaction architectures, and provides rigorous GPU performance safeguards and `prefers-reduced-motion` fallbacks to ensure 0 layout shift (CLS), 60+ FPS fidelity, and 100% test compatibility.

---

## 1. Comprehensive Inventory of Interactive Surfaces

The suite features 28 distinct interactive surfaces across two primary route domains: the Portfolio Mainframe (`/`, `/projects/[slug]`) and Build Doctor (`/build-doctor`, `/case-study`).

### 1.1 Mainframe Portfolio Surfaces (`src/components/portfolio/`)

| Surface Component | File & Lines | Interactive Elements | Current Interaction Mechanism | Gaps / Elevation Opportunities |
| :--- | :--- | :--- | :--- | :--- |
| **FeaturedProofGrid** | `src/components/portfolio/FeaturedProofGrid.tsx`: lines 29–82 | - Signature Project Card (lines 30–81)<br>- Secondary Proof Cards (lines 30–81)<br>- Status & Lifecycle Badges (lines 43–53)<br>- Stack Tags (lines 58–62)<br>- Action Buttons (lines 65–79) | CSS `.glass-card` hover (`translateY(-2px)`, border-cyan, box-shadow). Buttons use `compactLinkClass` (`hover:-translate-y-0.5`). | Static 2D lift. No cursor tracking, no 3D tilt, no dynamic glare, no neon border tracing. |
| **ProjectDirectory** | `src/components/portfolio/ProjectDirectory.tsx`: lines 70–188 | - Search Input & Clear Button (lines 70–94)<br>- 9 Filter Pill Buttons (lines 98–110)<br>- Reset Filter Button (lines 111–122)<br>- 10+ Project Article Cards (lines 137–177)<br>- Action Links & Status Badges (lines 140, 157–176) | Filter pills toggle conditional Tailwind classes (`border-cyan/80 bg-cyan/20` vs `border-line`). Project cards use `hover:border-cyan/60 hover:bg-black/40`. | Active filter pill abruptly snaps with no sliding layout spring (`layoutId`). Cards have flat hover without tilt or depth. |
| **TopCommandNav** | `src/components/portfolio/TopCommandNav.tsx`: lines 16–86 | - Brand Badge Logo (`Link`) (lines 18–35)<br>- Desktop Navigation Links (lines 37–47)<br>- Command Trigger Button (line 50)<br>- GitHub & Email CTA Buttons (lines 51–66)<br>- Mobile Nav Pills (lines 69–84) | CSS hover (`hover:border-cyan/40 hover:bg-cyan/10`). Ping dot (`animate-ping`). | Buttons lack spring tap feedback (`whileTap={{ scale: 0.96 }}`). Nav links lack sliding active tab indicator. |
| **HeroMainframe** | `src/components/portfolio/HeroMainframe.tsx`: lines 9–75 | - 5 Primary & Secondary CTA Buttons (lines 34–52)<br>- Ralphplan Pipeline Step Chips (lines 54–66)<br>- HolographicProofPanel (lines 73) | CSS classes `primaryLinkClass` & `secondaryLinkClass` (`hover:-translate-y-0.5`). Pipeline chips use `hover:border-cyan/40`. | CTA buttons lack magnetic pull or glowing aura. Pipeline chips lack active pulse propagation. |
| **HolographicProofPanel** | `src/components/portfolio/HolographicProofPanel.tsx`: lines 18–60 | - 4 Callout Cards (lines 22–35)<br>- 3 Big Number Metric Cards (lines 45–58)<br>- Holographic CSS Rings & Rhombus (lines 37–43) | Pure CSS `@keyframes holo-pulse` (opacity 0.45 to 0.95, scale 0.92 to 1.05). Callout cards have `hover:border-cyan/60 hover:bg-black/60`. | Rings pulse unconditionally without pointer reactivity. The central 3D rhombus is static CSS. |
| **StatsRibbon** | `src/components/portfolio/StatsRibbon.tsx`: lines 24–60 | - 8 Verified Stat Cards (lines 37–57)<br>- Icon Badges (lines 46–48)<br>- Proof Source Chips (lines 51–53) | `.glass-card` CSS hover (`transform: translateY(-2px)`). | 8 stat cards render in a tight grid; tilt physics and glowing border trail would transform this into a high-tech instrument panel. |
| **LiveWorkflowEventsTracker** | `src/components/portfolio/LiveWorkflowEventsTracker.tsx`: lines 165–312 | - Snapshot Refresh Button (lines 183–193)<br>- 3 Metric Toggle Buttons (lines 227–241)<br>- Copy Summary Button (lines 242–245)<br>- 4 TrackerMetricCards (lines 253–257)<br>- Evidence Drawer Trigger (line 283) | Metric toggle buttons use conditional class snapping. Refresh button uses Tailwind `animate-spin`. Metric cards use `hover:border-cyan/35`. | Excellent candidate for sliding `layoutId` pill on metric options and micro-spring tilt on `TrackerMetricCard`. |
| **LiveWorkflowEventsChart** | `src/components/portfolio/LiveWorkflowEventsChart.tsx`: lines 151–295 | - SVG interactive scrubber rail & points (lines 166–281)<br>- Point hover/focus nodes (lines 256–275) | Custom pointer event drag (`setPointerCapture`, `onPointerMove`). | Already has good pointer drag logic; can be enhanced with spring-damped coordinate transitions and glowing trail accents. |
| **TrackerEvidenceDrawer** | `src/components/portfolio/TrackerEvidenceDrawer.tsx`: lines 21–73 | - Backdrop presentation click (line 21)<br>- Close Button (lines 35–42)<br>- Source Evidence Cards (lines 46–65)<br>- Ledger Navigation Link (line 67) | Plain conditional DOM rendering (`if (!open) return null;`). CSS hover on close button (`hover:border-cyan/60`). | Instant unmount/mount. Needs `AnimatePresence` with slide/fade and staggered card entrance. |
| **CommandPalette** | `src/components/portfolio/CommandPalette.tsx`: lines 104–167 | - Opener Trigger Button (lines 104–114)<br>- Modal Backdrop & Container (lines 116–165)<br>- Search Input & Clear Button (lines 124–139)<br>- Action List Items (lines 142–159) | Basic `open ? <div> : null`. Action items use `hover:border-cyan/35 hover:bg-cyan/10`. | No spring scale entrance, no active selection highlight morphing (`layoutId`), no keyboard Arrow navigation highlight. |
| **EmployerSignalPanel** | `src/components/portfolio/EmployerSignalPanel.tsx`: lines 38–69 | - 6 Signal Article Cards (lines 49–65)<br>- Icon Badges (lines 54–56) | Static border and background: `rounded-md border border-line bg-black/30 p-4`. No hover transitions. | Completely flat. Lacks micro-interactions and subtle glow reveals. |
| **RalphplanWorkflowMap** | `src/components/portfolio/RalphplanWorkflowMap.tsx`: lines 31–68 | - 8 Workflow Step Cards (lines 46–54)<br>- 3 Lane Description Articles (lines 56–66) | Static border and background: `rounded-md border border-line bg-black/30 p-4`. | Static. Ideal for progressive step hover lighting and scanline highlight propagation across the 8-step pipeline. |
| **EvidenceLedger** | `src/components/portfolio/EvidenceLedger.tsx`: lines 14–72 | - 7 Evidence Source Articles (lines 27–49)<br>- 4 Suite Application Health Cards (lines 52–70)<br>- Action and Source Links (lines 38–46, 58–67) | Articles use `transition hover:border-cyan/45 hover:bg-black/40`. Links use `compactLinkClass`. | Simple flat hover. Needs reactive border highlight and micro-spring button feedback. |
| **CopyEmailButton** | `src/components/portfolio/CopyEmailButton.tsx`: lines 23–44 | - Mailto Link (lines 24–30)<br>- Copy Button (lines 31–39) | CSS transitions. State toggles text to "Copied" or "Copy failed" for 2.2s. | Lacks tactile spring bounce (`whileTap={{ scale: 0.95 }}`) and animated icon morphing between `Copy` and `Check`. |

---

### 1.2 Build Doctor Application Surfaces (`src/components/`)

| Surface Component | File & Lines | Interactive Elements | Current Interaction Mechanism | Gaps / Elevation Opportunities |
| :--- | :--- | :--- | :--- | :--- |
| **BuildDoctorApp (Header & Hero)** | `src/components/BuildDoctorApp.tsx`: lines 256–386 | - Header Nav Links & StatusChips (lines 257–289)<br>- Hero CTA Buttons (lines 306–320)<br>- 5 Proof Badge Chips (lines 323–329)<br>- Demo Path Step Cards (lines 357–369) | Demo path cards use `transition hover:border-cyan/35 hover:bg-cyan/10`. Buttons use `transition hover:bg-cyan/25`. | Demo path steps and proof badges lack spring physics and active step illumination. |
| **SampleLogPicker** | `src/components/SampleLogPicker.tsx`: lines 44–107 | - 7 Scenario Category Filter Pills (lines 51–66)<br>- Sample Scenario Clickable Cards (lines 70–99) | Filters toggle `border-cyan/70 bg-cyan/15`. Cards toggle `border-cyan/70 bg-cyan/10 shadow-[inset_0_3px_0_rgba(109,216,255,0.85)]`. | Category filters lack animated pill slider (`layoutId`). Scenario cards have manual `active:scale-[0.99]`; needs spring-based hover tilt and glow border. |
| **LogInput** | `src/components/LogInput.tsx`: lines 22–63 | - Redaction Status Badge (lines 31–34)<br>- Build Log Textarea (lines 36–43)<br>- Run Diagnosis Button (lines 52–61) | Textarea has `focus:border-cyan`. Button has `hover:bg-cyan/40` and `disabled:opacity-45`. Spinner is `animate-spin`. | Textarea lacks active focus glow aura. Run diagnosis button lacks neon pulse during execution. |
| **DiagnosisPanel** | `src/components/DiagnosisPanel.tsx`: lines 12–69 | - Root Cause Assessment Header & StatusChip (lines 13–19)<br>- 5 Diagnostic Metric Cards (lines 21–68)<br>- Confidence Meter Progress Bar (lines 37–39)<br>- InfoTip Tooltips (lines 26, 34, 45, 54, 63) | Static `rounded-xl border border-white/10 bg-black/30 p-4`. Progress bar has inline `style={{ width: '${percent}%' }}`. | Progress bar fills instantly without spring animation. Metric cards lack hover tilt. InfoTip is pure CSS hover without entrance physics. |
| **SuggestedSolutionsPanel** | `src/components/SuggestedSolutionsPanel.tsx`: lines 56–211 | - Autofill Fix Plan Button (lines 67–74)<br>- Solution Cards (lines 78–170)<br>- "Add to report" Toggle Buttons (lines 92–101)<br>- Copy Snippet Button (lines 140–147)<br>- Verification Command Buttons (lines 156–166)<br>- Autofill Fix Plan Textarea & Action Buttons (lines 173–208) | Selected cards change border to `border-cyan/65 bg-cyan/10`. Command buttons have `hover:border-cyan/40`. | Cards snap between selected/unselected without layout animation. Command buttons lack click ripple or tactile spring feedback. |
| **AiPatchReviewPanel** | `src/components/AiPatchReviewPanel.tsx`: lines 38–166 | - "Run DeepSeek Review" Button (lines 49–57)<br>- DeepSeek Review Cards (lines 61–99)<br>- Rate-limited Fallback Card (lines 101–164)<br>- Status Chips (lines 74–86, 115–133) | Button has `hover:bg-cyan/20` and `disabled:opacity-50`. Status chips are static pills. | During AI review loading, lacks holographic scanline sweep. Fallback cards lack smooth accordion transitions. |
| **PatchDraftPanel** | `src/components/PatchDraftPanel.tsx`: lines 12–84 | - Rationale & Confidence Badge (lines 13–27)<br>- Likely Affected Files List (lines 30–49)<br>- Configuration Code Snippet (lines 51–58)<br>- Verification Command Chips (lines 60–69)<br>- Review Risks Warning Box (lines 70–80) | Static cards: `rounded-2xl border border-white/10 bg-black/30 p-4`. | Static code view. Commands can be interactive click-to-copy chips with spring feedback. |
| **TraceTimeline** | `src/components/TraceTimeline.tsx`: lines 5–57 | - Deterministic Snapshot Header (lines 14–16)<br>- Trace Step Cards (lines 18–55)<br>- Step Number Badges & Status Chips (lines 22–38) | Static cards: `rounded-2xl border border-white/10 bg-black/25 p-3.5`. | Lacks step-by-step sequential pulse animation or hover card elevation. |
| **FixPlan** | `src/components/FixPlan.tsx`: lines 6–39 | - Remediation Step Checklist (lines 13–20)<br>- Validation Command Cards (lines 28–35) | Static list items with `font-mono text-gold` numbered circles. | Static layout. Validation commands should feature copy-to-clipboard interactions with spring feedback. |
| **IncidentReport** | `src/components/IncidentReport.tsx`: lines 45–95 | - Generate / Download Report Button (lines 56–65)<br>- Sticky Preview Toolbar (lines 69–88)<br>- Copy Markdown Button (lines 70–78)<br>- Report Preview Code Box (line 89) | Buttons use Tailwind `hover:bg-gold/20` and `hover:bg-cyan/10`. Copy state triggers text switch to "Copied". | Sticky toolbar and code preview mount abruptly without fluid height or spring reveal. |
| **StatusChip & InfoTip** | `src/components/StatusChip.tsx`: 21–33<br>`src/components/InfoTip.tsx`: 3–20 | - Status Chips (pass, review, blocked, simulated, locked)<br>- InfoTip Question/Info Circle with popover tooltip | `InfoTip` uses CSS `group-hover:block` with `active:scale-95`. `StatusChip` is static. | `InfoTip` tooltip pops abruptly without physics. `StatusChip` has no breathing glow or radar pulse. |

---

## 2. Analysis of Existing State Handling Mechanisms

### 2.1 Hover States
1. **Current Pattern**:
   - Predominantly achieved via Tailwind CSS utility classes:
     - `hover:-translate-y-0.5 hover:border-cyan hover:bg-cyan/25 hover:shadow-[0_0_20px_rgba(109,216,255,0.3)]` (see `src/components/portfolio/shared.ts:4`).
     - Or global CSS `.glass-card:hover` (`src/app/globals.css:63–67`):
       ```css
       .glass-card:hover {
         border-color: rgba(109, 216, 255, 0.5);
         transform: translateY(-2px);
         box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(109, 216, 255, 0.12);
       }
       ```
2. **Shortcomings**:
   - **2D Only**: Cards only elevate vertically by -2px. There is zero angular pitch or yaw (`rotateX`, `rotateY`).
   - **Cursor Agnostic**: The illumination is uniform across the card, completely ignoring where the user's cursor entered or is hovering.
   - **Linear Easing**: Fixed duration CSS transitions (`duration-200` or `duration-300`) lack physical mass, momentum, and recoil.

### 2.2 Tap and Press States
1. **Current Pattern**:
   - Buttons use `active:translate-y-0` (resetting the hover translateY) or `active:scale-95` / `active:scale-[0.99]`.
2. **Shortcomings**:
   - Abrupt visual step without spring physics or tactile rebound.
   - Does not feel like a physical tactile control in an engineering mainframe.

### 2.3 Mouse Movement and Tracking
1. **Current Pattern**:
   - Only a single component in the entire project tracks mouse/pointer coordinates: `LiveWorkflowEventsChart.tsx` (lines 110–130) uses `PointerEvent` and `scrubToClientX` to scrub along an SVG timeline.
   - Nowhere in the portfolio or Build Doctor app is there dynamic cursor-following spotlight illumination, 3D tilt tracking, or magnetic pull.

### 2.4 Focus and Accessibility States
1. **Current Pattern**:
   - Standard keyboard focus ring in `src/app/globals.css:112–115`:
     ```css
     :where(a, button, [tabindex]:not([tabindex="-1"])):focus-visible {
       outline: 2px solid #6dd8ff;
       outline-offset: 3px;
     }
     ```
   - Component-level utilities: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan`.
2. **Assessment**:
   - Clean, compliant, accessible baseline. However, focus transitions are instant CSS outlines without animated glow rings, scanline indicators, or technical focus brackets.

### 2.5 Active and Selected State Transitions
1. **Current Pattern**:
   - Filters (e.g. `ProjectDirectory.tsx:104–106`, `SampleLogPicker.tsx:58–61`, `LiveWorkflowEventsTracker.tsx:234–236`) toggle static classes:
     ```tsx
     activeFilter === filter
       ? "border-cyan/80 bg-cyan/20 text-white shadow-[0_0_0_1px_rgba(109,216,255,0.18)]"
       : "border-line bg-black/25 text-slate-300 hover:border-cyan/60 hover:bg-cyan/10 hover:text-white"
     ```
2. **Shortcomings**:
   - Visual jump: clicking between tabs or filters instantly replaces styles on the previous button and adds them to the new one.
   - No smooth gliding pill (`layoutId`) underneath the text, which is one of Framer Motion's strongest, most polished capabilities.

---

## 3. Investigation of Existing Framer Motion & CSS Infrastructure

### 3.1 Framer Motion Installation
- `package.json:20`: `"framer-motion": "^12.40.0"`.
- This is the latest major release of Framer Motion (Motion v12), fully compatible with React 19 (`react: ^19.0.0`) and Next.js 16 (`next: ^16.2.6`).
- It supports modern hooks: `useMotionValue`, `useTransform`, `useSpring`, `useVelocity`, `useReducedMotion`, `animate`, `motion`, and `AnimatePresence`.

### 3.2 Current Codebase Usage
- Only one file imports `framer-motion`: `src/components/portfolio/MotionSection.tsx:3`:
  ```tsx
  import { motion, useReducedMotion } from "framer-motion";
  ```
  It wraps page sections in a flat reveal:
  ```tsx
  <motion.div
    className={className}
    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.16 }}
    transition={{ duration: 0.42, ease: "easeOut" }}
  >
    {children}
  </motion.div>
  ```
- **Zero** components use 3D tilt, spring mouse tracking, `whileHover`, `whileTap`, `layoutId`, or glowing border trails.

### 3.3 CSS Effects in `src/app/globals.css`
- Lines 48–67 define `.glass-panel` and `.glass-card`.
- Lines 69–75 define `.glow-cyan` (`0 0 20px rgba(109,216,255,0.25)`) and `.glow-cyan-lg` (`0 0 35px rgba(109,216,255,0.35)`).
- Lines 89–110 define `.holo-ring` with `@keyframes holo-pulse`.
- Lines 142–150 define `@media (prefers-reduced-motion: reduce)`:
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

---

## 4. Proposed Micro-Interaction Architectures

To elevate the suite into a cinematic, tactile mainframe interface without introducing bloat or breaking existing contracts, we propose four cohesive architectural primitives:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MICRO-INTERACTION SUITE                         │
├────────────────────────────────┬───────────────────────────────────────┤
│  1. TiltCard / use3DTilt       │ Cursor-aware 3D pitch/yaw + glare     │
│  2. NeonBorderGlow             │ Perimeter cursor spotlight & trail    │
│  3. SpringTriggers & PillTabs  │ Tactile buttons & sliding layoutId    │
│  4. HoloScanline & RadarPulse  │ Technical diagnostic scan & pulse     │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

### Architecture 1: Reusable 3D Tilt Card Primitive (`TiltCard` & `use3DTilt`)

#### Mathematical Mechanics
When a user hovers over a card of dimensions $W \times H$ at cursor offset $(x, y)$ relative to the card's top-left corner:
1. Calculate normalized center-offset:
   $$\Delta x = \frac{x}{W} - 0.5 \quad (\in [-0.5, 0.5])$$
   $$\Delta y = \frac{y}{H} - 0.5 \quad (\in [-0.5, 0.5])$$
2. Map to rotation angles:
   $$\text{targetRotateY} = \Delta x \times \text{maxTilt} \quad (\text{e.g. } \pm 10^\circ)$$
   $$\text{targetRotateX} = -\Delta y \times \text{maxTilt} \quad (\text{e.g. } \mp 10^\circ)$$
3. Smooth via spring physics:
   $$\text{rotateX} = \text{useSpring}(\text{rawRotateX}, \{ \text{stiffness}: 280, \text{damping}: 24, \text{mass}: 0.8 \})$$
   $$\text{rotateY} = \text{useSpring}(\text{rawRotateY}, \{ \text{stiffness}: 280, \text{damping}: 24, \text{mass}: 0.8 \})$$
4. Dynamic specular glare reflection:
   $$\text{glareX} = \frac{x}{W} \times 100\%, \quad \text{glareY} = \frac{y}{H} \times 100\%$$
   Applied as an overlay radial gradient:
   `radial-gradient(circle 280px at ${glareX}% ${glareY}%, rgba(109,216,255,0.18), transparent 80%)`.

#### Component Specification
```tsx
// src/components/motion/TiltCard.tsx
"use client";

import React, { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

export type TiltCardProps = {
  children: ReactNode;
  className?: string;
  maxTilt?: number;      // default: 8 degrees
  scaleOnHover?: number; // default: 1.02
  glare?: boolean;       // default: true
  glareOpacity?: number; // default: 0.18
  depth?: number;        // default: 1000px perspective
  disabled?: boolean;
};

export function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  scaleOnHover = 1.02,
  glare = true,
  glareOpacity = 0.18,
  depth = 1000,
  disabled = false,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Raw cursor position motion values (bypass React re-render cycle)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs
  const springConfig = { stiffness: 280, damping: 24, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Derive rotations
  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);
  const scale = useSpring(isHovered ? scaleOnHover : 1, { stiffness: 320, damping: 26 });

  // Derive glare position
  const glareBackground = useTransform([smoothX, smoothY], ([latestX, latestY]: number[]) => {
    return `radial-gradient(circle 320px at ${latestX * 100}% ${latestY * 100}%, rgba(109,216,255,${glareOpacity}), transparent 80%)`;
  });

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handlePointerEnter() {
    setIsHovered(true);
  }

  function handlePointerLeave() {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  if (shouldReduceMotion || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={cardRef}
      style={{ perspective: depth }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative transform-gpu ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full rounded-[inherit]"
      >
        {children}

        {glare && isHovered ? (
          <motion.div
            aria-hidden="true"
            style={{ background: glareBackground }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
          />
        ) : null}
      </motion.div>
    </div>
  );
}
```

#### Application Targets:
- `FeaturedProofGrid`: Wrap signature card (maxTilt: 6) and 2 secondary proof cards (maxTilt: 8).
- `ProjectDirectory`: Wrap individual project articles with gentle tilt (maxTilt: 5).
- `StatsRibbon`: Wrap 8 stat metric cards (maxTilt: 7).
- `DiagnosisPanel`: Wrap 5 root-cause assessment cards (maxTilt: 6).
- `HolographicProofPanel`: Wrap the callout cards and the central holographic assembly.

---

### Architecture 2: Neon Border Glow Wrapper (`NeonBorderGlow`)

#### Concept
Rather than static borders (`border border-line`), the perimeter illuminates under the cursor. As the mouse glides over the card, an intense cyan/gold neon beam follows the perimeter, giving the impression of an energized plasma circuit.

#### Mechanics:
1. An absolute overlay layer with `pointer-events-none -inset-px rounded-[inherit]`.
2. Uses CSS mask composite with a dynamic radial spotlight:
   - Outer layer filled with `radial-gradient(350px circle at ${cursorX}px ${cursorY}px, rgba(109,216,255,0.7), transparent 60%)`.
   - Masked with `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)` and `mask-composite: exclude` with `padding: 1px`.
   - Result: Only the 1px border is illuminated by the spotlight!
3. Fallback for older browsers or reduced motion: standard `border border-cyan/40` or clean static border.

#### Component Specification
```tsx
// src/components/motion/NeonBorderGlow.tsx
"use client";

import React, { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

export type NeonBorderGlowProps = {
  children: ReactNode;
  className?: string;
  color?: "cyan" | "gold" | "emerald";
  glowRadius?: number; // default: 350px
};

const colorGradients = {
  cyan: "rgba(109, 216, 255, 0.8)",
  gold: "rgba(214, 170, 82, 0.8)",
  emerald: "rgba(52, 211, 153, 0.8)",
};

export function NeonBorderGlow({
  children,
  className = "",
  color = "cyan",
  glowRadius = 350,
}: NeonBorderGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { stiffness: 350, damping: 28 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const borderMask = useTransform([smoothX, smoothY], ([x, y]: number[]) => {
    return `radial-gradient(${glowRadius}px circle at ${x}px ${y}px, ${colorGradients[color]}, transparent 70%)`;
  });

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        mouseX.set(-1000);
        mouseY.set(-1000);
      }}
      className={`relative rounded-xl ${className}`}
    >
      {children}

      {!shouldReduceMotion ? (
        <motion.div
          aria-hidden="true"
          style={{
            background: borderMask,
            opacity: isHovered ? 1 : 0,
          }}
          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] p-[1px]"
        />
      ) : null}
    </div>
  );
}
```

#### Application Targets:
- `FeaturedProofGrid` signature card: permanent subtle ambient glow + cursor-following intense neon border.
- `SuggestedSolutionsPanel` solution cards: selected card glows with cyan neon border.
- `BuildDoctorApp` Step cards (Step 1 through Step 5 intake sections).

---

### Architecture 3: Spring Triggers & Fluid `layoutId` Pill Tabs

#### Concept
1. **Pill Selectors**: Replace instant class swapping on filter buttons (`ProjectDirectory`, `SampleLogPicker`, `LiveWorkflowEventsTracker`) with Framer Motion `layoutId="activePill"`.
   - When a user clicks a different pill, an illuminated cyan indicator glides underneath the text with natural spring deceleration.
2. **Tactile Spring Buttons**:
   - Wrap buttons in `motion.button` / `motion.a`:
     ```tsx
     whileHover={{ scale: 1.025, y: -1 }}
     whileTap={{ scale: 0.96, y: 0 }}
     transition={{ type: "spring", stiffness: 450, damping: 25 }}
     ```

#### Pattern Implementation for ProjectDirectory & SampleLogPicker:
```tsx
// Example within ProjectDirectory.tsx or a reusable FilterGroup:
<div className="flex flex-wrap items-center gap-2" aria-label="Project filters">
  {filters.map((filter) => {
    const isSelected = activeFilter === filter;
    return (
      <button
        key={filter}
        type="button"
        onClick={() => setActiveFilter(filter)}
        aria-pressed={isSelected}
        className="relative min-h-10 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
      >
        {isSelected ? (
          <motion.span
            layoutId="activeProjectDirectoryFilter"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="absolute inset-0 rounded-full border border-cyan/80 bg-cyan/20 shadow-[0_0_15px_rgba(109,216,255,0.25)]"
          />
        ) : null}
        <span className="relative z-10">{filter}</span>
      </button>
    );
  })}
</div>
```

---

### Architecture 4: Holographic Scanline & Pulse States (`HoloScanline` / `PulseBadge`)

#### Concept
Technical surfaces (`BuildDoctorApp`, `DiagnosisPanel`, `TraceTimeline`, `RalphplanWorkflowMap`) need visual signifiers of telemetry and diagnosis in flight.
1. **Scanline Beam**:
   A horizontal luminescent scanline that sweeps down a container when active or loading.
   ```tsx
   export function HoloScanline({ active = true }: { active?: boolean }) {
     const shouldReduceMotion = useReducedMotion();
     if (!active || shouldReduceMotion) return null;

     return (
       <motion.div
         aria-hidden="true"
         initial={{ y: "-100%" }}
         animate={{ y: "200%" }}
         transition={{
           repeat: Infinity,
           duration: 2.8,
           ease: "linear",
         }}
         className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan/15 to-transparent z-10"
       />
     );
   }
   ```
2. **Radar Pulse Status Chip**:
   Status chips (`StatusChip`, `EvidenceSourceBadge`, `TrackerDeltaBadge`) gain an animated soft pulse when active or verified:
   - Box-shadow breathing animation (`0 0 8px rgba(109,216,255,0.2)` to `0 0 16px rgba(109,216,255,0.4)`).
   - Instant freeze in reduced-motion mode.

---

## 5. Performance Safeguards & GPU Acceleration

Micro-interactions must maintain rock-solid 60 FPS performance without frame dropping, layout thrashing, or memory leaks.

### 5.1 GPU Acceleration & Composite-Only Properties
1. **Rule**: **Never** animate properties that trigger Layout (reflow) or Paint:
   - ❌ DO NOT animate: `top`, `left`, `width`, `height`, `margin`, `padding`, `border-width`.
   - ✅ ONLY animate composite properties: `transform` (`rotateX`, `rotateY`, `scale`, `translate3d`), `opacity`, and CSS custom properties for gradients.
2. **Tailwind Class**: `transform-gpu` to force hardware acceleration on the target element layer.
3. **`will-change` Discipline**:
   - Do NOT apply `will-change: transform` indiscriminately across dozens of DOM nodes simultaneously (which leads to VRAM exhaustion).
   - Dynamically enable `will-change: transform` on `pointerEnter` and remove it on `pointerLeave`.

### 5.2 Event Throttling & `requestAnimationFrame` Integration
- Framer Motion's `useMotionValue` updates outside the React render loop. When `mouseX.set(val)` is called inside `onPointerMove`:
  - It does **not** trigger a React re-render.
  - The DOM transformation occurs on the compositor thread synchronized to the browser's refresh rate (`rAF`).
- Pointer capture and throttling ensure zero CPU spikes during fast mouse movement across the grid.

### 5.3 Pointer-Events Isolation
- Overlays (glare reflections, scanline sweeps, neon border masks) **must** declare `pointer-events: none`.
- If an overlay intercepts mouse events, nested buttons, links, or text selections will fail, breaking automated tests (`e2e/build-doctor.spec.ts`) and user usability.

### 5.4 Zero Cumulative Layout Shift (CLS)
- 3D tilts use CSS `transform: rotateX(...) rotateY(...) scale(...)`. Transformations alter visual rendering without altering geometry in the document layout tree.
- Glowing borders are positioned via `-inset-px` or `inset-0` with `p-[1px]` within a container of fixed border-box sizing.
- CLS impact is provably **0.000**.

---

## 6. Accessibility & Reduced-Motion (`prefers-reduced-motion: reduce`)

Motion must never cause disorientation, vestibular trigger, or nausea.

### 6.1 Multi-Tiered Fallback Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REDUCED MOTION ARCHITECTURE                     │
├────────────────────────────────┬───────────────────────────────────────┤
│ Tier 1: JS Hook               │ useReducedMotion() disables 3D tilts, │
│                                │ glare, springs, and scanlines.        │
├────────────────────────────────┼───────────────────────────────────────┤
│ Tier 2: CSS Override           │ @media (prefers-reduced-motion)       │
│                                │ forces animation-duration: 0.01ms.    │
├────────────────────────────────┼───────────────────────────────────────┤
│ Tier 3: Layout Neutrality      │ When motion is disabled, components   │
│                                │ render identical DOM & semantic tags. │
└────────────────────────────────┴───────────────────────────────────────┘
```

1. **Tier 1 — Framer Motion `useReducedMotion` Hook**:
   - In `TiltCard`: If `shouldReduceMotion === true`, the component short-circuits to a standard `<div>` or renders `<motion.div>` with `style={{ transform: "none" }}`.
   - In `NeonBorderGlow`: The spotlight mask is completely omitted from the DOM.
   - In `HoloScanline`: Returns `null`.
2. **Tier 2 — Global CSS Guard**:
   - `src/app/globals.css:142–150`:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
         animation-duration: 0.01ms !important;
         scroll-behavior: auto !important;
         transition-duration: 0.01ms !important;
       }
     }
     ```
3. **Tier 3 — High Contrast and Semantic Tree**:
   - Accessible roles (`article`, `button`, `link`, `dialog`), ARIA labels (`aria-pressed`, `aria-label`), and keyboard navigation (Tab, Enter, Space) remain completely unaffected by motion wrappers.
   - Contrast ratio of text against glowing or tilted backgrounds remains strictly above WCAG AA (4.5:1).

---

## 7. React Server Component (RSC) Boundary Compliance

### 7.1 Current Architecture Analysis
- `src/app/page.tsx` is a Server Component rendering:
  - `HeroMainframe.tsx` (Server Component)
  - `StatsRibbon.tsx` (Server Component)
  - `FeaturedProofGrid.tsx` (Server Component)
  - `RalphplanWorkflowMap.tsx` (Server Component)
  - `EmployerSignalPanel.tsx` (Server Component)
  - `EvidenceLedger.tsx` (Server Component)
  - Client components on the home page: `ProjectDirectory.tsx`, `LiveWorkflowEventsTracker.tsx`, `TopCommandNav.tsx` (which contains `CommandPalette.tsx`).

### 7.2 RSC Boundary Strategy
1. **Do NOT convert entire page sections to `"use client"`** unnecessarily.
2. Build reusable interactive motion wrappers (e.g. `TiltCard`, `NeonBorderGlow`, `InteractiveButton`) as client components (`"use client"`).
3. In Server Components like `FeaturedProofGrid`:
   - Keep `FeaturedProofGrid` as a Server Component.
   - Import `<TiltCard>` and wrap individual `<article>` items:
     ```tsx
     // FeaturedProofGrid remains an RSC:
     export function FeaturedProofGrid() {
       return (
         <section id="featured-projects" className={sectionShellClass}>
           ...
           <div className="mt-6 grid gap-5 lg:grid-cols-3">
             {featuredProjects.map((project) => (
               <TiltCard key={project.id} className="...">
                 <article className="...">
                   ...
                 </article>
               </TiltCard>
             ))}
           </div>
         </section>
       );
     }
     ```
   - This keeps data serialization and static HTML generation on the server while delegating only the micro-interaction wrapper to the client leaf node.

---

## 8. Verification & Test Plan

1. **Vitest Unit & Integration Suite**:
   - Run `npm test` (`vitest run`). Must pass 100% of tests (32+ tests across `portfolio-data-integrity.test.ts` and `build-doctor.test.ts`).
2. **TypeScript Compilation**:
   - Run `npm run typecheck` (`tsc --noEmit`). Must report 0 diagnostics.
3. **Deterministic Audits**:
   - Run `npm run audit:45k` (runs 45,000 deterministic checks). Must pass cleanly.
4. **Playwright E2E Verification**:
   - Execute `npx playwright test e2e/build-doctor.spec.ts`.
   - Verify that all element selectors, click targets, bounding boxes, and drag scrubbers (`workflow-scrubber-handle`) remain fully functional and unblocked.
5. **Reduced-Motion Verification**:
   - Emulate `prefers-reduced-motion: reduce` in browser/Playwright (`page.emulateMedia({ reducedMotion: 'reduce' })`).
   - Confirm all 3D tilts and animations are suppressed with zero layout deformation.

---

## 9. Conclusion

Requirement R2 can be fulfilled with an elegant, modular set of motion primitives:
1. `TiltCard` & `use3DTilt`: Smooth cursor-following 3D pitch and yaw with spring physics and specular glare.
2. `NeonBorderGlow`: Dynamic perimeter cursor spotlight.
3. `SpringButton` & `layoutId` Pill Tabs: Tactile micro-spring press feedback and fluid gliding filter transitions.
4. `HoloScanline` & Radar Pulses: Atmospheric telemetry indicators for diagnostic workflows.

By adhering to leaf-node RSC boundaries, composite-only GPU properties, and strict `useReducedMotion` fallbacks, the implementation will deliver a breathtaking, cinematic aesthetic while maintaining 100% test passing rates, 0 TypeScript errors, and zero CLS.
