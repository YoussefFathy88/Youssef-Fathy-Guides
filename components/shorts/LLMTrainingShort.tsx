"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────

const STEP_DURATION_MS = 3800;

interface Step {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeColor: string;
}

const STEPS: Step[] = [
  {
    id: "blank",
    title: "It starts knowing nothing",
    subtitle: "Billions of weights, all set randomly",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "pretrain",
    title: "It reads trillions of words",
    subtitle: "Predicting the next token, again and again",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "finetune",
    title: "Humans teach it to answer",
    subtitle: "Labeled question–answer pairs shape its style",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "rlhf",
    title: "Humans rank its replies",
    subtitle: "Preferred answers boost the model's score",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "result",
    title: "Three stages. One helpful AI.",
    subtitle: "Pre-train → Fine-tune → Align",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function BlankVisual({ reduced }: { reduced: boolean }) {
  const weights = Array.from({ length: 20 }, (_, i) => i);
  const vals = [0.42, -0.17, 0.88, -0.63, 0.05, 0.71, -0.34, 0.19, -0.92, 0.56,
                0.13, -0.78, 0.47, 0.02, -0.55, 0.89, -0.21, 0.64, -0.08, 0.37];
  return (
    <div className="flex flex-col items-center gap-6 px-6 w-full">
      <p className="text-base text-slate-400 text-center">Random starting weights</p>
      <div className="grid grid-cols-4 gap-2 w-full max-w-[300px]">
        {weights.map((_, i) => (
          <motion.div
            key={i}
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.04, duration: 0.25 }}
            className={cn(
              "rounded-lg border py-2 px-1 text-center font-mono text-sm font-semibold",
              vals[i] > 0
                ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                : "border-rose-500/40 bg-rose-500/15 text-rose-200",
            )}
          >
            {vals[i].toFixed(2)}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.2 }}
        className="text-base text-slate-400 text-center"
      >
        No knowledge. Pure noise.
      </motion.p>
    </div>
  );
}

function PretrainVisual({ reduced }: { reduced: boolean }) {
  const tokens = ["The", "cat", "sat", "on", "the", "▸?"];
  const colors = [
    "border-violet-500/40 bg-violet-500/15 text-violet-200",
    "border-amber-500/40 bg-amber-500/15 text-amber-200",
    "border-teal-500/40 bg-teal-500/15 text-teal-200",
    "border-blue-500/40 bg-blue-500/15 text-blue-200",
    "border-violet-500/40 bg-violet-500/15 text-violet-200",
    "border-rose-500/40 bg-rose-500/15 text-rose-200",
  ];
  return (
    <div className="flex flex-col items-center gap-6 px-4 w-full">
      <p className="text-base text-slate-400 text-center">Predict the missing token</p>
      <div className="flex flex-wrap justify-center gap-2">
        {tokens.map((tok, i) => (
          <motion.span
            key={tok}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35, type: "spring", bounce: 0.35 }}
            className={cn(
              "rounded-xl border px-4 py-2.5 font-mono text-xl font-semibold",
              colors[i],
              i === tokens.length - 1 && "animate-pulse",
            )}
          >
            {tok}
          </motion.span>
        ))}
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.4 }}
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-center"
      >
        <p className="text-base text-amber-200">Done trillions of times on web text</p>
      </motion.div>
    </div>
  );
}

