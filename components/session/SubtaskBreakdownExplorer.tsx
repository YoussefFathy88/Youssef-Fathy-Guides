"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "criteria", short: "Good Subtask Criteria", color: "teal" },
  { id: "decompose", short: "AI Helps Decompose", color: "violet" },
  { id: "example", short: "Example Output", color: "amber" },
] as const;

// ─── Tab 1 — What makes a good subtask ─────────────────────────────────────────

const CRITERIA = [
  { id: "atomic", label: "Atomic", detail: "One thing, not a bundle of changes." },
  { id: "scoped", label: "Scoped", detail: "Clear boundaries — you know what's in and out." },
  { id: "verifiable", label: "Verifiable", detail: "You can tell exactly when it's done." },
] as const;

function CriteriaPanel() {
  const reducedMotion = useReducedMotion();
  const [showGood, setShowGood] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Three criteria turn a vague ask into a task the AI can actually finish.</PanelTitle>
      <div className="grid gap-3 md:grid-cols-3">
        {CRITERIA.map((c) => (
          <div key={c.id} className="rounded-xl border-2 border-teal-400/40 bg-teal-950/15 p-4">
            <p className="text-lg font-bold text-teal-200 md:text-xl">{c.label}</p>
            <p className="mt-1 text-lg text-gray-100 md:text-xl">{c.detail}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowGood(true)}
        className="w-fit rounded-xl border-2 border-teal-400/70 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 transition hover:border-teal-300 md:text-lg"
      >
        Compare bad vs. good →
      </button>

      {showGood && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4">
            <p className="text-base font-bold text-rose-300 md:text-lg">Bad</p>
            <p className="mt-2 text-lg text-gray-400 line-through md:text-xl">&ldquo;Implement the backend.&rdquo;</p>
          </div>
          <div className="rounded-xl border-2 border-teal-400/60 bg-teal-950/25 p-4">
            <p className="text-base font-bold text-teal-300 md:text-lg">Good</p>
            <p className="mt-2 text-lg text-gray-100 md:text-xl">
              &ldquo;Create a search service that queries pgvector and returns the top-5 chunks by cosine similarity.&rdquo;
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Tab 2 — How AI helps you decompose ────────────────────────────────────────

const RESPONSE_ITEMS = [
  "1. Set up pgvector schema and migration",
  "2. Build PDF ingestion pipeline",
  "3. Create the search service",
  "4. Build the /search API endpoint",
  "5. Wire the frontend search UI",
] as const;

function DecomposePanel() {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(0);
  const full = revealed >= RESPONSE_ITEMS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>One prompt pattern turns a plan into an ordered subtask list.</PanelTitle>
      <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-4">
        <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">Prompt</p>
        <p className="mt-2 font-mono text-lg text-gray-100 md:text-xl">
          &ldquo;Given this plan, break it into subtasks. Each subtask should be implementable in one AI session. Order by dependency.&rdquo;
        </p>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border-2 border-violet-400/40 bg-violet-950/15 p-4">
        {RESPONSE_ITEMS.slice(0, revealed).map((item) => (
          <motion.p
            key={item}
            initial={reducedMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg text-gray-100 md:text-xl"
          >
            {item}
          </motion.p>
        ))}
        {revealed === 0 && <p className="text-lg text-gray-500 md:text-xl">Response will appear here…</p>}
      </div>
      {!full && (
        <button
          type="button"
          onClick={() => setRevealed((r) => r + 1)}
          className="w-fit rounded-xl border-2 border-violet-400/70 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-300 md:text-lg"
        >
          {revealed === 0 ? "Generate response →" : "Next subtask →"}
        </button>
      )}
    </div>
  );
}

// ─── Tab 3 — Example output ─────────────────────────────────────────────────────

const SUBTASKS = [
  { id: "t1", label: "Set up pgvector schema and migration", scope: "Add the vector column and index; no app code yet." },
  { id: "t2", label: "Build PDF ingestion pipeline", scope: "Parse → chunk → embed → store, one document at a time." },
  { id: "t3", label: "Create search service", scope: "Query → embed → similarity search → return chunks." },
  { id: "t4", label: "Build /search API endpoint", scope: "Thin HTTP wrapper around the search service." },
  { id: "t5", label: "Wire frontend search UI to endpoint", scope: "Input box, loading state, results list." },
] as const;

function ExamplePanel() {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(1);
  const full = shown >= SUBTASKS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A realistic subtask list for a RAG search feature — SpecAI project.</PanelTitle>
      <div className="flex flex-col gap-2">
        {SUBTASKS.slice(0, shown).map((task, i) => (
          <motion.div
            key={task.id}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl border-2 border-amber-400/40 bg-amber-950/15 p-4"
          >
            <span className="mt-0.5 text-xl text-amber-300" aria-hidden>☐</span>
            <div>
              <p className="text-lg font-bold text-white md:text-xl">{i + 1}. {task.label}</p>
              <p className="mt-1 text-lg text-gray-300 md:text-xl">{task.scope}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {!full ? (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-amber-400/70 bg-amber-950/40 px-5 py-3 text-base font-bold text-amber-100 transition hover:border-amber-300 md:text-lg"
        >
          Generate next task →
        </button>
      ) : (
        <Callout color="teal">Five subtasks, each small enough for one AI session, ordered by dependency.</Callout>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [CriteriaPanel, DecomposePanel, ExamplePanel] as const;

export default function SubtaskBreakdownExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="Breaking a plan into subtasks" />;
}
