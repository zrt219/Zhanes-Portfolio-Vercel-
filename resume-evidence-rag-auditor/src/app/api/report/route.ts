import { NextResponse } from "next/server";
import { auditRequestSchema, auditResumeClaims, generateReport } from "@/lib/rag-auditor";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REPORT_REQUEST", issues: parsed.error.issues }, { status: 400 });
  }
  const audit = auditResumeClaims(parsed.data);
  return NextResponse.json({ audit, report: generateReport(audit) });
}
