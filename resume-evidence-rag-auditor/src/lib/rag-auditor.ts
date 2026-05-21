import { z } from "zod";

export const auditRequestSchema = z.object({
  jobDescription: z.string().min(10).max(8000).default("Applied AI engineer role focused on RAG, evals, agent workflows, and customer-facing AI systems."),
  claims: z.array(z.string()).default([
    "Built Vercel Build Doctor Agent with log parsing, redaction, structured reports, and eval harness.",
    "Built enterprise-safe agent workflow demos with approval gates and audit reports.",
    "Led production AI platform for millions of users.",
  ]),
});

export type AuditRequest = z.input<typeof auditRequestSchema>;

export const evidenceCorpus = [
  {
    id: "build-doctor",
    title: "Vercel Build Doctor Agent",
    tags: ["vercel", "next.js", "log parsing", "redaction", "evals", "reports"],
    proof: "Verified app classifies deployment failures, redacts secrets, exports incident reports, and runs 8 eval fixtures.",
  },
  {
    id: "enterprise-workflow",
    title: "Enterprise Agent Workflow Studio",
    tags: ["agents", "approval gates", "audit", "tool registry", "evals"],
    proof: "Models mock tools, agent graph generation, approval gates, deterministic evals, and audit exports.",
  },
  {
    id: "gateway-playground",
    title: "AI Gateway Failover Playground",
    tags: ["gateway", "provider routing", "fallback", "latency", "cost", "trace"],
    proof: "Simulates unified chat routing with outage fallback, cost/latency telemetry, request traces, and eval fixtures.",
  },
  {
    id: "rag-auditor",
    title: "Resume Evidence RAG Auditor",
    tags: ["rag", "retrieval", "claim verification", "job matching", "grounded bullets", "evals"],
    proof: "Audits resume claims against local evidence, flags unsupported claims, and generates grounded bullets.",
  },
];

function scoreClaim(claim: string, jobDescription: string) {
  const normalized = `${claim} ${jobDescription}`.toLowerCase();
  const matches = evidenceCorpus
    .map((item) => {
      const overlap = item.tags.filter((tag) => normalized.includes(tag.toLowerCase()));
      return { ...item, overlap };
    })
    .filter((item) => item.overlap.length > 0)
    .sort((a, b) => b.overlap.length - a.overlap.length);

  const jobTerms = jobDescription.toLowerCase().split(/[^a-z0-9.+#-]+/).filter((term) => term.length > 3);
  const jobOverlap = Array.from(new Set(jobTerms.filter((term) => claim.toLowerCase().includes(term) || matches.some((item) => item.tags.some((tag) => tag.includes(term)))))).slice(0, 8);
  const inflationFlags = [
    /millions/i.test(claim) ? "Scale claim requires direct usage evidence." : "",
    /fortune|openai reviewed|anthropic reviewed/i.test(claim) ? "External reviewer/company claim is unsupported." : "",
    /production ai platform/i.test(claim) ? "Production platform claim exceeds verified demo/project evidence." : "",
  ].filter(Boolean);
  const verified = matches.length > 0 && inflationFlags.length === 0;
  return {
    claim,
    status: verified ? "VERIFIED" : "UNVERIFIED",
    confidence: verified ? Math.min(0.95, 0.55 + matches[0].overlap.length * 0.1 + jobOverlap.length * 0.03) : 0.28,
    jobOverlap,
    evidence: matches.slice(0, 3).map((item) => ({ id: item.id, title: item.title, proof: item.proof, matchedTags: item.overlap })),
    flags: verified ? [] : [...inflationFlags, "Claim lacks matching local evidence or appears inflated beyond verified project scope."],
    evidenceGap: verified ? "" : "Add a project URL, commit, test output, deployment URL, or work-log entry before using this claim.",
  };
}

export function auditResumeClaims(input: AuditRequest) {
  const config = auditRequestSchema.parse(input);
  const auditedClaims = config.claims.map((claim) => scoreClaim(claim, config.jobDescription));
  const verified = auditedClaims.filter((claim) => claim.status === "VERIFIED").length;
  const tailoredBullets = auditedClaims
    .filter((claim) => claim.status === "VERIFIED")
    .map((claim) => {
      const evidenceTitles = claim.evidence.map((item) => item.title).join(", ");
      return `${claim.claim.replace(/\.$/, "")}; evidence: ${evidenceTitles}; aligned terms: ${claim.jobOverlap.join(", ") || "AI engineering"}.`;
    });
  const evidenceGaps = auditedClaims.filter((claim) => claim.status === "UNVERIFIED").map((claim) => ({ claim: claim.claim, gap: claim.evidenceGap, flags: claim.flags }));

  return {
    mode: "DEMO JSON RETRIEVAL",
    jobDescription: config.jobDescription,
    auditedClaims,
    summary: {
      total: auditedClaims.length,
      verified,
      unverified: auditedClaims.length - verified,
      score: Math.round((verified / auditedClaims.length) * 100),
    },
    tailoredBullets,
    evidenceGaps,
    readiness: {
      status: evidenceGaps.length ? "REVIEW" : "READY",
      checklist: [
        "Remove or rewrite unverified claims.",
        "Attach deployment URLs and commit evidence to verified claims.",
        "Run eval fixtures before exporting role-specific bullets.",
        "Keep demo-only claims labeled accurately.",
      ],
    },
    safetyNotes: [
      "The MVP uses JSON mock retrieval, not a live vector database.",
      "Unverified claims are flagged instead of rewritten as facts.",
      "Generated bullets are grounded only in matched evidence records.",
    ],
  };
}

export function generateReport(audit: ReturnType<typeof auditResumeClaims>) {
  return `# Resume Evidence RAG Audit Report

## Summary
${audit.summary.verified}/${audit.summary.total} claims verified against local evidence.

## Claim Review
${audit.auditedClaims.map((claim) => `- ${claim.status}: ${claim.claim}`).join("\n")}

## Tailored Bullets
${audit.tailoredBullets.map((bullet) => `- ${bullet}`).join("\n")}

## Safety Notes
${audit.safetyNotes.map((note) => `- ${note}`).join("\n")}
`;
}

export function runEvalSuite() {
  const audit = auditResumeClaims(auditRequestSchema.parse({}));
  const unsafeFlagged = audit.auditedClaims.some((claim) => claim.claim.includes("millions") && claim.status === "UNVERIFIED");
  const verifiedEvidence = audit.auditedClaims.filter((claim) => claim.status === "VERIFIED").every((claim) => claim.evidence.length > 0);
  const bulletsGrounded = audit.tailoredBullets.length === audit.summary.verified;
  const gapsPresent = audit.evidenceGaps.length === audit.summary.unverified;
  const cases = [
    { id: "unverified-claim-flagging", result: unsafeFlagged ? "PASS" : "FAIL" },
    { id: "verified-evidence-match", result: verifiedEvidence ? "PASS" : "FAIL" },
    { id: "grounded-bullet-count", result: bulletsGrounded ? "PASS" : "FAIL" },
    { id: "evidence-gap-generation", result: gapsPresent ? "PASS" : "FAIL" },
  ];
  const passed = cases.filter((item) => item.result === "PASS").length;
  return { total: cases.length, passed, failed: cases.length - passed, score: Math.round((passed / cases.length) * 100), cases };
}
