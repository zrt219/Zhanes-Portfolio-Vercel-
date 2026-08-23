import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { compactLinkClass, primaryLinkClass, proofActionLabel, proofStatusClass, proofStatusLabel, sectionShellClass } from "./shared";

const lifecycleChipClass = {
  alpha: "border-yellow-300/60 bg-yellow-400/20 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.2)]",
  hackathon: "border-sky-300/60 bg-sky-400/20 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.2)]",
} as const;

const lifecycleLabel = {
  alpha: "Alpha",
  hackathon: "Hackathon",
} as const;

export function FeaturedProofGrid() {
  return (
    <section id="featured-projects" className={sectionShellClass}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan">Featured proof systems</p>
          <h2 className="mt-2 text-3xl font-extrabold text-white">Start with the systems carrying the clearest technical evidence.</h2>
        </div>
        <a href="#projects" className={compactLinkClass}>
          Open full directory
        </a>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {featuredProjects.map((project) => (
          <article
            key={project.id}
            className={`glass-card rounded-xl p-6 transition-all duration-300 ${
              project.signature
                ? "border-cyan/70 bg-gradient-to-b from-cyan/15 via-panel/80 to-panel/90 shadow-[0_0_35px_rgba(109,216,255,0.2)] lg:col-span-2"
                : "border-line/70 bg-panel/60"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan">{project.category}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{project.title}</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${proofStatusClass(project.proofStatus)}`}>
                {proofStatusLabel(project.proofStatus)}
              </span>
              {project.lifecycleStatus ? (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${lifecycleChipClass[project.lifecycleStatus]}`}
                  aria-label={`${project.title} ${lifecycleLabel[project.lifecycleStatus]} status`}
                >
                  {lifecycleLabel[project.lifecycleStatus]}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{project.valueProposition}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{project.technicalSignal}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((chip) => (
                <span key={chip} className="rounded-full border border-line/80 bg-black/40 px-3 py-1 text-xs font-medium text-slate-300">
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {project.proofBriefSlug ? (
                <Link href={`/projects/${project.proofBriefSlug}`} className={project.signature ? primaryLinkClass : compactLinkClass} aria-label={`View proof brief for ${project.title}`}>
                  View proof brief
                </Link>
              ) : null}
              {project.demoUrl ? (
                <a href={project.demoUrl} target="_blank" rel="noreferrer" className={compactLinkClass}>
                  {proofActionLabel(project.proofStatus)} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
              {project.githubUrl ? (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className={compactLinkClass}>
                  GitHub <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
