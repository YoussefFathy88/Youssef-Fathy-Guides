"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
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
    id: "model",
    title: "An AI model is just an equation",
    subtitle: "Weight (w) and bias (b) shape the line",
    accentColor: "text-violet-300",
    badgeColor: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  },
  {
    id: "twoPoints",
    title: "We know two points on the line",
    subtitle: "(x₁, y₁) and (x₂, y₂) are given data",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "solve",
    title: "Substitute the points to solve",
    subtitle: "Simple equation — solvable with plain algebra",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
  {
    id: "training",
    title: "Training tries many examples",
    subtitle: "Trial and error works for equations of any size",
    accentColor: "text-teal-300",
    badgeColor: "bg-teal-500/20 text-teal-200 border-teal-500/30",
  },
  {
    id: "realEquations",
    title: "Real AI: billions of weights",
    subtitle: "Same idea — scaled up massively",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "llmTrained",
    title: "LLMs train on huge amounts of text",
    subtitle: "Weights learn patterns from billions of words",
    accentColor: "text-indigo-300",
    badgeColor: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
  },
  {
    id: "llmPredict",
    title: "New prompt in, prediction out",
    subtitle: "Trained weights predict the next words",
    accentColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
];

// ─── ModelVisual ────────────────────────────────────────────────────────────────

function ModelVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-slate-600/40 bg-slate-800/50 px-4 py-2.5 text-center"
      >
        <p className="text-lg text-slate-200">
          A model is an equation that turns <span className="font-bold text-white">input</span> into{" "}
          <span className="font-bold text-white">output</span>
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.3, duration: 0.4 }}
        className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3"
      >
        <p className="text-base text-slate-400 text-center mb-2">Straight line equation</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-white">y =</span>
          <span className="rounded-xl border border-violet-400/50 bg-violet-500/30 px-3 py-0.5 text-2xl font-bold text-violet-100">
            w
          </span>
          <span className="text-2xl font-bold text-white">x +</span>
          <span className="rounded-xl border border-amber-400/50 bg-amber-500/30 px-3 py-0.5 text-2xl font-bold text-amber-100">
            b
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.7, duration: 0.35 }}
        className="grid grid-cols-2 gap-2 w-full"
      >
        <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-violet-200">w = weight</p>
          <p className="text-base text-slate-400">controls slope</p>
        </div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-amber-200">b = bias</p>
          <p className="text-base text-slate-400">shifts up / down</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── TwoPointsVisual ────────────────────────────────────────────────────────────
// SVG viewBox "0 0 240 100"
// Axes: y-axis at x=25 (y=8 to y=88), x-axis at y=88 (x=25 to x=218)
// Data range x∈[0,5], y∈[0,10] — sx(x)=25+x*38.6, sy(y)=88-y*8

const KNOWN_POINTS = [
  { label: "(x₁, y₁)", x: 1, y: 3, sx: 63.6, sy: 64 },
  { label: "(x₂, y₂)", x: 2, y: 5, sx: 102.2, sy: 48 },
];

function TwoPointsVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-2 gap-2 w-full"
      >
        {KNOWN_POINTS.map((p, i) => (
          <motion.div
            key={p.label}
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35 }}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center"
          >
            <p className="text-base text-amber-300 font-semibold">{p.label}</p>
            <p className="text-lg font-bold font-mono text-white">
              ({p.x}, {p.y})
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 0.5, duration: 0.4 }}
        className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 p-2"
      >
        <svg viewBox="0 0 240 100" width="100%" height="90">
          {[20, 50, 80].map((yg) => (
            <line key={yg} x1={25} y1={yg} x2={218} y2={yg} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          ))}
          <line x1={25} y1={8} x2={25} y2={88} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={25} y1={88} x2={218} y2={88} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeLinecap="round" />
          <text x={226} y={91} fill="rgba(255,255,255,0.4)" fontSize={11}>x</text>
          <text x={18} y={12} fill="rgba(255,255,255,0.4)" fontSize={11} textAnchor="middle">y</text>
          {KNOWN_POINTS.map((p, i) => (
            <motion.g key={p.label}>
              <motion.circle
                cx={p.sx}
                cy={p.sy}
                r={5}
                fill="rgb(251,191,36)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduced ? 0 : 0.9 + i * 0.25, duration: 0.3, type: "spring", bounce: 0.5 }}
              />
              <motion.text
                x={p.sx}
                y={p.sy - 10}
                fill="rgb(253,230,138)"
                fontSize={11}
                fontWeight={700}
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : 1.1 + i * 0.25, duration: 0.3 }}
              >
                ({p.x},{p.y})
              </motion.text>
            </motion.g>
          ))}
        </svg>
        <p className="text-center text-base text-slate-400">Two points, unknown line</p>
      </motion.div>
    </div>
  );
}

