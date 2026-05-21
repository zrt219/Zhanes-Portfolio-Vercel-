import { NextResponse } from "next/server";
import { generateWorkflow, workflowRequestSchema } from "@/lib/workflow-studio";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = workflowRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_WORKFLOW_REQUEST", issues: parsed.error.issues }, { status: 400 });
  }
  return NextResponse.json(generateWorkflow(parsed.data));
}
