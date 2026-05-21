import { NextResponse } from "next/server";
import { diagnoseBuildLog } from "@/lib/build-doctor";
import { diagnoseRequestSchema, diagnosisSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = diagnoseRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_BUILD_LOG", message: "Request body failed validation.", issues: parsed.error.issues } },
      { status: 400 },
    );
  }

  const diagnosis = diagnosisSchema.parse(diagnoseBuildLog(parsed.data.log));
  return NextResponse.json({ diagnosis, mode: "deterministic", rawLogStored: false });
}