function FinetuneVisual({ reduced }: { reduced: boolean }) {
  const pairs = [
    { q: "Translate 'hello'", a: "Bonjour" },
    { q: "Summarize this article", a: "It talks about…" },
    { q: "Fix my code bug", a: "The issue is on line 3…" },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[340px] mx-auto">
      {pairs.map((pair, i) => (
        <motion.div
          key={pair.q}
          initial={reduced ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.35, duration: 0.4 }}
          className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 space-y-1.5"
        >
          <div className="flex items-start gap-2">
            <span className="shrink-0 rounded-md bg-teal-500/25 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-teal-300">Q</span>
            <span className="text-base text-slate-200">{pair.q}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 rounded-md bg-violet-500/25 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-violet-300">A</span>
            <span className="text-base text-teal-100">{pair.a}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RlhfVisual({ reduced }: { reduced: boolean }) {
  const replies = [
    { text: "Sure! The answer is 42.", score: "👍 Good", color: "border-blue-500/40 bg-blue-500/15 text-blue-200", bar: 85 },
    { text: "I don't know, maybe 42?", score: "👎 Weak", color: "border-slate-600/60 bg-slate-700/30 text-slate-400", bar: 30 },
  ];
  return (
    <div className="flex flex-col gap-5 px-4 w-full max-w-[340px] mx-auto">
      <p className="text-base text-slate-400 text-center">Same question, two replies — humans rank them</p>
      {replies.map((r, i) => (
        <motion.div
          key={r.text}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.4, duration: 0.4 }}
          className={cn("rounded-xl border p-3 space-y-2", r.color)}
        >
          <p className="text-base">{r.text}</p>
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold">{r.score}</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-blue-400"
                initial={{ width: "0%" }}
                animate={{ width: `${r.bar}%` }}
                transition={{ delay: reduced ? 0 : i * 0.4 + 0.3, duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ResultVisual({ reduced }: { reduced: boolean }) {
  const stages = [
    { label: "Pre-train", desc: "Learn language from web text", color: "border-violet-500/40 bg-violet-500/15 text-violet-200" },
    { label: "Fine-tune", desc: "Learn task format from Q&A pairs", color: "border-teal-500/40 bg-teal-500/15 text-teal-200" },
    { label: "Align", desc: "Learn to be helpful from human ranks", color: "border-rose-500/40 bg-rose-500/15 text-rose-200" },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[340px] mx-auto">
      {stages.map((stage, i) => (
        <motion.div
          key={stage.label}
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduced ? 0 : i * 0.35, duration: 0.4, type: "spring", bounce: 0.3 }}
          className={cn("rounded-xl border p-4 flex items-center gap-4", stage.color)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
            {i + 1}
          </div>
          <div>
            <p className="text-lg font-bold">{stage.label}</p>
            <p className="text-sm text-slate-300">{stage.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LLMTrainingShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = STEPS[stepIndex];

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setStepIndex(prev => (prev + 1) % STEPS.length);
    setProgress(0);
  }, []);

  const goPrev = useCallback(() => {
    setStepIndex(prev => (prev - 1 + STEPS.length) % STEPS.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (tickRef.current) clearInterval(tickRef.current);

    if (!isPlaying) return;

    const tickMs = 50;
    tickRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + (tickMs / STEP_DURATION_MS) * 100, 100));
    }, tickMs);

    intervalRef.current = setInterval(() => {
      setStepIndex(prev => (prev + 1) % STEPS.length);
      setProgress(0);
    }, STEP_DURATION_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isPlaying, stepIndex]);

  useEffect(() => {
    setProgress(0);
  }, [stepIndex]);

  function renderVisual(id: string) {
    switch (id) {
      case "blank":    return <BlankVisual    reduced={reducedMotion} />;
      case "pretrain": return <PretrainVisual reduced={reducedMotion} />;
      case "finetune": return <FinetuneVisual reduced={reducedMotion} />;
      case "rlhf":     return <RlhfVisual     reduced={reducedMotion} />;
      case "result":   return <ResultVisual   reduced={reducedMotion} />;
      default:         return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── Topic badge + step dots ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          LLM Training
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
                i === stepIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Title ───────────────────────────────────────────────────────────── */}
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

      {/* ── Animation zone ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
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

      {/* ── Subtitle strip ──────────────────────────────────────────────────── */}
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
            <p className="text-center text-base font-medium text-white">{step.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Controls + progress bar ──────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-2 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Previous step"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:scale-105 transition"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="translate-x-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Next step"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white/70"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs font-medium text-white/40 tracking-widest uppercase">
          {stepIndex + 1} / {STEPS.length}
        </p>
      </div>
    </div>
  );
}
