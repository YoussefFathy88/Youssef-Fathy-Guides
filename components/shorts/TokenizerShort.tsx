"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────

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
    title: "AI can't read text directly",
    subtitle: "It breaks text into pieces called tokens",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "vocab",
    title: "Training built a token vocabulary",
    subtitle: "Common chunks got their own token — about 200,000 total",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "lookup",
    title: "Now tokenize a brand-new prompt",
    subtitle: "'the' matches a whole vocabulary token",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "ids",
    title: "Tokens become numbers",
    subtitle: "Each token maps to an ID the model reads",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
  {
    id: "result",
    title: "One prompt becomes four tokens",
    subtitle: "Common words stay whole; rare ones split",
    accentColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
];

const PROMPT_WORDS = ["the", "tokenizer", "helps"];

// ─── Step 1: Hook ──────────────────────────────────────────────────────────────

function HookVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 text-center"
      >
        <p className="text-base font-bold text-violet-200 mb-1">Prompt</p>
        <p className="text-lg font-semibold text-white">&quot;{PROMPT_WORDS.join(" ")}&quot;</p>
      </motion.div>

      <motion.svg
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.3 }}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-slate-500 animate-bounce"
      >
        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
        <polyline points="19 12 12 19 5 12" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>

      <div className="flex gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.5 + i * 0.15, duration: 0.3 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-xl font-bold text-slate-400"
          >
            ?
          </motion.span>
        ))}
      </div>

      <p className="text-center text-base text-slate-400">
        Something splits it into pieces first
      </p>
    </div>
  );
}

// ─── Step 2: Vocabulary (brief mention, not deep training) ─────────────────────

const SAMPLE_VOCAB = ["the", "ing", "token", "izer", "un", "able", "er", "ly"];

function VocabVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="text-base font-bold text-amber-200 mb-2 text-center">
          Sample of the trained vocabulary
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_VOCAB.map((v, i) => (
            <motion.span
              key={v}
              initial={reduced ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : i * 0.08, duration: 0.25 }}
              className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 text-base font-bold font-mono text-amber-200"
            >
              {v}
            </motion.span>
          ))}
        </div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.75, duration: 0.3 }}
        className="text-4xl font-bold text-white"
      >
        ~200,000
      </motion.div>
      <p className="text-center text-base text-slate-400">
        tokens learned once, from huge amounts of text
      </p>
    </div>
  );
}

// ─── Step 3: Tokenize a new prompt (main focus, multi-phase) ───────────────────

type PhaseKind = "whole" | "chars" | "partial" | "final";

interface LookupPhase {
  wordIndex: number;
  kind: PhaseKind;
  chips: string[];
  finalPieces?: string[];
  heading: string;
  note: string;
  subtitle: string;
}

const LOOKUP_PHASES: LookupPhase[] = [
  {
    wordIndex: 0,
    kind: "whole",
    chips: ["the"],
    finalPieces: ["the"],
    heading: "Already a whole token",
    note: "\"the\" is common enough to have its own token",
    subtitle: "'the' matches a whole vocabulary token",
  },
  {
    wordIndex: 1,
    kind: "chars",
    chips: ["t", "o", "k", "e", "n", "i", "z", "e", "r"],
    heading: "Not a whole token — start from characters",
    note: "\"tokenizer\" isn't in the vocabulary as one piece",
    subtitle: "Not a whole token — BPE starts from its characters",
  },
  {
    wordIndex: 1,
    kind: "partial",
    chips: ["tok", "en", "iz", "er"],
    heading: "Merge learned pairs, step by step",
    note: "Each merge combines two pieces the training already learned",
    subtitle: "It repeats the merges it learned during training",
  },
  {
    wordIndex: 1,
    kind: "final",
    chips: ["token", "izer"],
    finalPieces: ["token", "izer"],
    heading: "Stop once pieces match the vocabulary",
    note: "\"token\" and \"izer\" are both known tokens — done",
    subtitle: "Merging stops once the pieces match the vocabulary",
  },
  {
    wordIndex: 2,
    kind: "whole",
    chips: ["helps"],
    finalPieces: ["helps"],
    heading: "Already a whole token",
    note: "\"helps\" is common enough to have its own token",
    subtitle: "'helps' matches a whole vocabulary token",
  },
];

