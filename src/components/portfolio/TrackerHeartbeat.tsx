"use client";

import { Activity } from "lucide-react";

type TrackerHeartbeatProps = {
  label?: string;
  isLive?: boolean;
  isSyncing?: boolean;
};

export function TrackerHeartbeat({
  label = "● LIVE SYNC",
  isLive = true,
  isSyncing = false,
}: TrackerHeartbeatProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${
        isLive
          ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.18)]"
          : "border-cyan/45 bg-black/30 text-white"
      }`}
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping motion-reduce:animate-none ${
            isLive ? "bg-emerald-400" : "bg-cyan/60"
          }`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            isLive ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-cyan"
          }`}
        />
      </span>
      <Activity
        className={`h-3.5 w-3.5 ${
          isSyncing ? "animate-spin text-emerald-300" : isLive ? "text-emerald-400" : "text-cyan"
        }`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
