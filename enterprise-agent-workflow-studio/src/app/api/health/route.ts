import { NextResponse } from "next/server";
import { runEvalSuite, toolRegistry } from "@/lib/workflow-studio";

export async function GET() {
  const evals = runEvalSuite();
  return NextResponse.json({
    service: "enterprise-agent-workflow-studio",
    status: evals.failed === 0 ? "READY" : "REVIEW",
    mode: "DEMO LOCAL ONLY",
    checks: {
      toolRegistry: toolRegistry.length,
      evalScore: evals.score,
      auditExport: true,
      approvalGates: true,
    },
    generatedAt: new Date().toISOString(),
  });
}
