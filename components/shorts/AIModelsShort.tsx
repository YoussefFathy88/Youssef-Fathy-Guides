"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Step data ─────────────────────────────────────────────────────────────────

interface Step {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeColor: string;
}

const STEPS: Step[] = [
  {
    id: "function",
    title: "A model is just an equation",
    subtitle: "Weights turn input into output",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "terminology",
    title: "Two jobs: Training & Inference",
    subtitle: "GPT and Claude do the same thing — just with millions of weights",
    accentColor: "text-indigo-300",
    badgeColor: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
  },
  {
    id: "training",
    title: "Training tunes the weights",
    subtitle: "Guess the next token, check the error, nudge weights",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "inference",
    title: "Inference uses frozen weights",
    subtitle: "One token out, fed back in, one word at a time",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "recap",
    title: "Weights. Training. Inference.",
    subtitle: "The whole trick behind every AI model you've talked to",
    accentColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
];

// ─── Shared bits ────────────────────────────────────────────────────────────────

function DownArrow({ reduced, delay = 0 }: { reduced: boolean; delay?: number }) {
  return (
    <motion.svg
      width={28}
      height={24}
      viewBox="0 0 28 24"
      className="mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduced ? 0 : delay, duration: 0.25 }}
    >
      <path d="M 14 2 L 14 18" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" />
      <path
        d="M 7 12 L 14 20 L 21 12"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.svg>
  );
}

// ─── FunctionVisual — price = w1 × size + w2 × rooms ───────────────────────────

function FunctionVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-slate-600/40 bg-slate-800/50 px-4 py-2.5 text-center"
      >
        <p className="text-lg text-slate-200">
          Any model is <span className="font-bold text-white">weights</span> plugged into an{" "}
          <span className="font-bold text-white">equation</span>
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.3, duration: 0.4 }}
        className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3"
      >
        <p className="text-base text-slate-400 text-center mb-2">Predicting a house price</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-lg font-bold text-white">price =</span>
          <span className="rounded-xl border border-violet-400/50 bg-violet-500/30 px-2.5 py-0.5 text-lg font-bold text-violet-100">
            w1
          </span>
          <span className="text-lg font-bold text-white">× size +</span>
          <span className="rounded-xl border border-violet-400/50 bg-violet-500/30 px-2.5 py-0.5 text-lg font-bold text-violet-100">
            w2
          </span>
          <span className="text-lg font-bold text-white">× rooms + ...</span>
        </div>
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.8, duration: 0.35 }}
        className="text-center text-base text-slate-400"
      >
        Know w1 and w2 → predict any house's price
      </motion.p>
    </div>
  );
}

// ─── TerminologyVisual — compute weights = Training, use weights = Inference ───

function TerminologyVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2.5"
      >
        <p className="text-base text-slate-300">
          Figure out <span className="font-bold text-white">w1 and w2</span> from house data
        </p>
        <p className="mt-1 text-lg font-bold text-teal-200">= Training</p>
      </motion.div>

      <DownArrow reduced={reduced} delay={0.4} />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.55, duration: 0.35 }}
        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2.5"
      >
        <p className="text-base text-slate-300">
          Use those weights on a <span className="font-bold text-white">new house</span>
        </p>
        <p className="mt-1 text-lg font-bold text-blue-200">= Inference</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.0, duration: 0.4 }}
        className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-center"
      >
        <p className="text-base font-bold text-indigo-200">GPT & Claude: same idea</p>
        <p className="text-base text-slate-300">
          just millions of weights instead of 2
        </p>
      </motion.div>
    </div>
  );
}

// ─── TrainingVisual — corpus → transformer → predicted vs real → loss → nudge ──

function TrainingVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-teal-500/25 bg-teal-500/10 px-3 py-2 text-center"
      >
        <p className="text-base font-semibold text-teal-200">Billions of tokens of text</p>
      </motion.div>

      <DownArrow reduced={reduced} delay={0.35} />

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.45, duration: 0.3 }}
        className="rounded-lg border border-slate-600/40 bg-slate-800/50 px-2.5 py-1.5 text-center"
      >
        <p className="text-base text-slate-300">
          "Cairo is the capital of <span className="text-slate-500">___</span>"
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.6, duration: 0.35 }}
        className="grid grid-cols-2 gap-2"
      >
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-center">
          <p className="text-base text-rose-300">model guesses</p>
          <p className="text-lg font-bold font-mono text-white">"France"</p>
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-center">
          <p className="text-base text-emerald-300">real answer</p>
          <p className="text-lg font-bold font-mono text-emerald-100">"Egypt"</p>
        </div>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.95, duration: 0.35 }}
        className="rounded-xl border border-slate-600/40 bg-slate-800/50 px-3 py-2.5 space-y-2"
      >
        <div className="flex items-center justify-between">
          <p className="text-base text-slate-300 font-semibold">Loss (how wrong)</p>
          <p className="text-base text-amber-300 font-semibold">adjust weights</p>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-700/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
            initial={{ width: "88%" }}
            animate={reduced ? { width: "6%" } : { width: ["88%", "6%", "6%", "88%"] }}
            transition={
              reduced
                ? { delay: 1.3, duration: 1.6, ease: "easeOut" }
                : {
                    delay: 1.3,
                    duration: 3.2,
                    times: [0, 0.5, 0.85, 1],
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: 0.6,
                  }
            }
          />
        </div>
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 3.1, duration: 0.3 }}
        className="text-center text-base text-slate-400"
      >
        Repeat trillions of times — that's training
      </motion.p>
    </div>
  );
}

