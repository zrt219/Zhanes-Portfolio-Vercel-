import { taxonomyById } from "./failure-taxonomy";
import { parseBuildLog } from "./log-parser";
import { redactSecrets } from "./redact-secrets";
import { sampleLogs } from "./sample-logs";
import type { Diagnosis, EvalResults } from "./schemas";

type EvalResultLabel = EvalResults["cases"][number]["result"];

export function diagnoseBuildLog(rawLog: string): Diagnosis {
  const { redacted, redactions } = redactSecrets(rawLog);
  const parsed = parseBuildLog(redacted);
  const recipe = taxonomyById[parsed.failureType];
  const fallbackEvidence = parsed.evidence.length
    ? parsed.evidence
    : [{ lineNumber: 1, kind: "info" as const, content: redacted.split("\n").find(Boolean)?.slice(0, 220) ?? "No diagnostic lines found." }];

  return {
    ...parsed,
    evidence: fallbackEvidence,
    fixPlan: recipe.fixSteps,
    patchChecklist: [
      `Confirm the first fatal signal maps to ${recipe.label}.`,
      "Apply the smallest code or configuration change that addresses the root cause.",
      "Keep secrets in Vercel environment variables; do not hardcode them in source.",
      "Rerun the verification commands before deploying.",
    ],
    verificationCommands: recipe.verificationCommands,
    preventionChecklist: recipe.preventionChecks,
    readinessReport: {
      status: parsed.failureType === "UNKNOWN" ? "NEEDS_REVIEW" : "READY_AFTER_FIX",
      summary:
        parsed.failureType === "UNKNOWN"
          ? "The log needs human review or additional context before a deployment readiness claim is safe."
          : "Deployment is ready to retry after the fix plan is applied and verification commands pass.",
      remainingRisks:
        parsed.failureType === "UNKNOWN"
          ? ["Low-confidence classification", "Full build context may be missing"]
          : ["Fix has not been applied inside this diagnostic session", "External Vercel project settings still need verification"],
    },
    redactedLog: redacted,
    redactions,
    generatedAt: new Date().toISOString(),
  };
}

export function generateIncidentReport(diagnosis: Diagnosis) {
  const evidence = diagnosis.evidence
    .map((line) => `- L${line.lineNumber} [${line.kind.toUpperCase()}]: ${line.content}`)
    .join("\n");
  const fixes = diagnosis.fixPlan.map((step) => `- ${step}`).join("\n");
  const commands = diagnosis.verificationCommands.map((command) => `- \`${command}\``).join("\n");
  const risks = diagnosis.readinessReport.remainingRisks.map((risk) => `- ${risk}`).join("\n");

  return `# Build Doctor Incident Report

## Summary
${diagnosis.label} detected with ${(diagnosis.confidence * 100).toFixed(0)}% confidence.

## Evidence
${evidence}

## Root Cause
${diagnosis.probableRootCause}

## Fix Plan
${fixes}

## Commands To Verify
${commands}

## Deployment Readiness
${diagnosis.readinessReport.status}: ${diagnosis.readinessReport.summary}

## Remaining Risks
${risks}

## Safety Notes
- Raw secrets are redacted before diagnosis and reporting.
- Demo output is deterministic and does not require Vercel, GitHub, or model-provider credentials.
`;
}

export function runEvalSuite(): EvalResults {
  const cases = sampleLogs.map((sample) => {
    const diagnosis = diagnoseBuildLog(sample.log);
    const fixText = diagnosis.fixPlan.join(" ").toLowerCase();
    const evidenceText = diagnosis.evidence.map((line) => line.content).join(" ").toLowerCase();
    const categoryCorrect = diagnosis.failureType === sample.expected;
    const hasFixSignal = sample.requiredFixSignals.some((signal) => fixText.includes(signal.toLowerCase()));
    const hasEvidence = evidenceText.length > 0;
    const secretSafe = !/postgresql:\/\/user:secret/i.test(diagnosis.redactedLog);
    const result: EvalResultLabel = categoryCorrect && hasFixSignal && hasEvidence && secretSafe ? "PASS" : categoryCorrect ? "PARTIAL" : "FAIL";

    return {
      id: sample.id,
      name: sample.title,
      expected: sample.expected,
      actual: diagnosis.failureType,
      result,
      notes: [
        categoryCorrect ? "Category matched expected taxonomy." : "Category mismatch.",
        hasFixSignal ? "Fix plan includes relevant remediation language." : "Fix plan needs stronger matching remediation.",
        secretSafe ? "Redaction safety check passed." : "Redaction safety check failed.",
      ],
    };
  });

  const passed = cases.filter((item) => item.result === "PASS").length;
  const partial = cases.filter((item) => item.result === "PARTIAL").length;
  const failed = cases.filter((item) => item.result === "FAIL").length;

  return {
    total: cases.length,
    passed,
    partial,
    failed,
    score: Math.round(((passed + partial * 0.5) / cases.length) * 100),
    cases,
  };
}
