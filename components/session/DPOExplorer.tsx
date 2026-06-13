"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccentColor = "amber" | "teal" | "rose" | "violet" | "blue" | "gray";

const BAR_FILL: Record<AccentColor, string> = {
  teal:   "bg-teal-500",
  violet: "bg-violet-500",
  rose:   "bg-rose-500",
  amber:  "bg-amber-500",
  blue:   "bg-blue-500",
  gray:   "bg-gray-500",
};

const ACCENT: Record<AccentColor, { tab: string; border: string; bg: string; text: string }> = {
  gray: {
    tab:    "border-slate-300/80 bg-slate-800/60 text-white ring-slate-300/50",
    border: "border-slate-300/70",
    bg:     "bg-slate-500/15",
    text:   "text-gray-100",
  },
  teal: {
    tab:    "border-teal-400/80 bg-teal-950/50 text-teal-50 ring-teal-400/50",
    border: "border-teal-400/70",
    bg:     "bg-teal-500/15",
    text:   "text-teal-100",
  },
  blue: {
    tab:    "border-blue-400/80 bg-blue-950/50 text-blue-50 ring-blue-400/50",
    border: "border-blue-400/70",
    bg:     "bg-blue-500/15",
    text:   "text-blue-100",
  },
  violet: {
    tab:    "border-violet-400/80 bg-violet-950/50 text-violet-50 ring-violet-400/50",
    border: "border-violet-400/70",
    bg:     "bg-violet-500/15",
    text:   "text-violet-100",
  },
  rose: {
    tab:    "border-rose-400/80 bg-rose-950/50 text-rose-50 ring-rose-400/50",
    border: "border-rose-400/70",
    bg:     "bg-rose-500/15",
    text:   "text-rose-100",
  },
  amber: {
    tab:    "border-amber-400/80 bg-amber-950/50 text-amber-50 ring-amber-400/50",
    border: "border-amber-400/70",
    bg:     "bg-amber-500/15",
    text:   "text-amber-100",
  },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "problem",  short: "The Problem",   chapter: "Why SFT falls short",   color: "rose"   as AccentColor },
  { id: "pick",     short: "Pick a Winner", chapter: "Humans choose",          color: "violet" as AccentColor },
  { id: "data",     short: "Training Data", chapter: "Preference triples",     color: "teal"   as AccentColor },
  { id: "update",   short: "Push Weights",  chapter: "Direct update",          color: "amber"  as AccentColor },
  { id: "stable",   short: "Stay Stable",   chapter: "Reference model",        color: "blue"   as AccentColor },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Shared walking example ───────────────────────────────────────────────────

const PROMPT = "What is an API?";
const CHOSEN  = "An API is a way for two applications to talk to each other. For example, when a weather app shows today's temperature, it's using an API to fetch that data from a remote server.";
const REJECTED = "APIs are the REVOLUTIONARY backbone of MODERN SOFTWARE!! They TRANSFORM how apps COMMUNICATE in ways that are truly MIND-BLOWING!!";
const CHOSEN_LEAD   = "An API is a way for two apps to talk…";
const REJECTED_LEAD = "APIs are REVOLUTIONARY!! MIND-BLOWING!!";

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-lg font-semibold text-gray-300 md:text-xl">{children}</p>;
}

function Callout({ children, color = "violet" }: { children: React.ReactNode; color?: AccentColor }) {
  return (
    <div className={cn("rounded-xl border-2 p-4 md:p-5", ACCENT[color].border, ACCENT[color].bg)}>
      <p className="text-lg text-gray-100 md:text-xl">{children}</p>
    </div>
  );
}

function ChapterBadge({ chapter }: { chapter: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-base font-bold text-violet-200 md:text-lg">
      📖 {chapter}
    </span>
  );
}

