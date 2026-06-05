"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AccentColor = "amber" | "teal" | "rose" | "violet" | "blue" | "gray";

export interface PreTrainingStep {
  id: string;
  number: number;
  shortLabel: string;
  label: string;
  emoji: string;
  color: AccentColor;
  summary: string;
}

export interface PreTrainingLoopExplorerProps {
  title?: string;
  caption?: string;
  steps?: PreTrainingStep[];
}

const ACCENT: Record<
  AccentColor,
  { tab: string; ring: string; bar: string; badge: string }
> = {
  amber: {
    tab: "border-amber-500/70 bg-amber-950/40 text-amber-100 ring-amber-500/30",
    ring: "ring-amber-500/35",
    bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    badge: "bg-amber-500/20 text-amber-200",
  },
  teal: {
    tab: "border-teal-500/70 bg-teal-950/40 text-teal-100 ring-teal-500/30",
    ring: "ring-teal-500/35",
    bar: "bg-gradient-to-r from-teal-500 to-teal-400",
    badge: "bg-teal-500/20 text-teal-200",
  },
  rose: {
    tab: "border-rose-500/70 bg-rose-950/40 text-rose-100 ring-rose-500/30",
    ring: "ring-rose-500/35",
    bar: "bg-gradient-to-r from-rose-500 to-rose-400",
    badge: "bg-rose-500/20 text-rose-200",
  },
  violet: {
    tab: "border-violet-500/70 bg-violet-950/40 text-violet-100 ring-violet-500/30",
    ring: "ring-violet-500/35",
    bar: "bg-gradient-to-r from-violet-500 to-violet-400",
    badge: "bg-violet-500/20 text-violet-200",
  },
  blue: {
    tab: "border-blue-500/70 bg-blue-950/40 text-blue-100 ring-blue-500/30",
    ring: "ring-blue-500/35",
    bar: "bg-gradient-to-r from-blue-500 to-blue-400",
    badge: "bg-blue-500/20 text-blue-200",
  },
  gray: {
    tab: "border-gray-500/70 bg-gray-950/40 text-gray-100 ring-gray-500/30",
    ring: "ring-gray-500/35",
    bar: "bg-gradient-to-r from-gray-500 to-gray-400",
    badge: "bg-gray-500/20 text-gray-200",
  },
};

const RUNNING_PROMPT = "The capital of France is";

interface TokenCandidate {
  token: string;
  color: string;
  probs: number[];
}

const CANDIDATES: TokenCandidate[] = [
  { token: "Paris", color: "#8b5cf6", probs: [0.14, 0.22, 0.48, 0.72, 0.88, 0.91] },
  { token: "Lyon", color: "#14b8a6", probs: [0.16, 0.14, 0.10, 0.06, 0.04, 0.04] },
  { token: "a", color: "#f59e0b", probs: [0.15, 0.12, 0.08, 0.05, 0.03, 0.02] },
  { token: "the", color: "#3b82f6", probs: [0.14, 0.11, 0.07, 0.04, 0.02, 0.01] },
];

const CHECKPOINT_LABELS = [
  "Init",
  "1K steps",
  "10K steps",
  "100K steps",
  "1M steps",
  "Trained",
];

const CHECKPOINT_LOSS = ["2.48", "2.12", "1.45", "0.62", "0.18", "0.09"];
const CHECKPOINT_TOKENS = ["0", "4M", "40M", "400M", "4B", "15T"];

