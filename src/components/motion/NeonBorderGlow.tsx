"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useSafeReducedMotion } from "@/lib/motion";

export type NeonBorderGlowProps = {
  children?: ReactNode;
  className?: string;
  color?: "cyan" | "emerald" | "gold";
  glowColor?: string;
  active?: boolean;
  pulseSpeed?: number;
  style?: CSSProperties;
};

const GLOW_COLORS = {
  cyan: "rgba(109, 216, 255, 0.5)",
  emerald: "rgba(52, 211, 153, 0.5)",
  gold: "rgba(214, 170, 82, 0.5)",
} as const;

/**
 * Reusable wrapper that renders a responsive cyan/emerald/gold neon perimeter glow
 * on hover or active state.
 * Strictly maintains pointer-events: none on all glow overlays.
 */
export function NeonBorderGlow({
  children,
  className = "",
  color = "cyan",
  glowColor,
  active = false,
  pulseSpeed = 2.6,
  style,
}: NeonBorderGlowProps) {
  const isReduced = useSafeReducedMotion();
  const resolvedColor = glowColor ?? GLOW_COLORS[color] ?? GLOW_COLORS.cyan;

  return (
    <div className={`group relative ${className}`} style={style}>
      {/* Dynamic neon perimeter glow aura */}
      {!isReduced && (
        <motion.div
          className={`pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 ${
            active ? "opacity-90" : "opacity-0 group-hover:opacity-100"
          }`}
          style={{
            boxShadow: `0 0 16px ${resolvedColor}, inset 0 0 10px ${resolvedColor}`,
          }}
          animate={
            active
              ? {
                  opacity: [0.45, 0.9, 0.45],
                  transition: {
                    duration: pulseSpeed,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : undefined
          }
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
