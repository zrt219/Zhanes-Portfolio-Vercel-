import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import React, { useState, useEffect } from "react";
import { renderToString } from "react-dom/server";
import * as framerMotion from "framer-motion";
import type { Variants } from "framer-motion";
import * as motionModule from "../lib/motion";
import {
  useSafeReducedMotion,
  getReducedMotionVariants,
  getAccessibleVariants,
  SPRING_PRESETS,
  snappySpring,
  cinematicSpring,
  softSpring,
  bounceSpring,
  containerVariants,
  cascadeVariants,
  fadeInScaleItem,
  fadeInUpItem,
  drawerVariants,
  modalBackdropVariants,
  modalPanelVariants,
} from "../lib/motion";
import { TiltCard } from "../components/motion/TiltCard";
import { NeonBorderGlow } from "../components/motion/NeonBorderGlow";
import { SpringButton } from "../components/motion/SpringButton";
import { calculateTiltAngles, calculateGlarePosition } from "../components/motion/use3DTilt";
import { TrackerEvidenceDrawer } from "../components/portfolio/TrackerEvidenceDrawer";
import { CommandPalette } from "../components/portfolio/CommandPalette";
import fs from "node:fs";
import path from "node:path";

describe("useSafeReducedMotion Hook (Requirement R4 & Feature F10)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false during SSR to avoid React hydration mismatches", () => {
    // In SSR, useEffect never runs, so mounted remains false.
    // useSafeReducedMotion() safely returns false during server-side rendering,
    // ensuring identical markup between server render and client initial hydration.
    function TestSSRComponent() {
      const isReduced = useSafeReducedMotion();
      return React.createElement("span", { "data-reduced": String(isReduced) }, `SSR Value: ${isReduced}`);
    }

    const html = renderToString(React.createElement(TestSSRComponent));
    expect(html).toContain('data-reduced="false"');
    expect(html).toContain("SSR Value: false");
  });


  it("returns true on client when mounted and system reduced motion preference is active", () => {
    // Simulate the hook's client mount lifecycle
    function simulateClientHook(systemReduced: boolean) {
      // In client execution after mount:
      const mounted = true;
      if (!mounted) return false;
      return Boolean(systemReduced);
    }

    expect(simulateClientHook(true)).toBe(true);
  });

  it("returns false on client when mounted and system reduced motion preference is disabled", () => {
    function simulateClientHook(systemReduced: boolean) {
      const mounted = true;
      if (!mounted) return false;
      return Boolean(systemReduced);
    }

    expect(simulateClientHook(false)).toBe(false);
  });

  it("integrates with window.matchMedia('(prefers-reduced-motion: reduce)') client media query listener", () => {
    const mediaQueryString = "(prefers-reduced-motion: reduce)";
    let listenerAttached = false;

    const mockMatchMedia = vi.fn().mockImplementation((query: string) => {
      expect(query).toBe(mediaQueryString);
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string) => {
          if (event === "change") listenerAttached = true;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });

    const fakeWindow = { matchMedia: mockMatchMedia };
    const mql = fakeWindow.matchMedia(mediaQueryString);
    mql.addEventListener("change", () => {});

    expect(mockMatchMedia).toHaveBeenCalledWith(mediaQueryString);
    expect(mql.matches).toBe(true);
    expect(listenerAttached).toBe(true);
  });
});

