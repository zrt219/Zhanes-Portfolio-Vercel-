"use client";

import { CheckCircle2, Database, GitBranch, ShieldCheck } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { portfolioStatsLastUpdated } from "@/data/portfolioStats";
import { latestWorkflowSnapshot } from "@/data/workflowEvents";
import { runEvalSuite } from "@/lib/build-doctor";
import { formatCount } from "./shared";
import {
  bounceSpring,
  cinematicSpring,
  fadeInScaleItem,
  fadeInUpItem,
  snappySpring,
  useSafeReducedMotion,
} from "@/lib/motion";
import { TiltCard } from "@/components/motion/TiltCard";

const callouts = [
  { label: "Claims", value: "Source-labeled", icon: ShieldCheck },
  { label: "Agent lanes", value: "3-lane Ralphplan", icon: GitBranch },
  { label: "Evidence refresh", value: portfolioStatsLastUpdated, icon: Database },
  { label: "Build Doctor eval", value: "Deterministic", icon: CheckCircle2 },
];

export function HolographicProofPanel() {
  const buildDoctorEvals = runEvalSuite();
  const isReduced = useSafeReducedMotion();

  // Stagger container for top 4 callout cards
  const calloutContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  };

  // Stagger container for bottom telemetry metrics bar
  const metricsContainerVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.32,
        ...cinematicSpring,
      },
    },
  };

  return (
    <TiltCard
      maxTilt={5}
      glare={true}
      glareOpacity={0.12}
      className="w-full"
    >
      <aside
        className="relative min-h-[410px] overflow-hidden rounded-xl border border-cyan/40 bg-[#07111d]/90 p-6 shadow-[0_0_40px_rgba(109,216,255,0.18)] backdrop-blur-xl"
        aria-label="Source-labeled proof panel"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(109,216,255,0.25),transparent_42%),linear-gradient(135deg,rgba(109,216,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Dynamic Holographic Scanline Sweep */}
        {!isReduced && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-cyan/15 to-transparent opacity-75"
            animate={{ y: ["-100%", "450%"] }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "linear",
            }}
            aria-hidden="true"
          />
        )}

        {/* Staggered Callout Cards */}
        <motion.div
          className="relative grid gap-3 sm:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={isReduced ? undefined : calloutContainerVariants}
        >
          {callouts.map((callout) => {
            const Icon = callout.icon;
            return (
              <motion.div
                key={callout.label}
                variants={isReduced ? undefined : fadeInScaleItem}
                whileHover={
                  isReduced
                    ? undefined
                    : {
                        scale: 1.025,
                        borderColor: "rgba(109,216,255,0.7)",
                        backgroundColor: "rgba(0,0,0,0.65)",
                        transition: { duration: 0.18 },
                      }
                }
                className="rounded-lg border border-cyan/30 bg-black/40 p-3.5 backdrop-blur-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-cyan" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                    {callout.label}
                  </p>
                </div>
                <p className="mt-1.5 text-sm font-bold text-white">{callout.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Central Holographic Gyro Core with Cinematic Boot Sequence */}
        <div className="relative mt-6 flex min-h-[180px] items-center justify-center">
          {/* Outer Gyro Ring */}
          <motion.div
            className="holo-ring absolute h-52 w-52 rounded-full border border-cyan/50"
            initial={isReduced ? undefined : { opacity: 0, scale: 0.3, rotate: -180 }}
            animate={
              isReduced
                ? undefined
                : {
                    opacity: 1,
                    scale: [1, 1.03, 1],
                    rotate: 360,
                  }
            }
            transition={
              isReduced
                ? undefined
                : {
                    opacity: { duration: 0.6 },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 24, repeat: Infinity, ease: "linear" },
                  }
            }
          />

          {/* Inner Counter-Rotating Gyro Ring */}
          <motion.div
            className="holo-ring holo-ring-delay absolute h-40 w-40 rounded-full border border-cyan/40"
            initial={isReduced ? undefined : { opacity: 0, scale: 0.4, rotate: 180 }}
            animate={
              isReduced
                ? undefined
                : {
                    opacity: 1,
                    scale: [1, 0.96, 1],
                    rotate: -360,
                  }
            }
            transition={
              isReduced
                ? undefined
                : {
                    opacity: { duration: 0.6, delay: 0.1 },
                    scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                  }
            }
          />

          {/* Floating Quantum Rhombus with Boot Entrance Pop */}
          <motion.div
            className="absolute h-24 w-24 rounded-xl border border-cyan/80 bg-cyan/20 shadow-[0_0_50px_rgba(109,216,255,0.6)] backdrop-blur-sm"
            initial={isReduced ? { rotate: 45 } : { opacity: 0, scale: 0, rotate: 0 }}
            animate={
              isReduced
                ? { rotate: 45 }
                : {
                    opacity: 1,
                    scale: [1, 1.04, 1],
                    rotate: [45, 52, 45],
                    y: [-4, 4, -4],
                  }
            }
            transition={
              isReduced
                ? undefined
                : {
                    opacity: { duration: 0.4, delay: 0.2 },
                    scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  }
            }
          />

          {/* Inner Diamond Core */}
          <motion.div
            className="absolute h-16 w-16 rounded-lg border border-white/70 bg-[#0e7bff]/50 shadow-[0_0_35px_rgba(14,123,255,0.8)]"
            initial={isReduced ? { rotate: 45 } : { opacity: 0, scale: 0, rotate: -45 }}
            animate={
              isReduced
                ? { rotate: 45 }
                : {
                    opacity: 1,
                    scale: [1, 1.03, 1],
                    rotate: [45, 38, 45],
                    y: [3, -3, 3],
                  }
            }
            transition={
              isReduced
                ? undefined
                : {
                    opacity: { duration: 0.4, delay: 0.3 },
                    scale: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
                  }
            }
          />

          <div className="absolute bottom-3 h-2.5 w-64 rounded-full bg-cyan/50 blur-md" />
        </div>

        {/* Telemetry Metrics Bar: Staggered Appearance */}
        <motion.div
          className="relative mt-6 grid gap-3 rounded-lg border border-line/80 bg-black/40 p-4 backdrop-blur-md sm:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={isReduced ? undefined : metricsContainerVariants}
        >
          <motion.div variants={isReduced ? undefined : fadeInUpItem}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workflow events
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white text-gradient-cyan">
              {formatCount(latestWorkflowSnapshot.workflowEvents)}
            </p>
          </motion.div>
          <motion.div variants={isReduced ? undefined : fadeInUpItem}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Codex sessions
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white text-gradient-cyan">
              {formatCount(latestWorkflowSnapshot.sessionRows)}
            </p>
          </motion.div>
          <motion.div variants={isReduced ? undefined : fadeInUpItem}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Eval fixtures
            </p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">
              {buildDoctorEvals.passed}/{buildDoctorEvals.total}
            </p>
          </motion.div>
        </motion.div>
      </aside>
    </TiltCard>
  );
}
