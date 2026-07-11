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
    title: "High temp can get facts wrong",
    subtitle: "Same question — very different answers",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "scores",
    title: "Every word gets a score first",
    subtitle: "Softmax turns scores into percentages",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "dial",
    title: "Temperature reshapes those scores",
    subtitle: "Low = safe pick — High = takes risks",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "usecases",
    title: "Match temperature to your task",
    subtitle: "Facts need low — creativity needs high",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "summary",
    title: "You control the randomness",
    subtitle: "Temp 0 = same every time, Temp 2 = wild",
    accentColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
];

// ─── Temperature dial data ────────────────────────────────────────────────────

const TEMP_LEVELS = [
  { value: "0.1", tag: "Safe" },
  { value: "0.5", tag: "Focused" },
  { value: "1.0", tag: "Default" },
  { value: "1.5", tag: "Creative" },
  { value: "2.0", tag: "Wild" },
] as const;

const TOTAL_DIAL_PHASES = TEMP_LEVELS.length;

// Factual question: "What's the capital of France?"
const USER_PROMPT = "What's the capital of France?";

// Candidate answers — Paris is correct, rest are wrong
const CANDIDATES = ["Paris", "Lyon", "Nice", "Marseille"] as const;
const CAND_COLORS = ["bg-teal-500", "bg-blue-500", "bg-amber-500", "bg-rose-500"] as const;
const CAND_TEXT = ["text-teal-300", "text-blue-300", "text-amber-300", "text-rose-300"] as const;

// Illustrative probabilities at each temperature level
// Low temp: Paris dominates (correct answer is safe)
// High temp: distribution flattens — wrong answers get dangerous share
const TEMP_PROBS: readonly number[][] = [
  [99, 1, 0, 0],     // T=0.1 — almost always Paris
  [87, 8, 4, 1],     // T=0.5
  [72, 16, 8, 4],    // T=1.0
  [46, 28, 16, 10],  // T=1.5 — wrong answers now meaningful
  [30, 30, 24, 16],  // T=2.0 — Lyon almost as likely as Paris
] as const;

// ─── Shared sub-components ────────────────────────────────────────────────────

