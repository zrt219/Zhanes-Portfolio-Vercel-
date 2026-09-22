import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GET as workflowTrackerGet } from "@/app/api/workflow-tracker/route";
import { formatRelativeSyncTime } from "@/lib/useWorkflowTracker";
import { liveWorkflowTrackerSnapshot } from "@/data/liveWorkflowTracker";

describe("Workflow Tracker API Route (/api/workflow-tracker)", () => {
  it("serves dynamic snapshot with ETag, Cache-Control: no-cache, and timestamp metadata", async () => {
    const response = await workflowTrackerGet();
    expect(response.status).toBe(200);

    const cacheControl = response.headers.get("cache-control");
    expect(cacheControl).toContain("no-cache");
    expect(cacheControl).toContain("stale-while-revalidate=60");

    const etag = response.headers.get("etag");
    expect(etag).toBeTruthy();
    expect(etag?.startsWith('"')).toBe(true);

    const lastModified = response.headers.get("last-modified");
    expect(lastModified).toBeTruthy();

    const xGeneratedAt = response.headers.get("x-generated-at");
    expect(xGeneratedAt).toBeTruthy();

    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.data).toMatchObject({
      currentWorkflowEvents: liveWorkflowTrackerSnapshot.currentWorkflowEvents,
      sessionIndexRows: liveWorkflowTrackerSnapshot.sessionIndexRows,
      history: expect.any(Array),
    });
    expect(payload.etag).toBe(etag);
    expect(payload.generatedAt).toEqual(expect.any(String));
    expect(payload.serverTimestamp).toEqual(expect.any(Number));
    expect(payload.lastModified).toEqual(expect.any(String));
  });

  it("handles conditional requests and returns 304 Not Modified when ETag matches", async () => {
    const initialResponse = await workflowTrackerGet();
    const etag = initialResponse.headers.get("etag")!;

    // Request with matching If-None-Match
    const conditionalRequest = new Request("http://localhost/api/workflow-tracker", {
      headers: { "if-none-match": etag },
    });

    const notModifiedResponse = await workflowTrackerGet(conditionalRequest);
    expect(notModifiedResponse.status).toBe(304);
    expect(notModifiedResponse.headers.get("etag")).toBe(etag);
    expect(notModifiedResponse.headers.get("cache-control")).toContain("no-cache");
  });

  it("handles weak ETag and wildcard If-None-Match correctly", async () => {
    const initialResponse = await workflowTrackerGet();
    const etag = initialResponse.headers.get("etag")!;

    const weakRequest = new Request("http://localhost/api/workflow-tracker", {
      headers: { "if-none-match": `W/${etag}` },
    });
    const weakResponse = await workflowTrackerGet(weakRequest);
    expect(weakResponse.status).toBe(304);

    const wildcardRequest = new Request("http://localhost/api/workflow-tracker", {
      headers: { "if-none-match": "*" },
    });
    const wildcardResponse = await workflowTrackerGet(wildcardRequest);
    expect(wildcardResponse.status).toBe(304);
  });
});

describe("Relative Time Tracker (formatRelativeSyncTime)", () => {
  const reference = 1_700_000_000_000; // Fixed timestamp ms

  it("returns 'Not synced yet' for null or undefined dates", () => {
    expect(formatRelativeSyncTime(null)).toBe("Not synced yet");
  });

  it("formats seconds accurately", () => {
    const zeroDiff = new Date(reference);
    expect(formatRelativeSyncTime(zeroDiff, reference)).toBe("Synced just now");

    const oneSec = new Date(reference - 1_000);
    expect(formatRelativeSyncTime(oneSec, reference)).toBe("Synced 1 second ago");

    const thirtySec = new Date(reference - 30_000);
    expect(formatRelativeSyncTime(thirtySec, reference)).toBe("Synced 30 seconds ago");

    const fiftyNineSec = new Date(reference - 59_000);
    expect(formatRelativeSyncTime(fiftyNineSec, reference)).toBe("Synced 59 seconds ago");
  });

  it("formats minutes accurately", () => {
    const oneMin = new Date(reference - 60_000);
    expect(formatRelativeSyncTime(oneMin, reference)).toBe("Synced 1 minute ago");

    const tenMin = new Date(reference - 600_000);
    expect(formatRelativeSyncTime(tenMin, reference)).toBe("Synced 10 minutes ago");
  });

  it("formats hours accurately", () => {
    const oneHour = new Date(reference - 3_600_000);
    expect(formatRelativeSyncTime(oneHour, reference)).toBe("Synced 1 hour ago");

    const fourHours = new Date(reference - 14_400_000);
    expect(formatRelativeSyncTime(fourHours, reference)).toBe("Synced 4 hours ago");
  });
});

describe("useWorkflowTracker Hook Behavior", () => {
  it("renders with initial snapshot safely during SSR without throwing", async () => {
    const React = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { useWorkflowTracker } = await import("@/lib/useWorkflowTracker");

    function TestComponent() {
      const { snapshot, isRefreshing, isFallback, relativeSyncTime } = useWorkflowTracker();
      return React.createElement(
        "div",
        null,
        React.createElement(
          "span",
          { "data-events": String(snapshot.currentWorkflowEvents) },
          `Events: ${snapshot.currentWorkflowEvents}`,
        ),
        React.createElement(
          "span",
          { "data-refreshing": String(isRefreshing) },
          `Refreshing: ${isRefreshing}`,
        ),
        React.createElement(
          "span",
          { "data-fallback": String(isFallback) },
          `Fallback: ${isFallback}`,
        ),
        React.createElement("span", { "data-sync": relativeSyncTime }, relativeSyncTime),
      );
    }

    const html = renderToString(React.createElement(TestComponent));
    expect(html).toContain(`Events: ${liveWorkflowTrackerSnapshot.currentWorkflowEvents}`);
    expect(html).toContain("Refreshing: false");
    expect(html).toContain("Fallback: false");
    expect(html).toContain("Not synced yet");
  });
});
