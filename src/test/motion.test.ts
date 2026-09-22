import { describe, expect, it } from "vitest";
import {
  SPRING_PRESETS,
  snappySpring,
  cinematicSpring,
  softSpring,
  bounceSpring,
  containerVariants,
  cascadeVariants,
  fadeInScaleItem,
  fadeInUpItem,
  containerStaggerVariants,
  fastStaggerVariants,
  itemFadeUpVariants,
  itemFadeScaleVariants,
  modalBackdropVariants,
  modalPanelVariants,
  drawerVariants,
  getReducedMotionVariants,
  getAccessibleVariants,
} from "../lib/motion";

describe("Motion Engine & Presets", () => {
  it("exports valid individual spring presets with required stiffness and damping", () => {
    expect(snappySpring.stiffness).toBe(400);
    expect(snappySpring.damping).toBe(28);
    expect(cinematicSpring.stiffness).toBe(260);
    expect(cinematicSpring.damping).toBe(20);
    expect(softSpring.stiffness).toBe(150);
    expect(softSpring.damping).toBe(22);
    expect(bounceSpring.stiffness).toBe(500);
    expect(bounceSpring.damping).toBe(15);
  });

  it("exports valid spring presets map for backward-compatibility", () => {
    expect(SPRING_PRESETS.snappy.stiffness).toBeGreaterThan(0);
    expect(SPRING_PRESETS.snappy.damping).toBeGreaterThan(0);
    expect(SPRING_PRESETS.cinematic.stiffness).toBeGreaterThan(0);
    expect(SPRING_PRESETS.cinematic.damping).toBeGreaterThan(0);
    expect(SPRING_PRESETS.soft.stiffness).toBeGreaterThan(0);
    expect(SPRING_PRESETS.soft.damping).toBeGreaterThan(0);
    expect(SPRING_PRESETS.bounce.stiffness).toBeGreaterThan(0);
    expect(SPRING_PRESETS.bounce.damping).toBeGreaterThan(0);
  });

  it("exports valid container stagger configurations (containerVariants & cascadeVariants)", () => {
    expect(containerVariants.visible).toBeDefined();
    expect(containerVariants.hidden).toBeDefined();
    expect(cascadeVariants.visible).toBeDefined();
    expect(cascadeVariants.hidden).toBeDefined();

    expect(containerStaggerVariants.visible).toBeDefined();
    expect(fastStaggerVariants.visible).toBeDefined();
  });

  it("exports valid item reveal and modal variants (fadeInScaleItem & fadeInUpItem)", () => {
    expect(fadeInScaleItem.hidden).toBeDefined();
    expect(fadeInScaleItem.visible).toBeDefined();
    expect(fadeInUpItem.hidden).toBeDefined();
    expect(fadeInUpItem.visible).toBeDefined();

    expect(itemFadeUpVariants.hidden).toBeDefined();
    expect(itemFadeScaleVariants.hidden).toBeDefined();
    expect(modalBackdropVariants.hidden).toBeDefined();
    expect(modalBackdropVariants.visible).toBeDefined();
    expect(modalBackdropVariants.exit).toBeDefined();
    expect(modalPanelVariants.hidden).toBeDefined();
    expect(modalPanelVariants.visible).toBeDefined();
    expect(modalPanelVariants.exit).toBeDefined();
    expect(drawerVariants.hidden).toBeDefined();
    expect(drawerVariants.visible).toBeDefined();
    expect(drawerVariants.exit).toBeDefined();
  });

  it("collapses transforms when reduced motion is enabled via getReducedMotionVariants", () => {
    const defaultVariants = {
      hidden: { opacity: 0, y: 30, scale: 0.9, rotate: 10 },
      visible: { opacity: 1, y: 0, scale: 1, rotate: 0 },
    };

    const accessible = getReducedMotionVariants(defaultVariants, true);
    expect((accessible.hidden as any).y).toBe(0);
    expect((accessible.hidden as any).scale).toBe(1);
    expect((accessible.hidden as any).rotate).toBe(0);
    expect((accessible.hidden as any).opacity).toBe(1);
    expect((accessible.hidden as any).transition.duration).toBe(0);

    const untouched = getReducedMotionVariants(defaultVariants, false);
    expect((untouched.hidden as any).y).toBe(30);
    expect((untouched.hidden as any).scale).toBe(0.9);
  });

  it("supports getAccessibleVariants alias identically", () => {
    const defaultVariants = {
      hidden: { opacity: 0, y: 25, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    };
    const accessible = getAccessibleVariants(defaultVariants, true);
    expect((accessible.hidden as any).y).toBe(0);
    expect((accessible.hidden as any).scale).toBe(1);
  });
});
