"use client";

import { Activity, ClipboardCheck, Gauge, SearchCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { Diagnosis } from "@/lib/schemas";
import { InfoTip } from "./InfoTip";
import { StatusChip } from "./StatusChip";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

export function DiagnosisPanel({ diagnosis, compact = false }: { diagnosis: Diagnosis; compact?: boolean }) {
  const percent = Math.round(diagnosis.confidence * 100);
  const redactionCount = diagnosis.redactions.length;
  const redactionSummary = redactionCount ? `${redactionCount} sensitive values redacted` : "No sensitive values detected";
  const isReduced = useSafeReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: SPRING_PRESETS.cinematic,
    },
  };

  return (
    <section className={`${compact ? "rounded-2xl border border-white/10 bg-white/[0.035] p-4" : "rounded-lg border border-cyan/30 bg-panel/95 p-5 shadow-glow"}`}>
      <motion.div
        initial={isReduced ? undefined : { opacity: 0, y: 10 }}
        animate={isReduced ? undefined : { opacity: 1, y: 0 }}
        transition={isReduced ? undefined : SPRING_PRESETS.cinematic}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
            <span className="relative z-10">Root-cause assessment</span>
            {!isReduced && (
              <motion.span
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan/35 to-transparent pointer-events-none"
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                aria-hidden="true"
              />
            )}
          </div>
          <h2 className={`${compact ? "mt-2 text-xl" : "mt-1 text-2xl"} font-semibold text-white`}>{diagnosis.label}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{diagnosis.probableRootCause}</p>
        </div>
        <StatusChip kind={diagnosis.readinessReport.status === "READY_AFTER_FIX" ? "pass" : "review"} label={diagnosis.readinessReport.status.replaceAll("_", " ")} />
      </motion.div>

      <motion.div
        className={`mt-5 grid gap-3 ${compact ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-5"}`}
        initial="hidden"
        animate="visible"
        variants={isReduced ? undefined : containerVariants}
      >
        <motion.div
          variants={isReduced ? undefined : itemVariants}
          whileHover={isReduced ? undefined : { scale: 1.025, y: -2 }}
          transition={SPRING_PRESETS.snappy}
          className="rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(109,216,255,0.15)]"
        >
          <SearchCheck className="h-5 w-5 text-cyan" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            Likely root cause{" "}
            <InfoTip label="Likely root cause">The deterministic classification based on known failure patterns and extracted evidence.</InfoTip>
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white">{diagnosis.probableRootCause}</p>
        </motion.div>

        <motion.div
          variants={isReduced ? undefined : itemVariants}
          whileHover={isReduced ? undefined : { scale: 1.025, y: -2 }}
          transition={SPRING_PRESETS.snappy}
          className="rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(109,216,255,0.15)]"
        >
          <Gauge className="h-5 w-5 text-gold" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            Confidence{" "}
            <InfoTip label="Confidence">How strongly the log matches known failure patterns. It is a review signal, not a guarantee.</InfoTip>
          </p>
          <p className={`${compact ? "text-2xl" : "text-3xl"} mt-1 font-semibold text-white`}>{percent}%</p>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-2 rounded-full border border-cyan/70 bg-cyan/45 shadow-[0_0_10px_rgba(109,216,255,0.5)]"
              initial={isReduced ? { width: `${percent}%` } : { width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={isReduced ? { duration: 0 } : SPRING_PRESETS.cinematic}
            />
          </div>
        </motion.div>

        <motion.div
          variants={isReduced ? undefined : itemVariants}
          whileHover={isReduced ? undefined : { scale: 1.025, y: -2 }}
          transition={SPRING_PRESETS.snappy}
          className="rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(109,216,255,0.15)]"
        >
          <Activity className="h-5 w-5 text-cyan" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            Affected subsystem{" "}
            <InfoTip label="Subsystem">The application area likely involved, such as TypeScript, environment variables, database setup, or package installation.</InfoTip>
          </p>
          <p className="mt-1 text-xl font-semibold text-white">{diagnosis.affectedSubsystem}</p>
          <p className="mt-2 rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">{diagnosis.failureType}</p>
        </motion.div>

        <motion.div
          variants={isReduced ? undefined : itemVariants}
          whileHover={isReduced ? undefined : { scale: 1.025, y: -2 }}
          transition={SPRING_PRESETS.snappy}
          className="rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(109,216,255,0.15)]"
        >
          <ShieldCheck className="h-5 w-5 text-gold" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            Secret scan{" "}
            <InfoTip label="Secret scan">Sensitive-looking values are replaced with labels before the log is shown, reported, or reviewed by an optional provider.</InfoTip>
          </p>
          <p className="mt-1 text-xl font-semibold text-white">{redactionSummary}</p>
          <p className="mt-2 text-sm text-slate-400">{diagnosis.redactions.join(", ") || "No sensitive values detected"}</p>
        </motion.div>

        <motion.div
          variants={isReduced ? undefined : itemVariants}
          whileHover={isReduced ? undefined : { scale: 1.025, y: -2 }}
          transition={SPRING_PRESETS.snappy}
          className="rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(109,216,255,0.15)]"
        >
          <ClipboardCheck className="h-5 w-5 text-cyan" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            Report readiness{" "}
            <InfoTip label="Report readiness">Whether the current deterministic diagnosis can be exported as a markdown incident report.</InfoTip>
          </p>
          <p className="mt-1 text-xl font-semibold text-white">Export available</p>
          <p className="mt-2 text-sm text-slate-400">{diagnosis.readinessReport.status.replaceAll("_", " ")}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
