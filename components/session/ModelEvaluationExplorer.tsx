"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "benchmarks", short: "Benchmarks", color: "violet" },
  { id: "pricing", short: "Pricing", color: "teal" },
  { id: "speed-quality", short: "Speed vs Quality", color: "amber" },
  { id: "sources", short: "Honest Sources", color: "rose" },
] as const;

// ─── Tab 1 — Benchmarks ───────────────────────────────────────────────────────

const BENCHMARK_CARDS = [
  {
    id: "humaneval",
    name: "HumanEval",
    category: "Coding",
    measures: "Whether generated code passes hidden unit tests on small, self-contained Python problems.",
    misses: "Real codebases, multiple files, or your team's existing conventions.",
  },
  {
    id: "swebench",
    name: "SWE-bench",
    category: "Coding",
    measures: "Whether the model can fix a real GitHub issue end-to-end in a real repository.",
    misses: "Your private codebase, your stack, and tasks smaller or messier than a full issue.",
  },
  {
    id: "livebench",
    name: "LiveBench",
    category: "Coding",
    measures: "Code generation, self-repair, and execution on problems refreshed monthly so models can't memorize the answers.",
    misses: "Multi-file, agentic work in your own repository and conventions.",
  },
] as const;

function BenchmarkCard({ card, index }: { card: (typeof BENCHMARK_CARDS)[number]; index: number }) {
  const reducedMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reducedMotion ? 0 : index * 0.15 }}
      className={cn(
        "flex min-h-[13rem] flex-col justify-between rounded-xl border-2 p-5 text-left transition md:p-6",
        flipped ? "border-teal-400/70 bg-teal-950/25" : "border-violet-400/50 bg-violet-950/20",
      )}
    >
      {!flipped ? (
        <>
          <span className="inline-flex w-fit rounded-full border border-violet-400/40 bg-violet-950/40 px-3 py-1 text-base font-bold text-violet-200 md:text-lg">
            {card.category}
          </span>
          <p className="mt-4 text-2xl font-bold text-white md:text-3xl">{card.name}</p>
          <p className="mt-3 text-lg text-gray-300 md:text-xl">Click to see what it measures vs. what it misses</p>
        </>
      ) : (
        <>
          <p className="text-lg font-bold text-teal-300 md:text-xl">✅ Measures</p>
          <p className="mt-1 text-lg text-gray-100 md:text-xl">{card.measures}</p>
          <p className="mt-4 text-lg font-bold text-rose-300 md:text-xl">🚫 Misses</p>
          <p className="mt-1 text-lg text-gray-100 md:text-xl">{card.misses}</p>
        </>
      )}
    </motion.button>
  );
}

function BenchmarksPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Benchmarks score controlled tasks — not your actual codebase.</PanelTitle>
      <div className="grid gap-3 md:grid-cols-3">
        {BENCHMARK_CARDS.map((card, i) => (
          <BenchmarkCard key={card.id} card={card} index={i} />
        ))}
      </div>
      <Callout color="violet">
        A model that tops every leaderboard can still miss on your project. Benchmarks are a starting filter, not the final answer.
      </Callout>
    </div>
  );
}

// ─── Tab 2 — Pricing ──────────────────────────────────────────────────────────

const PRICING_ROWS = [
  { id: "fast", name: "Fast tier", input: "$0.25", output: "$1.25", best: "Autocomplete & boilerplate" },
  { id: "mid", name: "Mid tier", input: "$3.00", output: "$15.00", best: "Feature implementation" },
  { id: "premium", name: "Premium tier", input: "$5.00", output: "$25.00", best: "Planning & architecture" },
] as const;

