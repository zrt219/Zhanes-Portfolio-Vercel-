"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { EvidenceSource } from "@/types/liveWorkflowTracker";
import { formatConfidence } from "@/lib/formatMetrics";
import { confidenceClass, evidenceTypeLabel } from "@/lib/trackerEvidence";
import { compactLinkClass } from "./shared";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

type TrackerEvidenceDrawerProps = {
  sources: EvidenceSource[];
  open: boolean;
  onClose: () => void;
};

export function TrackerEvidenceDrawer({ sources, open, onClose }: TrackerEvidenceDrawerProps) {
  const isReduced = useSafeReducedMotion();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="tracker-evidence-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isReduced ? 0 : 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[70] bg-black/75 px-4 py-6 backdrop-blur-md"
          role="presentation"
          onClick={onClose}
        >
          <motion.aside
            key="tracker-evidence-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tracker-evidence-title"
            initial={{ x: isReduced ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isReduced ? 0 : "100%" }}
            transition={isReduced ? { duration: 0 } : SPRING_PRESETS.cinematic}
            className="ml-auto flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-lg border border-cyan/35 bg-[#07111f] shadow-[0_30px_120px_rgba(0,0,0,0.7)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">Source chain</p>
                <h3 id="tracker-evidence-title" className="mt-2 text-2xl font-semibold text-white">Public-safe tracker sources</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">Evidence sources are shown with public-safe labels. Private filesystem paths and raw session logs are intentionally hidden.</p>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={isReduced ? undefined : { scale: 1.05 }}
                whileTap={isReduced ? undefined : { scale: 0.95 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-black/30 text-slate-200 transition hover:border-cyan/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                aria-label="Close tracker evidence drawer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="overflow-y-auto p-5">
              <motion.div
                className="grid gap-3"
                initial="hidden"
                animate="visible"
                variants={
                  isReduced
                    ? undefined
                    : {
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.05, delayChildren: 0.05 },
                        },
                      }
                }
              >
                {sources.map((source) => (
                  <motion.article
                    key={source.id}
                    variants={
                      isReduced
                        ? undefined
                        : {
                            hidden: { opacity: 0, x: 20 },
                            visible: { opacity: 1, x: 0, transition: SPRING_PRESETS.cinematic },
                          }
                    }
                    whileHover={
                      isReduced
                        ? undefined
                        : {
                            scale: 1.01,
                            borderColor: "rgba(109,216,255,0.6)",
                            backgroundColor: "rgba(0,0,0,0.35)",
                          }
                    }
                    className="rounded-md border border-line bg-black/25 p-4 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white">{source.label}</h4>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{evidenceTypeLabel(source.sourceType)}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${confidenceClass(source.confidence)}`}>
                        {formatConfidence(source.confidence)}
                      </span>
                    </div>
                    <p className="mt-3 rounded-sm border border-dashed border-cyan/30 bg-cyan/5 px-2 py-1 text-xs text-slate-300">{source.publicSafeLabel}</p>
                    <ul className="mt-3 grid gap-1 text-sm leading-6 text-slate-300">
                      {source.supports.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs uppercase tracking-[0.1em] text-slate-500">Last refreshed: {source.lastRefreshed ?? "Evidence pending"}</p>
                  </motion.article>
                ))}
              </motion.div>
              <motion.a
                href="#evidence-ledger"
                onClick={onClose}
                className={`${compactLinkClass} mt-5 inline-block`}
                whileHover={isReduced ? undefined : { scale: 1.04 }}
                whileTap={isReduced ? undefined : { scale: 0.96 }}
              >
                View evidence ledger
              </motion.a>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
