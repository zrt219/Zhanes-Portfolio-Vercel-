import { jsonResponse } from "../_utils";
import { liveWorkflowTrackerSnapshot } from "@/data/liveWorkflowTracker";

export async function GET() {
  return jsonResponse({
    ok: true,
    data: liveWorkflowTrackerSnapshot,
    generatedAt: new Date().toISOString(),
  });
}
