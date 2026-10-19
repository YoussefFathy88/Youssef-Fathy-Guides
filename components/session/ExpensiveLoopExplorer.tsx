"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "loop", short: "The Bad Loop", color: "rose" },
  { id: "cost", short: "Why It's Expensive", color: "amber" },
] as const;

// ─── Tab 1 — The bad loop (animated) ───────────────────────────────────────────

const LOOP_NODES = [
  { id: "ask", label: "Ask AI", tone: "green" as const },
  { id: "build", label: "AI Builds", tone: "yellow" as const },
  { id: "wrong", label: "Feature Wrong", tone: "red" as const },
  { id: "ask2", label: "Ask Again", tone: "green" as const },
  { id: "refactor", label: "AI Refactors", tone: "yellow" as const },
  { id: "off", label: "Still Off", tone: "red" as const },
] as const;

const TONE_CLASS: Record<(typeof LOOP_NODES)[number]["tone"], string> = {
  green: "border-teal-400/70 bg-teal-950/30 text-teal-800 dark:text-teal-100",
  yellow: "border-amber-400/70 bg-amber-950/30 text-amber-800 dark:text-amber-100",
  red: "border-rose-400/70 bg-rose-950/30 text-rose-800 dark:text-rose-100",
};

function LoopPanel() {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(1);
  const done = shown >= LOOP_NODES.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Without a shared plan, every fix becomes another round trip.</PanelTitle>

      <div className="flex flex-wrap items-center gap-2">
        {LOOP_NODES.map((node, i) => (
          <div key={node.id} className="flex items-center gap-2">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: i < shown ? 1 : 0.15, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn("rounded-xl border-2 px-4 py-3 text-base font-bold md:text-lg", TONE_CLASS[node.tone])}
            >
              {node.label}
            </motion.div>
            {i < LOOP_NODES.length - 1 && <span className="text-2xl text-gray-600 dark:text-gray-500">→</span>}
          </div>
        ))}
        {done && <span className="text-2xl text-gray-600 dark:text-gray-500">↻</span>}
      </div>

      {!done ? (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-rose-400/70 bg-rose-950/40 px-5 py-3 text-base font-bold text-rose-800 dark:text-rose-100 transition hover:border-rose-300 md:text-lg"
        >
          Next step →
        </button>
      ) : (
        <Callout color="rose">
          The loop repeats until someone stops to write down what &ldquo;done&rdquo; actually means —
          every extra lap burns tokens, time, and trust.
        </Callout>
      )}
    </div>
  );
}

// ─── Tab 2 — Why it's expensive ────────────────────────────────────────────────

const COSTS = [
  { id: "token", icon: "🪙", label: "Token cost", detail: "Refactor prompts often run 3–5× the tokens of the original implementation prompt." },
  { id: "time", icon: "⏱️", label: "Time cost", detail: "Every correction cycle adds a full review-and-rewrite pass, not just a quick tweak." },
  { id: "drift", icon: "🧩", label: "Drift cost", detail: "Each patch on top of a patch pulls the code further from a clean architecture." },
] as const;

function CostPanel() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>The loop is not just annoying — it has three real costs.</PanelTitle>
      <div className="grid gap-3 md:grid-cols-3">
        {COSTS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={reducedMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: reducedMotion ? 0 : i * 0.15 }}
            className="flex flex-col gap-2 rounded-xl border-2 border-amber-400/40 bg-amber-950/20 p-4 md:p-5"
          >
            <span className="text-3xl" aria-hidden>{c.icon}</span>
            <p className="text-lg font-bold text-amber-800 dark:text-amber-200 md:text-xl">{c.label}</p>
            <p className="text-lg text-gray-900 dark:text-gray-200 md:text-xl">{c.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [LoopPanel, CostPanel] as const;

export default function ExpensiveLoopExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="The expensive loop problem" />;
}
