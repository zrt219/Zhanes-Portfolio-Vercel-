"use client";

import { FileText } from "lucide-react";

export function IncidentReport({ report, onGenerate, loading }: { report: string; onGenerate: () => void; loading: boolean }) {
  return (
    <section className="rounded-lg border border-line bg-panel/90 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">Export</p>
          <h3 className="text-lg font-semibold text-white">Recruiter-ready incident report</h3>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-gold/70 bg-gold/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-gold/20 disabled:opacity-50"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          {loading ? "Generating" : "Generate Incident Report"}
        </button>
      </div>
      {report ? (
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-md border border-line bg-black/55 p-4 whitespace-pre-wrap text-sm leading-6 text-slate-100">{report}</pre>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-line p-4 text-sm text-slate-400">Generate a diagnosis first, then export a markdown report with evidence, root cause, fix plan, verification commands, and risks.</p>
      )}
    </section>
  );
}
