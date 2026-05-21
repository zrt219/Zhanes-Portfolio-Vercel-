import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/workflow-studio";

export async function GET() {
  return NextResponse.json(runEvalSuite());
}
