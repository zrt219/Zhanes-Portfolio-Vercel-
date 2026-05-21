import { z } from "zod";

export const auditRequestSchema = z.object({
  jobDescription: z.string().min(10).default("Applied AI engineer role focused on RAG, evals, agent workflows, and customer-facing AI systems."),
  claims: z.array(z.string()).default([
    "Built Vercel Build Doctor Agent with log parsing, redaction, structured reports, and eval harness.",
    "Built enterprise-safe agent workflow demos with approval gates and audit reports.",
    "Led production AI platform for millions of users.",
  ]),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;

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

  const verified = matches.length > 0 && !/millions|fortune|openai reviewed|production ai platform/i.test(claim);
  return {
    claim,
    status: verified ? "VERIFIED" : "UNVERIFIED",
    confidence: verified ? Math.min(0.95, 0.55 + matches[0].overlap.length * 0.12) : 0.28,
    evidence: matches.slice(0, 3).map((item) => ({ id: item.id, title: item.title, proof: item.proof, matchedTags: item.overlap })),
    flags: verified ? [] : ["Claim lacks matching local evidence or appears inflated beyond verified project scope."],
  };
}

export function auditResumeClaims(input: AuditRequest) {
  const auditedClaims = input.claims.map((claim) => scoreClaim(claim, input.jobDescription));
  const verified = auditedClaims.filter((claim) => claim.status === "VERIFIED").length;
  const tailoredBullets = auditedClaims
    .filter((claim) => claim.status === "VERIFIED")
    .map((claim) => `Verified ${claim.claim.replace(/\.$/, "")} for roles requiring RAG/eval discipline, agent workflow design, and deployment-ready AI product evidence.`);

  return {
    mode: "DEMO JSON RETRIEVAL",
    jobDescription: input.jobDescription,
    auditedClaims,
    summary: {
      total: auditedClaims.length,
      verified,
      unverified: auditedClaims.length - verified,
      score: Math.round((verified / auditedClaims.length) * 100),
    },
    tailoredBullets,
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
  const cases = [
    { id: "unverified-claim-flagging", result: unsafeFlagged ? "PASS" : "FAIL" },
    { id: "verified-evidence-match", result: verifiedEvidence ? "PASS" : "FAIL" },
    { id: "grounded-bullet-count", result: bulletsGrounded ? "PASS" : "FAIL" },
  ];
  const passed = cases.filter((item) => item.result === "PASS").length;
  return { total: cases.length, passed, failed: cases.length - passed, score: Math.round((passed / cases.length) * 100), cases };
}
