import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { liveWorkflowTrackerSnapshot } from "@/data/liveWorkflowTracker";
import type { LiveWorkflowTrackerSnapshot } from "@/types/liveWorkflowTracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface WorkflowTrackerApiResponse {
  ok: boolean;
  data: LiveWorkflowTrackerSnapshot;
  generatedAt: string;
  serverTimestamp: number;
  lastModified: string;
  etag: string;
}

function getLatestSnapshot(): { snapshot: LiveWorkflowTrackerSnapshot; lastModifiedDate: Date } {
  const snapshot: LiveWorkflowTrackerSnapshot = { ...liveWorkflowTrackerSnapshot };
  let lastModifiedDate = new Date();

  try {
    const evidencePath = path.resolve(process.cwd(), "evidence/public/live-workflow-events-tracker.md");
    if (fs.existsSync(evidencePath)) {
      const stats = fs.statSync(evidencePath);
      lastModifiedDate = stats.mtime;
    }
  } catch {
    // Fall back gracefully if filesystem access is unavailable
  }

  return { snapshot, lastModifiedDate };
}

export async function GET(request?: Request) {
  const { snapshot, lastModifiedDate } = getLatestSnapshot();
  const now = new Date();

  // Compute strong deterministic ETag based on snapshot content
  const contentHash = createHash("sha1")
    .update(JSON.stringify(snapshot))
    .digest("hex")
    .slice(0, 16);
  const etag = `"${contentHash}"`;

  const clientEtag = request?.headers?.get?.("if-none-match");
  if (clientEtag && (clientEtag === etag || clientEtag === `W/${etag}` || clientEtag === "*")) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "no-cache, stale-while-revalidate=60",
        "Last-Modified": lastModifiedDate.toUTCString(),
        "X-Generated-At": now.toISOString(),
      },
    });
  }

  const payload: WorkflowTrackerApiResponse = {
    ok: true,
    data: snapshot,
    generatedAt: now.toISOString(),
    serverTimestamp: now.getTime(),
    lastModified: lastModifiedDate.toISOString(),
    etag,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-cache, stale-while-revalidate=60",
      ETag: etag,
      "Last-Modified": lastModifiedDate.toUTCString(),
      "X-Generated-At": now.toISOString(),
    },
  });
}
