import { NextResponse } from "next/server";
import { generateIncidentReport } from "@/lib/build-doctor";
import { reportRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_DIAGNOSIS", message: "Request body failed validation.", issues: parsed.error.issues } },
      { status: 400 },
    );
  }

  return NextResponse.json({
    report: generateIncidentReport(parsed.data.diagnosis),
    format: "markdown",
    rawLogStored: false,
  });
}