function ProbBars({
  probs,
  reduced,
}: {
  probs: readonly number[];
  reduced: boolean;
}) {
  return (
    <div className="space-y-2 w-full">
      {CANDIDATES.map((word, i) => (
        <div
          key={word}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 space-y-1",
            i === 0
              ? "border-teal-500/40 bg-teal-500/10"
              : "border-slate-600/40 bg-slate-800/40",
          )}
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white">{word}</span>
              {i === 0 && (
                <span className="text-base text-teal-300 font-bold">✓</span>
              )}
              {i > 0 && probs[i]! >= 15 && (
                <span className="text-base text-rose-400 font-bold">✗</span>
              )}
            </div>
            <span className={cn("font-mono text-base font-bold", CAND_TEXT[i])}>
              {probs[i]}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className={cn("h-full rounded-full", CAND_COLORS[i])}
              animate={{ width: `${probs[i]}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function HookVisual({ reduced }: { reduced: boolean }) {
  // High-temp wrong answers to show (excluding Paris)
  const wrongAnswers = [
    { word: "Lyon", correct: false },
    { word: "Nice", correct: false },
    { word: "Marseille", correct: false },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      {/* Question */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3 py-2.5"
      >
        <p className="text-base font-bold text-violet-200 mb-0.5">Question asked</p>
        <p className="text-lg font-semibold text-white">{USER_PROMPT}</p>
      </motion.div>

      {/* Low temp — always correct */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduced ? 0 : 0.3, duration: 0.35 }}
        className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-3 py-2.5 flex items-center justify-between"
      >
        <div>
          <p className="text-base font-bold text-teal-300 mb-0.5">Low temp (0.2)</p>
          <p className="text-base text-slate-300">Always picks the right answer</p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="rounded-xl border border-teal-400/50 bg-teal-500/25 px-3 py-1.5 text-xl font-bold text-white">
            Paris
          </span>
          <span className="text-lg font-bold text-teal-300">✓</span>
        </div>
      </motion.div>

      {/* High temp — can get it wrong */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduced ? 0 : 0.55, duration: 0.35 }}
        className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-bold text-rose-300">High temp (1.8)</p>
          <span className="text-base text-slate-400">Could pick any of these:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Correct one */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : 0.65, duration: 0.25, type: "spring", bounce: 0.3 }}
            className="rounded-xl border border-teal-400/50 bg-teal-500/20 px-3 py-2 flex items-center justify-between"
          >
            <span className="text-lg font-bold text-white">Paris</span>
            <span className="text-base font-bold text-teal-300">✓</span>
          </motion.div>
          {/* Wrong ones */}
          {wrongAnswers.map((item, i) => (
            <motion.div
              key={item.word}
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: reduced ? 0 : 0.75 + i * 0.1,
                duration: 0.25,
                type: "spring",
                bounce: 0.3,
              }}
              className="rounded-xl border border-rose-400/50 bg-rose-500/20 px-3 py-2 flex items-center justify-between"
            >
              <span className="text-lg font-bold text-white">{item.word}</span>
              <span className="text-base font-bold text-rose-300">✗</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ScoresVisual({ reduced }: { reduced: boolean }) {
  const baseProbs = TEMP_PROBS[2]!;

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2"
      >
        <p className="text-base font-bold text-amber-200 mb-0.5">Prompt</p>
        <p className="text-base text-white">{USER_PROMPT}</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.2 }}
      >
        <ProbBars probs={baseProbs} reduced={reduced} />
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.8 }}
        className="text-center text-base text-slate-500 italic"
      >
        Illustrative — Temperature 1.0 (default)
      </motion.p>
    </div>
  );
}

function DialVisual({ reduced, dialPhase }: { reduced: boolean; dialPhase: number }) {
  const level = TEMP_LEVELS[dialPhase]!;
  const probs = TEMP_PROBS[dialPhase]!;
  const isLow = dialPhase <= 1;
  const isHigh = dialPhase >= 3;

  const chipClass = isLow
    ? "border-teal-400/40 bg-teal-500/20 text-teal-300"
    : isHigh
    ? "border-rose-400/40 bg-rose-500/20 text-rose-300"
    : "border-blue-400/40 bg-blue-500/20 text-blue-300";

  const barColor = isLow ? "bg-teal-500" : isHigh ? "bg-rose-500" : "bg-blue-500";

  const bannerClass = isLow
    ? "border-teal-500/30 bg-teal-500/10"
    : isHigh
    ? "border-rose-500/30 bg-rose-500/10"
    : "border-blue-500/30 bg-blue-500/10";
  const bannerText = isLow ? "text-teal-200" : isHigh ? "text-rose-200" : "text-blue-200";

  const label = isLow
    ? "Sharp — Paris wins every time"
    : isHigh
    ? "Flat — wrong answers get a real chance"
    : "Balanced — Paris still likely";

  return (
    <div className="flex flex-col gap-2.5 px-4 w-full max-w-[320px] mx-auto">
      {/* Temperature banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`banner-${dialPhase}`}
          initial={reduced ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: 6 }}
          transition={{ duration: 0.22 }}
          className={cn("rounded-xl border px-4 py-2.5 flex items-center justify-between", bannerClass)}
        >
          <div>
            <p className={cn("text-xl font-bold font-mono", bannerText)}>
              T = {level.value}
            </p>
            <p className={cn("text-base leading-tight", bannerText)}>{label}</p>
          </div>
          <span className={cn("rounded-full border px-2.5 py-1 text-base font-bold", chipClass)}>
            {level.tag}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Dial track */}
      <div className="px-1 space-y-1">
        <div className="flex items-end gap-1">
          {TEMP_LEVELS.map((t, i) => (
            <div key={t.value} className="flex flex-col items-center gap-0.5 flex-1">
              <motion.div
                className={cn("w-full rounded-full", i <= dialPhase ? barColor : "bg-slate-700")}
                animate={{ height: i === dialPhase ? 12 : 6 }}
                transition={{ duration: 0.25 }}
              />
              <span
                className={cn(
                  "text-base font-mono font-bold",
                  i === dialPhase
                    ? isLow
                      ? "text-teal-300"
                      : isHigh
                      ? "text-rose-300"
                      : "text-blue-300"
                    : "text-slate-600",
                )}
              >
                {t.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-base text-teal-400">← Safe</span>
          <span className="text-base text-rose-400">Wild →</span>
        </div>
      </div>

      {/* Probability bars */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bars-${dialPhase}`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? {} : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ProbBars probs={probs} reduced={reduced} />
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-base text-slate-500 italic">Illustrative probabilities</p>
    </div>
  );
}

function UsecasesVisual({ reduced }: { reduced: boolean }) {
  const rows = [
    { task: "Fact lookup", temp: "0.0 – 0.3", icon: "🔍", color: "teal" as const },
    { task: "Summarizing", temp: "0.3 – 0.6", icon: "📝", color: "blue" as const },
    { task: "Chatting", temp: "0.7 – 1.0", icon: "💬", color: "amber" as const },
    { task: "Brainstorming", temp: "1.2 – 1.8", icon: "💡", color: "rose" as const },
  ];

  const colorMap = {
    teal: "border-teal-500/30 bg-teal-500/10",
    blue: "border-blue-500/30 bg-blue-500/10",
    amber: "border-amber-500/30 bg-amber-500/10",
    rose: "border-rose-500/30 bg-rose-500/10",
  };
  const textMap = {
    teal: "text-teal-200",
    blue: "text-blue-200",
    amber: "text-amber-200",
    rose: "text-rose-200",
  };
  const monoMap = {
    teal: "text-teal-300",
    blue: "text-blue-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
  };

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-center text-base font-bold text-white">When to use each range</p>
      {rows.map((row, i) => (
        <motion.div
          key={row.task}
          initial={reduced ? false : { opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.14, duration: 0.3 }}
          className={cn("rounded-xl border px-3 py-2.5 flex items-center gap-3", colorMap[row.color])}
        >
          <span className="text-2xl">{row.icon}</span>
          <div className="flex-1">
            <p className={cn("text-base font-bold", textMap[row.color])}>{row.task}</p>
            <p className={cn("text-base font-mono font-bold", monoMap[row.color])}>{row.temp}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SummaryVisual({ reduced }: { reduced: boolean }) {
  const ranges = [
    { range: "0", label: "Same answer every time", color: "teal" as const },
    { range: "0.5 – 1", label: "Small variation — usually right", color: "blue" as const },
    { range: "1.5 – 2", label: "Creative — risky — surprising", color: "rose" as const },
  ];

  const colorMap = {
    teal: "border-teal-500/30 bg-teal-500/10",
    blue: "border-blue-500/30 bg-blue-500/10",
    rose: "border-rose-500/30 bg-rose-500/10",
  };
  const textMap = {
    teal: "text-teal-300",
    blue: "text-blue-300",
    rose: "text-rose-300",
  };

  return (
    <div className="flex flex-col items-center gap-3 px-4 w-full max-w-[320px] mx-auto">
      {/* Gradient dial */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3"
      >
        <p className="text-base font-bold text-white mb-2 text-center">Temperature dial</p>
        <div className="relative h-5 w-full rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-blue-500 to-rose-500" />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-base font-bold text-teal-300">0 — Predictable</span>
          <span className="text-base font-bold text-rose-300">2 — Wild</span>
        </div>
      </motion.div>

      {ranges.map((item, i) => (
        <motion.div
          key={item.range}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.35 + i * 0.18, duration: 0.3 }}
          className={cn(
            "w-full rounded-xl border px-3 py-2.5 flex items-center gap-3",
            colorMap[item.color],
          )}
        >
          <span className={cn("font-mono text-lg font-bold min-w-[3rem] text-center", textMap[item.color])}>
            {item.range}
          </span>
          <div className="w-px h-8 bg-white/10" />
          <p className="text-base text-white">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TemperatureShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  const [dialPhase, setDialPhase] = useState(0);

  const step = STEPS[stepIndex]!;
  const isDialStep = step.id === "dial";

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
    setDialPhase(0);
  }, []);

  const goNext = useCallback(() => {
    if (isDialStep && dialPhase < TOTAL_DIAL_PHASES - 1) {
      setDialPhase((p) => p + 1);
      return;
    }
    setDialPhase(0);
    setStepIndex((prev) => (prev + 1) % STEPS.length);
  }, [isDialStep, dialPhase]);

  const goPrev = useCallback(() => {
    if (isDialStep && dialPhase > 0) {
      setDialPhase((p) => p - 1);
      return;
    }
    setDialPhase(0);
    setStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, [isDialStep, dialPhase]);

  const dialStepIndex = STEPS.findIndex((s) => s.id === "dial");
  const progress = isDialStep
    ? ((dialStepIndex + (dialPhase + 1) / TOTAL_DIAL_PHASES) / STEPS.length) * 100
    : ((stepIndex + 1) / STEPS.length) * 100;

  function renderVisual(id: string) {
    switch (id) {
      case "hook":     return <HookVisual     reduced={reducedMotion} />;
      case "scores":   return <ScoresVisual   reduced={reducedMotion} />;
      case "dial":     return <DialVisual     reduced={reducedMotion} dialPhase={dialPhase} />;
      case "usecases": return <UsecasesVisual reduced={reducedMotion} />;
      case "summary":  return <SummaryVisual  reduced={reducedMotion} />;
      default:         return null;
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
          Temperature
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
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {renderVisual(step.id)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtitle strip */}
      <div className="px-5 pt-2 pb-2">
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

      {/* Controls + progress */}
      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white/70"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          {isDialStep
            ? `Temp ${dialPhase + 1} / ${TOTAL_DIAL_PHASES} — tap Next`
            : `Step ${stepIndex + 1} / ${STEPS.length} — tap Next`}
        </p>
      </div>
    </div>
  );
}
