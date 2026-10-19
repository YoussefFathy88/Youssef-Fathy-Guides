"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "one-task", short: "One Task at a Time", color: "teal" },
  { id: "review", short: "Review Before You Move", color: "violet" },
  { id: "commit", short: "Commit After Each Task", color: "amber" },
] as const;

// ─── Tab 1 — One task at a time ────────────────────────────────────────────────

function OneTaskPanel() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Never start the next task until the current one is reviewed, tested, and committed.</PanelTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4 md:p-5">
          <p className="text-base font-bold text-rose-700 dark:text-rose-300 md:text-lg">Skip ahead</p>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-2xl text-rose-700 dark:text-rose-300" aria-hidden>
            <span>A</span><span className="rotate-12">↘</span><span>C</span><span className="-rotate-12">↙</span><span>B</span><span className="rotate-6">↘</span><span>bug</span>
          </div>
          <p className="mt-3 text-lg text-gray-900 dark:text-gray-200 md:text-xl">Tasks tangle together — a bug from task A hides inside task C.</p>
        </div>
        <div className="rounded-xl border-2 border-teal-400/50 bg-teal-950/20 p-4 md:p-5">
          <p className="text-base font-bold text-teal-700 dark:text-teal-300 md:text-lg">One at a time</p>
          <div className="mt-3 flex items-center gap-2 text-2xl text-teal-700 dark:text-teal-300" aria-hidden>
            <span>A</span><span>→</span><span>B</span><span>→</span><span>C</span>
          </div>
          <p className="mt-3 text-lg text-gray-900 dark:text-gray-200 md:text-xl">Each task finishes clean before the next one starts.</p>
        </div>
      </div>
      <Callout color="teal">
        Context bleed between unfinished tasks confuses the AI and introduces bugs that are hard to trace back.
      </Callout>
    </div>
  );
}

// ─── Tab 2 — Review before you move ────────────────────────────────────────────

const REVIEW_STEPS = [
  "Read the diff — understand every changed line",
  "Run it / test it manually",
  "Ask AI to explain anything unclear",
  "If wrong, fix it in this session before closing",
] as const;

function ReviewPanel() {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const done = step >= REVIEW_STEPS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>After the AI implements a task, do this before moving on.</PanelTitle>
      <div className="flex flex-col gap-3">
        {REVIEW_STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-4 transition",
              i < step ? "border-violet-400/60 bg-violet-950/25" : "border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-950/60 opacity-50",
            )}
          >
            <motion.span
              animate={{ scale: i < step ? [0.6, 1.15, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className={cn("text-2xl", i < step ? "text-violet-700 dark:text-violet-300" : "text-gray-600")}
            >
              {i < step ? "✅" : String(i + 1)}
            </motion.span>
            <p className="text-lg text-gray-900 dark:text-gray-100 md:text-xl">{s}</p>
          </div>
        ))}
      </div>
      {!done && (
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-violet-400/70 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-800 dark:text-violet-100 transition hover:border-violet-300 md:text-lg"
        >
          Check off next step →
        </button>
      )}
    </div>
  );
}

// ─── Tab 3 — Git commit after each task ────────────────────────────────────────

const COMMITS = [
  { id: "c1", msg: "feat: search service — pgvector query, top-5 by cosine similarity" },
  { id: "c2", msg: "feat: /search endpoint — wraps search service, validates input" },
  { id: "c3", msg: "feat: search UI — input, loading state, results list" },
] as const;

function CommitPanel() {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(1);
  const full = shown >= COMMITS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Each completed task becomes one commit with a clear message.</PanelTitle>
      <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-950/70 p-4">
        <p className="text-base font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 md:text-lg">Commit message pattern</p>
        <p className="mt-2 font-mono text-lg text-gray-900 dark:text-gray-100 md:text-xl">feat: [task name] — [one line of what it does]</p>
      </div>
      <div className="flex flex-col gap-2">
        {COMMITS.slice(0, shown).map((c) => (
          <motion.div
            key={c.id}
            initial={reducedMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-lg border border-amber-400/40 bg-amber-950/15 px-4 py-3 font-mono"
          >
            <span className="text-amber-700 dark:text-amber-300">●</span>
            <p className="text-lg text-gray-900 dark:text-gray-100 md:text-xl">{c.msg}</p>
          </motion.div>
        ))}
      </div>
      {!full ? (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-amber-400/70 bg-amber-950/40 px-5 py-3 text-base font-bold text-amber-800 dark:text-amber-100 transition hover:border-amber-300 md:text-lg"
        >
          Complete next task →
        </button>
      ) : (
        <Callout color="teal">
          If a later task breaks something, you can pinpoint exactly which commit — and roll back to a stable state.
        </Callout>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [OneTaskPanel, ReviewPanel, CommitPanel] as const;

export default function ImplementationDisciplineExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="Implementation discipline" />;
}
