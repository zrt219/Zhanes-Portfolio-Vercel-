"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { TrackerMetric, WorkflowEventHistoryPoint } from "@/types/liveWorkflowTracker";
import { formatMetricNumber, formatSignedMetric } from "@/lib/formatMetrics";

type LiveWorkflowEventsChartProps = {
  history: WorkflowEventHistoryPoint[];
  metric: TrackerMetric;
  selectedIndex: number;
  onSelectPoint: (index: number) => void;
};

const width = 680;
const height = 300;
const padding = 48;

const metricLabels: Record<TrackerMetric, string> = {
  workflowEvents: "Workflow events",
  sessionRows: "Session rows",
  dailyDelta: "Daily delta",
};

const metricDescriptions: Record<TrackerMetric, string> = {
  workflowEvents: "Total counted workflow records in the dated evidence refresh.",
  sessionRows: "Codex session index rows aligned to local session logs.",
  dailyDelta: "Change in workflow events compared with the previous tracker snapshot.",
};

function metricValue(point: WorkflowEventHistoryPoint, metric: TrackerMetric) {
  if (metric === "workflowEvents") return point.workflowEvents;
  if (metric === "sessionRows") return point.sessionRows;
  return point.dailyDelta;
}

function formatChartValue(value: number, metric: TrackerMetric) {
  return metric === "dailyDelta" ? formatSignedMetric(value) : formatMetricNumber(value);
}

function coordinates(history: WorkflowEventHistoryPoint[], metric: TrackerMetric) {
  const values = history.map((point) => metricValue(point, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return history.map((point, index) => ({
    point,
    x: padding + (index * (width - padding * 2)) / Math.max(history.length - 1, 1),
    y: height - padding - ((metricValue(point, metric) - min) / range) * (height - padding * 2),
  }));
}

export function LiveWorkflowEventsChart({ history, metric, selectedIndex, onSelectPoint }: LiveWorkflowEventsChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);

  if (history.length === 0) {
    return (
      <div className="rounded-md border border-line bg-black/35 p-5">
        <p className="font-semibold text-white">Tracker data unavailable.</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">Run the evidence refresh pipeline or verify live-workflow-events-tracker.md.</p>
      </div>
    );
  }

  const points = coordinates(history, metric);
  const values = history.map((point) => metricValue(point, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const fillPath = `${points[0]?.x ?? padding},${height - padding} ${polyline} ${points[points.length - 1]?.x ?? width - padding},${height - padding}`;
  const selected = history[selectedIndex] ?? history[history.length - 1];
  const selectedPoint = points[selectedIndex] ?? points[points.length - 1];
  const selectedMetricValue = metricValue(selected, metric);

  function selectNearestPoint(clientX: number) {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    const ratio = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
    const svgX = ratio * width;
    const nearest = points.reduce(
      (closest, point, index) => {
        const distance = Math.abs(point.x - svgX);
        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: selectedIndex, distance: Number.POSITIVE_INFINITY },
    );
    onSelectPoint(nearest.index);
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    selectNearestPoint(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (dragging) {
      selectNearestPoint(event.clientX);
    }
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }

  function handlePointKey(event: KeyboardEvent<SVGCircleElement>, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectPoint(index);
    }
  }

  function handleChartKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onSelectPoint(Math.max(selectedIndex - 1, 0));
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onSelectPoint(Math.min(selectedIndex + 1, history.length - 1));
    }
  }

  return (
    <div className="rounded-lg border border-cyan/20 bg-black/35 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan">Active chart metric</p>
          <p className="mt-1 text-sm text-slate-300">{metricDescriptions[metric]}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Drag timeline to inspect evidence points. Arrow keys move the selected date.</p>
        </div>
        <span className="rounded-full border border-cyan/45 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
          Showing {metricLabels[metric]}
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        tabIndex={0}
        aria-label={`${metricLabels[metric]} draggable chart for workflow tracker history`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleChartKey}
        className="h-auto w-full cursor-grab touch-none select-none outline-none active:cursor-grabbing focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
      >
        <defs>
          <linearGradient id="trackerLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="trackerFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
          <filter id="trackerGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line * (height - padding * 2)) / 3;
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 8" />;
        })}
        <text x={padding - 10} y={padding + 4} textAnchor="end" fill="#a7b4c8" fontSize="12" fontWeight="600">
          {formatChartValue(max, metric)}
        </text>
        <text x={padding - 10} y={height - padding + 4} textAnchor="end" fill="#a7b4c8" fontSize="12" fontWeight="600">
          {formatChartValue(min, metric)}
        </text>
        <polygon points={fillPath} fill="url(#trackerFill)" />
        <polyline points={polyline} fill="none" stroke="url(#trackerLine)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" filter="url(#trackerGlow)" />
        <line x1={selectedPoint.x} x2={selectedPoint.x} y1={padding - 12} y2={height - padding + 10} stroke="#f8fafc" strokeOpacity="0.62" strokeWidth="2" strokeDasharray="5 6" />
        <rect x={selectedPoint.x - 20} y={padding - 34} width="40" height="18" rx="9" fill="#07111f" stroke="#67e8f9" strokeWidth="2" />
        <text x={selectedPoint.x} y={padding - 21} textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="700">
          DRAG
        </text>
        {points.map(({ point, x, y }, index) => {
          const active = index === selectedIndex;
          return (
            <g key={point.date}>
              <circle
                cx={x}
                cy={y}
                r={active ? 12 : 9}
                fill={active ? "#67e8f9" : "#07111f"}
                stroke={active ? "#f8fafc" : "#67e8f9"}
                strokeWidth="3"
                tabIndex={0}
                role="button"
                aria-label={`${point.date}: ${metricLabels[metric]} ${formatChartValue(metricValue(point, metric), metric)}`}
                onMouseEnter={() => onSelectPoint(index)}
                onFocus={() => onSelectPoint(index)}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectPoint(index);
                }}
                onKeyDown={(event) => handlePointKey(event, index)}
                className="cursor-pointer outline-none focus-visible:stroke-white"
              />
              <text x={x} y={height - 17} textAnchor="middle" fill="#a7b4c8" fontSize="14" fontWeight="600">
                {point.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 rounded-md border border-cyan/25 bg-cyan/5 p-3" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan">Tracker tooltip</p>
        <p className="mt-2 text-sm text-white">
          {selected.date}: {metricLabels[metric]} {formatChartValue(selectedMetricValue, metric)}.
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Snapshot context: {formatMetricNumber(selected.workflowEvents)} events, {formatSignedMetric(selected.dailyDelta)} delta, {formatMetricNumber(selected.sessionRows)} sessions.
        </p>
      </div>
    </div>
  );
}
