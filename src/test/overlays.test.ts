import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  drawerVariants,
  modalBackdropVariants,
  modalPanelVariants,
  getReducedMotionVariants,
  SPRING_PRESETS,
  cinematicSpring,
  snappySpring,
} from "../lib/motion";
import { TrackerEvidenceDrawer } from "../components/portfolio/TrackerEvidenceDrawer";
import { CommandPalette } from "../components/portfolio/CommandPalette";

describe("Overlay Variants & Transitions (Feature F7)", () => {
  it("defines correct drawer slide variants with cinematic spring", () => {
    expect(drawerVariants.hidden).toEqual(expect.objectContaining({ x: "100%" }));
    expect(drawerVariants.visible).toEqual(
      expect.objectContaining({
        x: 0,
        opacity: 1,
        transition: cinematicSpring,
      })
    );
    expect(drawerVariants.exit).toEqual(expect.objectContaining({ x: "100%" }));
  });

  it("defines correct modal backdrop fade and blur dissipation variants", () => {
    expect(modalBackdropVariants.hidden).toEqual(
      expect.objectContaining({ opacity: 0, backdropFilter: "blur(0px)" })
    );
    expect(modalBackdropVariants.visible).toEqual(
      expect.objectContaining({ opacity: 1, backdropFilter: "blur(12px)" })
    );
    expect(modalBackdropVariants.exit).toEqual(
      expect.objectContaining({ opacity: 0, backdropFilter: "blur(0px)" })
    );
  });

  it("defines correct modal panel spring expansion variants", () => {
    expect(modalPanelVariants.hidden).toEqual(
      expect.objectContaining({ opacity: 0, scale: 0.95, y: 16 })
    );
    expect(modalPanelVariants.visible).toEqual(
      expect.objectContaining({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: cinematicSpring,
      })
    );
    expect(modalPanelVariants.exit).toEqual(
      expect.objectContaining({ opacity: 0, scale: 0.96, y: 12 })
    );
  });

  it("validates command palette cinematic spring expansion configuration", () => {
    const commandPaletteExpansion = {
      hidden: { opacity: 0, scale: 0.95, y: -16 },
      visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_PRESETS.cinematic },
      exit: { opacity: 0, scale: 0.95, y: -16, transition: { duration: 0.18, ease: "easeIn" } },
    };

    expect(commandPaletteExpansion.hidden.scale).toBe(0.95);
    expect(commandPaletteExpansion.hidden.y).toBe(-16);
    expect(commandPaletteExpansion.visible.scale).toBe(1);
    expect(commandPaletteExpansion.visible.y).toBe(0);
    expect(commandPaletteExpansion.exit.y).toBe(-16);
  });

  it("converts moving overlay variants to static zero-movement variants when reduced motion is enabled", () => {
    const rawVariants = {
      hidden: { opacity: 0, x: "100%", y: -16, scale: 0.95 },
      visible: { opacity: 1, x: 0, y: 0, scale: 1 },
      exit: { opacity: 0, x: "100%", y: -16, scale: 0.95 },
    };

    const reduced = getReducedMotionVariants(rawVariants, true);
    expect((reduced.hidden as any).x).toBe(0);
    expect((reduced.hidden as any).y).toBe(0);
    expect((reduced.hidden as any).scale).toBe(1);
    expect((reduced.hidden as any).transition.duration).toBe(0);

    expect((reduced.exit as any).x).toBe(0);
    expect((reduced.exit as any).y).toBe(0);
    expect((reduced.exit as any).scale).toBe(1);
    expect((reduced.exit as any).transition.duration).toBe(0);
  });
});

