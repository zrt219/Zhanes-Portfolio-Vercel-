"use client";

import { Play, ClipboardPaste } from "lucide-react";
import { InfoTip } from "./InfoTip";

export function LogInput({
  value,
  onChange,
  onDiagnose,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  onDiagnose: () => void;
  loading: boolean;
}) {
  return (
    <section className="rounded-2xl border border-cyan/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.84))] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Build Log Intake</p>
          <h2 className="text-xl font-semibold leading-snug text-white">
            Paste a failed Vercel or Next.js build log{" "}
            <InfoTip label="Build log">The text output from a failed deploy. It usually contains the first clue about what broke.</InfoTip>
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gold/60 bg-gold/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
          Secrets redacted first
        </span>
      </div>
      <textarea
        aria-label="Build log input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[320px] w-full resize-y rounded-2xl border border-white/10 bg-black/55 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={onDiagnose}
        disabled={loading || !value.trim()}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan/70 bg-cyan/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-cyan/30 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Play className="h-4 w-4" aria-hidden="true" />
        {loading ? "Diagnosing" : "Diagnose Build"}
      </button>
    </section>
  );
}
