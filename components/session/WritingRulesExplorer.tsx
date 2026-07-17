"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "anatomy", short: "Rule Anatomy", color: "violet" },
  { id: "examples", short: "Real Rule Examples", color: "teal" },
  { id: "anti-patterns", short: "Anti-Patterns", color: "rose" },
] as const;

// ─── Tab 1 — Rule anatomy ───────────────────────────────────────────────────────

function AnatomyPanel() {
  const reducedMotion = useReducedMotion();
  const [built, setBuilt] = useState(0);
  const full = built >= 3;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A good rule has three parts: context, instruction, and an example.</PanelTitle>
      <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4">
        <p className="text-base font-bold text-rose-300 md:text-lg">Vague (bad)</p>
        <p className="mt-1 text-lg text-gray-300 line-through md:text-xl">&ldquo;Use clean code.&rdquo;</p>
      </div>
      <div className="rounded-xl border-2 border-violet-400/50 bg-violet-950/20 p-4">
        <p className="text-base font-bold text-violet-300 md:text-lg">Specific (good) — builds in three parts</p>
        <div className="mt-2 text-lg text-gray-100 md:text-xl">
          {built >= 1 && <motion.span initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}>All database queries must go through the service layer. </motion.span>}
          {built >= 2 && <motion.span initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="text-teal-200">Never query directly from a controller or route handler.</motion.span>}
        </div>
      </div>
      {!full && (
        <button
          type="button"
          onClick={() => setBuilt((b) => b + 1)}
          className="w-fit rounded-xl border-2 border-violet-400/70 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-300 md:text-lg"
        >
          Build next part →
        </button>
      )}
    </div>
  );
}

// ─── Tab 2 — Real rule examples ─────────────────────────────────────────────────

const REAL_RULES = [
  "Use async/await for all database operations. Never use .then() chains.",
  "API responses follow this shape: { data, error, meta }. Never return raw model objects.",
  "Services live in /services, endpoints in /routes, utilities in /lib.",
  "All new features must include error handling for empty results and database failures.",
  "Use pgvector's <=> cosine distance operator for all embedding similarity queries.",
] as const;

function ExamplesPanel() {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(1);
  const full = shown >= REAL_RULES.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Five real rules from a project (SpecAI-inspired), typed one at a time.</PanelTitle>
      <div className="flex flex-col gap-2 rounded-xl border border-gray-700 bg-gray-950/70 p-4 font-mono">
        {REAL_RULES.slice(0, shown).map((rule, i) => (
          <motion.p
            key={rule}
            initial={reducedMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg text-gray-100 md:text-xl"
          >
            {i + 1}. {rule}
          </motion.p>
        ))}
      </div>
      {!full && (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-teal-400/70 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 transition hover:border-teal-300 md:text-lg"
        >
          Add next rule →
        </button>
      )}
    </div>
  );
}

// ─── Tab 3 — Anti-patterns ───────────────────────────────────────────────────────

const ANTI_PATTERNS = [
  { bad: "Write good comments", why: "Too subjective — the AI ignores it.", fix: "Comment only the WHY when it's non-obvious (a workaround, a hidden constraint)." },
  { bad: "Follow best practices", why: "Meaningless without a definition.", fix: "Name the specific practice: \"validate all route inputs with zod schemas.\"" },
  { bad: "Keep code clean", why: "No action, no standard to check against.", fix: "\"Functions stay under 40 lines; extract helpers past that.\"" },
] as const;

function AntiPatternsPanel() {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Three rules that sound good but give the AI nothing to act on.</PanelTitle>
      <div className="flex flex-col gap-3">
        {ANTI_PATTERNS.map((item, i) => {
          const isRevealed = revealed.has(i);
          return (
            <div key={item.bad} className="rounded-xl border border-gray-700 bg-gray-950/60 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl text-rose-400" aria-hidden>❌</span>
                <p className="text-lg text-gray-200 md:text-xl">&ldquo;{item.bad}&rdquo;</p>
              </div>
              {!isRevealed ? (
                <button
                  type="button"
                  onClick={() => setRevealed((r) => new Set(r).add(i))}
                  className="mt-2 rounded-lg border border-teal-400/50 bg-teal-950/30 px-3 py-1.5 text-base font-bold text-teal-200 md:text-lg"
                >
                  Show fix →
                </button>
              ) : (
                <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                  <p className="text-base text-gray-400 md:text-lg">{item.why}</p>
                  <div className="mt-1 flex items-start gap-2">
                    <span className="text-xl text-teal-300" aria-hidden>✅</span>
                    <p className="text-lg text-teal-100 md:text-xl">{item.fix}</p>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      {revealed.size === ANTI_PATTERNS.length && (
        <Callout color="teal">Every rule should name the specific, verifiable thing you want the AI to do.</Callout>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [AnatomyPanel, ExamplesPanel, AntiPatternsPanel] as const;

export default function WritingRulesExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="Writing rules that actually work" />;
}
