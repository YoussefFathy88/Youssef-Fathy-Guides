"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────
// Single running example: the word "Egyptian", from prompt
// "Tell me fact about Egyptian people". Every piece — including "ian" — is
// built from raw letters via its own explicit merge rule (#2 i+a, #4 E+g,
// #7 ia+n, #19 y+p, #33 yp+t, #71 Eg+ypt), same as real BPE: no chunk is
// ever assumed pre-merged. Ranks are an illustrative rule set for teaching
// merge order, not real cl100k_base ranks — the vocabulary-size fact
// (100,000) is the only hard number here. No rule ever merges
// "Egypt" + "ian" together, so "Egyptian" ends up as 2 tokens, not 1 —
// deliberately, to show that common words stay whole while rarer ones split.

interface Step {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeColor: string;
}

const STEPS: Step[] = [
  {
    id: "hook",
    title: "AI breaks Egyptian into letters",
    subtitle: "Before reading anything, text splits into pieces called tokens",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "rules",
    title: "Training already learned numbered rules",
    subtitle: "The most common pair merges first and becomes rule #1",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "merge",
    title: "Runtime replays the learned rules",
    subtitle: "No new rules — just the ones training already learned",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
  {
    id: "recap",
    title: "Some words split, some don't",
    subtitle: "Watch the whole prompt turn into tokens",
    accentColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
];

const PROMPT_PREFIX = "Tell me fact about ";
const PROMPT_SUFFIX = " people";
const FOCUS_WORD = "Egyptian";
const FOCUS_LETTERS = ["E", "g", "y", "p", "t", "i", "a", "n"];

// ─── Step 1: Hook — the split ───────────────────────────────────────────────

function HookVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 text-center"
      >
        <p className="text-base font-bold text-violet-200 mb-1">Prompt</p>
        <p className="text-lg font-semibold text-white leading-snug">
          &quot;{PROMPT_PREFIX}
          <span className="rounded bg-violet-500/40 px-1">{FOCUS_WORD}</span>
          {PROMPT_SUFFIX}&quot;
        </p>
      </motion.div>

      <motion.svg
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.3 }}
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-slate-500 animate-bounce"
      >
        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
        <polyline points="19 12 12 19 5 12" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>

      <div className="flex flex-wrap justify-center gap-2">
        {FOCUS_LETTERS.map((c, i) => (
          <motion.span
            key={i}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.4 + i * 0.1, duration: 0.3 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/20 text-lg font-bold font-mono text-violet-200"
          >
            {c}
          </motion.span>
        ))}
      </div>

      <p className="text-center text-base text-slate-400">
        Just the focus word, split into raw letters
      </p>
    </div>
  );
}

// ─── Step 2: Training already learned the rules ─────────────────────────────

interface Rule {
  rank: number;
  left: string;
  right: string;
  result: string;
}

const WORD_RULES: Rule[] = [
  { rank: 2, left: "i", right: "a", result: "ia" },
  { rank: 4, left: "E", right: "g", result: "Eg" },
  { rank: 7, left: "ia", right: "n", result: "ian" },
  { rank: 19, left: "y", right: "p", result: "yp" },
  { rank: 33, left: "yp", right: "t", result: "ypt" },
  { rank: 71, left: "Eg", right: "ypt", result: "Egypt" },
];

function RulesVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-4 w-full max-w-[320px] mx-auto">
      {WORD_RULES.map((r, i) => (
        <motion.div
          key={r.rank}
          initial={reduced ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.12, duration: 0.25 }}
          className="flex items-center gap-2 rounded-lg border border-teal-400/30 bg-teal-500/10 px-2.5 py-1"
        >
          <span className="rounded-md border border-teal-400/40 bg-teal-500/20 px-1.5 py-0.5 text-base font-mono font-bold text-teal-200">
            #{r.rank}
          </span>
          <span className="text-base font-mono font-bold text-white">
            {r.left}+{r.right}
          </span>
          <span className="text-base text-slate-500">&rarr;</span>
          <span className="text-base font-mono font-bold text-teal-200">{r.result}</span>
        </motion.div>
      ))}
      <p className="text-center text-base text-slate-400 pt-1 leading-snug">
        6 of Egyptian&apos;s rules &mdash; one of 100,000 total. No rule merges Egypt+ian.
      </p>
    </div>
  );
}

