"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, FileWarning, ServerCog, ShieldCheck } from "lucide-react";
import { sampleLogs } from "@/lib/sample-logs";
import type { Diagnosis } from "@/lib/schemas";
import { suiteApps } from "@/lib/suite-metadata";
import { CaseStudySection } from "./CaseStudySection";
import { DiagnosisPanel } from "./DiagnosisPanel";
import { EvidenceTable } from "./EvidenceTable";
import { FixPlan } from "./FixPlan";
import { InfoTip } from "./InfoTip";
import { IncidentReport } from "./IncidentReport";
import { LogInput } from "./LogInput";
import { SampleLogPicker } from "./SampleLogPicker";
import { SocialLinks } from "./SocialLinks";
import { StatusChip } from "./StatusChip";

const pipelineSteps = ["Read the log", "Hide secrets", "Name the failure", "Show evidence", "Write the fix"];
const proofCards = [
  { icon: ShieldCheck, title: "Secret-safe", copy: "Raw tokens are replaced before display." },
  { icon: ClipboardCheck, title: "Evidence-led", copy: "The report shows the lines it used." },
  { icon: CheckCircle2, title: "Verify next", copy: "Commands are generated for the repair loop." },
];

export function BuildDoctorApp() {
  const [sampleId, setSampleId] = useState(sampleLogs[0].id);
  const activeSample = useMemo(() => sampleLogs.find((sample) => sample.id === sampleId) ?? sampleLogs[0], [sampleId]);
  const [log, setLog] = useState(activeSample.log);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  function pickSample(id: string) {
    const next = sampleLogs.find((sample) => sample.id === id);
    if (!next) return;
    setSampleId(id);
    setLog(next.log);
    setDiagnosis(null);
    setReport("");
  }

  async function diagnose() {
    setLoading(true);
    setReport("");
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log, sampleId }),
      });
      const payload = (await response.json()) as { diagnosis: Diagnosis };
      setDiagnosis(payload.diagnosis);
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    if (!diagnosis) return;
    setReportLoading(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis }),
      });
      const payload = (await response.json()) as { report: string };
      setReport(payload.report);
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-7 overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/75 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan/45 bg-cyan/10 shadow-[0_0_24px_rgba(109,216,255,0.16)]">
              <ServerCog className="h-5 w-5 text-cyan" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">ZRT Build Reliability Lab</p>
              <p className="text-base font-semibold text-white">Vercel Build Doctor Agent</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Suite navigation">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-cyan/60 hover:bg-cyan/10 hover:text-white">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Suite
            </Link>
            {suiteApps.slice(1).map((app) => (
              <a key={app.id} href={app.demoUrl} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-cyan/60 hover:bg-cyan/10 hover:text-white">
                {app.id.replace("-", " ")}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            <StatusChip kind="simulated" label="Demo mode" />
            <StatusChip kind="locked" label="No raw log storage" />
            <StatusChip kind="pass" label="Deterministic fallback" />
          </div>
          <SocialLinks />
        </div>
      </header>

      <section className="mb-7 overflow-hidden rounded-[28px] border border-cyan/20 bg-[radial-gradient(circle_at_12%_0%,rgba(109,216,255,0.16),transparent_34rem),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.92))] shadow-[0_28px_110px_rgba(0,0,0,0.45)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
              <FileWarning className="h-4 w-4" aria-hidden="true" />
              Build failure triage
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.98] text-white sm:text-5xl lg:text-[64px]">
              Turn failed deploy logs into a fix plan.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Paste a failing Vercel or Next.js build log. Build Doctor classifies the failure, extracts evidence, proposes fixes, generates a patch checklist, and exports a recruiter-ready incident report.
            </p>
            <div className="mt-5 max-w-2xl rounded-2xl border border-dashed border-cyan/35 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">Plain English</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                When a website fails to deploy, the error log can look overwhelming. This tool reads the log, hides secrets, points to the likely cause, and gives the next commands to try.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#diagnose" className="inline-flex items-center gap-2 rounded-xl border border-cyan/60 bg-cyan/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_40px_rgba(109,216,255,0.15)] transition hover:bg-cyan/30">
                Run diagnosis <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link href="/case-study" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white/35 hover:bg-white/[0.06]">
                View case study
              </Link>
            </div>
          </div>
          <aside className="border-t border-white/10 bg-black/20 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                5-step diagnostic pass{" "}
                <InfoTip label="Pipeline">The step-by-step path the tool follows, from pasted log to fix checklist.</InfoTip>
              </p>
              <div className="mt-5 space-y-3">
                {pipelineSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan/45 bg-cyan/10 font-mono text-xs text-cyan">{index + 1}</span>
                    <span className="text-sm font-semibold text-slate-100">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {proofCards.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <Icon className="h-4 w-4 text-cyan" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mb-7 grid gap-4 md:grid-cols-3">
        {[
          ["Suite role", "First stop in the connected AI systems demo: turn an incident signal into evidence."],
          ["Recruiter signal", "Shows failure analysis, structured outputs, redaction safety, and eval discipline."],
          ["Next handoff", "Use the incident report as context for gateway routing, workflow approval, and resume evidence."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-[0_14px_50px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
          </div>
        ))}
      </section>

      <div id="diagnose" className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-950/45 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] lg:grid-cols-[330px_1fr]">
        <SampleLogPicker activeId={sampleId} onPick={pickSample} />
        <LogInput value={log} onChange={setLog} onDiagnose={diagnose} loading={loading} />
      </div>

      <div className="mt-6 space-y-5">
        {diagnosis ? (
          <>
            <DiagnosisPanel diagnosis={diagnosis} />
            <EvidenceTable diagnosis={diagnosis} />
            <FixPlan diagnosis={diagnosis} />
            <IncidentReport report={report} onGenerate={generateReport} loading={reportLoading} />
          </>
        ) : (
          <section className="rounded-lg border border-dashed border-line bg-black/25 p-6 text-sm text-slate-400">
            Select a fixture or paste your own log, then run the deterministic diagnosis pipeline. Demo data is labeled simulated and raw logs are not stored.
          </section>
        )}
        <CaseStudySection />
      </div>
    </main>
  );
}