const DEFAULT_STEPS: PreTrainingStep[] = [
  {
    id: "init",
    number: 1,
    shortLabel: "Init",
    label: "Initialize weights randomly",
    emoji: "🎲",
    color: "gray",
    summary: "Every weight starts random — the model predicts garbage.",
  },
  {
    id: "batch",
    number: 2,
    shortLabel: "Batch",
    label: "Load a batch",
    emoji: "📦",
    color: "teal",
    summary: "The data loader picks hundreds of token windows at once.",
  },
  {
    id: "forward",
    number: 3,
    shortLabel: "Forward",
    label: "Forward pass",
    emoji: "⚡",
    color: "violet",
    summary: "Token IDs flow through every layer → logits at each position.",
  },
  {
    id: "loss",
    number: 4,
    shortLabel: "Loss",
    label: "Compute the loss",
    emoji: "📉",
    color: "rose",
    summary: "Cross-entropy compares prediction vs target — one loss number.",
  },
  {
    id: "backward",
    number: 5,
    shortLabel: "Backward",
    label: "Backward pass",
    emoji: "🔙",
    color: "amber",
    summary: "Gradients flow back — how much each weight hurt the answer.",
  },
  {
    id: "optimizer",
    number: 6,
    shortLabel: "Optim",
    label: "Optimizer step",
    emoji: "🔧",
    color: "blue",
    summary: "Adam nudges every weight to reduce loss — the moment of learning.",
  },
  {
    id: "repeat",
    number: 7,
    shortLabel: "Repeat",
    label: "Repeat",
    emoji: "🔁",
    color: "violet",
    summary: "Same loop for trillions of tokens — watch predictions improve.",
  },
  {
    id: "monitor",
    number: 8,
    shortLabel: "Monitor",
    label: "Monitor",
    emoji: "📊",
    color: "teal",
    summary: "Validation loss catches overfitting before it wastes compute.",
  },
  {
    id: "checkpoint",
    number: 9,
    shortLabel: "Save",
    label: "Save checkpoints",
    emoji: "💾",
    color: "amber",
    summary: "Weights saved every few hours — resume after a crash.",
  },
  {
    id: "done",
    number: 10,
    shortLabel: "Done",
    label: "Training ends",
    emoji: "🏁",
    color: "teal",
    summary: "Final weights = base model. Completes text — no instructions yet.",
  },
];

const BATCH_SEQUENCES = [
  { prefix: "The capital of France is", highlight: true },
  { prefix: "In machine learning, gradient", highlight: false },
  { prefix: "def train(model, data):", highlight: false },
  { prefix: "Photosynthesis converts sunlight", highlight: false },
];

const RANDOM_WEIGHTS = [
  [0.042, -0.118, 0.231, -0.007],
  [-0.156, 0.089, -0.044, 0.192],
  [0.011, -0.203, 0.067, -0.134],
];