// ─── Step 3: Runtime — the actual merge, step by step ───────────────────────

interface MergePhase {
  chips: string[];
  mergedIndex: number | null;
  ruleLabel: string | null;
  heading: string;
  note: string;
  subtitle: string;
}

const MERGE_PHASES: MergePhase[] = [
  {
    chips: ["E", "g", "y", "p", "t", "i", "a", "n"],
    mergedIndex: null,
    ruleLabel: null,
    heading: "Start from raw letters",
    note: "Check every adjacent pair before merging anything",
    subtitle: "Runtime starts from the same 8 letters training saw",
  },
  {
    chips: ["E", "g", "y", "p", "t", "ia", "n"],
    mergedIndex: 5,
    ruleLabel: "Rule #2 — best-ranked pair",
    heading: "(i, a) wins — merge it",
    note: "Highest-ranked pair anywhere in the sequence, not first-in-line",
    subtitle: "Rule #2 fires: i and a merge into ia",
  },
  {
    chips: ["Eg", "y", "p", "t", "ia", "n"],
    mergedIndex: 0,
    ruleLabel: "Rule #4 — next best pair",
    heading: "(E, g) wins — merge it",
    note: "ia isn't touched again — only the next-best pair merges",
    subtitle: "Rule #4 fires: E and g merge into Eg",
  },
  {
    chips: ["Eg", "y", "p", "t", "ian"],
    mergedIndex: 4,
    ruleLabel: "Rule #7",
    heading: "(ia, n) wins — merge it",
    note: "ian only exists because ia was already merged",
    subtitle: "Rule #7 fires: ia and n merge into ian",
  },
  {
    chips: ["Eg", "yp", "t", "ian"],
    mergedIndex: 1,
    ruleLabel: "Rule #19",
    heading: "(y, p) wins — merge it",
    note: "Same rule that would fire for any y-p pair, anywhere",
    subtitle: "Rule #19 fires: y and p merge into yp",
  },
  {
    chips: ["Eg", "ypt", "ian"],
    mergedIndex: 1,
    ruleLabel: "Rule #33",
    heading: "(yp, t) wins — merge it",
    note: "ypt only exists because yp was already merged",
    subtitle: "Rule #33 fires: yp and t merge into ypt",
  },
  {
    chips: ["Egypt", "ian"],
    mergedIndex: 0,
    ruleLabel: "Rule #71 — rare, learned late",
    heading: "(Eg, ypt) wins — merge it",
    note: "The country name forms from rules learned in training",
    subtitle: "Rule #71 fires: Eg and ypt merge into Egypt",
  },
  {
    chips: ["Egypt", "ian"],
    mergedIndex: null,
    ruleLabel: null,
    heading: "No rule matches — merging stops",
    note: "There's no rule for Egypt+ian, so it stays 2 tokens",
    subtitle: "Merging stops here — Egyptian ends up as 2 tokens",
  },
];

function MergeVisual({ phaseIndex, reduced }: { phaseIndex: number; reduced: boolean }) {
  const phase = MERGE_PHASES[phaseIndex]!;
  const isFinal = phaseIndex === MERGE_PHASES.length - 1;

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={phaseIndex}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-center"
        >
          <p className="text-base font-bold text-rose-300">{phase.heading}</p>

          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {phase.chips.map((c, i) => (
              <motion.span
                key={`${c}-${i}`}
                layout
                initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduced ? 0 : i * 0.06, duration: 0.25 }}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-base font-bold font-mono",
                  phase.mergedIndex === i
                    ? "border-rose-400/60 bg-rose-500/30 text-rose-100 ring-2 ring-rose-400/50"
                    : isFinal
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                      : "border-slate-600 bg-slate-800 text-slate-300"
                )}
              >
                {c}
              </motion.span>
            ))}
          </div>

          {phase.ruleLabel && (
            <p className="mt-2 text-base font-mono font-semibold text-rose-300">
              {phase.ruleLabel}
            </p>
          )}
          <p className="text-base text-slate-400 mt-1">{phase.note}</p>
        </motion.div>
      </AnimatePresence>

      {isFinal && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.3, duration: 0.3 }}
          className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-center"
        >
          <p className="text-base text-white font-medium">
            &quot;Egyptian&quot; &rarr; 2 tokens, not 1
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Step 4: Recap — the whole prompt, tokenized ────────────────────────────

