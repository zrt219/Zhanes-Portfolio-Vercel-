"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { featuredProjects } from "@/data/projects";
import {
  compactLinkClass,
  primaryLinkClass,
  proofActionLabel,
  proofStatusClass,
  proofStatusLabel,
  sectionShellClass,
} from "./shared";
import { TiltCard } from "@/components/motion/TiltCard";
import {
  cascadeVariants,
  cinematicSpring,
  fadeInScaleItem,
  snappySpring,
  useSafeReducedMotion,
} from "@/lib/motion";

const lifecycleChipClass = {
  alpha: "border-yellow-300/60 bg-yellow-400/20 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.2)]",
  hackathon: "border-sky-300/60 bg-sky-400/20 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.2)]",
} as const;

const lifecycleLabel = {
  alpha: "Alpha",
  hackathon: "Hackathon",
} as const;

export function FeaturedProofGrid() {
  const isReduced = useSafeReducedMotion();

  // Signature card variant with anchored high-stiffness spring
  const signatureCardVariants: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 240,
        damping: 22,
      },
    },
  };

  const secondaryCardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: cinematicSpring,
    },
  };

  return (
    <section id="featured-projects" className={sectionShellClass}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan">Featured proof systems</p>
          <h2 className="mt-2 text-3xl font-extrabold text-white">Start with the systems carrying the clearest technical evidence.</h2>
        </div>
        <motion.a
          href="#projects"
          className={compactLinkClass}
          whileHover={isReduced ? undefined : { scale: 1.04 }}
          whileTap={isReduced ? undefined : { scale: 0.96 }}
          transition={snappySpring}
        >
          Open full directory
        </motion.a>
      </div>

      <motion.div
        className="mt-6 grid gap-5 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={isReduced ? undefined : cascadeVariants}
      >
        {featuredProjects.map((project) => (
          <motion.div
            key={project.id}
            variants={
              isReduced
                ? undefined
                : project.signature
                ? signatureCardVariants
                : secondaryCardVariants
            }
            className={project.signature ? "lg:col-span-2 h-full" : "h-full"}
          >
            <TiltCard
              maxTilt={project.signature ? 4 : 7}
              glare={true}
              glareOpacity={project.signature ? 0.18 : 0.12}
              className="h-full rounded-xl"
            >
              <article
                className={`glass-card flex h-full flex-col justify-between rounded-xl p-6 transition-all duration-300 ${
                  project.signature
                    ? "border-cyan/70 bg-gradient-to-b from-cyan/15 via-panel/80 to-panel/90 shadow-[0_0_35px_rgba(109,216,255,0.2)] hover:shadow-[0_0_45px_rgba(109,216,255,0.3)]"
                    : "border-line/70 bg-panel/60 hover:border-cyan/50"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan">{project.category}</p>
                      <h3 className="mt-2 text-2xl font-bold text-white">{project.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <motion.span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${proofStatusClass(project.proofStatus)}`}
                        animate={
                          isReduced || !project.signature
                            ? undefined
                            : {
                                boxShadow: [
                                  "0 0 10px rgba(109,216,255,0.2)",
                                  "0 0 22px rgba(109,216,255,0.5)",
                                  "0 0 10px rgba(109,216,255,0.2)",
                                ],
                              }
                        }
                        transition={{
                          duration: 3.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {proofStatusLabel(project.proofStatus)}
                      </motion.span>
                      {project.lifecycleStatus ? (
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${lifecycleChipClass[project.lifecycleStatus]}`}
                          aria-label={`${project.title} ${lifecycleLabel[project.lifecycleStatus]} status`}
                        >
                          {lifecycleLabel[project.lifecycleStatus]}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{project.valueProposition}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{project.technicalSignal}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((chip) => (
                      <motion.span
                        key={chip}
                        className="rounded-full border border-line/80 bg-black/40 px-3 py-1 text-xs font-medium text-slate-300"
                        whileHover={isReduced ? undefined : { scale: 1.05, borderColor: "rgba(109,216,255,0.5)" }}
                        transition={snappySpring}
                      >
                        {chip}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {project.proofBriefSlug ? (
                    <motion.div
                      whileHover={isReduced ? undefined : { scale: 1.03 }}
                      whileTap={isReduced ? undefined : { scale: 0.97 }}
                      transition={snappySpring}
                    >
                      <Link
                        href={`/projects/${project.proofBriefSlug}`}
                        className={project.signature ? primaryLinkClass : compactLinkClass}
                        aria-label={`View proof brief for ${project.title}`}
                      >
                        View proof brief
                      </Link>
                    </motion.div>
                  ) : null}
                  {project.demoUrl ? (
                    <motion.a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={compactLinkClass}
                      whileHover={isReduced ? undefined : { scale: 1.03 }}
                      whileTap={isReduced ? undefined : { scale: 0.97 }}
                      transition={snappySpring}
                    >
                      {proofActionLabel(project.proofStatus)} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </motion.a>
                  ) : null}
                  {project.githubUrl ? (
                    <motion.a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={compactLinkClass}
                      whileHover={isReduced ? undefined : { scale: 1.03 }}
                      whileTap={isReduced ? undefined : { scale: 0.97 }}
                      transition={snappySpring}
                    >
                      GitHub <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </motion.a>
                  ) : null}
                </div>
              </article>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
