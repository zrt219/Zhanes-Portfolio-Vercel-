import { Activity, CheckCircle2, Code2, Database, FileCode2, Github, ShieldCheck, Sigma } from "lucide-react";
import { portfolioAnalytics, portfolioStats, portfolioStatsLastUpdated } from "@/data/portfolioStats";
import { proofChipClass } from "./shared";

const iconByIndex = [Activity, Database, FileCode2, Github, ShieldCheck, Code2, Sigma, CheckCircle2];
const statCards = [
  ...portfolioStats.slice(0, 4),
  ...portfolioAnalytics.map((item) => ({
    id: item.id,
    label: item.label,
    value: item.value,
    displayValue: item.value,
    sourceLabel: item.sourceLabel,
    sourceFile: item.sourceFile,
    confidence: "High" as const,
    detail: "Verified summary value from the May 30 evidence snapshot.",
    description: item.label,
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  })),
];

export function StatsRibbon() {
  return (
    <section id="metrics" className="scroll-mt-28 rounded-xl border border-cyan/40 bg-black/40 p-5 backdrop-blur-md shadow-2xl" aria-label="Verified proof stats snapshot">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan">Verified proof stats</p>
          <h2 className="mt-1 text-2xl font-bold text-white">May 30 evidence snapshot</h2>
        </div>
        <span className={proofChipClass}>
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />
          Not image-derived
        </span>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = iconByIndex[index % iconByIndex.length];
          return (
            <article key={stat.id} className="glass-card rounded-lg p-4 transition-all duration-300">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold leading-none text-white text-gradient-cyan md:text-3xl">{stat.displayValue}</p>
                  <h3 className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-200">{stat.label}</h3>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan/50 bg-cyan/15 shadow-[0_0_12px_rgba(109,216,255,0.2)]">
                  <Icon aria-hidden="true" className="h-4 w-4 text-cyan" />
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{stat.description}</p>
              <p className="mt-3 rounded-md border border-dashed border-cyan/35 bg-cyan/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-300">
                {stat.confidence} confidence - {stat.sourceLabel}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
