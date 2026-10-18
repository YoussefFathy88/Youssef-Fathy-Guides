"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState, type ComponentType } from "react";

import { cn } from "@/lib/utils";

// ─── Shared accent system for all "Slide" tab explorers ──────────────────────
// One shell (TabExplorerShell) renders the chrome (tab bar + prev/next on one row);
// each session-specific "*Explorer" component only supplies TABS + 3 panels.

export type AccentColor = "amber" | "teal" | "rose" | "violet" | "blue" | "gray";

export const ACCENT: Record<AccentColor, { tab: string; border: string; bg: string; text: string }> = {
  gray: {
    tab: "border-slate-300/80 bg-slate-800/60 text-white ring-slate-300/50",
    border: "border-slate-300/70",
    bg: "bg-slate-500/15",
    text: "text-gray-100",
  },
  teal: {
    tab: "border-teal-400/80 bg-teal-950/50 text-teal-50 ring-teal-400/50",
    border: "border-teal-400/70",
    bg: "bg-teal-500/15",
    text: "text-teal-100",
  },
  blue: {
    tab: "border-blue-400/80 bg-blue-950/50 text-blue-50 ring-blue-400/50",
    border: "border-blue-400/70",
    bg: "bg-blue-500/15",
    text: "text-blue-100",
  },
  violet: {
    tab: "border-violet-400/80 bg-violet-950/50 text-violet-50 ring-violet-400/50",
    border: "border-violet-400/70",
    bg: "bg-violet-500/15",
    text: "text-violet-100",
  },
  rose: {
    tab: "border-rose-400/80 bg-rose-950/50 text-rose-50 ring-rose-400/50",
    border: "border-rose-400/70",
    bg: "bg-rose-500/15",
    text: "text-rose-100",
  },
  amber: {
    tab: "border-amber-400/80 bg-amber-950/50 text-amber-50 ring-amber-400/50",
    border: "border-amber-400/70",
    bg: "bg-amber-500/15",
    text: "text-amber-100",
  },
};

export function PanelTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-lg font-semibold text-gray-200 md:text-xl">{children}</p>;
}

export function Callout({ children, color = "violet" }: { children: React.ReactNode; color?: AccentColor }) {
  return (
    <div className={cn("rounded-xl border-2 p-4 md:p-5", ACCENT[color].border, ACCENT[color].bg)}>
      <p className="text-lg text-gray-100 md:text-xl">{children}</p>
    </div>
  );
}

export function SubTabBar({
  tabs,
  activeIdx,
  onSelect,
  accent,
}: {
  tabs: readonly { id: string; label: string }[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  accent: AccentColor;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeIdx === i}
          onClick={() => onSelect(i)}
          className={cn(
            "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
            activeIdx === i
              ? cn("ring-2 ring-offset-2 ring-offset-gray-900", ACCENT[accent].tab)
              : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500",
          )}
        >
          {i + 1}. {tab.label}
        </button>
      ))}
    </div>
  );
}

export function FadeSwap({ id, children }: { id: string | number; children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
        className="flex flex-col gap-4"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export interface ExplorerTab {
  id: string;
  short: string;
  color: AccentColor;
}

interface TabExplorerShellProps {
  tabs: readonly ExplorerTab[];
  panels: readonly ComponentType[];
  ariaLabel: string;
}

export function TabExplorerShell({ tabs, panels, ariaLabel }: TabExplorerShellProps) {
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeTab = tabs[activeIdx];
  const ActivePanel = panels[activeIdx];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full flex-col rounded-2xl border border-gray-700 bg-gray-900 p-5 md:p-8"
      data-local-navigation="true"
    >
      {/* Tab bar (numbered, ✓ when done) + Prev/Next on one row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2 px-1 py-1 md:gap-2.5" role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab, idx) => {
            const isActive = activeIdx === idx;
            const done = idx < activeIdx;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                id={`${baseId}-tab-${tab.id}`}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "shrink-0 rounded-xl border-2 px-3 py-2.5 text-base font-bold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
                  "md:px-4 md:py-3 md:text-lg",
                  isActive
                    ? cn("ring-2 ring-offset-2 ring-offset-gray-900", ACCENT[tab.color].tab)
                    : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500 hover:text-white",
                )}
              >
                <span className={cn("mr-1.5", done ? "text-teal-300" : isActive ? "text-gray-200" : "text-gray-400")} aria-hidden>
                  {done ? "✓" : `${idx + 1}.`}
                </span>
                {tab.short}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-base text-gray-400 md:text-lg">{activeIdx + 1} / {tabs.length}</span>
          <button
            type="button"
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            disabled={activeIdx === 0}
            className="rounded-xl border-2 border-gray-700 bg-gray-950 px-5 py-3 text-base font-bold text-gray-200 transition hover:border-gray-600 disabled:opacity-40 md:text-lg"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={() => setActiveIdx((i) => Math.min(tabs.length - 1, i + 1))}
            disabled={activeIdx === tabs.length - 1}
            className="rounded-xl border-2 border-violet-500/50 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-400 disabled:opacity-40 md:text-lg"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Active panel */}
      <div role="tabpanel" aria-labelledby={`${baseId}-tab-${activeTab.id}`} className="mt-4 flex flex-1 flex-col md:mt-5">
        <FadeSwap id={activeTab.id}>
          <ActivePanel />
        </FadeSwap>
      </div>

    </motion.div>
  );
}
