"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { TrackerMetric, WorkflowEventHistoryPoint } from "@/types/liveWorkflowTracker";
import { formatMetricNumber, formatSignedMetric } from "@/lib/formatMetrics";
import { useSafeReducedMotion } from "@/lib/motion";

export type TrackerTimeframe = "all" | "may-jun" | "jul-aug" | "sept-live";

type LiveWorkflowEventsChartProps = {
  history: WorkflowEventHistoryPoint[];
  metric: TrackerMetric;
  selectedIndex: number;
  onSelectPoint: (index: number) => void;
  timeframe?: TrackerTimeframe;
  onSelectTimeframe?: (timeframe: TrackerTimeframe) => void;
};

const width = 680;
const height = 300;
const paddingX = 58;
const paddingY = 46;

export const metricLabels: Record<TrackerMetric, string> = {
  workflowEvents: "Workflow events",
  sessionRows: "Session rows",
  dailyDelta: "Daily delta",
};

export const metricDescriptions: Record<TrackerMetric, string> = {
  workflowEvents: "Total counted workflow records in the dated evidence refresh.",
  sessionRows: "Codex session index rows aligned to local session logs.",
  dailyDelta: "Change in workflow events compared with the previous tracker snapshot.",
};

function metricValue(point: WorkflowEventHistoryPoint, metric: TrackerMetric): number {
  if (metric === "workflowEvents") return point.workflowEvents;
  if (metric === "sessionRows") return point.sessionRows;
  return point.dailyDelta;
}

function formatChartValue(value: number, metric: TrackerMetric): string {
  return metric === "dailyDelta" ? formatSignedMetric(value) : formatMetricNumber(value);
}

