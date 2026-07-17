"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "search", short: "Task A: Search Service", color: "teal" },
  { id: "endpoint", short: "Task B: API Endpoint", color: "violet" },
  { id: "ui", short: "Task C: Frontend UI", color: "amber" },
] as const;

// ─── Shared review checklist row ───────────────────────────────────────────────

function ReviewList({ items }: { items: readonly string[] }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item}
          initial={reducedMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: reducedMotion ? 0 : i * 0.1 }}
          className="flex items-start gap-2 text-lg text-gray-100 md:text-xl"
        >
          <span className="mt-1 text-violet-300" aria-hidden>•</span>
          <span>{item}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Tab 1 — Search service ─────────────────────────────────────────────────────

function SearchTaskPanel() {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(0);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Query in, embed it, return the top-5 chunks from pgvector.</PanelTitle>
      <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-4 font-mono text-lg text-gray-100 md:text-xl">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>async function searchChunks(query: string)</motion.p>
        {expanded >= 1 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-4 text-teal-200">const vector = await embed(query)</motion.p>}
        {expanded >= 2 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-4 text-violet-200">return db.matchTopK(vector, 5)</motion.p>}
      </div>
      {expanded < 2 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => e + 1)}
          className="w-fit rounded-xl border-2 border-teal-400/70 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 transition hover:border-teal-300 md:text-lg"
        >
          Reveal next line →
        </button>
      )}
      <Callout color="teal">
        <span className="font-bold text-teal-200">Review this before moving on:</span>
      </Callout>
      <ReviewList
        items={[
          "Does it handle empty results?",
          "Is the embedding call separate and reusable?",
          "Is error handling in place for a failed database query?",
        ]}
      />
    </div>
  );
}

// ─── Tab 2 — API endpoint ────────────────────────────────────────────────────────

function EndpointTaskPanel() {
  const reducedMotion = useReducedMotion();
  const [plugged, setPlugged] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A thin POST /search endpoint that calls the search service.</PanelTitle>
      <div className="flex items-center justify-center gap-3">
        <div className="rounded-xl border-2 border-violet-400/50 bg-violet-950/25 px-5 py-4 text-lg font-bold text-violet-100 md:text-xl">
          POST /search
        </div>
        <motion.span
          animate={{ x: plugged ? 0 : -8, opacity: plugged ? 1 : 0.4 }}
          className="text-3xl text-gray-400"
          aria-hidden
        >
          🔌→
        </motion.span>
        <div className="rounded-xl border-2 border-teal-400/50 bg-teal-950/25 px-5 py-4 text-lg font-bold text-teal-100 md:text-xl">
          searchChunks()
        </div>
      </div>
      {!plugged ? (
        <button
          type="button"
          onClick={() => setPlugged(true)}
          className="mx-auto w-fit rounded-xl border-2 border-violet-400/70 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-300 md:text-lg"
        >
          Wire it up →
        </button>
      ) : (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-700 bg-gray-950/70 p-4 font-mono text-lg text-gray-100 md:text-xl"
        >
          <p>{"→ { query: \"pricing table\" }"}</p>
          <p className="text-teal-200">{"← 200 { chunks: [...5 items] }"}</p>
        </motion.div>
      )}
      <ReviewList
        items={[
          "Clean separation from the service logic?",
          "Correct status codes (400 on bad input, 200 on success)?",
          "Input validated before it reaches the service?",
        ]}
      />
    </div>
  );
}

// ─── Tab 3 — Frontend UI ─────────────────────────────────────────────────────────

const UI_STEPS = ["Search box", "Loading state", "Results list"] as const;

function UiTaskPanel() {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A search input that calls /search and renders the returned chunks.</PanelTitle>
      <div className="flex flex-col gap-3 rounded-xl border-2 border-amber-400/40 bg-amber-950/15 p-5">
        <div className="rounded-lg border border-gray-600 bg-gray-950/70 px-4 py-3 text-lg text-gray-300 md:text-xl">🔍 Search chunks…</div>
        {step >= 1 && (
          <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-amber-200 md:text-xl">
            ⏳ Loading…
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
            <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3 text-lg text-gray-100 md:text-xl">Chunk 1 — pricing overview…</div>
            <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3 text-lg text-gray-100 md:text-xl">Chunk 2 — enterprise tier…</div>
          </motion.div>
        )}
      </div>
      {step < UI_STEPS.length && (
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-amber-400/70 bg-amber-950/40 px-5 py-3 text-base font-bold text-amber-100 transition hover:border-amber-300 md:text-lg"
        >
          Show {UI_STEPS[step]?.toLowerCase()} →
        </button>
      )}
      <ReviewList
        items={[
          "Is a loading state shown while waiting?",
          "Is an error state shown if the request fails?",
          "Are results clearly formatted for scanning?",
        ]}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [SearchTaskPanel, EndpointTaskPanel, UiTaskPanel] as const;

export default function SpecAIBuildExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="Real example: SpecAI build" />;
}
