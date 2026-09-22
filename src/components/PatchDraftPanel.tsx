"use client";

import { useState } from "react";
import { AlertTriangle, Code2, Files, TerminalSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Diagnosis } from "@/lib/schemas";
import { InfoTip } from "./InfoTip";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

const draftTabs = [
  { id: "all", label: "All Views" },
  { id: "snippet", label: "Configuration snippet" },
  { id: "commands", label: "Verification commands" },
  { id: "files", label: "Target files" },
];

export function PatchDraftPanel({ diagnosis }: { diagnosis: Diagnosis }) {
  const isReduced = useSafeReducedMotion();
  const [activeTab, setActiveTab] = useState("all");

  const patchRationale =
    diagnosis.failureType === "SUPABASE_CONFIG_ERROR"
      ? "The captured build log indicates the client setup could not read the public Supabase URL or anon key from that build environment."
      : diagnosis.patchDraft.rationale;

  const showFiles = activeTab === "all" || activeTab === "files";
  const showSnippet = activeTab === "all" || activeTab === "snippet";
  const showCommands = activeTab === "all" || activeTab === "commands";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Safe patch draft{" "}
            <InfoTip label="Patch draft">A deterministic repair recommendation for the detected failure class, not a live repo-aware diff.</InfoTip>
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{patchRationale}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The patch draft is a review aid. Build Doctor does not apply code changes automatically.
          </p>
        </div>
        <span className="rounded-full border border-gold/60 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
          {diagnosis.patchDraft.confidence} confidence
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-white/10 pb-3" role="tablist" aria-label="Patch draft tabs">
        {draftTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className="relative rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors hover:text-white"
            >
              {isActive && (
                <motion.div
                  layoutId="activePatchDraftTab"
                  className="absolute inset-0 rounded-full border border-cyan/50 bg-cyan/15 shadow-[0_0_12px_rgba(109,216,255,0.25)]"
                  transition={isReduced ? { duration: 0 } : SPRING_PRESETS.snappy}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={isReduced ? undefined : { opacity: 0, y: 8 }}
          animate={isReduced ? undefined : { opacity: 1, y: 0 }}
          exit={isReduced ? undefined : { opacity: 0, y: -8 }}
          transition={SPRING_PRESETS.cinematic}
          className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]"
        >
          {showFiles && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 text-cyan">
                <Files className="h-4 w-4" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Likely affected files</p>
              </div>
              <h4 className="mt-3 text-base font-semibold text-white">{diagnosis.patchDraft.title}</h4>
              <div className="mt-4 space-y-2">
                {diagnosis.patchDraft.likelyAffectedFiles.length ? (
                  diagnosis.patchDraft.likelyAffectedFiles.map((file) => (
                    <div key={file} className="rounded-xl border border-white/10 bg-black/35 px-3 py-3 font-mono text-sm text-slate-100">
                      {file}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/20 px-3 py-3 text-sm text-slate-300">
                    No deterministic file target identified. Use the evidence lines to locate the first failing file before changing code.
                  </div>
                )}
              </div>
            </div>
          )}

          {(showSnippet || showCommands) && (
            <div className={`rounded-2xl border border-white/10 bg-black/30 p-4 ${!showFiles ? "lg:col-span-2" : ""}`}>
              {showSnippet && (
                <motion.div
                  initial={isReduced ? undefined : { opacity: 0, y: 10 }}
                  animate={isReduced ? undefined : { opacity: 1, y: 0 }}
                  transition={SPRING_PRESETS.cinematic}
                >
                  <div className="flex items-center gap-2 text-cyan">
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">Suggested configuration snippet</p>
                  </div>
                  <pre className="mt-4 max-h-[280px] overflow-auto rounded-2xl border border-cyan/15 bg-slate-950/80 p-4 whitespace-pre-wrap text-sm leading-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <code>{diagnosis.patchDraft.snippet}</code>
                  </pre>
                </motion.div>
              )}

              {showCommands && (
                <motion.div
                  initial={isReduced ? undefined : { opacity: 0, y: 10 }}
                  animate={isReduced ? undefined : { opacity: 1, y: 0 }}
                  transition={isReduced ? undefined : { ...SPRING_PRESETS.cinematic, delay: isReduced ? 0 : 0.08 }}
                  className="mt-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">Verification commands</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {diagnosis.patchDraft.verificationCommands.map((command, idx) => (
                      <motion.span
                        key={command}
                        initial={isReduced ? undefined : { opacity: 0, scale: 0.95 }}
                        animate={isReduced ? undefined : { opacity: 1, scale: 1 }}
                        transition={isReduced ? undefined : { ...SPRING_PRESETS.snappy, delay: isReduced ? 0 : idx * 0.04 }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 font-mono text-xs text-slate-100"
                      >
                        <TerminalSquare className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />
                        {command}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "all" && (
                <div className="mt-4 rounded-2xl border border-dashed border-gold/45 bg-gold/5 p-3">
                  <div className="flex items-center gap-2 text-gold">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">Review risks</p>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
                    {diagnosis.patchDraft.risks.map((risk) => (
                      <li key={risk}>- {risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