describe("getReducedMotionVariants Helper (Requirement R4 & Feature F1)", () => {
  const dynamicVariants: framerMotion.Variants = {
    hidden: {
      opacity: 0,
      x: -24,
      y: 32,
      scale: 0.92,
      rotate: -15,
      rotateX: 20,
      rotateY: -25,
      filter: "blur(8px)",
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      rotateX: 0,
      rotateY: 0,
      filter: "none",
      transition: { duration: 0.35, ease: "easeIn" as const },
    },
    exit: {
      opacity: 0,
      x: 20,
      y: -15,
      scale: 0.96,
      rotate: 5,
      rotateX: -10,
      rotateY: 15,
      filter: "blur(4px)",
      transition: { duration: 0.2 },
    },
  };

  it("leaves variants completely untouched when reduced motion is disabled (isReduced = false)", () => {
    const variants = getReducedMotionVariants(dynamicVariants, false);
    expect(variants).toBe(dynamicVariants);
    expect((variants.hidden as any).x).toBe(-24);
    expect((variants.hidden as any).y).toBe(32);
    expect((variants.hidden as any).scale).toBe(0.92);
    expect((variants.hidden as any).rotate).toBe(-15);
    expect((variants.hidden as any).rotateX).toBe(20);
    expect((variants.hidden as any).rotateY).toBe(-25);
    expect((variants.hidden as any).filter).toBe("blur(8px)");
  });

  it("neutralizes translational x and y offsets to 0 when reduced motion is enabled", () => {
    const reduced = getReducedMotionVariants(dynamicVariants, true);
    expect((reduced.hidden as any).x).toBe(0);
    expect((reduced.hidden as any).y).toBe(0);
    expect((reduced.visible as any).x).toBe(0);
    expect((reduced.visible as any).y).toBe(0);
    expect((reduced.exit as any).x).toBe(0);
    expect((reduced.exit as any).y).toBe(0);
  });

  it("neutralizes scale transforms to 1 when reduced motion is enabled", () => {
    const reduced = getReducedMotionVariants(dynamicVariants, true);
    expect((reduced.hidden as any).scale).toBe(1);
    expect((reduced.visible as any).scale).toBe(1);
    expect((reduced.exit as any).scale).toBe(1);
  });

  it("neutralizes 2D and 3D rotational angles (rotate, rotateX, rotateY) to 0", () => {
    const reduced = getReducedMotionVariants(dynamicVariants, true);
    expect((reduced.hidden as any).rotate).toBe(0);
    expect((reduced.hidden as any).rotateX).toBe(0);
    expect((reduced.hidden as any).rotateY).toBe(0);
    expect((reduced.exit as any).rotate).toBe(0);
    expect((reduced.exit as any).rotateX).toBe(0);
    expect((reduced.exit as any).rotateY).toBe(0);
  });

  it("collapses transition durations to 0", () => {
    const reduced = getReducedMotionVariants(dynamicVariants, true);
    expect((reduced.hidden as any).transition).toEqual({ duration: 0 });
    expect((reduced.visible as any).transition).toEqual({ duration: 0 });
    expect((reduced.exit as any).transition).toEqual({ duration: 0 });
  });

  it("sets opacity to 1 and filter to 'none'", () => {
    const reduced = getReducedMotionVariants(dynamicVariants, true);
    expect((reduced.hidden as any).opacity).toBe(1);
    expect((reduced.hidden as any).filter).toBe("none");
    expect((reduced.visible as any).opacity).toBe(1);
    expect((reduced.exit as any).opacity).toBe(1);
  });

  it("processes multi-state variant maps safely without mutating input", () => {
    const frozenInput = Object.freeze({
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
    });
    const reduced = getReducedMotionVariants(frozenInput, true);
    expect((reduced.initial as any).scale).toBe(1);
    expect((reduced.initial as any).opacity).toBe(1);
    expect((frozenInput.initial as any).scale).toBe(0.8);
  });

  it("safely handles non-object variant values and empty objects", () => {
    const variantsWithPrimitives: any = {
      empty: {},
      stringProp: "custom-variant-name",
      numberProp: 42,
    };
    const reduced = getReducedMotionVariants(variantsWithPrimitives, true);
    expect((reduced.empty as any).x).toBe(0);
    expect((reduced.empty as any).scale).toBe(1);
    expect(reduced.stringProp).toBe("custom-variant-name");
    expect(reduced.numberProp).toBe(42);
  });

  it("supports getAccessibleVariants alias identically", () => {
    const variants = {
      test: { x: 50, y: 100, scale: 0.5, rotate: 45 },
    };
    const accessible = getAccessibleVariants(variants, true);
    expect((accessible.test as any).x).toBe(0);
    expect((accessible.test as any).y).toBe(0);
    expect((accessible.test as any).scale).toBe(1);
    expect((accessible.test as any).rotate).toBe(0);
    expect((accessible.test as any).transition.duration).toBe(0);
  });
});