function LookupVisual({ phaseIndex, reduced }: { phaseIndex: number; reduced: boolean }) {
  const phase = LOOKUP_PHASES[phaseIndex]!;
  const tally = LOOKUP_PHASES.slice(0, phaseIndex + 1).flatMap((p) => p.finalPieces ?? []);
  const isFinalChip = phase.kind === "whole" || phase.kind === "final";

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-center">
        <p className="text-base font-bold text-teal-200 mb-1">Prompt</p>
        <p className="text-lg font-semibold text-white">
          {PROMPT_WORDS.map((w, i) => (
            <span
              key={i}
              className={cn(i === phase.wordIndex && "rounded bg-teal-500/40 px-1")}
            >
              {w}
              {i < PROMPT_WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phaseIndex}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-center"
        >
          <p
            className={cn(
              "text-base font-bold",
              isFinalChip ? "text-teal-300" : "text-amber-300"
            )}
          >
            {phase.heading}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {phase.chips.map((c, i) => (
              <motion.span
                key={`${c}-${i}`}
                layout
                initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.25 }}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-base font-bold font-mono",
                  isFinalChip
                    ? "border-teal-400/40 bg-teal-500/20 text-teal-200"
                    : "border-amber-400/40 bg-amber-500/20 text-amber-200"
                )}
              >
                {c}
              </motion.span>
            ))}
          </div>
          <p className="text-base text-slate-400 mt-2">{phase.note}</p>
        </motion.div>
      </AnimatePresence>

      <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 px-3 py-2">
        <p className="text-base text-slate-400 mb-1">Tokens so far</p>
        <div className="flex flex-wrap gap-1.5">
          {tally.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="rounded-md border border-slate-600 bg-slate-800 px-2 py-0.5 text-base font-mono text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Tokens become IDs ──────────────────────────────────────────────────

const FINAL_TOKENS = [
  { token: "the", id: 1820 },
  { token: "token", id: 11241 },
  { token: "izer", id: 1634 },
  { token: "helps", id: 8395 },
];

function IdsVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 px-4 w-full max-w-[320px] mx-auto">
      {FINAL_TOKENS.map((t, i) => (
        <motion.div
          key={t.token}
          initial={reduced ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.15, duration: 0.3 }}
          className="flex items-center justify-between rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2"
        >
          <span className="rounded-md border border-rose-400/40 bg-rose-500/20 px-2.5 py-1 text-base font-bold font-mono text-rose-200">
            {t.token}
          </span>
          <span className="text-base text-slate-500">→</span>
          <span className="text-base font-mono font-bold text-white">{t.id}</span>
        </motion.div>
      ))}
      <p className="text-center text-base text-slate-500 italic pt-1">
        Illustrative IDs — not real GPT token numbers
      </p>
    </div>
  );
}

// ─── Step 5: Result ─────────────────────────────────────────────────────────────

function ResultVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.35 }}
        className="text-5xl font-bold text-emerald-300"
      >
        4
      </motion.div>
      <p className="text-lg font-semibold text-white text-center">tokens from 3 words</p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.25, duration: 0.3 }}
        className="w-full rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3"
      >
        <div className="flex flex-wrap justify-center gap-1.5">
          {FINAL_TOKENS.map((t) => (
            <span
              key={t.token}
              className="rounded-md border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1 text-base font-bold font-mono text-emerald-200"
            >
              {t.token}
            </span>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-base text-slate-400">
        Common words stay whole — rare ones split into pieces
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TokenizerShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [lookupPhaseIndex, setLookupPhaseIndex] = useState(0);

  const step = STEPS[stepIndex]!;
  const isLookupStep = step.id === "lookup";
  const totalLookupPhases = LOOKUP_PHASES.length;

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
    setLookupPhaseIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (STEPS[stepIndex]?.id === "lookup" && lookupPhaseIndex < totalLookupPhases - 1) {
      setLookupPhaseIndex((prev) => prev + 1);
      return;
    }
    setLookupPhaseIndex(0);
    setStepIndex((prev) => (prev + 1) % STEPS.length);
  }, [stepIndex, lookupPhaseIndex, totalLookupPhases]);

  const goPrev = useCallback(() => {
    if (STEPS[stepIndex]?.id === "lookup" && lookupPhaseIndex > 0) {
      setLookupPhaseIndex((prev) => prev - 1);
      return;
    }
    setLookupPhaseIndex(0);
    setStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, [stepIndex, lookupPhaseIndex]);

  const progress = isLookupStep
    ? ((lookupPhaseIndex + 1) / totalLookupPhases) * 100
    : ((stepIndex + 1) / STEPS.length) * 100;

  const subtitle = isLookupStep ? LOOKUP_PHASES[lookupPhaseIndex]!.subtitle : step.subtitle;

  function renderVisual(id: string) {
    switch (id) {
      case "hook":
        return <HookVisual reduced={reducedMotion} />;
      case "vocab":
        return <VocabVisual reduced={reducedMotion} />;
      case "lookup":
        return <LookupVisual phaseIndex={lookupPhaseIndex} reduced={reducedMotion} />;
      case "ids":
        return <IdsVisual reduced={reducedMotion} />;
      case "result":
        return <ResultVisual reduced={reducedMotion} />;
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
          Tokenization
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
            key={`visual-${step.id}-${isLookupStep ? lookupPhaseIndex : ""}`}
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
            key={`subtitle-${step.id}-${isLookupStep ? lookupPhaseIndex : ""}`}
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
          {isLookupStep
            ? `Phase ${lookupPhaseIndex + 1} / ${totalLookupPhases} — tap Next`
            : `Step ${stepIndex + 1} / ${STEPS.length} — tap Next`}
        </p>
      </div>
    </div>
  );
}
