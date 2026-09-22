"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import {
  containerVariants,
  fadeInUpItem,
  useSafeReducedMotion,
} from "@/lib/motion";

export type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
  variants?: Variants;
  viewportAmount?: number;
};

const defaultSectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function MotionSection({
  children,
  className,
  delay = 0,
  stagger = false,
  variants,
  viewportAmount = 0.1,
}: MotionSectionProps) {
  const isReduced = useSafeReducedMotion();

  if (isReduced) {
    return <section className={className}>{children}</section>;
  }

  const selectedVariants = variants || (stagger ? containerVariants : defaultSectionVariants);

  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: viewportAmount }}
      variants={selectedVariants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.section>
  );
}
