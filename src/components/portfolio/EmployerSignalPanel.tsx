"use client";

import { BrainCircuit, ClipboardCheck, Code2, ShieldCheck, Workflow, Zap } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { sectionShellClass } from "./shared";
import { TiltCard } from "@/components/motion/TiltCard";
import {
  containerVariants,
  fadeInScaleItem,
  fadeInUpItem,
  snappySpring,
  useSafeReducedMotion,
} from "@/lib/motion";

const signals = [
  {
    title: "Proof-oriented AI engineering",
    detail: "Codex workflow counts, public GitHub projects, Vercel demos, and daily evidence artifacts are presented with source labels and confidence boundaries.",
    icon: ShieldCheck,
  },
  {
    title: "Agentic workflow design",
    detail: "Ralphplan-style planning, subagent lanes, context construction, implementation loops, browser QA, and evidence curation are treated as one delivery system.",
    icon: Workflow,
  },
  {
    title: "RAG, eval, and observability discipline",
    detail: "Local RAG demos, deterministic eval routes, claim auditing, trace timelines, and report exports show how AI output gets checked before it becomes a public claim.",
    icon: BrainCircuit,
  },
  {
    title: "Developer tools under ambiguity",
    detail: "Build Doctor, gateway failover, and resume evidence tooling show product thinking around logs, failures, fallbacks, proof paths, and measurable QA.",
    icon: ClipboardCheck,
  },
  {
    title: "Full-stack shipped surfaces",
    detail: "Next.js, Vercel, TypeScript, FastAPI, Supabase-adjacent workflows, document exports, and browser regression checks connect backend evidence to usable interfaces.",
    icon: Code2,
  },
  {
    title: "Web3 and deterministic proof systems",
    detail: "Solidity state machines, Foundry projects, XRPL EVM dashboards, provenance protocols, and testnet/demo labeling support audit-style engineering proof.",
    icon: Zap,
  },
];

export function EmployerSignalPanel() {
  const isReduced = useSafeReducedMotion();

  // 6-Card Staggered Container
  const signalGridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.06,
      },
    },
  };

  return (
    <section id="capabilities" className={sectionShellClass}>
      <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={isReduced ? undefined : fadeInUpItem}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">AI engineering capability map</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">What the work proves.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The portfolio is organized around evidence: open the demos, inspect the repos, read the source labels, and check the QA path before taking any claim at face value.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-3 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={isReduced ? undefined : signalGridVariants}
        >
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={signal.title}
                variants={isReduced ? undefined : fadeInScaleItem}
                className="h-full"
              >
                <TiltCard
                  maxTilt={6}
                  glare={true}
                  glareOpacity={0.1}
                  className="h-full rounded-md"
                >
                  <article className="flex h-full flex-col rounded-md border border-line bg-black/30 p-4 transition-all duration-200 hover:border-cyan/50 hover:bg-black/40">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-cyan/45 bg-cyan/10 shadow-[0_0_10px_rgba(109,216,255,0.15)]">
                        <Icon aria-hidden="true" className="h-4 w-4 text-cyan" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-white">{signal.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{signal.detail}</p>
                      </div>
                    </div>
                  </article>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
