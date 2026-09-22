"use client";

import { ArrowRight, Command, ExternalLink, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { signatureProjects } from "@/data/projects";
import { SPRING_PRESETS, useSafeReducedMotion } from "@/lib/motion";

const actions = [
  { label: "View GitHub", description: "Open zrt219 public GitHub profile.", href: "https://github.com/zrt219", external: true },
  { label: "Email Zhane", description: "Open email composer.", href: "mailto:zpeace11@gmail.com" },
  { label: "Open Live Workflow Graph", description: "Jump to the workflow evidence chart.", href: "#workflow-tracker" },
  { label: "View Project Directory", description: "Search public projects and proof labels.", href: "#projects" },
  { label: "Try Build Doctor", description: "Run the deterministic Vercel diagnostic demo.", href: "/build-doctor" },
  { label: "Open Evidence Dashboard", description: "Open the signature evidence system.", href: "https://zhane-grey-evidence-dashboard.vercel.app", external: true },
  { label: "Review Ralphplan Workflow", description: "Jump to the planning and verification loop.", href: "#ralphplan-workflow" },
  { label: "Open Evidence Ledger", description: "Inspect public-safe source labels and health routes.", href: "#evidence-ledger" },
  ...signatureProjects.map((project) => ({
    label: `${project.title} proof brief`,
    description: project.signatureDetails?.headline ?? "Open signature project proof brief.",
    href: `/projects/${project.proofBriefSlug!}`,
  })),
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);
  const isReduced = useSafeReducedMotion();

  function closePalette() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      const isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCommandK) {
        event.preventDefault();
        setOpen((current) => {
          if (current) {
            setQuery("");
            setActiveIndex(0);
          }
          return !current;
        });
      }
      if (event.key === "Escape") {
        closePalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      openerRef.current?.focus();
    }
  }, [open]);

  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return actions;
    }

    const terms = normalized.split(/\s+/).filter(Boolean);
    return actions.filter((action) => {
      const searchable = `${action.label} ${action.description}`.toLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [query]);

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filteredActions.length > 0) {
        setActiveIndex((current) => (current + 1) % filteredActions.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filteredActions.length > 0) {
        setActiveIndex((current) => (current - 1 + filteredActions.length) % filteredActions.length);
      }
    } else if (event.key === "Enter") {
      const selectedAction = filteredActions[activeIndex];
      if (selectedAction) {
        event.preventDefault();
        closePalette();
        if (selectedAction.external) {
          window.open(selectedAction.href, "_blank", "noreferrer");
        } else {
          window.location.href = selectedAction.href;
        }
      }
    }
  }

  const modalPanelExpansionVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: isReduced ? 1 : 0.95,
      y: isReduced ? 0 : -16,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: isReduced ? { duration: 0 } : SPRING_PRESETS.cinematic,
    },
    exit: {
      opacity: 0,
      scale: isReduced ? 1 : 0.95,
      y: isReduced ? 0 : -16,
      transition: isReduced ? { duration: 0 } : { duration: 0.18, ease: "easeIn" as const },
    },
  };

  return (
    <>
      <motion.button
        type="button"
        ref={openerRef}
        onClick={() => setOpen(true)}
        whileHover={isReduced ? undefined : { scale: 1.03 }}
        whileTap={isReduced ? undefined : { scale: 0.96 }}
        transition={SPRING_PRESETS.snappy}
        className="group relative inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-black/30 px-3 py-2 text-sm font-semibold text-slate-100 transition-all hover:border-cyan/70 hover:bg-cyan/10 hover:shadow-[0_0_15px_rgba(109,216,255,0.25)]"
        aria-label="Open command palette"
      >
        <Command className="h-4 w-4 text-cyan" aria-hidden="true" />
        <span className="hidden sm:inline">Command</span>
        <span className="hidden rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-slate-400 lg:inline">Ctrl K</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dialogRef}
            onKeyDown={trapFocus}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isReduced ? 0 : 0.2 }}
            className="fixed inset-0 z-[80] bg-obsidian/75 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio command palette"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalPanelExpansionVariants}
              className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-lg border border-cyan/35 bg-[#07111d] shadow-[0_0_50px_rgba(109,216,255,0.25)]"
            >
              <div className="flex items-center gap-3 border-b border-line bg-black/35 px-4 py-3">
                <Search className="h-4 w-4 text-cyan" aria-hidden="true" />
                <label htmlFor="portfolio-command-search" className="sr-only">
                  Search commands
                </label>
                <input
                  id="portfolio-command-search"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search proof, workflow, projects, contact"
                  className="min-h-11 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                />
                <motion.button
                  type="button"
                  onClick={closePalette}
                  whileTap={isReduced ? undefined : { scale: 0.9 }}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-black/30 text-slate-200 transition hover:border-white/50"
                  aria-label="Close command palette"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredActions.length ? (
                  filteredActions.map((action, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <motion.a
                        key={action.label}
                        href={action.href}
                        target={action.external ? "_blank" : undefined}
                        rel={action.external ? "noreferrer" : undefined}
                        onClick={closePalette}
                        onMouseEnter={() => setActiveIndex(index)}
                        className="group relative flex items-center justify-between gap-4 rounded-md border border-transparent px-3 py-3 text-left transition-colors"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeCommandItem"
                            className="absolute inset-0 rounded-md border border-cyan/40 bg-cyan/10 pointer-events-none"
                            transition={isReduced ? { duration: 0 } : SPRING_PRESETS.snappy}
                          />
                        )}
                        <span className="relative z-10">
                          <span className="block font-semibold text-white group-hover:text-cyan transition-colors">
                            {action.label}
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-slate-400">
                            {action.description}
                          </span>
                        </span>
                        {action.external ? (
                          <ExternalLink className="relative z-10 h-4 w-4 text-cyan shrink-0" aria-hidden="true" />
                        ) : (
                          <ArrowRight className="relative z-10 h-4 w-4 text-cyan shrink-0" aria-hidden="true" />
                        )}
                      </motion.a>
                    );
                  })
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-slate-400">
                    No command matches that search.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
