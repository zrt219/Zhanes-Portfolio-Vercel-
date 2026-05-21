import { NextResponse } from "next/server";
import { auditRequestSchema, auditResumeClaims } from "@/lib/rag-auditor";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_AUDIT_REQUEST", issues: parsed.error.issues }, { status: 400 });
  }
  return NextResponse.json(auditResumeClaims(parsed.data));
}
