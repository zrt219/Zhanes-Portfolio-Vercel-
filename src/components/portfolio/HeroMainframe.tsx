import { ArrowRight, Github, Mail } from "lucide-react";
import Link from "next/link";
import { portfolioStatsLastUpdated } from "@/data/portfolioStats";
import { HolographicProofPanel } from "./HolographicProofPanel";
import { primaryLinkClass, secondaryLinkClass } from "./shared";

export function HeroMainframe() {
  return (
    <section className="grid gap-8 py-10 lg:min-h-[560px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan shadow-[0_0_15px_rgba(109,216,255,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan"></span>
          </span>
          Evidence-backed AI engineering systems
        </div>

        <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.06] text-white sm:text-5xl lg:text-6xl [text-wrap:balance]">
          AI engineering systems built like a{" "}
          <span className="bg-gradient-to-r from-cyan via-cyan-300 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(109,216,255,0.35)]">
            proof layer
          </span>
          .
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200 [text-wrap:pretty]">
          Agentic workflows, Vercel diagnostics, RAG/eval systems, Solidity proof layers, and working full-stack demos.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 [text-wrap:pretty]">
          Visual style follows the supplied reference, but evidence does not. Public stats and project links are sourced from the May 30 local evidence refresh, public GitHub records, and verified Vercel/demo URLs.
        </p>

        <div className="mt-6 flex flex-wrap gap-3" aria-label="Primary portfolio actions">
          <a href="https://github.com/zrt219" target="_blank" rel="noreferrer" className={primaryLinkClass}>
            <Github className="h-4 w-4" aria-hidden="true" />
            View GitHub
          </a>
          <a href="mailto:zpeace11@gmail.com" className={secondaryLinkClass}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email Zhane
          </a>
          <Link href="/build-doctor" className={secondaryLinkClass}>
            Try Build Doctor <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="#workflow-tracker" className={secondaryLinkClass}>
            Workflow Snapshot <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="#projects" className={secondaryLinkClass}>
            Project Directory <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-line/80 bg-black/40 backdrop-blur-md p-3.5 shadow-lg">
          <span className="rounded-full border border-cyan/50 bg-cyan/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan shadow-[0_0_10px_rgba(109,216,255,0.2)]">
            Ralphplan mode
          </span>
          {["Evidence", "Context", "Subagents", "Implementation", "Browser QA", "Proof ledger"].map((item, index) => (
            <span key={item} className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
              {index > 0 ? <span className="font-mono text-cyan/70">-&gt;</span> : null}
              <span className="rounded-md border border-line/50 bg-panel/50 px-2 py-0.5 transition-colors hover:border-cyan/40 hover:text-white">
                {item}
              </span>
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          Stats snapshot last verified: <span className="text-slate-300">{portfolioStatsLastUpdated}</span>
        </p>
      </div>

      <HolographicProofPanel />
    </section>
  );
}