function SubTabBar({
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

function ProbBar({
  label,
  value,
  color,
  reducedMotion,
}: {
  label: string;
  value: number;
  color: AccentColor;
  reducedMotion: boolean | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-28 shrink-0 text-base font-bold md:w-32 md:text-lg", ACCENT[color].text)}>
        {label}
      </span>
      <div className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-lg bg-gray-800">
        <motion.div
          className={cn("h-full rounded-lg", BAR_FILL[color])}
          initial={{ width: "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: reducedMotion ? 0 : 1, ease: "easeOut" }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-base font-bold text-gray-200 md:text-lg">
        {value}%
      </span>
    </div>
  );
}

// ─── Tab 1 — The Problem ──────────────────────────────────────────────────────

const PROBLEM_SUBTABS = [
  { id: "both",     label: "Two responses" },
  { id: "sft",      label: "SFT sees them equally" },
  { id: "question", label: "The gap" },
] as const;

function ProblemPanel() {
  const reducedMotion = useReducedMotion();
  const [sub, setSub] = useState(0);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ChapterBadge chapter={TABS[0].chapter} />
        <PanelTitle>SFT taught the model to copy examples — but copying has a blind spot.</PanelTitle>
      </div>

      <SubTabBar tabs={PROBLEM_SUBTABS} activeIdx={sub} onSelect={setSub} accent="rose" />

      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-4"
        >
          {sub === 0 && (
            <>
              <div className="rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3">
                <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">
                  Prompt: "{PROMPT}"
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border-2 border-teal-500/50 bg-teal-950/25 p-4 md:p-5">
                  <p className="text-base font-bold text-teal-300 md:text-lg">Response A</p>
                  <p className="mt-2 text-lg text-gray-100 md:text-xl">{CHOSEN}</p>
                  <p className="mt-3 text-lg font-bold text-teal-300 md:text-xl">Clear and helpful ✅</p>
                </div>
                <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/25 p-4 md:p-5">
                  <p className="text-base font-bold text-rose-300 md:text-lg">Response B</p>
                  <p className="mt-2 text-lg text-gray-100 md:text-xl">{REJECTED}</p>
                  <p className="mt-3 text-lg font-bold text-rose-400 md:text-xl">Hype — not helpful ❌</p>
                </div>
              </div>
            </>
          )}

          {sub === 1 && (
            <div className="rounded-xl border-2 border-rose-500/30 bg-rose-950/20 p-4 md:p-5">
              <p className="text-base font-bold text-rose-300 md:text-lg">SFT's blind spot</p>
              <p className="mt-2 text-lg text-gray-200 md:text-xl">
                SFT only learned to copy the format of good training examples.
                It has no way to compare two responses and pick the better one.
              </p>
              <p className="mt-3 text-lg font-bold text-rose-300 md:text-xl">
                Both responses look "plausible" to SFT — it cannot judge quality.
              </p>
            </div>
          )}

          {sub === 2 && (
            <Callout color="violet">
              <span className="block font-bold text-violet-200 text-xl md:text-2xl">
                ❓ How do we teach the model which response is actually better?
              </span>
              <span className="mt-2 block">
                We need a way to directly tell the model:
                <span className="font-bold text-teal-200"> "prefer this answer"</span> and
                <span className="font-bold text-rose-300"> "avoid that answer"</span>.
              </span>
              <span className="mt-2 block font-bold text-violet-200">That is exactly what DPO does.</span>
            </Callout>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Tab 2 — Pick a Winner ────────────────────────────────────────────────────

const PICK_SUBTABS = [
  { id: "prompt",  label: "See the prompt" },
  { id: "choose",  label: "Pick the winner" },
  { id: "pair",    label: "The pair" },
] as const;

function PickPanel() {
  const reducedMotion = useReducedMotion();
  const [sub, setSub] = useState(0);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ChapterBadge chapter={TABS[1].chapter} />
        <PanelTitle>A human reads both responses and picks the better one. That's the whole job.</PanelTitle>
      </div>

      <SubTabBar tabs={PICK_SUBTABS} activeIdx={sub} onSelect={setSub} accent="violet" />

      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-4"
        >
          {sub === 0 && (
            <div className="rounded-xl border-2 border-violet-500/40 bg-violet-950/20 p-4 md:p-5">
              <p className="text-base font-bold text-violet-300 md:text-lg">Human annotator sees:</p>
              <p className="mt-3 text-lg text-gray-100 md:text-xl">
                Prompt: <span className="font-bold text-violet-200">"{PROMPT}"</span>
              </p>
              <p className="mt-2 text-lg text-gray-300 md:text-xl">Response A: "{CHOSEN_LEAD}"</p>
              <p className="mt-1 text-lg text-gray-300 md:text-xl">Response B: "{REJECTED_LEAD}"</p>
              <p className="mt-3 text-lg font-bold text-violet-300 md:text-xl">
                👀 Which answer is more helpful?
              </p>
            </div>
          )}

          {sub === 1 && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border-2 border-teal-500/50 bg-teal-950/25 p-4 md:p-5">
                  <p className="text-base font-bold text-teal-300 md:text-lg">Response A — CHOSEN ✅</p>
                  <p className="mt-2 text-lg text-gray-100 md:text-xl">"{CHOSEN_LEAD}"</p>
                  <p className="mt-3 text-lg font-bold text-teal-300 md:text-xl">
                    👍 Clear, concrete, accurate
                  </p>
                </div>
                <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/25 p-4 md:p-5">
                  <p className="text-base font-bold text-rose-300 md:text-lg">Response B — REJECTED ❌</p>
                  <p className="mt-2 text-lg text-gray-100 md:text-xl">"{REJECTED_LEAD}"</p>
                  <p className="mt-3 text-lg font-bold text-rose-400 md:text-xl">
                    👎 Hype words, teaches nothing
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-300 md:text-xl">
                No score needed. No number.
                <span className="font-bold text-violet-300"> Just: A is better than B.</span>
              </p>
            </>
          )}

          {sub === 2 && (
            <>
              <div className="rounded-xl border-2 border-teal-500/50 bg-teal-950/25 p-4 md:p-5">
                <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">
                  This one human decision becomes:
                </p>
                <p className="mt-3 font-mono text-lg text-gray-200 md:text-xl">prompt  → "{PROMPT}"</p>
                <p className="mt-2 font-mono text-lg text-teal-100 md:text-xl">chosen  → "{CHOSEN_LEAD}" ✅</p>
                <p className="mt-2 font-mono text-lg text-rose-200 md:text-xl">rejected → "{REJECTED_LEAD}" ❌</p>
              </div>
              <Callout color="violet">
                One preference pair. No numbers. No reward score.
                <span className="block mt-1 font-bold text-violet-200">
                  Thousands of these pairs together train the aligned model.
                </span>
              </Callout>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Tab 3 — Training Data ────────────────────────────────────────────────────

const TRIPLES = [
  {
    id: "t1",
    label: "Triple 1",
    prompt:   "What is an API?",
    chosen:   "An API lets two apps talk to each other. A weather app uses an API to fetch today's temperature.",
    rejected: "APIs are REVOLUTIONARY!! MIND-BLOWING MODERN SOFTWARE!!",
  },
  {
    id: "t2",
    label: "Triple 2",
    prompt:   "Write a short poem about rain.",
    chosen:   "Rain taps softly on the glass, whispering of clouds that pass.",
    rejected: "RAIN RAIN RAIN RAIN WET WET WET",
  },
  {
    id: "t3",
    label: "Triple 3",
    prompt:   "What is photosynthesis?",
    chosen:   "Photosynthesis is how plants turn sunlight into energy using chlorophyll.",
    rejected: "Plants do photosynthesis with the sun and stuff.",
  },
] as const;

function DataPanel() {
  const reducedMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const triple = TRIPLES[idx];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ChapterBadge chapter={TABS[2].chapter} />
        <PanelTitle>
          Each training example is a triple: prompt + chosen answer + rejected answer.
        </PanelTitle>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRIPLES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              idx === i
                ? "border-teal-400/80 bg-teal-950/50 text-teal-50 ring-2 ring-teal-400/50 ring-offset-2 ring-offset-gray-900"
                : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={triple.id}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-3 rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4 md:p-5"
        >
          <p className="font-mono text-base text-gray-300 md:text-lg">
            prompt:   "{triple.prompt}"
          </p>
          <p className="font-mono text-lg text-teal-100 md:text-xl">
            chosen:   "{triple.chosen}" ✅
          </p>
          <p className="font-mono text-lg text-rose-200 md:text-xl">
            rejected: "{triple.rejected}" ❌
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="text-lg text-gray-300 md:text-xl">
        Every triple tells the model:
        <span className="font-bold text-teal-300"> do more of this</span> and
        <span className="font-bold text-rose-400"> less of that</span>.
        No numbers. No separate scorer.
      </p>
    </div>
  );
}

// ─── Tab 4 — Push Weights ─────────────────────────────────────────────────────

const TRAINING_STEPS = [
  { label: "Start",    badge: "Starting",     chosen: 52, rejected: 38, gap: 14, phase: "before" as const },
  { label: "Step 1",   badge: "First win 🎯", chosen: 55, rejected: 35, gap: 20, phase: "after"  as const },
  { label: "Step 50",  badge: "Mid training", chosen: 72, rejected: 19, gap: 53, phase: "mid"    as const },
  { label: "Step 200", badge: "Aligned ✅",   chosen: 91, rejected:  6, gap: 85, phase: "done"   as const },
] as const;

function UpdatePanel() {
  const reducedMotion = useReducedMotion();
  const [sub, setSub] = useState(0);
  const current = TRAINING_STEPS[sub];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ChapterBadge chapter={TABS[3].chapter} />
        <PanelTitle>
          For every triple, DPO increases the chosen probability and decreases the rejected probability.
        </PanelTitle>
      </div>

      <div className="rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3">
        <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">
          Prompt: "{PROMPT}"
        </p>
        <p className="mt-1 text-base text-teal-200 md:text-lg">Chosen: "{CHOSEN_LEAD}"</p>
        <p className="mt-1 text-base text-rose-300 md:text-lg">Rejected: "{REJECTED_LEAD}"</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRAINING_STEPS.map((step, i) => (
          <button
            key={step.label}
            type="button"
            onClick={() => setSub(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
              sub === i
                ? "border-amber-400/80 bg-amber-950/50 text-amber-50 ring-2 ring-amber-400/50 ring-offset-2 ring-offset-gray-900"
                : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-500",
            )}
          >
            {step.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="space-y-3 rounded-xl border border-gray-700 bg-gray-950/70 p-4 md:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-bold text-amber-300 md:text-lg">{current.badge}</p>
            <p className="text-base font-bold text-gray-300 md:text-lg">
              Preference gap: <span className="text-amber-200">{current.gap}%</span>
            </p>
          </div>

          <ProbBar label="Chosen ✅"   value={current.chosen}   color="teal" reducedMotion={reducedMotion} />
          <ProbBar label="Rejected ❌" value={current.rejected} color="rose" reducedMotion={reducedMotion} />

          {current.phase === "after" && (
            <p className="text-lg font-bold text-amber-300 md:text-xl">
              ↑ chosen went up · ↓ rejected went down — one update already works
            </p>
          )}
          {current.phase === "done" && (
            <p className="text-lg font-bold text-teal-300 md:text-xl">
              Model strongly prefers the helpful answer ✅
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <Callout color="amber">
        No scorer needed. No separate optimizer.
        <span className="font-bold text-amber-200"> DPO updates the model's weights directly from preference pairs.</span>
      </Callout>
    </div>
  );
}

// ─── Tab 5 — Stay Stable ──────────────────────────────────────────────────────

const STABLE_SUBTABS = [
  { id: "idea",    label: "The idea" },
  { id: "good",    label: "Good drift ✅" },
  { id: "bad",     label: "Bad drift ❌" },
  { id: "compare", label: "Side by side" },
] as const;

function DriftBar({
  label,
  refValue,
  currentValue,
  currentColor,
  reducedMotion,
}: {
  label: string;
  refValue: number;
  currentValue: number;
  currentColor: AccentColor;
  reducedMotion: boolean | null;
}) {
  const drift = currentValue - refValue;
  const driftPositive = drift > 0;
  return (
    <div className="space-y-2">
      <p className="text-base font-bold text-gray-300 md:text-lg">{label}</p>
      <div className="flex items-center gap-3">
        <span className="w-28 shrink-0 text-base text-violet-300 md:text-lg">Reference 🔒</span>
        <div className="flex h-7 min-w-0 flex-1 overflow-hidden rounded-lg bg-gray-800">
          <motion.div
            className="h-full rounded-lg bg-violet-500"
            initial={{ width: "0%" }}
            animate={{ width: `${refValue}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="w-12 shrink-0 text-right text-base font-bold text-violet-300 md:text-lg">{refValue}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 shrink-0 text-base text-gray-200 md:text-lg">Current 🔄</span>
        <div className="flex h-7 min-w-0 flex-1 overflow-hidden rounded-lg bg-gray-800">
          <motion.div
            className={cn("h-full rounded-lg", BAR_FILL[currentColor])}
            initial={{ width: "0%" }}
            animate={{ width: `${currentValue}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut", delay: 0.15 }}
          />
        </div>
        <span className={cn("w-12 shrink-0 text-right text-base font-bold md:text-lg", ACCENT[currentColor].text)}>
          {currentValue}%
        </span>
      </div>
      <p className={cn("text-base font-bold md:text-lg", driftPositive ? ACCENT[currentColor].text : "text-gray-400")}>
        Drift: {driftPositive ? "+" : ""}{drift}%
      </p>
    </div>
  );
}

function StablePanel() {
  const reducedMotion = useReducedMotion();
  const [sub, setSub] = useState(0);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ChapterBadge chapter={TABS[4].chapter} />
        <PanelTitle>DPO keeps a frozen copy of the starting model to stop wild drift.</PanelTitle>
      </div>

      <SubTabBar tabs={STABLE_SUBTABS} activeIdx={sub} onSelect={setSub} accent="blue" />

      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-4"
        >
          {sub === 0 && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border-2 border-violet-500/40 bg-violet-950/20 p-4 md:p-5">
                  <p className="text-base font-bold text-violet-300 md:text-lg">Reference model 🔒</p>
                  <p className="mt-2 text-lg text-gray-200 md:text-xl">
                    A frozen copy of the model <em>before</em> DPO training starts.
                    Its weights never change.
                  </p>
                  <p className="mt-3 text-base font-bold text-violet-300 md:text-lg">Locked — never updated</p>
                </div>
                <div className="rounded-xl border-2 border-amber-500/40 bg-amber-950/20 p-4 md:p-5">
                  <p className="text-base font-bold text-amber-300 md:text-lg">Training model 🔄</p>
                  <p className="mt-2 text-lg text-gray-200 md:text-xl">
                    The model being trained. After every update, DPO
                    checks how far it has moved from the reference.
                  </p>
                  <p className="mt-3 text-base font-bold text-amber-300 md:text-lg">Updating every step</p>
                </div>
              </div>
              <Callout color="blue">
                If the training model drifts too far from the reference, the loss automatically penalizes it.
                <span className="block mt-1 font-bold text-blue-200">
                  No extra knob to tune — drift protection is built into the math.
                </span>
              </Callout>
            </>
          )}

          {sub === 1 && (
            <>
              <div className="rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3">
                <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">Response being checked</p>
                <p className="mt-1 text-lg text-teal-200 md:text-xl">"{CHOSEN}" ✅</p>
              </div>
              <div className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4 md:p-5 space-y-4">
                <DriftBar
                  label="How likely is this response?"
                  refValue={60}
                  currentValue={64}
                  currentColor="teal"
                  reducedMotion={reducedMotion}
                />
              </div>
              <div className="rounded-xl border-2 border-teal-500/50 bg-teal-950/25 p-4 md:p-5">
                <p className="text-lg font-bold text-teal-300 md:text-xl">+4% drift — very small ✅</p>
                <p className="mt-1 text-lg text-gray-200 md:text-xl">
                  The model learned to prefer the helpful answer a little more.
                  It stayed close to the reference — penalty is nearly zero.
                </p>
              </div>
            </>
          )}

          {sub === 2 && (
            <>
              <div className="rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3">
                <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">Response being checked</p>
                <p className="mt-1 text-lg text-rose-300 md:text-xl">"{REJECTED}" ❌</p>
              </div>
              <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4 md:p-5 space-y-4">
                <DriftBar
                  label="How likely is this response?"
                  refValue={2}
                  currentValue={70}
                  currentColor="rose"
                  reducedMotion={reducedMotion}
                />
              </div>
              <div className="rounded-xl border-2 border-rose-500/50 bg-rose-950/30 p-4 md:p-5">
                <p className="text-lg font-bold text-rose-300 md:text-xl">+68% drift — wild jump ❌</p>
                <p className="mt-1 text-lg text-gray-200 md:text-xl">
                  The model started pushing hype answers to 70% likely — 35× the reference.
                  The loss fires a large penalty to pull it back.
                </p>
              </div>
            </>
          )}

          {sub === 3 && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border-2 border-teal-500/40 bg-teal-950/20 p-4 md:p-5 space-y-3">
                  <p className="text-base font-bold text-teal-300 md:text-lg">Helpful response ✅</p>
                  <p className="text-base text-gray-300 md:text-lg italic">"{CHOSEN_LEAD}"</p>
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-base text-violet-300 md:text-lg">Ref 🔒</span>
                    <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-gray-800">
                      <motion.div className="h-full rounded-full bg-violet-500" initial={{ width: "0%" }} animate={{ width: "60%" }} transition={{ duration: reducedMotion ? 0 : 0.8 }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-base font-bold text-violet-300 md:text-lg">60%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-base text-gray-200 md:text-lg">Now 🔄</span>
                    <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-gray-800">
                      <motion.div className="h-full rounded-full bg-teal-500" initial={{ width: "0%" }} animate={{ width: "64%" }} transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.1 }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-base font-bold text-teal-300 md:text-lg">64%</span>
                  </div>
                  <p className="text-base font-bold text-teal-300 md:text-lg">Drift +4% — penalty low ✅</p>
                </div>

                <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/20 p-4 md:p-5 space-y-3">
                  <p className="text-base font-bold text-rose-300 md:text-lg">Hype response ❌</p>
                  <p className="text-base text-gray-300 md:text-lg italic">"{REJECTED_LEAD}"</p>
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-base text-violet-300 md:text-lg">Ref 🔒</span>
                    <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-gray-800">
                      <motion.div className="h-full rounded-full bg-violet-500" initial={{ width: "0%" }} animate={{ width: "2%" }} transition={{ duration: reducedMotion ? 0 : 0.8 }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-base font-bold text-violet-300 md:text-lg">2%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-base text-gray-200 md:text-lg">Now 🔄</span>
                    <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-gray-800">
                      <motion.div className="h-full rounded-full bg-rose-500" initial={{ width: "0%" }} animate={{ width: "70%" }} transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.1 }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-base font-bold text-rose-300 md:text-lg">70%</span>
                  </div>
                  <p className="text-base font-bold text-rose-400 md:text-lg">Drift +68% — penalty high ❌</p>
                </div>
              </div>

              <Callout color="blue">
                Same mechanism, opposite result.
                <span className="block mt-1 font-bold text-blue-200">
                  Small helpful drift → low penalty. Wild hype drift → large penalty. The reference keeps the model honest.
                </span>
              </Callout>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Panel map ────────────────────────────────────────────────────────────────

const PANELS: Record<TabId, () => React.ReactNode> = {
  problem:  ProblemPanel,
  pick:     PickPanel,
  data:     DataPanel,
  update:   UpdatePanel,
  stable:   StablePanel,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DPOExplorer() {
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeTab = TABS[activeIdx];
  const ActivePanel = PANELS[activeTab.id];

  const goPrev = useCallback(() => setActiveIdx((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setActiveIdx((i) => Math.min(TABS.length - 1, i + 1)), []);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full flex-col rounded-2xl border border-gray-700 bg-gray-900 p-5 md:p-8"
      data-local-navigation="true"
    >
      {/* Journey dots */}
      <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-3">
        {TABS.map((tab, idx) => {
          const done    = idx < activeIdx;
          const current = idx === activeIdx;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Go to ${tab.short}`}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 text-base font-bold transition md:h-11 md:w-11 md:text-lg",
                current
                  ? cn("ring-2 ring-offset-2 ring-offset-gray-900", ACCENT[tab.color].tab)
                  : done
                    ? "border-teal-500/60 bg-teal-950/40 text-teal-200"
                    : "border-gray-700 bg-gray-950/60 text-gray-400 hover:border-gray-500",
              )}
            >
              {done ? "✓" : idx + 1}
            </button>
          );
        })}
        <span className="text-base text-gray-300 md:text-lg">
          Step {activeIdx + 1} · {activeTab.chapter}
        </span>
      </div>

      {/* Main tab bar */}
      <div
        className="flex gap-2 overflow-x-auto px-1 py-1 md:gap-2.5"
        role="tablist"
        aria-label="DPO training steps"
      >
        {TABS.map((tab, idx) => {
          const isActive = activeIdx === idx;
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
              <span className={cn("mr-1.5", isActive ? "text-gray-200" : "text-gray-400")} aria-hidden>
                {idx + 1}.
              </span>
              {tab.short}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab.id}`}
        className="mt-5 flex flex-1 flex-col md:mt-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="flex flex-1 flex-col"
          >
            <ActivePanel />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="rounded-xl border-2 border-gray-700 bg-gray-950 px-5 py-3 text-base font-bold text-gray-200 transition hover:border-gray-600 disabled:opacity-40 md:text-lg"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIdx === TABS.length - 1}
          className="rounded-xl border-2 border-violet-500/50 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-400 disabled:opacity-40 md:text-lg"
        >
          Next →
        </button>
        <span className="text-base text-gray-400 md:text-lg">
          {activeIdx + 1} / {TABS.length}
        </span>
      </div>
    </motion.div>
  );
}