const PROMPT_WORD_COUNT = 6;
const FULL_PROMPT_TOKENS = ["Tell", "me", "fact", "about", "Egypt", "ian", "people"];
const SPLIT_TOKENS = new Set(["Egypt", "ian"]);

function RecapVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.35 }}
        className="text-5xl font-bold text-emerald-300"
      >
        {FULL_PROMPT_TOKENS.length}
      </motion.div>
      <p className="text-lg font-semibold text-white text-center">
        tokens from {PROMPT_WORD_COUNT} words
      </p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.25, duration: 0.3 }}
        className="w-full rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3"
      >
        <div className="flex flex-wrap justify-center gap-1.5">
          {FULL_PROMPT_TOKENS.map((t, i) => (
            <motion.span
              key={`${t}-${i}`}
              initial={reduced ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : 0.35 + i * 0.08, duration: 0.25 }}
              className={cn(
                "rounded-md border px-2.5 py-1 text-base font-bold font-mono",
                SPLIT_TOKENS.has(t)
                  ? "border-rose-400/50 bg-rose-500/25 text-rose-200"
                  : "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
              )}
            >
              {t}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-base text-slate-400">
        &quot;Egyptian&quot; splits into Egypt + ian &mdash; every other word stayed whole
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TokenizerShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [mergePhaseIndex, setMergePhaseIndex] = useState(0);

  const step = STEPS[stepIndex]!;
  const isMergeStep = step.id === "merge";
  const totalMergePhases = MERGE_PHASES.length;

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
    setMergePhaseIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (STEPS[stepIndex]?.id === "merge" && mergePhaseIndex < totalMergePhases - 1) {
      setMergePhaseIndex((prev) => prev + 1);
      return;
    }
    setMergePhaseIndex(0);
    setStepIndex((prev) => (prev + 1) % STEPS.length);
  }, [stepIndex, mergePhaseIndex, totalMergePhases]);

  const goPrev = useCallback(() => {
    if (STEPS[stepIndex]?.id === "merge" && mergePhaseIndex > 0) {
      setMergePhaseIndex((prev) => prev - 1);
      return;
    }
    setMergePhaseIndex(0);
    setStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, [stepIndex, mergePhaseIndex]);

  const progress = isMergeStep
    ? ((mergePhaseIndex + 1) / totalMergePhases) * 100
    : ((stepIndex + 1) / STEPS.length) * 100;

  const subtitle = isMergeStep ? MERGE_PHASES[mergePhaseIndex]!.subtitle : step.subtitle;

  function renderVisual(id: string) {
    switch (id) {
      case "hook":
        return <HookVisual reduced={reducedMotion} />;
      case "rules":
        return <RulesVisual reduced={reducedMotion} />;
      case "merge":
        return <MergeVisual phaseIndex={mergePhaseIndex} reduced={reducedMotion} />;
      case "recap":
        return <RecapVisual reduced={reducedMotion} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor
          )}
        >
          BPE: Training vs Runtime
        </span>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToStep(i)}
              aria-label={`Step ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === stepIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      </div>

      <div className="px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={`title-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className={cn("text-2xl font-bold leading-tight", step.accentColor)}
          >
            {step.title}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${step.id}-${isMergeStep ? mergePhaseIndex : ""}`}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            {renderVisual(step.id)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 pt-3 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`subtitle-${step.id}-${isMergeStep ? mergePhaseIndex : ""}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-sm min-h-[3.5rem] flex items-center justify-center"
          >
            <p className="text-center text-base font-medium text-white leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next step"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div className="h-full rounded-full bg-white/70" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          {isMergeStep
            ? `Merge ${mergePhaseIndex + 1} / ${totalMergePhases} — tap Next`
            : `Step ${stepIndex + 1} / ${STEPS.length} — tap Next`}
        </p>
      </div>
    </div>
  );
}
