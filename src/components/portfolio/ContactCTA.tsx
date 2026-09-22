"use client";

import { ExternalLink, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { SocialLinks } from "../SocialLinks";
import { CopyEmailButton } from "./CopyEmailButton";
import { primaryLinkClass, secondaryLinkClass, sectionShellClass } from "./shared";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

const trustItems = ["Source-backed", "Demo-labeled", "No private keys", "Public-safe"];

export function ContactCTA() {
  const isReduced = useSafeReducedMotion();

  return (
    <section id="contact" className={`${sectionShellClass} mb-8 border-cyan/35 bg-cyan/10 relative overflow-hidden`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">Contact</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Let's talk about applied AI systems, developer tools, agent workflows, or eval infrastructure.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
            Send the role, team, or system problem. Strong proof paths: Build Doctor for developer tooling and reliability, AI Gateway for AI infrastructure, Enterprise Workflow Studio for approval-gated agents, and Resume Auditor for evidence-grounded RAG.
          </p>
          <div className="mt-5">
            <CopyEmailButton />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <motion.a
              href="mailto:zpeace11@gmail.com"
              className={primaryLinkClass}
              whileHover={isReduced ? undefined : { scale: 1.03 }}
              whileTap={isReduced ? undefined : { scale: 0.97 }}
              transition={SPRING_PRESETS.snappy}
            >
              Email about an AI engineering role <Mail className="h-4 w-4" aria-hidden="true" />
            </motion.a>
            <motion.a
              href="https://github.com/zrt219"
              target="_blank"
              rel="noreferrer"
              className={secondaryLinkClass}
              whileHover={isReduced ? undefined : { scale: 1.03 }}
              whileTap={isReduced ? undefined : { scale: 0.97 }}
              transition={SPRING_PRESETS.snappy}
            >
              GitHub <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </motion.a>
          </div>
        </div>

        <motion.div
          whileHover={isReduced ? undefined : { scale: 1.02, borderColor: "rgba(109,216,255,0.6)" }}
          transition={SPRING_PRESETS.snappy}
          className="rounded-md border border-line bg-black/30 p-4 transition-colors"
        >
          <p className="text-sm font-semibold text-white">Public links</p>
          <div className="mt-3">
            <SocialLinks />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {trustItems.map((item) => (
              <motion.span
                key={item}
                whileHover={isReduced ? undefined : { scale: 1.05, borderColor: "rgba(109,216,255,0.8)" }}
                className="rounded-full border border-cyan/45 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
