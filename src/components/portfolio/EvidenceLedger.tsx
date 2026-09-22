"use client";

import { ExternalLink } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { evidenceSources } from "@/data/evidenceSources";
import { suiteApps } from "@/lib/suite-metadata";
import { compactLinkClass, sectionShellClass } from "./shared";
import {
  cinematicSpring,
  fadeInScaleItem,
  fadeInUpItem,
  snappySpring,
  useSafeReducedMotion,
} from "@/lib/motion";

const statusClass = {
  verified: "border-cyan/60 bg-cyan/10 text-white",
  documented: "border-white/45 bg-white/5 text-slate-100",
  demo: "border-cyan/40 bg-black/25 text-slate-100",
  review: "border-gold/70 border-dashed bg-gold/10 text-white",
};

export function EvidenceLedger() {
  const isReduced = useSafeReducedMotion();

  // 7 Evidence Sources Staggered Container
  const sourcesContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  };

  // 4 Suite Apps Staggered Container
  const suiteAppsContainerVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
        ...cinematicSpring,
      },
    },
  };

  return (
    <section id="evidence-ledger" className={sectionShellClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">Evidence and QA ledger</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Public-safe proof sources and live check routes.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Raw private logs stay private. This ledger exposes source labels, public demos, health/eval endpoints, and browser QA artifacts.
          </p>
        </div>
      </div>

      {/* 7 Evidence Sources Staggered Cascade */}
      <motion.div
        className="mt-5 grid gap-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={isReduced ? undefined : sourcesContainerVariants}
      >
        {evidenceSources.map((source) => (
          <motion.article
            key={source.id}
            variants={isReduced ? undefined : fadeInUpItem}
            whileHover={
              isReduced
                ? undefined
                : {
                    scale: 1.008,
                    borderColor: "rgba(109,216,255,0.6)",
                    backgroundColor: "rgba(0,0,0,0.45)",
                    transition: { duration: 0.18 },
                  }
            }
            className="grid gap-3 rounded-md border border-line bg-black/30 p-4 transition-colors md:grid-cols-[0.62fr_0.28fr_0.28fr] md:items-center"
          >
            <div>
              <p className="font-mono text-xs text-cyan">{source.type}</p>
              <h3 className="mt-1 font-semibold text-white">{source.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{source.detail}</p>
            </div>
            <p className="rounded-sm border border-dashed border-cyan/30 bg-cyan/5 px-2 py-1 text-xs text-slate-300">{source.publicLabel}</p>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusClass[source.status]}`}>{source.status}</span>
              {source.sourceHref ? (
                <motion.a
                  href={source.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className={compactLinkClass}
                  aria-label={`Open public-safe source file for ${source.label}`}
                  whileHover={isReduced ? undefined : { scale: 1.04 }}
                  whileTap={isReduced ? undefined : { scale: 0.96 }}
                  transition={snappySpring}
                >
                  Source file <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </motion.a>
              ) : null}
              {source.href ? (
                <motion.a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className={compactLinkClass}
                  aria-label={`Open ${source.label}`}
                  whileHover={isReduced ? undefined : { scale: 1.04 }}
                  whileTap={isReduced ? undefined : { scale: 0.96 }}
                  transition={snappySpring}
                >
                  Open <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </motion.a>
              ) : null}
            </div>
          </motion.article>
        ))}
      </motion.div>

      {/* 4 Suite Health Status Cards Staggered Cascade */}
      <motion.div
        className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={isReduced ? undefined : suiteAppsContainerVariants}
      >
        {suiteApps.map((app) => (
          <motion.article
            key={app.id}
            variants={isReduced ? undefined : fadeInScaleItem}
            whileHover={
              isReduced
                ? undefined
                : {
                    scale: 1.02,
                    borderColor: "rgba(109,216,255,0.5)",
                    backgroundColor: "rgba(109,216,255,0.04)",
                  }
            }
            transition={snappySpring}
            className="rounded-md border border-line bg-black/30 p-4 transition-colors"
          >
            <h3 className="font-semibold text-white">{app.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{app.demoMode}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <motion.a
                href={app.statusEndpoint}
                target="_blank"
                rel="noreferrer"
                className={compactLinkClass}
                aria-label={`Open ${app.name} health endpoint`}
                whileHover={isReduced ? undefined : { scale: 1.05 }}
                whileTap={isReduced ? undefined : { scale: 0.95 }}
                transition={snappySpring}
              >
                Health
              </motion.a>
              <motion.a
                href={app.evalEndpoint}
                target="_blank"
                rel="noreferrer"
                className={compactLinkClass}
                aria-label={`Open ${app.name} eval endpoint`}
                whileHover={isReduced ? undefined : { scale: 1.05 }}
                whileTap={isReduced ? undefined : { scale: 0.95 }}
                transition={snappySpring}
              >
                Eval
              </motion.a>
              <motion.a
                href={app.integrationEndpoint}
                target="_blank"
                rel="noreferrer"
                className={compactLinkClass}
                aria-label={`Open ${app.name} integration endpoint`}
                whileHover={isReduced ? undefined : { scale: 1.05 }}
                whileTap={isReduced ? undefined : { scale: 0.95 }}
                transition={snappySpring}
              >
                Integration
              </motion.a>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
