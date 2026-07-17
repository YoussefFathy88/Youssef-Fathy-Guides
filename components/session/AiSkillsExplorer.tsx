"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "skill-vs-rule", short: "Skill vs Rule", color: "violet" },
  { id: "anatomy", short: "Skill File Anatomy", color: "teal" },
  { id: "when", short: "When to Create One", color: "amber" },
] as const;

// ─── Tab 1 — Skill vs rule ──────────────────────────────────────────────────────

const TRAITS = [
  { rule: "Always on", skill: "Invoked on demand" },
  { rule: "Applies to all AI behavior", skill: "Applies to one specific output" },
  { rule: "\"API responses follow {data, error, meta}\"", skill: "\"Here's exactly how to generate a new endpoint\"" },
] as const;

function SkillVsRulePanel() {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(1);
  const full = shown >= TRAITS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A rule is an always-on constraint. A skill is an on-demand template.</PanelTitle>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-t-xl border-2 border-b-0 border-violet-400/50 bg-violet-950/25 p-3 text-center text-lg font-bold text-violet-200 md:text-xl">Rule</div>
        <div className="rounded-t-xl border-2 border-b-0 border-teal-400/50 bg-teal-950/25 p-3 text-center text-lg font-bold text-teal-200 md:text-xl">Skill</div>
        {TRAITS.slice(0, shown).map((t, i) => (
          <motion.div
            key={i}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="contents"
          >
            <div className="border-x-2 border-violet-400/30 bg-violet-950/10 p-3 text-lg text-gray-100 md:text-xl">{t.rule}</div>
            <div className="border-x-2 border-teal-400/30 bg-teal-950/10 p-3 text-lg text-gray-100 md:text-xl">{t.skill}</div>
          </motion.div>
        ))}
      </div>
      {!full && (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="w-fit rounded-xl border-2 border-teal-400/70 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 transition hover:border-teal-300 md:text-lg"
        >
          Add next comparison →
        </button>
      )}
    </div>
  );
}

// ─── Tab 2 — What a skill file looks like ───────────────────────────────────────

const SKILL_SECTIONS = [
  { id: "purpose", label: "Purpose", detail: "One line: what this skill produces." },
  { id: "when", label: "When to use", detail: "The trigger phrase or situation." },
  { id: "input", label: "Input", detail: "What you give it — a name, a schema, a description." },
  { id: "output", label: "Output template", detail: "The exact shape of what it generates." },
  { id: "example", label: "Example", detail: "One worked example end to end." },
] as const;

function AnatomyPanel() {
  const reducedMotion = useReducedMotion();
  const [built, setBuilt] = useState(1);
  const full = built >= SKILL_SECTIONS.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A skill file has five sections, built up in order.</PanelTitle>
      <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-4 font-mono">
        <p className="text-lg text-white md:text-xl"># Skill: Create API Endpoint</p>
        {SKILL_SECTIONS.slice(0, built).map((s) => (
          <motion.div key={s.id} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="mt-1">
            <p className="text-lg text-teal-200 md:text-xl">## {s.label}</p>
            <p className="pl-3 text-base text-gray-400 md:text-lg">{s.detail}</p>
          </motion.div>
        ))}
      </div>
      {!full && (
        <button
          type="button"
          onClick={() => setBuilt((b) => b + 1)}
          className="w-fit rounded-xl border-2 border-teal-400/70 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 transition hover:border-teal-300 md:text-lg"
        >
          Add next section →
        </button>
      )}
    </div>
  );
}

// ─── Tab 3 — When to create a skill ─────────────────────────────────────────────

function WhenPanel() {
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(1);
  const readyForSkill = count >= 3;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>Create a skill once you catch yourself writing the same detailed prompt more than twice.</PanelTitle>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-400/60 bg-amber-950/30 text-4xl font-bold text-amber-200">
          {count}
        </div>
        <p className="text-lg text-gray-200 md:text-xl">times you&apos;ve typed &ldquo;Create a new service for X&rdquo;</p>
      </div>
      {!readyForSkill ? (
        <button
          type="button"
          onClick={() => setCount((c) => Math.min(3, c + 1))}
          className="w-fit rounded-xl border-2 border-amber-400/70 bg-amber-950/40 px-5 py-3 text-base font-bold text-amber-100 transition hover:border-amber-300 md:text-lg"
        >
          Prompt it again →
        </button>
      ) : (
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Callout color="amber">📁 Time to make a skill — turn this repeated prompt into a reusable file.</Callout>
        </motion.div>
      )}
      <p className={cn("text-lg md:text-xl", readyForSkill ? "text-gray-500" : "text-gray-300")}>
        If it&apos;s a unique, one-off ask, just prompt inline — don&apos;t create a skill for it.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [SkillVsRulePanel, AnatomyPanel, WhenPanel] as const;

export default function AiSkillsExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="What are AI skills" />;
}
