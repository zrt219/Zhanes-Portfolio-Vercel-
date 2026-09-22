"use client";

import { useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { type MouseEvent, type PointerEvent, type RefObject, useCallback, useEffect, useState } from "react";
import { useSafeReducedMotion } from "@/lib/motion";

export type Use3DTiltOptions = {
  maxTilt?: number;
  stiffness?: number;
  damping?: number;
  glare?: boolean;
  glareOpacity?: number;
  disabled?: boolean;
  ref?: RefObject<HTMLElement | null>;
};

export type Use3DTiltResult = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  glareOpacity: MotionValue<number>;
  glareX: MotionValue<string>;
  glareY: MotionValue<string>;
  handleMouseMove: (e: MouseEvent<HTMLElement> | PointerEvent<HTMLElement> | globalThis.MouseEvent) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  isReduced: boolean;
};

/**
 * Deterministic math helper for calculating 3D rotation angles.
 * normX and normY are expected in [-0.5, 0.5].
 */
export function calculateTiltAngles(
  normX: number,
  normY: number,
  maxTilt: number = 8,
  isReduced: boolean = false
): { rotateX: number; rotateY: number } {
  if (isReduced) {
    return { rotateX: 0, rotateY: 0 };
  }
  const clampedX = Math.max(-0.5, Math.min(0.5, normX));
  const clampedY = Math.max(-0.5, Math.min(0.5, normY));
  return {
    rotateX: Number((-clampedY * 2 * maxTilt).toFixed(2)),
    rotateY: Number((clampedX * 2 * maxTilt).toFixed(2)),
  };
}

/**
 * Deterministic math helper for calculating specular glare position and opacity.
 */
export function calculateGlarePosition(
  normX: number,
  normY: number,
  isHovered: boolean = false,
  baseOpacity: number = 0.15,
  isReduced: boolean = false
): { glareX: string; glareY: string; glareOpacity: number } {
  if (isReduced || !isHovered) {
    return {
      glareX: "50%",
      glareY: "50%",
      glareOpacity: 0,
    };
  }
  const clampedX = Math.max(-0.5, Math.min(0.5, normX));
  const clampedY = Math.max(-0.5, Math.min(0.5, normY));
  const xPercent = Math.round((clampedX + 0.5) * 100);
  const yPercent = Math.round((clampedY + 0.5) * 100);
  return {
    glareX: `${xPercent}%`,
    glareY: `${yPercent}%`,
    glareOpacity: baseOpacity,
  };
}

/**
 * Hook providing smooth 3D pitch/yaw rotation coordinates and specular glare positioning
 * using Framer Motion springs and transforms.
 * Honors reduced motion by defaulting pitch/yaw and glare opacity to 0.
 */
export function use3DTilt(
  refOrOptions?: RefObject<HTMLElement | null> | Use3DTiltOptions,
  maybeOptions?: Use3DTiltOptions
): Use3DTiltResult {
  const isRef = refOrOptions && "current" in refOrOptions;
  const targetRef = isRef ? (refOrOptions as RefObject<HTMLElement | null>) : (refOrOptions as Use3DTiltOptions)?.ref;
  const options: Use3DTiltOptions = isRef ? (maybeOptions ?? {}) : ((refOrOptions as Use3DTiltOptions) ?? {});

  const maxTilt = options.maxTilt ?? 8;
  const stiffness = options.stiffness ?? 300;
  const damping = options.damping ?? 20;
  const glare = options.glare ?? true;
  const targetGlareOpacity = options.glareOpacity ?? 0.15;
  const disabled = options.disabled ?? false;

  const isReduced = useSafeReducedMotion();

  // Normalized cursor coordinates: -0.5 to +0.5 (center is 0)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness, damping, mass: 0.6 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Derive 3D rotation angles (pitch and yaw)
  // When smoothY goes from -0.5 to 0.5: tilt pitch from +maxTilt to -maxTilt
  // When smoothX goes from -0.5 to 0.5: tilt yaw from -maxTilt to +maxTilt
  const rotateX = useTransform(smoothY, [-0.5, 0.5], isReduced ? [0, 0] : [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], isReduced ? [0, 0] : [-maxTilt, maxTilt]);

  // Derive glare spotlight coordinates as percentage strings
  const glareX = useTransform(smoothX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ["0%", "100%"]);

  // Raw glare opacity motion value
  const rawGlareOpacity = useMotionValue(0);
  const smoothGlareOpacity = useSpring(rawGlareOpacity, { stiffness: 300, damping: 20 });
  const glareOpacity = useTransform(smoothGlareOpacity, (val) => (isReduced ? 0 : val));

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isReduced || disabled) {
      x.set(0);
      y.set(0);
      rawGlareOpacity.set(0);
    }
  }, [isReduced, disabled, x, y, rawGlareOpacity]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement> | PointerEvent<HTMLElement> | globalThis.MouseEvent) => {
      if (isReduced || disabled) return;

      const element =
        targetRef?.current ??
        ("currentTarget" in e && e.currentTarget ? (e.currentTarget as HTMLElement) : null) ??
        ("target" in e && e.target ? (e.target as HTMLElement) : null);

      if (!element || typeof element.getBoundingClientRect !== "function") return;

      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      x.set(Math.max(-0.5, Math.min(0.5, normX)));
      y.set(Math.max(-0.5, Math.min(0.5, normY)));

      if (glare) {
        rawGlareOpacity.set(targetGlareOpacity);
      }
    },
    [isReduced, disabled, targetRef, x, y, glare, rawGlareOpacity, targetGlareOpacity]
  );

  const handleMouseEnter = useCallback(() => {
    if (isReduced || disabled) return;
    setIsHovered(true);
    if (glare) {
      rawGlareOpacity.set(targetGlareOpacity);
    }
  }, [isReduced, disabled, glare, rawGlareOpacity, targetGlareOpacity]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    rawGlareOpacity.set(0);
  }, [x, y, rawGlareOpacity]);

  return {
    x,
    y,
    smoothX,
    smoothY,
    rotateX,
    rotateY,
    glareOpacity,
    glareX,
    glareY,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    isReduced,
  };
}