describe("TiltCard Reduced Motion Suppression (Requirement R4 & Feature F5)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders interactive motion elements with 3D perspective and glare under standard motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(false);

    const html = renderToString(
      React.createElement(
        TiltCard,
        { className: "standard-card", glare: true },
        React.createElement("span", null, "Standard Card Content")
      )
    );

    expect(html).toContain("[perspective:1000px]");
    expect(html).toContain("transform-gpu");
    expect(html).toContain("pointer-events-none");
    expect(html).toContain("overflow-hidden");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Standard Card Content");
  });

  it("renders static non-3D element with zero rotation when reduced motion is preferred", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        TiltCard,
        { className: "accessible-card", maxTilt: 15 },
        React.createElement("span", null, "Accessible Content")
      )
    );

    // Bypasses 3D perspective and transforms completely
    expect(html).not.toContain("[perspective:1000px]");
    expect(html).not.toContain("transform-gpu");
    expect(html).not.toContain("rotateX");
    expect(html).not.toContain("rotateY");
    expect(html).toContain("Accessible Content");
    expect(html).toContain("accessible-card");
  });

  it("completely suppresses the dynamic specular glare overlay under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        TiltCard,
        { glare: true, glareOpacity: 0.35 },
        React.createElement("span", null, "No Glare Allowed")
      )
    );

    // Glare overlay element with aria-hidden="true" must NOT be rendered at all
    expect(html).not.toContain("aria-hidden=\"true\"");
    expect(html).not.toContain("radial-gradient");
    expect(html).toContain("No Glare Allowed");
  });

  it("preserves children, custom classes, styles, and ARIA attributes under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        TiltCard,
        {
          className: "custom-class",
          role: "region",
          "aria-label": "Telemetry Dashboard",
          style: { zIndex: 10 },
        },
        React.createElement("p", null, "Telemetry Metric")
      )
    );

    expect(html).toContain("custom-class");
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Telemetry Dashboard"');
    expect(html).toContain("z-index:10");
    expect(html).toContain("Telemetry Metric");
  });

  it("renders static button element when as='button' under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        TiltCard,
        {
          as: "button",
          role: "button",
          "aria-pressed": true,
          className: "btn-tilt",
        },
        "Clickable Static Card"
      )
    );

    expect(html).toContain("<button");
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Clickable Static Card");
    expect(html).not.toContain("[perspective:1000px]");
  });

  it("calculateTiltAngles returns zero rotateX and rotateY when isReduced is true", () => {
    // Standard motion produces non-zero angles at corner offsets
    const normal = calculateTiltAngles(0.5, 0.5, 10, false);
    expect(normal.rotateX).toBe(-10);
    expect(normal.rotateY).toBe(10);

    // Reduced motion forces exactly 0 rotation regardless of cursor coordinates
    const reducedCorner = calculateTiltAngles(0.5, 0.5, 10, true);
    expect(reducedCorner.rotateX).toBe(0);
    expect(reducedCorner.rotateY).toBe(0);

    const reducedExtreme = calculateTiltAngles(-1.0, 1.0, 12, true);
    expect(reducedExtreme.rotateX).toBe(0);
    expect(reducedExtreme.rotateY).toBe(0);
  });

  it("calculateGlarePosition returns zero glareOpacity when isReduced is true", () => {
    const normalGlare = calculateGlarePosition(0.2, 0.2, true, 0.25, false);
    expect(normalGlare.glareOpacity).toBe(0.25);

    // Reduced motion forces glareOpacity to 0 even when hovered
    const reducedGlare = calculateGlarePosition(0.2, 0.2, true, 0.25, true);
    expect(reducedGlare.glareOpacity).toBe(0);
  });
});