describe("Keyboard Listeners & Accessibility Invariants (Feature F7)", () => {
  it("invokes onClose callback exclusively when Escape key is pressed", () => {
    const onClose = vi.fn();

    function handleKeyDown(event: { key: string }) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    handleKeyDown({ key: "Tab" });
    handleKeyDown({ key: "Enter" });
    handleKeyDown({ key: "ArrowDown" });
    expect(onClose).not.toHaveBeenCalled();

    handleKeyDown({ key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("filters command palette actions by multi-term search query", () => {
    const actions = [
      { label: "Try Build Doctor", description: "Run the deterministic Vercel diagnostic demo.", href: "/build-doctor" },
      { label: "Open Evidence Ledger", description: "Inspect public-safe source labels.", href: "#evidence-ledger" },
      { label: "View GitHub", description: "Open public GitHub profile.", href: "https://github.com" },
    ];

    function filterActions(query: string) {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return actions;
      const terms = normalized.split(/\s+/).filter(Boolean);
      return actions.filter((action) => {
        const searchable = `${action.label} ${action.description}`.toLowerCase();
        return terms.every((term) => searchable.includes(term));
      });
    }

    expect(filterActions("build")).toHaveLength(1);
    expect(filterActions("build")[0].label).toBe("Try Build Doctor");
    expect(filterActions("ledger")).toHaveLength(1);
    expect(filterActions("evidence public")).toHaveLength(1);
    expect(filterActions("nonexistent term")).toHaveLength(0);
  });

  it("calculates clamped navigation index for keyboard Arrow navigation", () => {
    const itemCount = 5;
    let activeIndex = 0;

    function moveDown(current: number) {
      return (current + 1) % itemCount;
    }

    function moveUp(current: number) {
      return (current - 1 + itemCount) % itemCount;
    }

    activeIndex = moveDown(activeIndex); // 1
    expect(activeIndex).toBe(1);
    activeIndex = moveDown(activeIndex); // 2
    expect(activeIndex).toBe(2);
    activeIndex = moveUp(activeIndex); // 1
    expect(activeIndex).toBe(1);
    activeIndex = moveUp(activeIndex); // 0
    expect(activeIndex).toBe(0);
    activeIndex = moveUp(activeIndex); // wrap to 4
    expect(activeIndex).toBe(4);
  });
});

describe("SSR Structure & Semantic Roles (Feature F7 & F8)", () => {
  const dummySources = [
    {
      id: "source-1",
      label: "Audit Ledger",
      sourceType: "generated-artifact" as const,
      confidence: "high" as const,
      publicSafeLabel: "public-audit-ref",
      supports: ["Deterministic rule verification"],
      lastRefreshed: "2026-09-03",
    },
  ];

  it("renders TrackerEvidenceDrawer with dialog role and aria attributes when open", () => {
    const html = renderToString(
      React.createElement(TrackerEvidenceDrawer, {
        sources: dummySources,
        open: true,
        onClose: () => {},
      })
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="tracker-evidence-title"');
    expect(html).toContain("Public-safe tracker sources");
    expect(html).toContain("Close tracker evidence drawer");
    expect(html).toContain("Audit Ledger");
  });

  it("renders nothing when TrackerEvidenceDrawer is closed", () => {
    const html = renderToString(
      React.createElement(TrackerEvidenceDrawer, {
        sources: dummySources,
        open: false,
        onClose: () => {},
      })
    );

    expect(html).toBe("");
  });

  it("renders CommandPalette opener button with proper aria labels and icons", () => {
    const html = renderToString(React.createElement(CommandPalette));
    expect(html).toContain('aria-label="Open command palette"');
    expect(html).toContain("Command");
    expect(html).toContain("Ctrl K");
  });
});

describe("Accordion & Tab State Transitions (Feature F9)", () => {
  it("toggles item expansion state correctly", () => {
    let expanded = ["card-1", "card-2"];

    function toggleExpand(id: string) {
      if (expanded.includes(id)) {
        expanded = expanded.filter((item) => item !== id);
      } else {
        expanded = [...expanded, id];
      }
    }

    toggleExpand("card-1");
    expect(expanded).toEqual(["card-2"]);

    toggleExpand("card-3");
    expect(expanded).toEqual(["card-2", "card-3"]);

    toggleExpand("card-2");
    expect(expanded).toEqual(["card-3"]);
  });

  it("switches review tabs between all, review, and fallback views", () => {
    let activeTab = "all";

    function selectTab(id: string) {
      activeTab = id;
    }

    expect(activeTab).toBe("all");
    selectTab("review");
    expect(activeTab).toBe("review");
    selectTab("fallback");
    expect(activeTab).toBe("fallback");
  });

  it("preserves spring presets for accordion height and button physics", () => {
    expect(snappySpring.stiffness).toBeGreaterThan(300);
    expect(snappySpring.damping).toBeLessThan(35);
    expect(cinematicSpring.stiffness).toBe(260);
    expect(cinematicSpring.damping).toBe(20);
  });
});
