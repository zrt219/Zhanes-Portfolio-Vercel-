"use client";

import { ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { compactLinkClass, sectionShellClass } from "./shared";
import { TiltCard } from "@/components/motion/TiltCard";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

const steps = [
  {
    time: "0:00",
    title: "Open Evidence Dashboard",
    detail: "Start with the signature proof surface and public evidence engine repo.",
    href: "https://zhane-grey-evidence-dashboard.vercel.app",
    external: true,
    action: "Open dashboard",
  },
  {
    time: "0:20",
    title: "Review proof metrics",
    detail: "Check the May 30 counts, source labels, and dated workflow-event snapshot.",
    href: "#metrics",
    action: "View metrics",
  },
  {
    time: "0:40",
    title: "Test Build Doctor",
    detail: "Run the deterministic Vercel build diagnostic workflow.",
    href: "/build-doctor",
    action: "Run demo",
  },
  {
    time: "1:00",
    title: "Inspect eval and health endpoints",
    detail: "Use the ledger to verify public status and fallback routes.",
    href: "#evidence-ledger",
    action: "Open ledger",
  },
  {
    time: "1:20",
    title: "Open GitHub source",
    detail: "Inspect the public repo profile and strongest source-backed projects.",
    href: "https://github.com/zrt219",
    external: true,
    action: "Open GitHub",
  },
  {
    time: "1:30",
    title: "Email Zhane",
    detail: "Start a technical conversation after reviewing the proof path.",
    href: "mailto:zpeace11@gmail.com",
    action: "Email",
  },
];

export function RecruiterPath() {
  const isReduced = useSafeReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING_PRESETS.cinematic,
    },
  };

  return (
    <section id="recruiter-path" className={sectionShellClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">Guided proof path</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">A fast route through the strongest technical evidence.</h2>
        </div>
      </div>

      <motion.div
        className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={isReduced ? undefined : containerVariants}
      >
        {steps.map((step) => {
          const content = (
            <>
              {step.action}
              {step.external ? <ExternalLink className="h-4 w-4" aria-hidden="true" /> : step.href.startsWith("mailto:") ? <Mail className="h-4 w-4" aria-hidden="true" /> : null}
            </>
          );
          return (
            <motion.div
              key={step.title}
              variants={isReduced ? undefined : itemVariants}
              className="h-full"
            >
              <TiltCard
                maxTilt={6}
                glare={true}
                glareOpacity={0.1}
                className="h-full rounded-md"
              >
                <article className="flex h-full flex-col justify-between rounded-md border border-line bg-black/30 p-4 transition-colors hover:border-cyan/50 hover:bg-black/40">
                  <div>
                    <p className="font-mono text-sm text-cyan font-semibold">{step.time}</p>
                    <h3 className="mt-2 font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.detail}</p>
                  </div>
                  <div className="mt-4">
                    {step.external || step.href.startsWith("mailto:") ? (
                      <motion.a
                        href={step.href}
                        target={step.external ? "_blank" : undefined}
                        rel={step.external ? "noreferrer" : undefined}
                        className={compactLinkClass}
                        whileHover={isReduced ? undefined : { scale: 1.04 }}
                        whileTap={isReduced ? undefined : { scale: 0.96 }}
                        transition={SPRING_PRESETS.snappy}
                      >
                        {content}
                      </motion.a>
                    ) : (
                      <motion.div
                        whileHover={isReduced ? undefined : { scale: 1.04 }}
                        whileTap={isReduced ? undefined : { scale: 0.96 }}
                        transition={SPRING_PRESETS.snappy}
                      >
                        <Link href={step.href} className={compactLinkClass}>
                          {content}
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </article>
              </TiltCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