function computeCoordinates(history: WorkflowEventHistoryPoint[], metric: TrackerMetric) {
  if (history.length === 0) return [];
  const values = history.map((point) => metricValue(point, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return history.map((point, index) => {
    const x =
      history.length === 1
        ? width / 2
        : paddingX + (index * (width - paddingX * 2)) / Math.max(history.length - 1, 1);
    const y =
      range === 0
        ? height / 2
        : height - paddingY - ((metricValue(point, metric) - min) / range) * (height - paddingY * 2);

    return { point, x, y };
  });
}

export function LiveWorkflowEventsChart({
  history,
  metric,
  selectedIndex,
  onSelectPoint,
}: LiveWorkflowEventsChartProps) {
  const isReduced = useSafeReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartId = useId();
  const [dragging, setDragging] = useState(false);
  const [scrubberX, setScrubberX] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-black/35 p-5">
        <p className="font-semibold text-white">Tracker data unavailable.</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Run the evidence refresh pipeline or verify live-workflow-events-tracker.md.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, selectedIndex), history.length - 1);
  const points = computeCoordinates(history, metric);
  const values = history.map((point) => metricValue(point, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const fillPath =
    points.length > 1
      ? `${points[0].x},${height - paddingY} ${polyline} ${points[points.length - 1].x},${height - paddingY}`
      : "";

  const selected = history[safeIndex] ?? history[history.length - 1];
  const selectedPoint = points[safeIndex] ?? points[points.length - 1];
  const selectedMetricValue = metricValue(selected, metric);

  const activeScrubberX = dragging && scrubberX !== null ? scrubberX : selectedPoint.x;
  const showPreviewRail = dragging && Math.abs(activeScrubberX - selectedPoint.x) > 4;

  // Adaptive label sampling to prevent visual clipping on dense timelines (e.g. 140+ points)
  const labelInterval = Math.max(1, Math.floor(points.length / 6));
  const shouldRenderDateLabel = (index: number) => {
    if (points.length <= 8) return true;
    if (index === safeIndex) return true;
    // Suppress label if it is too close to the active selected index to prevent text collision
    if (Math.abs(index - safeIndex) < Math.max(2, Math.floor(labelInterval / 2))) {
      return false;
    }
    if (index === 0 || index === points.length - 1) return true;
    return index % labelInterval === 0;
  };

  function getScrubberX(clientX: number) {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) {
      return null;
    }

    const ratio = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
    return Math.min(Math.max(ratio * width, paddingX), width - paddingX);
  }

  function selectNearestPoint(svgX: number) {
    const nearest = points.reduce(
      (closest, point, index) => {
        const distance = Math.abs(point.x - svgX);
        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: safeIndex, distance: Number.POSITIVE_INFINITY },
    );
    onSelectPoint(nearest.index);
  }

  function scrubToClientX(clientX: number) {
    const nextScrubberX = getScrubberX(clientX);
    if (nextScrubberX === null) return;

    setScrubberX(nextScrubberX);
    selectNearestPoint(nextScrubberX);
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    scrubToClientX(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (dragging) {
      event.preventDefault();
      scrubToClientX(event.clientX);
    }
  }

  function handlePointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    setScrubberX(null);
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
      onSelectPoint(Math.max(safeIndex - 1, 0));
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onSelectPoint(Math.min(safeIndex + 1, history.length - 1));
    }
  }

  const trackerLineGradientId = `trackerLine-${chartId}`;
  const trackerFillGradientId = `trackerFill-${chartId}`;
  const trackerGlowFilterId = `trackerGlow-${chartId}`;

  // Clamped position for floating interactive tooltip to avoid edge clipping
  const floatingTooltipX = Math.min(Math.max(selectedPoint.x, 68), width - 68);
  const floatingTooltipY = Math.max(selectedPoint.y - 28, 26);

  return (
    <div className="rounded-lg border border-cyan/20 bg-black/35 p-4 shadow-xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan">Active chart metric</p>
          <p className="mt-1 text-sm text-slate-300">{metricDescriptions[metric]}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Drag the highlighted evidence node or chart rail to inspect points. Arrow keys move the selected date.
          </p>
        </div>
        <span
          data-testid="workflow-scrub-state"
          className="rounded-full border border-cyan/45 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white"
        >
          {dragging ? "Scrubbing timeline" : `Showing ${metricLabels[metric]}`}
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
        onPointerLeave={(event) => {
          if (dragging) {
            handlePointerMove(event);
          }
        }}
        onKeyDown={handleChartKey}
        className="h-auto w-full cursor-grab touch-none select-none outline-none active:cursor-grabbing focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
      >
        <defs>
          <linearGradient id={trackerLineGradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={trackerFillGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
          <filter id={trackerGlowFilterId}>
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3].map((line) => {
          const y = paddingY + (line * (height - paddingY * 2)) / 3;
          return (
            <line
              key={line}
              x1={paddingX}
              x2={width - paddingX}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 8"
            />
          );
        })}

        {/* Min / Max value labels */}
        <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" fill="#a7b4c8" fontSize="12" fontWeight="600">
          {formatChartValue(max, metric)}
        </text>
        <text x={paddingX - 10} y={height - paddingY + 4} textAnchor="end" fill="#a7b4c8" fontSize="12" fontWeight="600">
          {formatChartValue(min, metric)}
        </text>

        {/* Fill Area & Line Stroke */}
        {fillPath ? <polygon points={fillPath} fill={`url(#${trackerFillGradientId})`} /> : null}
        {polyline ? (
          <polyline
            points={polyline}
            fill="none"
            stroke={`url(#${trackerLineGradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.5"
            filter={`url(#${trackerGlowFilterId})`}
          />
        ) : null}

        {/* Hit target background for smooth scrubbing */}
        <rect
          x={paddingX}
          y={paddingY - 20}
          width={width - paddingX * 2}
          height={height - paddingY * 2 + 40}
          rx="16"
          fill="transparent"
          pointerEvents="all"
        />

        {/* Faint preview rail following pointer when dragging */}
        {showPreviewRail ? (
          <line
            data-testid="workflow-scrub-preview-rail"
            x1={activeScrubberX}
            x2={activeScrubberX}
            y1={paddingY - 8}
            y2={height - paddingY + 8}
            stroke="#67e8f9"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeDasharray="2 7"
          />
        ) : null}

        {/* Active scrubber rail */}
        <line
          data-testid="workflow-scrubber-rail"
          x1={selectedPoint.x}
          x2={selectedPoint.x}
          y1={paddingY - 14}
          y2={height - paddingY + 12}
          stroke="#f8fafc"
          strokeOpacity={dragging ? "0.9" : "0.65"}
          strokeWidth={dragging ? "3" : "2"}
          strokeDasharray="5 6"
          className={dragging || isReduced ? "" : "transition-all duration-200 ease-out"}
        />

        {/* Individual data nodes */}
        {points.map(({ point, x, y }, index) => {
          const active = index === safeIndex;
          const isDense = points.length > 30;
          const baseRadius = isDense ? 3 : 7;
          const activeRadius = isDense ? 9 : 12;

          return (
            <g key={point.date}>
              {active ? (
                <circle
                  data-testid="workflow-scrubber-handle"
                  cx={x}
                  cy={y}
                  r={dragging ? activeRadius + 6 : activeRadius + 3}
                  fill="none"
                  stroke="#f8fafc"
                  strokeOpacity={dragging ? "0.85" : "0.6"}
                  strokeWidth="2"
                  strokeDasharray={dragging ? "none" : "4 5"}
                  className={dragging || isReduced ? "" : "transition-all duration-200 ease-out"}
                />
              ) : null}
              <circle
                cx={x}
                cy={y}
                r={active ? activeRadius : baseRadius}
                fill={active ? "#67e8f9" : "#07111f"}
                stroke={active ? "#f8fafc" : "#67e8f9"}
                strokeWidth={active ? "3" : "2"}
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
              {shouldRenderDateLabel(index) ? (
                <text
                  x={x}
                  y={height - 18}
                  textAnchor="middle"
                  fill={active ? "#ffffff" : "#a7b4c8"}
                  fontSize={active ? "13" : "12"}
                  fontWeight={active ? "700" : "500"}
                  className={active ? "transition-colors duration-150" : ""}
                >
                  {point.date.slice(5)}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Interactive Floating Tooltip Tag pinned above active node */}
        <g
          transform={`translate(${floatingTooltipX}, ${floatingTooltipY})`}
          className="pointer-events-none transition-transform duration-100 ease-out"
        >
          <rect
            x="-56"
            y="-13"
            width="112"
            height="22"
            rx="11"
            fill="#08111d"
            fillOpacity="0.94"
            stroke="#38bdf8"
            strokeWidth="1.2"
            filter={`url(#${trackerGlowFilterId})`}
          />
          <text
            x="0"
            y="1"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#67e8f9"
            fontSize="11"
            fontWeight="700"
            fontFamily="monospace"
            letterSpacing="0.02em"
          >
            {formatChartValue(selectedMetricValue, metric)}
          </text>
        </g>
      </svg>

      {/* Accessible Live Region Tooltip */}
      <div className="mt-3 rounded-md border border-cyan/25 bg-cyan/5 p-3" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan">Tracker tooltip</p>
        <p className="mt-2 text-sm text-white">
          {`${selected.date}: ${metricLabels[metric]} ${formatChartValue(selectedMetricValue, metric)}.`}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {`Snapshot context: ${formatMetricNumber(selected.workflowEvents)} events, ${formatSignedMetric(selected.dailyDelta)} delta, ${formatMetricNumber(selected.sessionRows)} sessions.`}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {dragging
            ? "The highlighted handle stays on the nearest dated evidence node; the faint preview rail follows your pointer."
            : "Drag position is inspect-only; tracker points are not editable."}
        </p>
      </div>
    </div>
  );
}