function ProbBars({ checkpointIdx }: { checkpointIdx: number }) {
  return (
    <div className="space-y-2">
      {CANDIDATES.map((c) => {
        const prob = c.probs[checkpointIdx] ?? c.probs[0];
        const pct = Math.round(prob * 100);
        const isTop = c.token === "Paris" && checkpointIdx >= 2;
        return (
          <div key={c.token} className="flex items-center gap-3">
            <span className="w-14 text-right font-mono text-base font-bold text-gray-200 md:text-lg">
              {c.token}
            </span>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-gray-800 ring-1 ring-gray-700 md:h-8">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{ backgroundColor: c.color }}
                animate={{ width: `${prob * 100}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <span
                className={cn(
                  "absolute inset-y-0 right-2 flex items-center font-mono text-base font-bold md:text-lg",
                  isTop ? "text-white" : "text-gray-300",
                )}
              >
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepPanel({
  step,
  checkpointIdx,
  onCheckpointChange,
  isPlaying,
  onTogglePlay,
}: {
  step: PreTrainingStep;
  checkpointIdx: number;
  onCheckpointChange: (idx: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  const tone = ACCENT[step.color];

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-4xl md:text-5xl" aria-hidden>
          {step.emoji}
        </span>
        <div>
          <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">
            Step {step.number}
          </p>
          <h3 className="text-2xl font-bold text-white md:text-3xl">{step.label}</h3>
        </div>
      </div>

      <div className={cn("rounded-2xl border-2 p-5 ring-1 md:p-6", tone.ring, "border-gray-700 bg-gray-950/70")}>
        <p className="text-lg leading-relaxed text-gray-100 md:text-xl">{step.summary}</p>
      </div>

      {/* Running example prompt — shared across steps */}
      <div className="rounded-xl bg-gray-950 px-4 py-3 ring-1 ring-gray-700 md:px-5 md:py-4">
        <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">Running example</p>
        <p className="mt-2 font-mono text-lg text-white md:text-xl">
          &quot;{RUNNING_PROMPT}&quot; <span className="text-amber-300">?</span>
        </p>
      </div>

      {/* Step-specific visual */}
      <div className="rounded-2xl border border-gray-700 bg-gray-950/80 p-4 md:p-5">
        {step.id === "init" && (
          <div className="space-y-4">
            <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">Random weights</p>
            <div className="grid grid-cols-4 gap-2 font-mono text-base text-gray-200 md:text-lg">
              {RANDOM_WEIGHTS.flat().map((w, i) => (
                <div key={i} className="rounded-lg bg-gray-900 px-2 py-2 text-center ring-1 ring-gray-700">
                  {w >= 0 ? "+" : ""}
                  {w.toFixed(3)}
                </div>
              ))}
            </div>
            <p className="text-lg text-rose-200 md:text-xl">Prediction: nearly uniform — no knowledge yet.</p>
            <ProbBars checkpointIdx={0} />
          </div>
        )}

        {step.id === "batch" && (
          <div className="space-y-4">
            <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
              Batch — 512 sequences
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {BATCH_SEQUENCES.map((seq) => (
                <div
                  key={seq.prefix}
                  className={cn(
                    "rounded-xl px-4 py-3 font-mono text-base md:text-lg",
                    seq.highlight
                      ? "bg-violet-950/50 text-violet-100 ring-2 ring-violet-500/50"
                      : "bg-gray-900 text-gray-300 ring-1 ring-gray-700",
                  )}
                >
                  {seq.prefix}…
                </div>
              ))}
            </div>
            <p className="text-lg text-gray-200 md:text-xl">
              Target for highlighted row: <span className="font-bold text-teal-300">Paris</span>
            </p>
          </div>
        )}

        {step.id === "forward" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {["Embed", "Attn ×12", "FFN", "Logits"].map((layer, i) => (
                <div key={layer} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-xl px-4 py-3 text-base font-bold md:px-5 md:py-4 md:text-lg",
                      i === 3 ? "bg-amber-500/20 text-amber-100 ring-2 ring-amber-500/40" : "bg-violet-500/15 text-violet-100 ring-1 ring-violet-500/30",
                    )}
                  >
                    {layer}
                  </div>
                  {i < 3 ? <span className="text-2xl text-gray-500">→</span> : null}
                </div>
              ))}
            </div>
            <p className="text-lg text-gray-200 md:text-xl">Output: probability at every position.</p>
            <ProbBars checkpointIdx={1} />
          </div>
        )}

        {step.id === "loss" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-rose-950/30 p-4 ring-1 ring-rose-500/30">
                <p className="text-base font-bold text-rose-200 md:text-lg">Predicted</p>
                <p className="mt-2 font-mono text-xl font-bold text-white md:text-2xl">Lyon — 22%</p>
              </div>
              <div className="rounded-xl bg-teal-950/30 p-4 ring-1 ring-teal-500/30">
                <p className="text-base font-bold text-teal-200 md:text-lg">Target</p>
                <p className="mt-2 font-mono text-xl font-bold text-white md:text-2xl">Paris — 100%</p>
              </div>
            </div>
            <div className="rounded-xl bg-gray-900 px-4 py-4 text-center ring-1 ring-gray-700">
              <p className="text-base font-bold uppercase text-gray-400 md:text-lg">Batch loss</p>
              <p className="mt-1 font-mono text-3xl font-bold text-rose-300 md:text-4xl">2.41</p>
            </div>
          </div>
        )}

        {step.id === "backward" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["Logits", "FFN", "Attn", "Embed"].map((layer, i) => (
                <div key={layer} className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500/15 px-4 py-3 text-base font-bold text-amber-100 ring-1 ring-amber-500/30 md:text-lg">
                    {layer}
                  </div>
                  {i < 3 ? <span className="text-2xl text-amber-400">↑</span> : null}
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-gray-900 p-4 ring-1 ring-gray-700">
              <p className="font-mono text-lg text-gray-100 md:text-xl">
                ∂L/∂w = <span className="font-bold text-amber-300">+0.003</span> → increase w, loss rises
              </p>
            </div>
          </div>
        )}

        {step.id === "optimizer" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-base font-bold text-gray-400 md:text-lg">Before</p>
                <p className="mt-2 font-mono text-2xl font-bold text-white md:text-3xl">0.042</p>
              </div>
              <span className="text-3xl text-violet-400">→</span>
              <div className="text-center">
                <p className="text-base font-bold text-gray-400 md:text-lg">After</p>
                <p className="mt-2 font-mono text-2xl font-bold text-teal-300 md:text-3xl">0.039</p>
              </div>
            </div>
            <p className="text-center text-lg text-gray-200 md:text-xl">
              Learning rate <span className="font-mono font-bold text-blue-300">3e-4</span> controls nudge size
            </p>
          </div>
        )}

        {step.id === "repeat" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {CHECKPOINT_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onCheckpointChange(i)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
                    checkpointIdx === i
                      ? "border-violet-500/70 bg-violet-950/50 text-violet-100 ring-2 ring-violet-500/30"
                      : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-600",
                  )}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={onTogglePlay}
                className="rounded-xl border-2 border-teal-500/50 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 md:text-lg"
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gray-900 p-3 text-center ring-1 ring-gray-700">
                <p className="text-base font-bold text-gray-400">Loss</p>
                <p className="font-mono text-2xl font-bold text-rose-300">{CHECKPOINT_LOSS[checkpointIdx]}</p>
              </div>
              <div className="rounded-xl bg-gray-900 p-3 text-center ring-1 ring-gray-700">
                <p className="text-base font-bold text-gray-400">Tokens seen</p>
                <p className="font-mono text-2xl font-bold text-violet-300">{CHECKPOINT_TOKENS[checkpointIdx]}</p>
              </div>
              <div className="rounded-xl bg-gray-900 p-3 text-center ring-1 ring-gray-700">
                <p className="text-base font-bold text-gray-400">Top token</p>
                <p className="font-mono text-2xl font-bold text-teal-300">
                  {checkpointIdx >= 2 ? "Paris" : "Lyon"}
                </p>
              </div>
            </div>
            <ProbBars checkpointIdx={checkpointIdx} />
            <p className="text-lg text-teal-200 md:text-xl">
              {checkpointIdx === 0
                ? "Step 2 again — load next batch, run the loop."
                : checkpointIdx >= 5
                  ? "Paris dominates — the model learned the fact."
                  : "Paris rises batch after batch — loss falls."}
            </p>
          </div>
        )}

        {step.id === "monitor" && (
          <div className="space-y-4">
            <svg viewBox="0 0 480 160" className="h-[140px] w-full md:h-[160px]" aria-hidden>
              <line x1="40" y1="130" x2="460" y2="130" stroke="#4b5563" strokeWidth="2" />
              <line x1="40" y1="20" x2="40" y2="130" stroke="#4b5563" strokeWidth="2" />
              <text x="250" y="155" textAnchor="middle" fill="#9ca3af" fontSize="16" fontWeight="600">
                Training steps
              </text>
              <text x="18" y="75" textAnchor="middle" fill="#9ca3af" fontSize="16" fontWeight="600" transform="rotate(-90 18 75)">
                Loss
              </text>
              <polyline
                points="60,110 120,85 180,60 240,42 300,30 360,24 420,20"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="3"
              />
              <polyline
                points="60,115 120,90 180,68 240,55 300,48 360,52 420,58"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeDasharray="8 4"
              />
              <circle cx="360" cy="52" r="6" fill="#f43f5e" />
              <text x="370" y="48" fill="#f43f5e" fontSize="16" fontWeight="700">
                Val diverges?
              </text>
            </svg>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-2 text-lg text-gray-200 md:text-xl">
                <span className="h-3 w-8 rounded bg-teal-500" /> Train loss
              </span>
              <span className="flex items-center gap-2 text-lg text-gray-200 md:text-xl">
                <span className="h-3 w-8 rounded bg-violet-500" /> Val loss
              </span>
            </div>
          </div>
        )}

        {step.id === "checkpoint" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {[
                { step: "10K", size: "14 GB" },
                { step: "50K", size: "14 GB" },
                { step: "100K", size: "14 GB" },
                { step: "800K", size: "14 GB" },
              ].map((ckpt, i) => (
                <div key={ckpt.step} className="flex items-center gap-2">
                  <div className="rounded-xl bg-amber-500/15 px-4 py-3 text-center ring-1 ring-amber-500/30">
                    <p className="text-base font-bold text-amber-200">💾</p>
                    <p className="font-mono text-lg font-bold text-white">{ckpt.step}</p>
                    <p className="text-base text-gray-400">{ckpt.size}</p>
                  </div>
                  {i < 3 ? <span className="text-gray-500">→</span> : null}
                </div>
              ))}
            </div>
            <p className="text-lg text-amber-200 md:text-xl">
              Crash at step 800K? Resume from 790K — not from zero.
            </p>
          </div>
        )}

        {step.id === "done" && (
          <div className="space-y-4">
            <div className={cn("inline-flex rounded-full px-4 py-2 text-base font-bold md:text-lg", tone.badge)}>
              Base model — pre-training complete
            </div>
            <ProbBars checkpointIdx={5} />
            <p className="text-lg text-gray-100 md:text-xl">
              Knows how to complete documents — not yet how to follow instructions.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PreTrainingLoopExplorer({
  title = "Pre-training loop — ten steps, one repeating cycle",
  caption = "Tap each step. On Repeat, scrub checkpoints to watch Paris rise and loss fall.",
  steps = DEFAULT_STEPS,
}: PreTrainingLoopExplorerProps) {
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const [activeIdx, setActiveIdx] = useState(0);
  const [checkpointIdx, setCheckpointIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeStep = steps[activeIdx];

  const stopPlaying = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlaying = useCallback(() => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCheckpointIdx((prev) => {
        if (prev >= CHECKPOINT_LABELS.length - 1) {
          stopPlaying();
          return CHECKPOINT_LABELS.length - 1;
        }
        return prev + 1;
      });
    }, 1200);
  }, [stopPlaying]);

  useEffect(() => () => stopPlaying(), [stopPlaying]);

  useEffect(() => {
    if (activeStep?.id !== "repeat") {
      stopPlaying();
    }
  }, [activeStep?.id, stopPlaying]);

  function goPrev() {
    setActiveIdx((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setActiveIdx((i) => Math.min(steps.length - 1, i + 1));
  }

  function togglePlay() {
    if (isPlaying) stopPlaying();
    else startPlaying();
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-700 bg-gray-900 p-6 md:p-10"
      data-local-navigation="true"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-100 md:text-2xl">{title}</h2>
        {caption ? <p className="text-lg text-gray-300 md:text-xl">{caption}</p> : null}
      </div>

      <div
        className="mt-6 flex gap-2 overflow-x-auto pb-2 md:mt-8 md:gap-2.5"
        role="tablist"
        aria-label="Pre-training steps"
      >
        {steps.map((step, idx) => {
          const isActive = activeIdx === idx;
          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`${baseId}-tab-${step.id}`}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "shrink-0 rounded-xl border-2 px-3 py-2.5 text-base font-bold transition md:px-4 md:py-3 md:text-lg",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                isActive
                  ? cn("ring-2", ACCENT[step.color].tab)
                  : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-600 hover:text-white",
              )}
            >
              <span className="mr-1.5" aria-hidden>
                {step.number}
              </span>
              {step.shortLabel}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeStep?.id}`}
        className="mt-6 md:mt-8"
      >
        <AnimatePresence mode="wait">
          {activeStep ? (
            <StepPanel
              key={activeStep.id}
              step={activeStep}
              checkpointIdx={checkpointIdx}
              onCheckpointChange={setCheckpointIdx}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
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
          disabled={activeIdx === steps.length - 1}
          className="rounded-xl border-2 border-violet-500/50 bg-violet-950/40 px-5 py-3 text-base font-bold text-violet-100 transition hover:border-violet-400 disabled:opacity-40 md:text-lg"
        >
          Next →
        </button>
        <span className="text-base text-gray-400 md:text-lg">
          {activeIdx + 1} / {steps.length}
        </span>
      </div>
    </motion.div>
  );
}