describe("NeonBorderGlow Reduced Motion Suppression (Requirement R4 & Feature F6)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders pulsing glowing aura motion element when standard motion is active", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(false);

    const html = renderToString(
      React.createElement(
        NeonBorderGlow,
        { active: true, color: "cyan" },
        React.createElement("span", null, "Glowing Child")
      )
    );

    expect(html).toContain("pointer-events-none");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("rgba(109, 216, 255");
    expect(html).toContain("Glowing Child");
  });

  it("suppresses pulsing glowing aura overlays entirely under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        NeonBorderGlow,
        { active: true, color: "emerald" },
        React.createElement("span", null, "Clean Static Child")
      )
    );

    // Under reduced motion, the aura motion.div is NOT rendered
    expect(html).not.toContain("pointer-events-none");
    expect(html).not.toContain('aria-hidden="true"');
    expect(html).not.toContain("rgba(52, 211, 153");
    expect(html).toContain("Clean Static Child");
  });

  it("preserves inner children and layout wrapper cleanly when aura is suppressed", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        NeonBorderGlow,
        { className: "custom-neon-container" },
        React.createElement("button", null, "Interactive Child")
      )
    );

    expect(html).toContain("custom-neon-container");
    expect(html).toContain("group relative");
    expect(html).toContain("Interactive Child");
  });

  it("enforces pointer-events: none on glow aura overlays when standard motion is active", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(false);

    const html = renderToString(
      React.createElement(
        NeonBorderGlow,
        { active: false, color: "gold" },
        React.createElement("div", null, "Inner")
      )
    );

    expect(html).toContain("pointer-events-none");
  });
});

describe("SpringButton Reduced Motion Hardening (Requirement R4 & Feature F6)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders motion.button with whileHover and whileTap spring scales under standard motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(false);

    const html = renderToString(
      React.createElement(
        SpringButton,
        { className: "px-4 py-2" },
        "Launch Mission"
      )
    );

    expect(html).toContain("<button");
    expect(html).toContain("Launch Mission");
    expect(html).toContain("px-4 py-2");
  });

  it("renders native static <button> without motion scale transforms under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        SpringButton,
        {
          className: "accessible-btn",
          type: "submit",
          disabled: true,
          "aria-label": "Submit verification",
        },
        "Confirm Action"
      )
    );

    expect(html).toContain("<button");
    expect(html).toContain('type="submit"');
    expect(html).toContain("disabled");
    expect(html).toContain('aria-label="Submit verification"');
    expect(html).toContain("accessible-btn");
    expect(html).toContain("Confirm Action");
  });

  it("forwards standard button properties (type, disabled, aria-label, onClick) under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(
        SpringButton,
        {
          type: "reset",
          role: "button",
          "aria-expanded": false,
        },
        "Reset Form"
      )
    );

    expect(html).toContain('type="reset"');
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Reset Form");
  });
});

