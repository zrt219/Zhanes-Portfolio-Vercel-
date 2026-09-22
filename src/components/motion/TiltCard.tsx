"use client";

import { motion, useTransform } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { useSafeReducedMotion } from "@/lib/motion";
import { use3DTilt } from "./use3DTilt";

export type TiltCardProps = {
  children?: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  glareOpacity?: number;
  scaleOnHover?: number;
  stiffness?: number;
  damping?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
  tabIndex?: number;
  role?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  as?: "div" | "button" | "article" | "section";
  disabled?: boolean;
};

export function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  glare = true,
  glareOpacity = 0.15,
  scaleOnHover = 1.015,
  stiffness = 300,
  damping = 20,
  onClick,
  style,
  tabIndex,
  role,
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
  as = "div",
  disabled = false,
}: TiltCardProps) {
  const isReduced = useSafeReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    rotateX,
    rotateY,
    glareX,
    glareY,
    glareOpacity: dynamicGlareOpacity,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = use3DTilt(cardRef, {
    maxTilt,
    stiffness,
    damping,
    glare,
    glareOpacity,
    disabled,
  });

  // Glare radial gradient background
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx} ${gy}, rgba(109,216,255,${glareOpacity}) 0%, transparent 65%)`
  );

  // When reduced motion or disabled is active, bypass 3D transform and glare completely
  if (isReduced || disabled) {
    const Tag = as;
    return (
      <Tag
        className={`relative ${className}`}
        onClick={onClick}
        tabIndex={tabIndex}
        role={role}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        style={style}
      >
        {children}
      </Tag>
    );
  }

  const MotionTag =
    as === "button"
      ? motion.button
      : as === "article"
      ? motion.article
      : as === "section"
      ? motion.section
      : motion.div;

  return (
    <MotionTag
      ref={cardRef as any}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: scaleOnHover,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{
        scale: 0.985,
        transition: { duration: 0.1 },
      }}
      className={`relative transform-gpu [perspective:1000px] ${className}`}
    >
      {children}

      {/* Dynamic Specular Glare Reflection - strictly pointer-events-none and overflow-hidden */}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
          style={{
            background: glareBackground,
            opacity: dynamicGlareOpacity,
          }}
          aria-hidden="true"
        />
      )}
    </MotionTag>
  );
}
