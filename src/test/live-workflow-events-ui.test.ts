import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { TrackerHeartbeat } from "@/components/portfolio/TrackerHeartbeat";
import { LiveWorkflowEventsTracker } from "@/components/portfolio/LiveWorkflowEventsTracker";
import { LiveWorkflowEventsChart } from "@/components/portfolio/LiveWorkflowEventsChart";
import { liveWorkflowTrackerSnapshot } from "@/data/liveWorkflowTracker";
import type { LiveWorkflowTrackerSnapshot, WorkflowEventHistoryPoint } from "@/types/liveWorkflowTracker";

describe("TrackerHeartbeat Component", () => {
  it("renders with default '● LIVE SYNC' badge and green pulsating indicator", () => {
    const html = renderToString(React.createElement(TrackerHeartbeat));
    expect(html).toContain("● LIVE SYNC");
    expect(html).toContain("bg-emerald-400");
    expect(html).toContain("border-emerald-500/40");
    expect(html).toContain("text-emerald-300");
    expect(html).toContain("motion-safe:animate-ping");
    expect(html).toContain("motion-reduce:animate-none");
  });

  it("supports custom label and static fallback mode", () => {
    const html = renderToString(
      React.createElement(TrackerHeartbeat, { label: "Static evidence snapshot", isLive: false }),
    );
    expect(html).toContain("Static evidence snapshot");
    expect(html).toContain("border-cyan/45");
    expect(html).toContain("bg-cyan");
  });

  it("applies spinning animation when isSyncing is true", () => {
    const html = renderToString(
      React.createElement(TrackerHeartbeat, { isLive: true, isSyncing: true }),
    );
    expect(html).toContain("animate-spin");
    expect(html).toContain("● LIVE SYNC");
  });
});

describe("LiveWorkflowEventsTracker Component", () => {
  it("renders header with live sync badge, relative timestamp display, and timeframe presets", () => {
    const html = renderToString(React.createElement(LiveWorkflowEventsTracker));

    // Heartbeat badge
    expect(html).toContain("● LIVE SYNC");
    expect(html).toContain("bg-emerald-400");

    // Relative timestamp display
    expect(html).toContain("Synced just now");

    // Timeframe presets
    expect(html).toContain("All (May–Sept)");
    expect(html).toContain("May–Jun");
    expect(html).toContain("Jul–Aug");
    expect(html).toContain("Sept Live");

    // Metric selector options
    expect(html).toContain("Workflow events");
    expect(html).toContain("Session rows");
    expect(html).toContain("Daily delta");

    // Refresh button
    expect(html).toContain("Refresh public-safe workflow tracker snapshot");
  });

  it("renders with custom snapshot and handles date filtering safely", () => {
    const mockHistory: WorkflowEventHistoryPoint[] = [
      { date: "2026-05-15", workflowEvents: 1000000, dailyDelta: 5000, sessionRows: 500, label: "May point" },
      { date: "2026-06-15", workflowEvents: 1100000, dailyDelta: 6000, sessionRows: 600, label: "June point" },
      { date: "2026-07-20", workflowEvents: 1200000, dailyDelta: 7000, sessionRows: 700, label: "July point" },
      { date: "2026-08-25", workflowEvents: 1300000, dailyDelta: 8000, sessionRows: 800, label: "August point" },
      { date: "2026-09-15", workflowEvents: 1400000, dailyDelta: 9000, sessionRows: 900, label: "Sept point" },
    ];

    const mockSnapshot: LiveWorkflowTrackerSnapshot = {
      ...liveWorkflowTrackerSnapshot,
      history: mockHistory,
      currentWorkflowEvents: 1400000,
    };

    const html = renderToString(
      React.createElement(LiveWorkflowEventsTracker, { snapshot: mockSnapshot }),
    );

    expect(html).toContain("1,400,000");
    expect(html).toContain("All (May–Sept)");
    expect(html).toContain("Sept Live");
  });
});

