"use client";

import type { EvidenceConfidence } from "@/types/liveWorkflowTracker";
import { formatConfidence } from "@/lib/formatMetrics";
import { confidenceClass } from "@/lib/trackerEvidence";
import { TiltCard } from "@/components/motion/TiltCard";

type TrackerMetricCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  confidence?: EvidenceConfidence;
  sourceLabel?: string;
};

export function TrackerMetricCard({ label, value, helper, confidence = "high", sourceLabel }: TrackerMetricCardProps) {
  return (
    <TiltCard
      maxTilt={6}
      glare={true}
      glareOpacity={0.12}
      className="h-full rounded-md"
    >
      <article className="flex h-full flex-col justify-between rounded-md border border-cyan/20 bg-[#07111f]/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-cyan/45 hover:bg-[#07111f]">
        <div>
          <p className="text-2xl font-semibold leading-none text-white text-gradient-cyan">{value}</p>
          <h3 className="mt-3 text-sm font-semibold text-slate-100">{label}</h3>
          {helper ? <p className="mt-2 text-xs leading-5 text-slate-400">{helper}</p> : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sourceLabel ? <span className="rounded-full border border-line bg-black/25 px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-slate-300">{sourceLabel}</span> : null}
          <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${confidenceClass(confidence)}`}>
            {formatConfidence(confidence)}
          </span>
        </div>
      </article>
    </TiltCard>
  );
}
