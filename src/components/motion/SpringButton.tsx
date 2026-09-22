"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

export type SpringButtonProps = HTMLMotionProps<"button"> & {
  children?: ReactNode;
  className?: string;
  scaleHover?: number;
  scaleTap?: number;
};

/**
 * Tactile interactive button wrapper with spring physics.
 * Honors prefers-reduced-motion by rendering a standard static button.
 */
export function SpringButton({
  children,
  className = "",
  scaleHover = 1.02,
  scaleTap = 0.96,
  type = "button",
  ...props
}: SpringButtonProps) {
  const isReduced = useSafeReducedMotion();

  if (isReduced) {
    return (
      <button type={type} className={className} {...(props as any)}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      whileHover={{
        scale: scaleHover,
        transition: SPRING_PRESETS.snappy,
      }}
      whileTap={{
        scale: scaleTap,
        transition: { type: "spring", stiffness: 600, damping: 20 },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
