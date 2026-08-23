import { Github, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CommandPalette } from "./CommandPalette";

const navItems = [
  { label: "Proof", href: "#metrics" },
  { label: "Workflow", href: "#workflow-tracker" },
  { label: "Projects", href: "#featured-projects" },
  { label: "Ralphplan", href: "#ralphplan-workflow" },
  { label: "Ledger", href: "#evidence-ledger" },
  { label: "Contact", href: "#contact" },
];

export function TopCommandNav() {
  return (
    <header className="sticky top-0 z-50 overflow-x-hidden border-b border-line/70 bg-[#06101b]/85 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-5 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan" aria-label="Zhane Grey portfolio home">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan/60 bg-cyan/15 font-mono text-sm font-bold text-cyan shadow-[0_0_12px_rgba(109,216,255,0.25)]">
            ZG
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="block text-sm font-bold uppercase tracking-[0.12em] text-white">Zhane Grey</span>
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 sm:inline-flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </span>
                Verified
              </span>
            </span>
            <span className="block truncate text-xs font-medium uppercase tracking-[0.16em] text-slate-400">AI Engineering Mainframe</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Portfolio sections">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-cyan/40 hover:bg-cyan/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 lg:ml-3">
          <CommandPalette />
          <a
            href="https://github.com/zrt219"
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-black/40 px-3.5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan/70 hover:bg-cyan/10 sm:inline-flex"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
          <a
            href="mailto:zpeace11@gmail.com"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan/60 bg-cyan/15 px-3.5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan hover:bg-cyan/25 hover:shadow-[0_0_15px_rgba(109,216,255,0.25)]"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email
          </a>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-5 lg:hidden" aria-label="Mobile portfolio sections">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-line bg-black/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300 transition hover:border-cyan/50 hover:bg-cyan/10 hover:text-white"
          >
            {item.label}
          </a>
        ))}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-cyan">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Source-labeled
        </span>
      </div>
    </header>
  );
}
