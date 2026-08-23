import type { ProofStatus } from "@/data/projects";

export const primaryLinkClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cyan/70 bg-cyan/15 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan hover:bg-cyan/25 hover:shadow-[0_0_20px_rgba(109,216,255,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan active:translate-y-0";

export const secondaryLinkClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-black/40 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/50 hover:bg-cyan/10 hover:text-white hover:shadow-[0_0_15px_rgba(109,216,255,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan active:translate-y-0";

export const compactLinkClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-black/30 backdrop-blur-sm px-3.5 py-2 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-cyan/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan active:translate-y-0";

export const sectionShellClass = "scroll-mt-28 rounded-xl border border-line/70 bg-panel/75 backdrop-blur-md p-5 shadow-2xl sm:p-6 lg:p-8 transition-all";

export const proofChipClass =
  "inline-flex items-center gap-2 rounded-full border border-cyan/50 bg-cyan/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan shadow-[0_0_12px_rgba(109,216,255,0.15)]";

export function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export function proofStatusLabel(status: ProofStatus) {
  switch (status) {
    case "live":
      return "Public demo";
    case "repo":
      return "Public repo";
    case "local-evidence":
      return "Local evidence";
    case "planned":
      return "Planned";
    case "unverified":
      return "Unverified";
  }
}

export function proofActionLabel(status: ProofStatus) {
  switch (status) {
    case "live":
      return "Open demo";
    case "repo":
      return "Open project URL";
    case "local-evidence":
      return "Evidence noted";
    case "planned":
      return "Planned";
    case "unverified":
      return "Unverified";
  }
}

export function proofStatusClass(status: ProofStatus) {
  switch (status) {
    case "live":
      return "border-emerald-400/60 bg-emerald-500/15 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]";
    case "repo":
      return "border-cyan/60 bg-cyan/15 text-cyan shadow-[0_0_10px_rgba(109,216,255,0.2)]";
    case "local-evidence":
      return "border-gold/70 border-dashed bg-gold/15 text-gold shadow-[0_0_10px_rgba(214,170,82,0.2)]";
    case "planned":
      return "border-white/40 border-dotted bg-white/5 text-slate-300";
    case "unverified":
      return "border-rose-400/60 bg-rose-500/15 text-rose-300";
  }
}
