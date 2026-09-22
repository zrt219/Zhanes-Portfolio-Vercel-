"use client";

import { ArrowRight, Github, Mail } from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { portfolioStatsLastUpdated } from "@/data/portfolioStats";
import { HolographicProofPanel } from "./HolographicProofPanel";
import { primaryLinkClass, secondaryLinkClass } from "./shared";
import {
  bounceSpring,
  cinematicSpring,
  fadeInUpItem,
  snappySpring,
  useSafeReducedMotion,
} from "@/lib/motion";

const pipelineSteps = [
  "Evidence",
  "Context",
  "Subagents",
  "Implementation",
  "Browser QA",
  "Proof ledger",
];

const headlineWords = [
  "AI",
  "engineering",
  "systems",
  "built",
  "like",
  "a",
];

export function HeroMainframe() {
  const isReduced = useSafeReducedMotion();

  // Root staggered container
  const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.03,
      },
    },
  };

  // Status badge scale & fade
  const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: -6 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: snappySpring,
    },
  };

  // Staggered words for the headline
  const headlineWordsContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.06,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: cinematicSpring,
    },
  };

  // CTA button cascade with bouncy tactile springs
  const ctaContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.22,
      },
    },
  };

  const ctaItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: bounceSpring,
    },
  };

  // Ralphplan ribbon sequential cascade
  const ribbonContainerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.32,
        ...cinematicSpring,
      },
    },
  };

  const ribbonStepVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: snappySpring,
    },
  };

  return (
    <section className="grid gap-8 py-10 lg:min-h-[560px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={isReduced ? undefined : heroContainerVariants}
      >
        {/* Status Eyebrow Badge */}
        <motion.div
          variants={isReduced ? undefined : badgeVariants}
          className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan shadow-[0_0_15px_rgba(109,216,255,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          Evidence-backed AI engineering systems
        </motion.div>

        {/* Staggered Word Reveal Headline */}
        <motion.h1
          variants={isReduced ? undefined : headlineWordsContainer}
          className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.06] text-white sm:text-5xl lg:text-6xl [text-wrap:balance]"
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              variants={isReduced ? undefined : wordVariants}
              className="inline-block mr-[0.28em]"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={isReduced ? undefined : wordVariants}
            className="inline-block bg-gradient-to-r from-cyan via-cyan-300 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(109,216,255,0.35)]"
          >
            proof layer
          </motion.span>
          <motion.span
            variants={isReduced ? undefined : wordVariants}
            className="inline-block text-white"
          >
            .
          </motion.span>
        </motion.h1>

        {/* Subtitles */}
        <motion.p
          variants={isReduced ? undefined : fadeInUpItem}
          className="mt-5 max-w-2xl text-lg leading-8 text-slate-200 [text-wrap:pretty]"
        >
          Agentic workflows, Vercel diagnostics, RAG/eval systems, Solidity proof layers, and working full-stack demos.
        </motion.p>
        <motion.p
          variants={isReduced ? undefined : fadeInUpItem}
          className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 [text-wrap:pretty]"
        >
          Visual style follows the supplied reference, but evidence does not. Public stats and project links are sourced from the May 30 local evidence refresh, public GitHub records, and verified Vercel/demo URLs.
        </motion.p>

        {/* Action CTA Buttons: 5 Buttons Staggered Cascade with Spring Bounce */}
        <motion.div
          variants={isReduced ? undefined : ctaContainerVariants}
          className="mt-6 flex flex-wrap gap-3"
          aria-label="Primary portfolio actions"
        >
          <motion.a
            href="https://github.com/zrt219"
            target="_blank"
            rel="noreferrer"
            className={primaryLinkClass}
            variants={isReduced ? undefined : ctaItemVariants}
            whileHover={isReduced ? undefined : { scale: 1.04, y: -2 }}
            whileTap={isReduced ? undefined : { scale: 0.96 }}
            transition={snappySpring}
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            View GitHub
          </motion.a>
          <motion.a
            href="mailto:zpeace11@gmail.com"
            className={secondaryLinkClass}
            variants={isReduced ? undefined : ctaItemVariants}
            whileHover={isReduced ? undefined : { scale: 1.04, y: -2 }}
            whileTap={isReduced ? undefined : { scale: 0.96 }}
            transition={snappySpring}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email Zhane
          </motion.a>
          <motion.div
            variants={isReduced ? undefined : ctaItemVariants}
            whileHover={isReduced ? undefined : { scale: 1.04, y: -2 }}
            whileTap={isReduced ? undefined : { scale: 0.96 }}
            transition={snappySpring}
          >
            <Link href="/build-doctor" className={secondaryLinkClass}>
              Try Build Doctor <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
          <motion.div
            variants={isReduced ? undefined : ctaItemVariants}
            whileHover={isReduced ? undefined : { scale: 1.04, y: -2 }}
            whileTap={isReduced ? undefined : { scale: 0.96 }}
            transition={snappySpring}
          >
            <Link href="#workflow-tracker" className={secondaryLinkClass}>
              View Workflow Snapshot <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
          <motion.div
            variants={isReduced ? undefined : ctaItemVariants}
            whileHover={isReduced ? undefined : { scale: 1.04, y: -2 }}
            whileTap={isReduced ? undefined : { scale: 0.96 }}
            transition={snappySpring}
          >
            <Link href="#projects" className={secondaryLinkClass}>
              Project Directory <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Ralphplan Workflow Stage Ribbon */}
        <motion.div
          variants={isReduced ? undefined : ribbonContainerVariants}
          className="mt-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-line/80 bg-black/40 backdrop-blur-md p-3.5 shadow-lg"
        >
          <span className="rounded-full border border-cyan/50 bg-cyan/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan shadow-[0_0_10px_rgba(109,216,255,0.2)]">
            Ralphplan mode
          </span>
          {pipelineSteps.map((item, index) => (
            <motion.span
              key={item}
              variants={isReduced ? undefined : ribbonStepVariants}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-300"
            >
              {index > 0 ? <span className="font-mono text-cyan/70">-&gt;</span> : null}
              <motion.span
                className="rounded-md border border-line/50 bg-panel/50 px-2 py-0.5 transition-colors hover:border-cyan/40 hover:text-white"
                whileHover={isReduced ? undefined : { scale: 1.06, y: -1 }}
                transition={snappySpring}
              >
                {item}
              </motion.span>
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          variants={isReduced ? undefined : fadeInUpItem}
          className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500"
        >
          Stats snapshot last verified: <span className="text-slate-300">{portfolioStatsLastUpdated}</span>
        </motion.p>
      </motion.div>

      {/* Right Column Hologram Container */}
      <motion.div
        initial={isReduced ? undefined : { opacity: 0, scale: 0.95 }}
        animate={isReduced ? undefined : { opacity: 1, scale: 1 }}
        transition={{ ...cinematicSpring, delay: 0.15 }}
      >
        <HolographicProofPanel />
      </motion.div>
    </section>
  );
}
