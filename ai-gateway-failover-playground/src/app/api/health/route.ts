import { NextResponse } from "next/server";
import { circuitBreakers, providers, runEvalSuite } from "@/lib/gateway";

export async function GET() {
  const evals = runEvalSuite();
  return NextResponse.json({
    service: "ai-gateway-failover-playground",
    status: evals.failed === 0 ? "READY" : "REVIEW",
    mode: "DEMO PROVIDER MOCKS",
    checks: {
      providerAdapters: providers.length,
      circuitBreakers: circuitBreakers.length,
      evalScore: evals.score,
      edgeRoute: true,
    },
    generatedAt: new Date().toISOString(),
  });
}
