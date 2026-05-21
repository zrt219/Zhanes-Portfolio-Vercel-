import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/rag-auditor";

export async function GET() {
  return NextResponse.json(runEvalSuite());
}