// ─── SolveVisual ────────────────────────────────────────────────────────────────

function SolveVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-3 w-full max-w-[320px] mx-auto">
      {/* Both points plugged in */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 gap-2"
      >
        <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-2 text-center">
          <p className="text-lg font-bold font-mono text-white">3 = w·1 + b</p>
        </div>
        <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-2 text-center">
          <p className="text-lg font-bold font-mono text-white">5 = w·2 + b</p>
        </div>
      </motion.div>

      {/* Solve for w */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduced ? 0 : 0.4, duration: 0.35 }}
        className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-center"
      >
        <p className="text-lg font-bold font-mono text-white">subtract → w = 2</p>
      </motion.div>

      {/* Solve for b */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduced ? 0 : 0.75, duration: 0.35 }}
        className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-center"
      >
        <p className="text-lg font-bold font-mono text-white">plug back in → b = 1</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 1.15, duration: 0.4, type: "spring", bounce: 0.4 }}
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2.5 text-center"
      >
        <p className="text-xl font-bold font-mono text-emerald-100">w = 2,  b = 1</p>
        <p className="text-base text-emerald-300 mt-0.5">Two unknowns, two points — solved</p>
      </motion.div>
    </div>
  );
}

// ─── TrainingVisual ────────────────────────────────────────────────────────────

const TRAINING_EXAMPLES = [
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 7 },
];

function TrainingVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-teal-500/25 bg-teal-500/10 px-3 py-2.5"
      >
        <p className="text-base text-teal-300 font-semibold mb-2">More examples than needed</p>
        <div className="space-y-1.5">
          {TRAINING_EXAMPLES.map(({ x, y }, i) => (
            <motion.div
              key={x}
              initial={reduced ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.18, duration: 0.35 }}
              className="flex items-center gap-2"
            >
              <span className="rounded-md border border-teal-500/30 bg-teal-500/20 px-2 py-0.5 text-base font-mono text-teal-100">
                input x={x}
              </span>
              <span className="text-slate-400 font-bold">→</span>
              <span className="rounded-md border border-teal-400/40 bg-teal-500/25 px-2 py-0.5 text-base font-mono font-bold text-teal-50">
                answer y={y}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.65, duration: 0.35 }}
        className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center"
      >
        <p className="text-base text-amber-200 font-semibold">
          Guess w and b, check the error, adjust — repeat
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.0, duration: 0.35 }}
        className="rounded-xl border border-slate-600/40 bg-slate-800/50 px-3 py-2.5 space-y-2"
      >
        <div className="flex items-center justify-between">
          <p className="text-base text-slate-300 font-semibold">Prediction error</p>
          <p className="text-base text-emerald-400 font-semibold">↓ decreasing</p>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-700/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
            initial={{ width: "92%" }}
            animate={{ width: "4%" }}
            transition={{ delay: reduced ? 0 : 1.2, duration: 1.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between">
          <p className="text-base text-slate-400">start: high error</p>
          <p className="text-base text-emerald-400">done: low ✓</p>
        </div>
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 3.0, duration: 0.3 }}
        className="text-center text-base text-slate-400"
      >
        Same trial-and-error works for far bigger equations
      </motion.p>
    </div>
  );
}

// ─── RealEquationsVisual ─────────────────────────────────────────────────────────

const WEIGHT_CHIPS = [
  { id: "w₁", val: "0.32" },
  { id: "w₂", val: "−0.71" },
  { id: "w₃", val: "1.24" },
  { id: "w₄", val: "0.89" },
  { id: "w₅", val: "−0.43" },
  { id: "w₆", val: "0.17" },
];

function RealEquationsVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2.5"
      >
        <p className="text-base text-violet-300 font-semibold mb-1">Simple model (1 weight)</p>
        <p className="text-lg font-bold font-mono text-white">y = w·x + b</p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.4, duration: 0.3 }}
        className="flex items-center gap-2"
      >
        <div className="h-px flex-1 bg-slate-600/40" />
        <p className="text-base text-slate-400 font-medium">scale up →</p>
        <div className="h-px flex-1 bg-slate-600/40" />
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.6, duration: 0.4 }}
        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2.5"
      >
        <p className="text-base text-blue-300 font-semibold mb-1">Real AI model (billions of weights)</p>
        <p className="text-base font-bold font-mono text-white leading-snug">
          y = w₁x₁ + w₂x₂ + … + wₙxₙ + b
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.0, duration: 0.35 }}
        className="space-y-1.5"
      >
        <p className="text-base text-slate-400 text-center">Sample learned values</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {WEIGHT_CHIPS.map((w, i) => (
            <motion.span
              key={w.id}
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : 1.1 + i * 0.07, duration: 0.25 }}
              className="rounded-lg border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-base font-mono text-blue-200"
            >
              {w.id}={w.val}
            </motion.span>
          ))}
          <motion.span
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 1.6, duration: 0.3 }}
            className="rounded-lg border border-slate-600/40 bg-slate-800/40 px-2.5 py-0.5 text-base text-slate-400"
          >
            …billions more
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── LlmTrainedVisual ────────────────────────────────────────────────────────────

const TEXT_CHUNKS = ["Wikipedia articles", "Books & stories", "Code repositories", "Websites & news"];

function LlmTrainedVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center text-base text-slate-300"
      >
        Same training idea, run on huge text
      </motion.p>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.2, duration: 0.3 }}
        className="grid grid-cols-2 gap-2 w-full"
      >
        {TEXT_CHUNKS.map((chunk, i) => (
          <motion.div
            key={chunk}
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.15, duration: 0.3 }}
            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-2 text-center"
          >
            <p className="text-base font-medium text-indigo-200">{chunk}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.svg
        width={32}
        height={28}
        viewBox="0 0 32 28"
        className="mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.9, duration: 0.25 }}
      >
        <path d="M 16 2 L 16 24" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" />
        <path d="M 9 17 L 16 26 L 23 17" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 1.15, duration: 0.4 }}
        className="rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-3 py-2.5 text-center"
      >
        <p className="text-base text-indigo-300 font-semibold">Billions of weights adjust</p>
        <p className="text-base text-slate-400 mt-0.5">until predictions match real text</p>
      </motion.div>
    </div>
  );
}

// ─── LlmPredictVisual ────────────────────────────────────────────────────────────

const COMPLETION_TOKENS = ["Paris", "."];

function LlmPredictVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-3 w-full max-w-[320px] mx-auto">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-slate-600/50 bg-slate-800/60 px-3 py-2.5"
      >
        <p className="text-base text-slate-400 mb-1">Prompt</p>
        <p className="text-lg font-semibold text-white">"The capital of France is"</p>
      </motion.div>

      <motion.svg
        width={28}
        height={24}
        viewBox="0 0 28 24"
        className="mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.45, duration: 0.25 }}
      >
        <path d="M 14 2 L 14 18" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" />
        <path d="M 7 12 L 14 20 L 21 12" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.6, duration: 0.3 }}
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2.5"
      >
        <p className="text-base text-emerald-300 mb-1.5">Model predicts, one word at a time</p>
        <div className="flex flex-wrap gap-1.5">
          {COMPLETION_TOKENS.map((tok, i) => (
            <motion.span
              key={tok + i}
              initial={reduced ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : 0.9 + i * 0.4, duration: 0.3, type: "spring", bounce: 0.5 }}
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/25 px-2.5 py-1 text-lg font-bold text-emerald-50"
            >
              {tok}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.9, duration: 0.3 }}
        className="text-center text-base text-slate-400"
      >
        Trained weights, never these exact words before
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
      case "model":         return <ModelVisual         reduced={reducedMotion} />;
      case "twoPoints":     return <TwoPointsVisual      reduced={reducedMotion} />;
      case "solve":         return <SolveVisual          reduced={reducedMotion} />;
      case "training":      return <TrainingVisual       reduced={reducedMotion} />;
      case "realEquations": return <RealEquationsVisual  reduced={reducedMotion} />;
      case "llmTrained":    return <LlmTrainedVisual     reduced={reducedMotion} />;
      case "llmPredict":    return <LlmPredictVisual     reduced={reducedMotion} />;
      default:              return null;
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