describe("LiveWorkflowEventsChart Component", () => {
  const samplePoints: WorkflowEventHistoryPoint[] = [
    { date: "2026-05-23", workflowEvents: 1135833, dailyDelta: 0, sessionRows: 696, label: "Point 1" },
    { date: "2026-05-24", workflowEvents: 1160551, dailyDelta: 24718, sessionRows: 757, label: "Point 2" },
    { date: "2026-05-25", workflowEvents: 1217410, dailyDelta: 56859, sessionRows: 846, label: "Point 3" },
  ];

  it("renders SVG chart with scrubber handle, rail, and floating tooltip tag", () => {
    const handleSelect = vi.fn();
    const html = renderToString(
      React.createElement(LiveWorkflowEventsChart, {
        history: samplePoints,
        metric: "workflowEvents",
        selectedIndex: 1,
        onSelectPoint: handleSelect,
      }),
    );

    // SVG elements & testids
    expect(html).toContain("viewBox=\"0 0 680 300\"");
    expect(html).toContain("data-testid=\"workflow-scrubber-handle\"");
    expect(html).toContain("data-testid=\"workflow-scrubber-rail\"");
    expect(html).toContain("data-testid=\"workflow-scrub-state\"");
    expect(html).toContain("Showing Workflow events");

    // Accessible live region tooltip content
    expect(html).toContain("2026-05-24: Workflow events 1,160,551.");
    expect(html).toContain("Snapshot context: 1,160,551 events, +24,718 delta, 757 sessions.");
  });

  it("handles empty history gracefully without crashing", () => {
    const handleSelect = vi.fn();
    const html = renderToString(
      React.createElement(LiveWorkflowEventsChart, {
        history: [],
        metric: "workflowEvents",
        selectedIndex: 0,
        onSelectPoint: handleSelect,
      }),
    );

    expect(html).toContain("Tracker data unavailable.");
  });

  it("handles single-point history without division by zero or NaN", () => {
    const singlePoint: WorkflowEventHistoryPoint[] = [
      { date: "2026-09-21", workflowEvents: 1500000, dailyDelta: 3000, sessionRows: 1050, label: "Single" },
    ];
    const handleSelect = vi.fn();
    const html = renderToString(
      React.createElement(LiveWorkflowEventsChart, {
        history: singlePoint,
        metric: "workflowEvents",
        selectedIndex: 0,
        onSelectPoint: handleSelect,
      }),
    );

    expect(html).not.toContain("NaN");
    expect(html).toContain("2026-09-21: Workflow events 1,500,000.");
  });

  it("handles identical min/max values without NaN", () => {
    const flatPoints: WorkflowEventHistoryPoint[] = [
      { date: "2026-06-01", workflowEvents: 1000, dailyDelta: 0, sessionRows: 100, label: "A" },
      { date: "2026-06-02", workflowEvents: 1000, dailyDelta: 0, sessionRows: 100, label: "B" },
    ];
    const handleSelect = vi.fn();
    const html = renderToString(
      React.createElement(LiveWorkflowEventsChart, {
        history: flatPoints,
        metric: "workflowEvents",
        selectedIndex: 0,
        onSelectPoint: handleSelect,
      }),
    );

    expect(html).not.toContain("NaN");
  });

  it("adapts date label sampling on dense timelines (140+ days) to prevent overlap", () => {
    const densePoints: WorkflowEventHistoryPoint[] = Array.from({ length: 140 }, (_, i) => {
      const day = String((i % 28) + 1).padStart(2, "0");
      const month = String(Math.floor(i / 28) + 5).padStart(2, "0");
      return {
        date: `2026-${month}-${day}`,
        workflowEvents: 1000000 + i * 2000,
        dailyDelta: 2000,
        sessionRows: 500 + i * 3,
        label: `Day ${i + 1}`,
      };
    });

    const handleSelect = vi.fn();
    const html = renderToString(
      React.createElement(LiveWorkflowEventsChart, {
        history: densePoints,
        metric: "workflowEvents",
        selectedIndex: 70,
        onSelectPoint: handleSelect,
      }),
    );

    // Count rendered <text> date elements (should be far less than 140)
    const textMatches = html.match(/<text x="[^"]*" y="282"/g) ?? [];
    expect(textMatches.length).toBeLessThan(20);
    expect(html).not.toContain("NaN");
  });
});
