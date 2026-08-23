import { CheckCircle2, Database, GitBranch, ShieldCheck } from "lucide-react";
import { portfolioStatsLastUpdated } from "@/data/portfolioStats";
import { latestWorkflowSnapshot } from "@/data/workflowEvents";
import { runEvalSuite } from "@/lib/build-doctor";
import { formatCount } from "./shared";

const callouts = [
  { label: "Claims", value: "Source-labeled", icon: ShieldCheck },
  { label: "Agent lanes", value: "3-lane Ralphplan", icon: GitBranch },
  { label: "Evidence refresh", value: portfolioStatsLastUpdated, icon: Database },
  { label: "Build Doctor eval", value: "Deterministic", icon: CheckCircle2 },
];

export function HolographicProofPanel() {
  const buildDoctorEvals = runEvalSuite();

  return (
    <aside className="relative min-h-[410px] overflow-hidden rounded-xl border border-cyan/40 bg-[#07111d]/90 p-6 shadow-[0_0_40px_rgba(109,216,255,0.18)] backdrop-blur-xl" aria-label="Source-labeled proof panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(109,216,255,0.25),transparent_42%),linear-gradient(135deg,rgba(109,216,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative grid gap-3 sm:grid-cols-2">
        {callouts.map((callout) => {
          const Icon = callout.icon;
          return (
            <div key={callout.label} className="rounded-lg border border-cyan/30 bg-black/40 p-3.5 backdrop-blur-md transition-colors hover:border-cyan/60 hover:bg-black/60">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">{callout.label}</p>
              </div>
              <p className="mt-1.5 text-sm font-bold text-white">{callout.value}</p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-6 flex min-h-[180px] items-center justify-center">
        <div className="holo-ring absolute h-52 w-52 rounded-full border border-cyan/50" />
        <div className="holo-ring holo-ring-delay absolute h-40 w-40 rounded-full border border-cyan/40" />
        <div className="absolute h-24 w-24 rotate-45 rounded-xl border border-cyan/80 bg-cyan/20 shadow-[0_0_50px_rgba(109,216,255,0.6)] backdrop-blur-sm" />
        <div className="absolute h-16 w-16 rotate-45 rounded-lg border border-white/70 bg-[#0e7bff]/50 shadow-[0_0_35px_rgba(14,123,255,0.8)]" />
        <div className="absolute bottom-3 h-2.5 w-64 rounded-full bg-cyan/50 blur-md" />
      </div>

      <div className="relative mt-6 grid gap-3 rounded-lg border border-line/80 bg-black/40 p-4 backdrop-blur-md sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workflow events</p>
          <p className="mt-1 text-2xl font-extrabold text-white text-gradient-cyan">{formatCount(latestWorkflowSnapshot.workflowEvents)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Codex sessions</p>
          <p className="mt-1 text-2xl font-extrabold text-white text-gradient-cyan">{formatCount(latestWorkflowSnapshot.sessionRows)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Eval fixtures</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-400">{buildDoctorEvals.passed}/{buildDoctorEvals.total}</p>
        </div>
      </div>
    </aside>
  );
}