// ─── InferenceVisual — prompt → frozen transformer → token → feed back → output ─

const NEXT_TOKENS = ["The", " capital", " of", " Egypt", " is", " Cairo", "."];

function InferenceVisual({ reduced }: { reduced: boolean }) {
  const [visibleCount, setVisibleCount] = useState(reduced ? NEXT_TOKENS.length : 0);

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function step(count: number) {
      if (cancelled) return;
      setVisibleCount(count);
      if (count < NEXT_TOKENS.length) {
        timeoutId = setTimeout(() => step(count + 1), 350);
      } else {
        timeoutId = setTimeout(() => step(0), 1500);
      }
    }

    timeoutId = setTimeout(() => step(1), 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reduced]);

  return (
    <div className="flex flex-col gap-2.5 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-slate-600/50 bg-slate-800/60 px-3 py-2 text-center"
      >
        <p className="text-base text-slate-400">Prompt</p>
        <p className="text-lg font-semibold text-white">"What's the capital of Egypt?"</p>
      </motion.div>

      <DownArrow reduced={reduced} delay={0.4} />

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.55, duration: 0.3 }}
        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-center"
      >
        <p className="text-base font-semibold text-blue-200">Frozen weights — no learning</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.75, duration: 0.3 }}
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2.5"
      >
        <p className="text-base text-emerald-300 mb-1.5">One token at a time, fed back in</p>
        <div className="flex flex-wrap gap-1.5">
          {NEXT_TOKENS.map((tok, i) => (
            <motion.span
              key={tok + i}
              animate={{ opacity: i < visibleCount ? 1 : 0, scale: i < visibleCount ? 1 : 0.7 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.5 }}
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/25 px-2 py-1 text-base font-bold text-emerald-50"
            >
              {tok}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── RecapVisual — three-line summary ───────────────────────────────────────────

const RECAP_LINES = [
  { term: "Weights", meaning: "= numbers", color: "violet" },
  { term: "Training", meaning: "= tuning the numbers", color: "teal" },
  { term: "Inference", meaning: "= using the tuned numbers", color: "blue" },
];

function RecapVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 px-3 w-full max-w-[320px] mx-auto">
      {RECAP_LINES.map((line, i) => (
        <motion.div
          key={line.term}
          initial={reduced ? false : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.35 }}
          className={cn(
            "rounded-xl border px-3 py-2.5",
            line.color === "violet" && "border-violet-500/30 bg-violet-500/10",
            line.color === "teal" && "border-teal-500/30 bg-teal-500/10",
            line.color === "blue" && "border-blue-500/30 bg-blue-500/10",
          )}
        >
          <p className="text-lg font-bold text-white">
            {line.term} <span className="font-medium text-slate-300">{line.meaning}</span>
          </p>
        </motion.div>
      ))}

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.15, duration: 0.35 }}
        className="text-center text-base text-emerald-200 font-medium mt-1"
      >
        That's every AI model you've ever talked to
      </motion.p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AIModelsShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex]!;

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((prev) => (prev + 1) % STEPS.length);
  }, []);

  const goPrev = useCallback(() => {
    setStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, []);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function renderVisual(id: string) {
    switch (id) {
      case "function":     return <FunctionVisual     reduced={reducedMotion} />;
      case "terminology":  return <TerminologyVisual  reduced={reducedMotion} />;
      case "training":     return <TrainingVisual     reduced={reducedMotion} />;
      case "inference":    return <InferenceVisual    reduced={reducedMotion} />;
      case "recap":        return <RecapVisual        reduced={reducedMotion} />;
      default:             return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header: badge + step dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          AI Models
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
                i === stepIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="px-5 pb-3">
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

      {/* Animation zone */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${step.id}`}
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

      {/* Subtitle */}
      <div className="px-5 pt-3 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`subtitle-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-sm"
          >
            <p className="text-center text-base font-medium text-white">
              {step.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls + progress */}
      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next step"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white/70"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          {`Step ${stepIndex + 1} / ${STEPS.length} — tap Next`}
        </p>
      </div>
    </div>
  );
}