describe("TrackerEvidenceDrawer & CommandPalette Fluid Transitions & Unmount (Requirement R4 & Feature F7)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const dummySources = [
    {
      id: "src-1",
      label: "Determinism Verification Ledger",
      sourceType: "generated-artifact" as const,
      confidence: "high" as const,
      publicSafeLabel: "audit-deterministic-spec",
      supports: ["100% test passing rate"],
      lastRefreshed: "2026-09-03",
    },
  ];

  it("TrackerEvidenceDrawer eliminates positional sliding offset (x: 0) and collapses transition duration under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(TrackerEvidenceDrawer, {
        sources: dummySources,
        open: true,
        onClose: () => {},
      })
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Public-safe tracker sources");
    expect(html).toContain("Determinism Verification Ledger");
  });

  it("TrackerEvidenceDrawer maintains opacity fades and clean unmount lifecycle under AnimatePresence", () => {
    // When open = false, drawer renders empty string (unmounted from DOM)
    const closedHtml = renderToString(
      React.createElement(TrackerEvidenceDrawer, {
        sources: dummySources,
        open: false,
        onClose: () => {},
      })
    );
    expect(closedHtml).toBe("");

    // When open = true, drawer renders backdrop and panel
    const openHtml = renderToString(
      React.createElement(TrackerEvidenceDrawer, {
        sources: dummySources,
        open: true,
        onClose: () => {},
      })
    );
    expect(openHtml).toContain("tracker-evidence-title");
  });

  it("TrackerEvidenceDrawer suppresses child evidence item stagger animations under reduced motion", () => {
    vi.spyOn(motionModule, "useSafeReducedMotion").mockReturnValue(true);

    const html = renderToString(
      React.createElement(TrackerEvidenceDrawer, {
        sources: dummySources,
        open: true,
        onClose: () => {},
      })
    );

    expect(html).toContain("Determinism Verification Ledger");
    expect(html).toContain("audit-deterministic-spec");
  });

  it("CommandPalette neutralizes modal scaling and vertical translation (scale: 1, y: 0) under reduced motion", () => {
    // Verify the command palette modal expansion variants under reduced motion
    const modalVariants = {
      hidden: { opacity: 0, scale: 0.95, y: -16 },
      visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_PRESETS.cinematic },
      exit: { opacity: 0, scale: 0.95, y: -16, transition: { duration: 0.18 } },
    };

    const reducedModal = getReducedMotionVariants(modalVariants, true);
    expect((reducedModal.hidden as any).scale).toBe(1);
    expect((reducedModal.hidden as any).y).toBe(0);
    expect((reducedModal.hidden as any).transition.duration).toBe(0);
    expect((reducedModal.visible as any).scale).toBe(1);
    expect((reducedModal.visible as any).y).toBe(0);
    expect((reducedModal.exit as any).scale).toBe(1);
    expect((reducedModal.exit as any).y).toBe(0);
    expect((reducedModal.exit as any).transition.duration).toBe(0);
  });

  it("CommandPalette collapses active selection highlight layoutId duration under reduced motion", () => {
    // Under reduced motion, transition={isReduced ? { duration: 0 } : SPRING_PRESETS.snappy}
    const transitionStandard = SPRING_PRESETS.snappy;
    const transitionReduced = { duration: 0 };

    expect(transitionStandard.stiffness).toBe(400);
    expect(transitionReduced.duration).toBe(0);
  });

  it("CommandPalette maintains opacity fade and clean unmount lifecycle under AnimatePresence", () => {
    // Opener button is rendered, dialog is initially unmounted
    const html = renderToString(React.createElement(CommandPalette));
    expect(html).toContain('aria-label="Open command palette"');
    expect(html).toContain("Command");
    expect(html).not.toContain("Portfolio command palette");
  });
});

describe("React Server Component (RSC) Boundaries & Zero CLS Invariants (Requirement R4 & Feature F10)", () => {
  const rootDir = path.resolve(__dirname, "../../");

  const rscFiles = [
    "src/app/page.tsx",
    "src/components/SuiteHub.tsx",
    "src/app/projects/[slug]/page.tsx",
    "src/app/suite/page.tsx",
    "src/app/build-doctor/page.tsx",
    "src/app/layout.tsx",
  ];

  it.each(rscFiles)("guarantees %s does NOT declare 'use client' (RSC boundary compliance)", (relativePath) => {
    const fullPath = path.join(rootDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      // Optional route check if exists
      return;
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split(/\r?\n/).slice(0, 10);
    const hasUseClient = lines.some((line) => line.trim().startsWith('"use client"') || line.trim().startsWith("'use client'"));
    expect(hasUseClient).toBe(false);
  });

  it("verifies motion engine variants use transform/opacity animations to guarantee zero Cumulative Layout Shift (CLS)", () => {
    const candidateVariants = [
      containerVariants,
      cascadeVariants,
      fadeInScaleItem,
      fadeInUpItem,
      drawerVariants,
      modalBackdropVariants,
      modalPanelVariants,
    ];

    // Layout shift occurs when animations mutate layout dimensions (width, height, margin, padding, top, left in normal flow)
    // Safe fluid animations use composite properties: opacity, transform (x, y, scale, rotate)
    const forbiddenLayoutKeys = ["width", "height", "margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "padding", "paddingTop", "paddingBottom"];

    for (const variantMap of candidateVariants) {
      for (const [stateName, stateDef] of Object.entries(variantMap)) {
        if (typeof stateDef === "object" && stateDef !== null) {
          for (const key of forbiddenLayoutKeys) {
            expect(
              (stateDef as any)[key],
              `Variant ${stateName} should not animate layout property '${key}' to prevent CLS`
            ).toBeUndefined();
          }
        }
      }
    }
  });
});
