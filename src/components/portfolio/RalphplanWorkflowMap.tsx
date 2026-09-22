"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { sectionShellClass } from "./shared";
import {
  cinematicSpring,
  fadeInScaleItem,
  fadeInUpItem,
  snappySpring,
  useSafeReducedMotion,
} from "@/lib/motion";

const workflowSteps = [
  "Input evidence",
  "Context construction",
  "Ralph planner",
  "Subagent lanes",
  "Implementation",
  "Browser QA",
  "Proof ledger",
  "Portfolio stats refresh",
];

const lanes = [
  {
    title: "Architect / Planner",
    detail: "Maps repo structure, evidence boundaries, affected files, risks, and verification shape before implementation.",
  },
  {
    title: "Builder / Integrator",
    detail: "Ships scoped changes through existing components, data configs, and route conventions without widening the blast radius.",
  },
  {
    title: "Verifier / Evidence Curator",
    detail: "Runs typecheck, tests, builds, browser QA, screenshots, deployment checks, and factual engineering-log updates.",
  },
];

export function RalphplanWorkflowMap() {
  const isReduced = useSafeReducedMotion();
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

  // 8-Step pipeline horizontal cascade
  const stepContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
  };

  const stepItemVariants: Variants = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: cinematicSpring,
    },
  };

  // 3 Subagent lanes staggered container
  const laneContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <section id="ralphplan-workflow" className={sectionShellClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">Ralphplan workflow diagram</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">How Codex work becomes proof instead of loose claims.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Local/demo operating model: scoped planning, implementation, verification, and evidence packaging are handled as one loop.
          </p>
        </div>
        <span className="rounded-sm border border-dotted border-white/45 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
          Local / demo operating model
        </span>
      </div>

      {/* 8-Step Directional Pipeline Stagger */}
      <motion.div
        className="mt-6 grid gap-3 lg:grid-cols-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={isReduced ? undefined : stepContainerVariants}
      >
        {workflowSteps.map((step, index) => {
          const isCurrentHovered = hoveredStepIndex === index;
          return (
            <motion.div
              key={step}
              variants={isReduced ? undefined : stepItemVariants}
              onMouseEnter={() => setHoveredStepIndex(index)}
              onMouseLeave={() => setHoveredStepIndex(null)}
              whileHover={
                isReduced
                  ? undefined
                  : {
                      scale: 1.05,
                      y: -3,
                    }
              }
              transition={snappySpring}
              className={`relative cursor-default rounded-md border p-4 transition-all duration-200 ${
                isCurrentHovered
                  ? "border-cyan/80 bg-cyan/15 text-white shadow-[0_0_20px_rgba(109,216,255,0.3)]"
                  : "border-line bg-black/30 text-slate-300 hover:border-cyan/50"
              }`}
            >
              <p className={`font-mono text-xs font-bold ${isCurrentHovered ? "text-cyan drop-shadow-[0_0_8px_rgba(109,216,255,0.6)]" : "text-cyan"}`}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-white">{step}</h3>
              {index < workflowSteps.length - 1 ? (
                <ArrowRight
                  aria-hidden="true"
                  className={`absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 transition-colors duration-200 lg:block z-10 ${
                    isCurrentHovered ? "text-cyan drop-shadow-[0_0_6px_rgba(109,216,255,0.8)]" : "text-cyan/60"
                  }`}
                />
              ) : null}
            </motion.div>
          );
        })}
      </motion.div>

      {/* 3 Subagent Lanes Staggered Entrance */}
      <motion.div
        className="mt-5 grid gap-3 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={isReduced ? undefined : laneContainerVariants}
      >
        {lanes.map((lane) => (
          <motion.article
            key={lane.title}
            variants={isReduced ? undefined : fadeInUpItem}
            whileHover={
              isReduced
                ? undefined
                : {
                    scale: 1.02,
                    borderColor: "rgba(109,216,255,0.6)",
                    boxShadow: "0 0 25px rgba(109,216,255,0.15)",
                  }
            }
            transition={snappySpring}
            className="rounded-md border border-cyan/30 bg-cyan/5 p-4 transition-all"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan" aria-hidden="true" />
              <h3 className="font-semibold text-white">{lane.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{lane.detail}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