function PricingPanel() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Output tokens always cost more than input tokens — generating text costs more compute than reading it.</PanelTitle>
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full min-w-[560px] border-collapse text-lg md:text-xl">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-950/60 text-left">
              <th className="p-3 font-bold text-gray-300">Model tier</th>
              <th className="p-3 font-bold text-gray-300">Input $/1M</th>
              <th className="p-3 font-bold text-gray-300">Output $/1M</th>
              <th className="p-3 font-bold text-gray-300">Best for</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_ROWS.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: reducedMotion ? 0 : i * 0.25 }}
                className="border-b border-gray-800 last:border-0"
              >
                <td className="p-3 font-bold text-white">{row.name}</td>
                <td className="p-3 text-gray-200">{row.input}</td>
                <td className="p-3 text-gray-200">{row.output}</td>
                <td className="p-3">
                  <motion.span
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: reducedMotion ? 0 : i * 0.25 + 0.35 }}
                    className="rounded-full border border-teal-400/50 bg-teal-950/40 px-3 py-1 font-bold text-teal-200"
                  >
                    {row.best}
                  </motion.span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-lg text-gray-400 md:text-xl">
        Illustrative shape, not live rates — always check your provider&apos;s pricing page for current numbers.
      </p>
    </div>
  );
}

// ─── Tab 3 — Speed vs Quality ─────────────────────────────────────────────────

const DIAL_STOPS = [
  { id: "fast", label: "Fast model", detail: "Quick autocomplete, boilerplate, one-line edits.", pos: 10 },
  { id: "mid", label: "Mid-tier model", detail: "Full feature implementation across a few files.", pos: 50 },
  { id: "premium", label: "Premium model", detail: "Planning, architecture decisions, hard debugging.", pos: 90 },
] as const;

function SpeedQualityPanel() {
  const reducedMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const stop = DIAL_STOPS[idx];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <PanelTitle>Match the model tier to the task — not every task needs your most expensive model.</PanelTitle>

      <div className="relative h-3 rounded-full bg-gray-800">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 via-amber-500 to-rose-500" style={{ width: "100%" }} />
        <motion.div
          animate={{ left: `${stop.pos}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }}
          className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-gray-900 shadow-lg"
        />
      </div>
      <div className="flex justify-between text-base font-bold text-gray-400 md:text-lg">
        <span>Speed</span>
        <span>Quality</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {DIAL_STOPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              idx === i
                ? "border-amber-400/80 bg-amber-950/50 text-amber-50 ring-2 ring-amber-400/50 ring-offset-2 ring-offset-gray-900"
                : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Callout color="amber">{stop.detail}</Callout>
    </div>
  );
}

// ─── Tab 4 — Honest sources ────────────────────────────────────────────────────

const SOURCES = [
  { id: "x", icon: "𝕏", label: "X / Twitter", sample: "\"Switched my agent to it for a week — great at refactors, weak on long context.\"" },
  { id: "reddit", icon: "👽", label: "r/ClaudeAI, r/LocalLLaMA, r/ChatGPT", sample: "\"Here's where it broke on my repo, with the exact prompt and diff.\"" },
  { id: "telegram", icon: "💬", label: "Arabic dev communities on Telegram", sample: "\"جربته على مشروع حقيقي، ده اللي حصل بالظبط.\"" },
] as const;

function SourcesPanel() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Real use cases and failure stories live outside the benchmark tables.</PanelTitle>
      <div className="grid gap-3 md:grid-cols-3">
        {SOURCES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reducedMotion ? 0 : i * 0.15 }}
            className="flex flex-col gap-3 rounded-xl border-2 border-rose-400/40 bg-rose-950/20 p-4 md:p-5"
          >
            <span className="text-3xl" aria-hidden>{s.icon}</span>
            <p className="text-lg font-bold text-rose-200 md:text-xl">{s.label}</p>
            <p className="rounded-lg border border-gray-700 bg-gray-950/60 p-3 text-base italic text-gray-400 md:text-lg">
              {s.sample}
            </p>
          </motion.div>
        ))}
      </div>
      <Callout color="rose">
        These posts show edge cases, failure modes, and real workflows — the exact things a benchmark table cannot show.
      </Callout>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [BenchmarksPanel, PricingPanel, SpeedQualityPanel, SourcesPanel] as const;

export default function ModelEvaluationExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="How to evaluate a model" />;
}
