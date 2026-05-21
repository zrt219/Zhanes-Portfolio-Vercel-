"use client";

import { sampleLogs } from "@/lib/sample-logs";
import { InfoTip } from "./InfoTip";

export function SampleLogPicker({ activeId, onPick }: { activeId: string; onPick: (id: string) => void }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Simulated fixture logs{" "}
        <InfoTip label="Fixture log">A safe sample error log used to demonstrate the tool without exposing a real project.</InfoTip>
      </p>
      <div className="grid gap-2">
        {sampleLogs.map((sample, index) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onPick(sample.id)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              activeId === sample.id ? "border-cyan/70 bg-cyan/10 shadow-[inset_3px_0_0_rgba(109,216,255,0.85)]" : "border-white/10 bg-white/[0.035] hover:border-white/30 hover:bg-white/[0.055]"
            }`}
          >
            <span className="mr-2 font-mono text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm font-medium text-white">{sample.title}</span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-slate-500">{sample.expected}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
