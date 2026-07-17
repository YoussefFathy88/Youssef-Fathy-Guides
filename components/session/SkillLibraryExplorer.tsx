"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "universal", short: "Universal Skills", color: "teal" },
  { id: "specai", short: "SpecAI-Specific Skills", color: "violet" },
  { id: "time-saved", short: "Time Saved", color: "amber" },
] as const;

// ─── Tab 1 — Skills worth having in any project ────────────────────────────────

const UNIVERSAL_SKILLS = [
  { name: "Create a new service / module", trigger: "\"new service for X\"" },
  { name: "Add a new API endpoint", trigger: "\"add endpoint for X\"" },
  { name: "Write a database migration", trigger: "\"migration for this schema change\"" },
  { name: "Create a test for a function", trigger: "\"test for X\"" },
  { name: "Review a diff for issues", trigger: "\"review this diff\"" },
] as const;

function UniversalPanel() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Five skills worth having in any project, regardless of stack.</PanelTitle>
      <div className="grid gap-3 md:grid-cols-2">
        {UNIVERSAL_SKILLS.map((s, i) => (
          <motion.div
            key={s.name}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reducedMotion ? 0 : i * 0.1 }}
            className="rounded-xl border-2 border-teal-400/40 bg-teal-950/15 p-4"
          >
            <p className="text-lg font-bold text-teal-200 md:text-xl">{s.name}</p>
            <p className="mt-1 font-mono text-base text-gray-400 md:text-lg">{s.trigger}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 2 — SpecAI-specific skills example ─────────────────────────────────────

const SPECAI_SKILLS = [
  "Add a new document type to the ingestion pipeline",
  "Create a new vector search endpoint for a new collection",
  "Add a new extraction prompt for a specification clause type",
] as const;

function SpecAiPanel() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Project-specific skills go further than universal ones — they know your domain.</PanelTitle>
      <div className="flex flex-col gap-3">
        {SPECAI_SKILLS.map((s, i) => (
          <motion.div
            key={s}
            initial={reducedMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: reducedMotion ? 0 : i * 0.15 }}
            className="flex items-center gap-3 rounded-xl border-2 border-violet-400/40 bg-violet-950/20 p-4"
          >
            <span className="rounded-full border border-violet-400/50 bg-violet-950/50 px-3 py-1 text-base font-bold text-violet-200 md:text-lg">
              SpecAI
            </span>
            <p className="text-lg text-gray-100 md:text-xl">{s}</p>
          </motion.div>
        ))}
      </div>
      <Callout color="violet">Universal skills work everywhere. Project skills encode what only this project knows.</Callout>
    </div>
  );
}

// ─── Tab 3 — How skills reduce repeated prompting ───────────────────────────────

function TimeSavedPanel() {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Without a skill you re-explain context every time. With one, you invoke it in one line.</PanelTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-gray-700 bg-gray-950/60 p-5">
          <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">Without skill</p>
          <p className="mt-2 text-lg text-gray-200 md:text-xl">
            &ldquo;Create a POST /recommendations endpoint. It should live in /routes, call a service in /services, validate
            input with zod, return {"{"}data, error, meta{"}"}, handle empty results, and use async/await throughout…&rdquo;
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-xl border-2 border-teal-400/50 bg-teal-950/25 p-5">
          <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">With skill</p>
          <p className="mt-2 text-lg font-bold text-teal-200 md:text-xl">&ldquo;Use the endpoint skill for /recommendations.&rdquo;</p>
        </div>
      </div>
      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="w-fit rounded-xl border-2 border-amber-400/70 bg-amber-950/40 px-5 py-3 text-base font-bold text-amber-100 transition hover:border-amber-300 md:text-lg"
        >
          Compare output quality →
        </button>
      ) : (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Callout color="amber">
            Both prompts produce the same matching output — the skill just already knows your project&apos;s rules.
          </Callout>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [UniversalPanel, SpecAiPanel, TimeSavedPanel] as const;

export default function SkillLibraryExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="Building your skill library" />;
}
