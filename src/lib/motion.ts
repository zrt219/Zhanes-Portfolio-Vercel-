"use client";

import { useReducedMotion, type Transition, type Variants } from "framer-motion";
import { useEffect, useState } from "react";

// ==========================================
// SPRING PRESETS (Requirement R1 & M1 Spec)
// ==========================================

export const snappySpring = {
  type: "spring",
  stiffness: 400,
  damping: 28,
} as const satisfies Transition;

export const cinematicSpring = {
  type: "spring",
  stiffness: 260,
  damping: 20,
} as const satisfies Transition;

export const softSpring = {
  type: "spring",
  stiffness: 150,
  damping: 22,
} as const satisfies Transition;

export const bounceSpring = {
  type: "spring",
  stiffness: 500,
  damping: 15,
} as const satisfies Transition;

export const SPRING_PRESETS = {
  snappy: snappySpring,
  cinematic: cinematicSpring,
  soft: softSpring,
  bounce: bounceSpring,
  smoothEase: {
    duration: 0.45,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
} as const;

// ==========================================
// STAGGER & CONTAINER PRESETS (Requirement R1)
// ==========================================

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const cascadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

export const fadeInScaleItem: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 24 },
  },
};

export const fadeInUpItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 26 },
  },
};

// Backwards-compatible aliases for existing tests & callers
export const containerStaggerVariants = containerVariants;
export const fastStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};
export const itemFadeUpVariants = fadeInUpItem;
export const itemFadeScaleVariants = fadeInScaleItem;

// Modal & Drawer variants (used by vitest and future milestones)
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(12px)",
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: cinematicSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export const drawerVariants: Variants = {
  hidden: { x: "100%", opacity: 0.4 },
  visible: {
    x: 0,
    opacity: 1,
    transition: cinematicSpring,
  },
  exit: {
    x: "100%",
    opacity: 0.4,
    transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] },
  },
};

// ==========================================
// REDUCED MOTION HOOKS & HELPERS (Requirement R4)
// ==========================================

/**
 * Hydration-safe hook for reduced motion preference.
 * Prevents SSR hydration mismatch by returning false during SSR
 * and synchronizing with OS prefers-reduced-motion on mount.
 */
export function useSafeReducedMotion(): boolean {
  const systemReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return false;
  return Boolean(systemReduced);
}

/**
 * Transforms variants into static zero-movement variants when reduced motion is requested.
 * Replaces moving transforms (y, x, scale, rotate) with neutral static values and duration: 0.
 */
export function getReducedMotionVariants(
  defaultVariants: Variants,
  isReduced: boolean
): Variants {
  if (!isReduced) return defaultVariants;

  const accessible: Variants = {};
  for (const [key, val] of Object.entries(defaultVariants)) {
    if (typeof val === "object" && val !== null) {
      accessible[key] = {
        ...val,
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        rotateX: 0,
        rotateY: 0,
        filter: "none",
        transition: { duration: 0 },
      };
    } else {
      accessible[key] = val;
    }
  }
  return accessible;
}

// Backwards-compatible alias for existing test suite
export const getAccessibleVariants = getReducedMotionVariants;
