"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

const emailAddress = "zpeace11@gmail.com";

export function CopyEmailButton() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const isReduced = useSafeReducedMotion();

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("failed");
      window.setTimeout(() => setState("idle"), 2600);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <motion.a
        href={`mailto:${emailAddress}`}
        whileHover={isReduced ? undefined : { scale: 1.03 }}
        whileTap={isReduced ? undefined : { scale: 0.97 }}
        transition={SPRING_PRESETS.snappy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan/65 bg-cyan/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan hover:bg-cyan/25 hover:shadow-[0_0_15px_rgba(109,216,255,0.25)]"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        {emailAddress}
      </motion.a>
      <motion.button
        type="button"
        onClick={copyEmail}
        whileHover={isReduced ? undefined : { scale: 1.03 }}
        whileTap={isReduced ? undefined : { scale: 0.95 }}
        transition={SPRING_PRESETS.snappy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-black/35 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan/60 hover:bg-cyan/10"
        aria-label="Copy Zhane email address"
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === "copied" ? (
            <motion.span
              key="copied"
              initial={isReduced ? undefined : { scale: 0.5, rotate: -45 }}
              animate={isReduced ? undefined : { scale: 1, rotate: 0 }}
              exit={isReduced ? undefined : { scale: 0.5 }}
              transition={SPRING_PRESETS.bounce}
              className="inline-flex items-center gap-1.5 text-cyan"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Copied
            </motion.span>
          ) : state === "failed" ? (
            <motion.span
              key="failed"
              initial={isReduced ? undefined : { scale: 0.5 }}
              animate={isReduced ? undefined : { scale: 1 }}
              exit={isReduced ? undefined : { scale: 0.5 }}
              className="inline-flex items-center gap-1.5 text-rose-400"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy failed
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={isReduced ? undefined : { scale: 0.8 }}
              animate={isReduced ? undefined : { scale: 1 }}
              exit={isReduced ? undefined : { scale: 0.8 }}
              className="inline-flex items-center gap-1.5"
            >
              <Copy className="h-4 w-4 text-cyan" aria-hidden="true" />
              Copy email
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Email address copied" : state === "failed" ? "Email copy failed" : ""}
      </span>
    </div>
  );
}
