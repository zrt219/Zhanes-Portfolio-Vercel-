import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/build-doctor";
import { evalResultsSchema } from "@/lib/schemas";

export async function GET() {
  return NextResponse.json(evalResultsSchema.parse(runEvalSuite()));
}

export async function POST() {
  return NextResponse.json(evalResultsSchema.parse(runEvalSuite()));
}
