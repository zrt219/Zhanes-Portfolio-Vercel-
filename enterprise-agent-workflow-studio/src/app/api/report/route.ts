import { NextResponse } from "next/server";
import { generateAuditReport, generateWorkflow, workflowRequestSchema } from "@/lib/workflow-studio";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = workflowRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REPORT_REQUEST", issues: parsed.error.issues }, { status: 400 });
  }
  const workflow = generateWorkflow(parsed.data);
  return NextResponse.json({ report: generateAuditReport(workflow), workflow });
}
