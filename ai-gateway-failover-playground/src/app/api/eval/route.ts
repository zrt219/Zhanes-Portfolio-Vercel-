import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/gateway";

export async function GET() {
  return NextResponse.json(runEvalSuite());
}
