import { NextResponse } from "next/server";
import { evidenceCorpus, runEvalSuite } from "@/lib/rag-auditor";

export async function GET() {
  const evals = runEvalSuite();
  return NextResponse.json({
    service: "resume-evidence-rag-auditor",
    status: evals.failed === 0 ? "READY" : "REVIEW",
    mode: "DEMO JSON RETRIEVAL",
    checks: {
      evidenceRecords: evidenceCorpus.length,
      evalScore: evals.score,
      claimVerifier: true,
      groundedBulletExport: true,
    },
    generatedAt: new Date().toISOString(),
  });
}
