"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

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

const FORWARD_SEQUENCE = ["The", "capital", "of", "France", "is", "Paris"];

interface ForwardPrediction {
  token: string;
  prob: number;
}

interface ForwardPosition {
  targetToken: string;
  contextLength: number;
  predictions: ForwardPrediction[];
  correctToken: string;
}

const FORWARD_POSITIONS: ForwardPosition[] = [
  {
    targetToken: "capital",
    contextLength: 1,
    predictions: [
      { token: "capital", prob: 31 },
      { token: "city", prob: 18 },
      { token: "best", prob: 12 },
      { token: "new", prob: 9 },
    ],
    correctToken: "capital",
  },
  {
    targetToken: "of",
    contextLength: 2,
    predictions: [
      { token: "of", prob: 44 },
      { token: "city", prob: 21 },
      { token: "is", prob: 10 },
      { token: "and", prob: 7 },
    ],
    correctToken: "of",
  },
  {
    targetToken: "France",
    contextLength: 3,
    predictions: [
      { token: "France", prob: 28 },
      { token: "the", prob: 19 },
      { token: "a", prob: 14 },
      { token: "Europe", prob: 11 },
    ],
    correctToken: "France",
  },
  {
    targetToken: "is",
    contextLength: 4,
    predictions: [
      { token: "is", prob: 38 },
      { token: "was", prob: 22 },
      { token: "has", prob: 14 },
      { token: ",", prob: 9 },
    ],
    correctToken: "is",
  },
  {
    targetToken: "Paris",
    contextLength: 5,
    predictions: [
      { token: "Paris", prob: 22 },
      { token: "Lyon", prob: 14 },
      { token: "a", prob: 12 },
      { token: "the", prob: 11 },
    ],
    correctToken: "Paris",
  },
];

const PREDICTION_COLORS = ["#8b5cf6", "#14b8a6", "#f59e0b", "#3b82f6"];

const INIT_POSITIONS: ForwardPosition[] = [
  {
    targetToken: "capital",
    contextLength: 1,
    predictions: [
      { token: "city", prob: 19 },
      { token: "capital", prob: 18 },
      { token: "best", prob: 17 },
      { token: "new", prob: 16 },
    ],
    correctToken: "capital",
  },
  {
    targetToken: "of",
    contextLength: 2,
    predictions: [
      { token: "city", prob: 20 },
      { token: "is", prob: 18 },
      { token: "of", prob: 17 },
      { token: "and", prob: 15 },
    ],
    correctToken: "of",
  },
  {
    targetToken: "France",
    contextLength: 3,
    predictions: [
      { token: "the", prob: 21 },
      { token: "a", prob: 19 },
      { token: "France", prob: 17 },
      { token: "Europe", prob: 16 },
    ],
    correctToken: "France",
  },
  {
    targetToken: "is",
    contextLength: 4,
    predictions: [
      { token: "was", prob: 22 },
      { token: "is", prob: 19 },
      { token: "has", prob: 17 },
      { token: ",", prob: 15 },
    ],
    correctToken: "is",
  },
  {
    targetToken: "Paris",
    contextLength: 5,
    predictions: [
      { token: "Lyon", prob: 20 },
      { token: "a", prob: 18 },
      { token: "the", prob: 17 },
      { token: "Paris", prob: 14 },
    ],
    correctToken: "Paris",
  },
];

function getCorrectTokenProb(position: ForwardPosition): number {
  const pred = position.predictions.find((p) => p.token === position.correctToken);
  return (pred?.prob ?? 0) / 100;
}

function getCrossEntropyLoss(position: ForwardPosition): string {
  const p = getCorrectTokenProb(position);
  if (p <= 0) return "∞";
  return (-Math.log(p)).toFixed(2);
}

function getCrossEntropyLossFromPct(probPct: number): string {
  const p = probPct / 100;
  if (p <= 0) return "∞";
  return (-Math.log(p)).toFixed(2);
}

const LOSS_WORKED_EXAMPLES = [
  {
    id: "bad",
    label: "Bad",
    token: "Paris",
    probPct: 22,
    tone: "rose" as const,
    verdict: "Model was wrong — high loss",
  },
  {
    id: "good",
    label: "Good",
    token: "Paris",
    probPct: 91,
    tone: "teal" as const,
    verdict: "Model was right — low loss",
  },
];

const LOSS_VIEW_TABS = [
  { id: "definition", label: "Definition" },
  { id: "equation", label: "Equation" },
  { id: "example", label: "Example" },
] as const;

const BACKWARD_WEIGHT_LAYERS = [
  { id: "logits", label: "Logits" },
  { id: "ffn", label: "FFN" },
  { id: "attn", label: "Attn" },
  { id: "embed", label: "Embed" },
] as const;

const BACKWARD_LAYER_WEIGHT_GRADS: Record<string, { id: string; grad: string }[]> = {
  logits: [
    { id: "w₁", grad: "+0.004" },
    { id: "w₂", grad: "−0.003" },
    { id: "w₃", grad: "+0.001" },
  ],
  ffn: [
    { id: "w₁", grad: "−0.008" },
    { id: "w₂", grad: "+0.005" },
    { id: "w₃", grad: "−0.002" },
  ],
  attn: [
    { id: "w₁", grad: "+0.007" },
    { id: "w₂", grad: "−0.002" },
    { id: "w₃", grad: "+0.003" },
  ],
  embed: [
    { id: "w₁", grad: "−0.004" },
    { id: "w₂", grad: "+0.006" },
    { id: "w₃", grad: "−0.001" },
  ],
};

const BACKWARD_VIEW_TABS = [
  { id: "definition", label: "Definition" },
  { id: "flow", label: "Chain rule" },
  { id: "example", label: "Example" },
] as const;

const BACKWARD_DEF_SUBTABS = [
  { id: "what", label: "What" },
  { id: "gradients", label: "Gradients" },
] as const;

const BACKWARD_LAYERS = [
  {
    id: "loss",
    label: "Loss",
    detail: "One number from the forward pass — e.g. batch loss 2.41.",
    question: "Which weights caused this loss?",
  },
  {
    id: "logits",
    label: "Logits",
    detail: "How much did each output logit contribute to the final loss?",
    question: "∂L/∂logits — blame flows into the layer below.",
  },
  {
    id: "ffn",
    label: "FFN",
    detail: "Which FFN weights pushed the logits in the wrong direction?",
    question: "∂L/∂w_FFN — answer here feeds the layer below.",
  },
  {
    id: "attn",
    label: "Attn",
    detail: "Which attention weights affected the FFN inputs?",
    question: "∂L/∂w_Attn — keep tracing backward.",
  },
  {
    id: "embed",
    label: "Embed",
    detail: "Embedding weights at the bottom of the stack.",
    question: "∂L/∂w_Embed — every weight now has one gradient.",
  },
] as const;

const BACKWARD_GRAD_EXAMPLES = [
  {
    id: "positive",
    label: "Positive",
    value: "+0.004",
    tone: "rose" as const,
    verdict: "Increasing this weight raises loss — it made things worse.",
    direction: "↗ loss rises if w increases",
  },
  {
    id: "negative",
    label: "Negative",
    value: "−0.003",
    tone: "teal" as const,
    verdict: "Increasing this weight lowers loss — it would help.",
    direction: "↘ loss falls if w increases",
  },
];

const OPTIMIZER_VIEW_TABS = [
  { id: "sgd", label: "SGD" },
  { id: "lr", label: "Learning rate" },
  { id: "adam", label: "Adam" },
] as const;

const OPTIMIZER_SAMPLE_WEIGHTS = [
  { id: "w₁", before: "0.042", after: "0.039", avgGrad: "+10.0" },
  { id: "w₂", before: "−0.118", after: "−0.115", avgGrad: "−10.0" },
  { id: "w₃", before: "0.231", after: "0.228", avgGrad: "+10.0" },
] as const;

const SGD_WORKED_EXAMPLE = {
  oldWeight: "0.042",
  newWeight: "0.039",
  grad: "+10.0",
  gradNumeric: 10,
  learningRate: "3e-4",
  learningRateNumeric: 0.0003,
} as const;

const LEARNING_RATE_SCENARIOS = [
  {
    id: "large",
    label: "Too large",
    tone: "rose" as const,
    outcome: "Weight overshoots — loss explodes, training unstable.",
  },
  {
    id: "small",
    label: "Too small",
    tone: "amber" as const,
    outcome: "Weights barely move — training takes forever.",
  },
] as const;

const TRAINED_POSITIONS: ForwardPosition[] = FORWARD_POSITIONS.map((pos) => ({
  ...pos,
  predictions: pos.predictions.map((p) =>
    p.token === pos.correctToken
      ? { ...p, prob: 91 }
      : { ...p, prob: Math.max(2, Math.round(p.prob * 0.25)) },
  ),
}));

const CHECKPOINT_SAVES = [
  { id: "10k", label: "10K steps", step: "10K", size: "14 GB" },
  { id: "50k", label: "50K steps", step: "50K", size: "14 GB" },
  { id: "100k", label: "100K steps", step: "100K", size: "14 GB" },
  { id: "800k", label: "800K steps", step: "800K", size: "14 GB" },
];

const LOSS_CHART_AXIS = { min: 0.5, max: 3.0, topY: 20, bottomY: 130 } as const;
const MONITOR_STEP_XS = [72, 132, 192, 252, 312, 372, 432] as const;

function lossToChartY(loss: number): number {
  const { min, max, topY, bottomY } = LOSS_CHART_AXIS;
  const span = bottomY - topY;
  const clamped = Math.min(max + 0.8, Math.max(min - 0.1, loss));
  return topY + ((max - clamped) / (max - min)) * span;
}

function buildLossPolyline(losses: readonly number[]): string {
  return MONITOR_STEP_XS.map((x, i) => `${x},${Math.round(lossToChartY(losses[i]))}`).join(" ");
}

const LOSS_Y_TICKS = [
  { loss: 3.0, label: "3.0" },
  { loss: 2.0, label: "2.0" },
  { loss: 1.0, label: "1.0" },
  { loss: 0.5, label: "0.5" },
] as const;

const MONITOR_VIEWS = [
  {
    id: "on-track",
    label: "On track",
    caption: "Train loss ↓ val loss ↓ together — model is generalizing.",
    trainLosses: [2.8, 2.2, 1.7, 1.3, 1.0, 0.8, 0.6],
    valLosses: [2.9, 2.3, 1.8, 1.35, 1.05, 0.85, 0.65],
    valDashed: false,
    annotation: null,
  },
  {
    id: "overfit",
    label: "Overfitting",
    caption: "Train loss ↓ but val loss ↑ splits away — memorizing, not learning.",
    trainLosses: [2.8, 2.1, 1.5, 1.1, 0.8, 0.6, 0.5],
    valLosses: [2.9, 2.2, 1.6, 1.25, 1.35, 1.7, 2.1],
    valDashed: true,
    annotation: { x: 382, y: 48, text: "Val rises" },
  },
  {
    id: "diverge",
    label: "Diverging",
    caption: "Loss spikes suddenly — learning rate too large or gradient explosion.",
    trainLosses: [2.8, 2.4, 2.0, 1.8, 1.6, 2.5, 3.8],
    valLosses: [2.9, 2.5, 2.1, 1.9, 1.7, 2.6, 3.9],
    valDashed: false,
    annotation: { x: 382, y: 22, text: "Loss explodes" },
  },
] as const;

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
    summary: "Each batch item is a full sequence — target is input shifted by one token.",
  },
  {
    id: "forward",
    number: 3,
    shortLabel: "Forward",
    label: "Forward pass",
    emoji: "⚡",
    color: "violet",
    summary: "Every position gets logits at once — causal mask hides future tokens.",
  },
  {
    id: "loss",
    number: 4,
    shortLabel: "Loss",
    label: "Compute the loss",
    emoji: "📉",
    color: "rose",
    summary: "Cross-entropy: L = −log P(target) — averaged across every position in the batch.",
  },
  {
    id: "backward",
    number: 5,
    shortLabel: "Backward",
    label: "Backward pass",
    emoji: "🔙",
    color: "amber",
    summary: "Chain rule traces loss backward — one gradient blame score per weight.",
  },
  {
    id: "optimizer",
    number: 6,
    shortLabel: "Optim",
    label: "Optimizer step",
    emoji: "🔧",
    color: "blue",
    summary: "Optimizer applies each averaged ∂L/∂w — SGD: new w = old w − (lr × gradient).",
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

const BATCH_SIZE = 512;

interface BatchSequence {
  id: string;
  label: string;
  input: string[];
  target: string[];
}

const BATCH_SEQUENCES: BatchSequence[] = [
  {
    id: "france",
    label: "Sequence 1",
    input: ["The", "capital", "of", "France", "is", "Paris", ".", "The"],
    target: ["capital", "of", "France", "is", "Paris", ".", "The", "city"],
  },
  {
    id: "ml",
    label: "Sequence 2",
    input: ["In", "machine", "learning", ",", "gradient", "descent", "is", "a"],
    target: ["machine", "learning", ",", "gradient", "descent", "is", "a", "method"],
  },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">{children}</p>
  );
}

function PanelCaption({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-gray-900 px-4 py-3 text-lg leading-relaxed text-gray-200 ring-1 ring-gray-700 md:text-xl">
      {children}
    </p>
  );
}

function SubTabList({
  tabs,
  activeIdx,
  onChange,
  accent,
  ariaLabel,
}: {
  tabs: { id: string; label: string }[];
  activeIdx: number;
  onChange: (idx: number) => void;
  accent: AccentColor;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab, idx) => {
        const isActive = activeIdx === idx;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(idx)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:px-5 md:text-lg",
              isActive
                ? cn("ring-2", ACCENT[accent].tab)
                : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-600 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ContextRow({ contextLength }: { contextLength: number }) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-2.5">
      {FORWARD_SEQUENCE.map((token, i) => {
        let state: "visible" | "trigger" | "masked" = "masked";
        if (i < contextLength - 1) state = "visible";
        else if (i === contextLength - 1) state = "trigger";
        return <ContextChip key={`${token}-${i}`} token={token} state={state} />;
      })}
    </div>
  );
}

function PredictionBarChart({
  predictions,
  correctToken,
}: {
  predictions: ForwardPrediction[];
  correctToken: string;
}) {
  return (
    <div className="space-y-2">
      {predictions.map((pred, i) => {
        const isCorrect = pred.token === correctToken;
        const barColor = isCorrect ? "#14b8a6" : PREDICTION_COLORS[i % PREDICTION_COLORS.length];
        return (
          <div key={pred.token} className="flex items-center gap-3">
            <span
              className={cn(
                "w-20 text-right font-mono text-base font-bold md:w-24 md:text-lg",
                isCorrect ? "text-teal-300" : "text-gray-200",
              )}
            >
              {pred.token}
              {isCorrect ? " ✓" : ""}
            </span>
            <div
              className={cn(
                "relative h-7 flex-1 overflow-hidden rounded-lg bg-gray-800 md:h-8",
                isCorrect ? "ring-2 ring-teal-500/50" : "ring-1 ring-gray-700",
              )}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{ backgroundColor: barColor }}
                animate={{ width: `${pred.prob}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <span
                className={cn(
                  "absolute inset-y-0 right-2 flex items-center font-mono text-base font-bold md:text-lg",
                  isCorrect ? "text-white" : "text-gray-300",
                )}
              >
                {pred.prob}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PositionTabContent({
  position,
  children,
}: {
  position: ForwardPosition;
  children?: ReactNode;
}) {
  return (
    <motion.div
      key={position.targetToken}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div>
        <SectionLabel>Context visible</SectionLabel>
        <ContextRow contextLength={position.contextLength} />
      </div>
      {children}
    </motion.div>
  );
}

function TokenChip({ token, variant }: { token: string; variant: "input" | "target" }) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border-2 px-3 py-2 md:px-4 md:py-2.5",
        variant === "input"
          ? "border-blue-500/50 bg-blue-950/40 text-blue-100"
          : "border-teal-500/50 bg-teal-950/40 text-teal-100",
      )}
    >
      <span className="text-center text-base font-semibold leading-tight md:text-lg">{token}</span>
    </div>
  );
}

function BatchSequencePreview({ sequence }: { sequence: BatchSequence }) {
  const n = sequence.input.length;

  return (
    <motion.div
      key={sequence.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl bg-gray-900 p-4 ring-1 ring-gray-700 md:p-5"
    >
      <div className="overflow-x-auto pb-1">
        <div
          className="inline-grid gap-x-2.5 gap-y-2 md:gap-x-3"
          style={{ gridTemplateColumns: `repeat(${n}, max-content)` }}
        >
          <p
            className="text-base font-bold uppercase tracking-wide text-blue-300 md:text-lg"
            style={{ gridColumn: "1 / -1" }}
          >
            Input
          </p>

          {sequence.input.map((token, i) => (
            <div key={`in-${i}`} style={{ gridColumn: i + 1, gridRow: 2 }} className="flex justify-center">
              <TokenChip token={token} variant="input" />
            </div>
          ))}

          {sequence.input.map((_, i) => (
            <div
              key={`arrow-${i}`}
              style={{ gridColumn: i + 1, gridRow: 3 }}
              className="flex items-center justify-center"
              aria-hidden
            >
              <span className="text-lg font-bold text-gray-500 md:text-xl">↓</span>
            </div>
          ))}

          <p
            className="text-base font-bold uppercase tracking-wide text-teal-300 md:text-lg"
            style={{ gridColumn: "1 / -1", gridRow: 4 }}
          >
            Target
          </p>

          {sequence.target.map((token, i) => (
            <div key={`tgt-${i}`} style={{ gridColumn: i + 1, gridRow: 5 }} className="flex justify-center">
              <TokenChip token={token} variant="target" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ContextChip({
  token,
  state,
}: {
  token: string;
  state: "visible" | "trigger" | "masked";
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border-2 px-3 py-2 md:px-4 md:py-2.5",
        state === "trigger"
          ? "border-amber-400/70 bg-amber-950/50 text-amber-100 ring-2 ring-amber-500/40"
          : state === "visible"
            ? "border-violet-500/50 bg-violet-950/40 text-violet-100"
            : "border-gray-700/50 bg-gray-900/40 text-gray-500 opacity-40",
      )}
    >
      <span className="text-base font-semibold md:text-lg">{token}</span>
    </div>
  );
}

function usePositionTabs(positions: ForwardPosition[]) {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabs = positions.map((p) => ({ id: p.targetToken, label: p.targetToken }));
  return { activeIdx, setActiveIdx, tabs, position: positions[activeIdx] };
}

function InitPanel() {
  const { activeIdx, setActiveIdx, tabs, position } = usePositionTabs(INIT_POSITIONS);

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Random weights — one tab per position
      </p>
      <SubTabList tabs={tabs} activeIdx={activeIdx} onChange={setActiveIdx} accent="gray" ariaLabel="Init positions" />
      <AnimatePresence mode="wait">
        <PositionTabContent position={position}>
          <div>
            <SectionLabel>Top predictions</SectionLabel>
            <PredictionBarChart predictions={position.predictions} correctToken={position.correctToken} />
          </div>
        </PositionTabContent>
      </AnimatePresence>
      <PanelCaption>
        Weights are random — predictions are nearly uniform. The model has no knowledge yet.
      </PanelCaption>
    </div>
  );
}

function ForwardPassPanel() {
  const { activeIdx, setActiveIdx, tabs, position } = usePositionTabs(FORWARD_POSITIONS);

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Predict next token — one tab per position
      </p>
      <SubTabList tabs={tabs} activeIdx={activeIdx} onChange={setActiveIdx} accent="violet" ariaLabel="Forward pass positions" />
      <AnimatePresence mode="wait">
        <PositionTabContent position={position}>
          <div>
            <SectionLabel>Top predictions</SectionLabel>
            <PredictionBarChart predictions={position.predictions} correctToken={position.correctToken} />
          </div>
        </PositionTabContent>
      </AnimatePresence>
      <PanelCaption>
        Each tab is one position. In one forward pass all 5 run simultaneously — the causal mask
        hides future tokens at each position.
      </PanelCaption>
    </div>
  );
}

function LossDefinitionView() {
  return (
    <motion.div
      key="loss-definition"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-700 md:p-6">
        <p className="text-lg leading-relaxed text-gray-100 md:text-xl">
          <span className="font-bold text-rose-200">Cross-entropy loss</span> scores how wrong the model&apos;s
          probability distribution is at each position — compared to the true next token from the target sequence.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-teal-950/30 p-4 ring-1 ring-teal-500/30 md:p-5">
          <p className="text-base font-bold text-teal-200 md:text-lg">Measures correctness</p>
          <p className="mt-3 text-lg text-gray-100 md:text-xl">
            High probability on the <span className="font-bold text-teal-300">correct token</span> → low loss
          </p>
        </div>
        <div className="rounded-xl bg-rose-950/30 p-4 ring-1 ring-rose-500/30 md:p-5">
          <p className="text-base font-bold text-rose-200 md:text-lg">Measures error</p>
          <p className="mt-3 text-lg text-gray-100 md:text-xl">
            Low probability on the correct token → <span className="font-bold text-rose-300">high loss</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function LossWorkedExampleCard({
  example,
}: {
  example: (typeof LOSS_WORKED_EXAMPLES)[number];
}) {
  const prob = example.probPct / 100;
  const loss = getCrossEntropyLossFromPct(example.probPct);
  const isGood = example.tone === "teal";

  return (
    <div
      className={cn(
        "rounded-xl p-5 ring-1 md:p-6",
        isGood ? "bg-teal-950/30 ring-teal-500/40" : "bg-rose-950/30 ring-rose-500/40",
      )}
    >
      <p
        className={cn(
          "text-base font-bold uppercase tracking-wide md:text-lg",
          isGood ? "text-teal-200" : "text-rose-200",
        )}
      >
        {example.label}
      </p>
      <p className="mt-4 font-mono text-lg text-gray-100 md:text-xl">
        P({example.token}) = {example.probPct}% = {prob.toFixed(2)}
      </p>
      <p
        className={cn(
          "mt-3 font-mono text-xl font-bold md:text-2xl",
          isGood ? "text-teal-200" : "text-rose-200",
        )}
      >
        L = −log({prob.toFixed(2)}) ≈ {loss}
      </p>
      <p className="mt-4 text-lg text-gray-200 md:text-xl">{example.verdict}</p>
    </div>
  );
}

function LossEquationView() {
  return (
    <motion.div
      key="loss-equation"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-700 md:p-6">
        <SectionLabel>Per position</SectionLabel>
        <p className="font-mono text-xl font-bold text-white md:text-2xl">L = −log P(target)</p>
        <p className="mt-4 text-lg text-gray-300 md:text-xl">
          P(target) = probability the model assigned to the correct next token
        </p>
      </div>
      <div className="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-700 md:p-6">
        <SectionLabel>Whole batch</SectionLabel>
        <p className="font-mono text-lg font-bold leading-relaxed text-white md:text-xl">
          Batch loss = average of L over every position in every sequence
        </p>
      </div>
      <div>
        <SectionLabel>Worked examples — predict &quot;Paris&quot;</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          {LOSS_WORKED_EXAMPLES.map((example) => (
            <LossWorkedExampleCard key={example.id} example={example} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function LossExampleView({
  activeIdx,
  setActiveIdx,
  tabs,
  position,
}: {
  activeIdx: number;
  setActiveIdx: (idx: number) => void;
  tabs: { id: string; label: string }[];
  position: ForwardPosition;
}) {
  const correctPct = Math.round(getCorrectTokenProb(position) * 100);
  const positionLoss = getCrossEntropyLoss(position);

  return (
    <motion.div
      key="loss-example"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <SubTabList tabs={tabs} activeIdx={activeIdx} onChange={setActiveIdx} accent="rose" ariaLabel="Loss positions" />
      <PositionTabContent position={position}>
        <div>
          <SectionLabel>Model vs target</SectionLabel>
          <PredictionBarChart predictions={position.predictions} correctToken={position.correctToken} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-teal-950/30 p-4 ring-1 ring-teal-500/30">
            <p className="text-base font-bold text-teal-200 md:text-lg">Target</p>
            <p className="mt-2 font-mono text-xl font-bold text-white md:text-2xl">{position.correctToken}</p>
          </div>
          <div className="rounded-xl bg-violet-950/30 p-4 ring-1 ring-violet-500/30">
            <p className="text-base font-bold text-violet-200 md:text-lg">P(target)</p>
            <p className="mt-2 font-mono text-xl font-bold text-white md:text-2xl">{correctPct}%</p>
          </div>
          <div className="rounded-xl bg-rose-950/30 p-4 ring-1 ring-rose-500/30">
            <p className="text-base font-bold text-rose-200 md:text-lg">L = −log P</p>
            <p className="mt-2 font-mono text-xl font-bold text-white md:text-2xl">{positionLoss}</p>
          </div>
        </div>
      </PositionTabContent>
    </motion.div>
  );
}

function LossPanel() {
  const [viewIdx, setViewIdx] = useState(0);
  const { activeIdx, setActiveIdx, tabs, position } = usePositionTabs(FORWARD_POSITIONS);

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Cross-entropy loss
      </p>
      <SubTabList
        tabs={LOSS_VIEW_TABS.map((t) => ({ id: t.id, label: t.label }))}
        activeIdx={viewIdx}
        onChange={setViewIdx}
        accent="rose"
        ariaLabel="Loss views"
      />
      <AnimatePresence mode="wait">
        {viewIdx === 0 ? (
          <LossDefinitionView />
        ) : viewIdx === 1 ? (
          <LossEquationView />
        ) : (
          <LossExampleView
            activeIdx={activeIdx}
            setActiveIdx={setActiveIdx}
            tabs={tabs}
            position={position}
          />
        )}
      </AnimatePresence>
      <PanelCaption>
        {viewIdx === 0
          ? "Loss is computed at every position, then averaged — one batch loss number drives the backward pass."
          : viewIdx === 1
            ? "Higher P(target) means the model was more correct at that position — loss falls toward zero as training improves."
            : "All position losses in the batch average to batch loss — illustrative mean ≈ 2.41."}
      </PanelCaption>
    </div>
  );
}

function BackwardLayerStack({
  activeLayerId,
  compact = false,
}: {
  activeLayerId?: string;
  compact?: boolean;
}) {
  const layers = [...BACKWARD_LAYERS].reverse();

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full flex-wrap items-center justify-center gap-2 md:gap-3">
          {layers.map((layer, i) => {
            const isActive = layer.id === activeLayerId;
            const isLoss = layer.id === "loss";
            return (
              <div key={layer.id} className="flex items-center gap-2 md:gap-3">
                <div
                  className={cn(
                    "shrink-0 rounded-xl border-2 font-bold",
                    compact ? "px-3 py-2 text-base md:px-4 md:py-2.5 md:text-lg" : "px-4 py-3 text-base md:px-5 md:py-3.5 md:text-lg",
                    isActive
                      ? "border-amber-400/70 bg-amber-950/50 text-amber-100 ring-2 ring-amber-500/40"
                      : "border-gray-700 bg-gray-900/80 text-gray-300",
                  )}
                >
                  {layer.label}
                  {isLoss ? <span className="ml-2 font-mono text-rose-300">2.41</span> : null}
                </div>
                {i < layers.length - 1 ? (
                  <span className="text-2xl font-bold text-amber-400 md:text-3xl" aria-hidden>
                    ←
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-center text-base font-bold uppercase tracking-wide text-amber-300 md:text-lg">
        Gradient flows ← from loss to weights
      </p>
    </div>
  );
}

function isPositiveGrad(grad: string) {
  return grad.startsWith("+");
}

function LayerWeightGradGrid({ layerId }: { layerId: string }) {
  const weights = BACKWARD_LAYER_WEIGHT_GRADS[layerId] ?? [];

  return (
    <div className="grid grid-cols-3 gap-3">
      {weights.map((w) => {
        const positive = isPositiveGrad(w.grad);
        return (
          <div
            key={w.id}
            className={cn(
              "rounded-xl p-4 ring-1",
              positive ? "bg-rose-950/25 ring-rose-500/35" : "bg-teal-950/25 ring-teal-500/35",
            )}
          >
            <p className="font-mono text-base font-bold text-gray-300 md:text-lg">{w.id}</p>
            <p
              className={cn(
                "mt-2 font-mono text-lg font-bold md:text-xl",
                positive ? "text-rose-200" : "text-teal-200",
              )}
            >
              ∂L/∂w = {w.grad}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BackwardGradientDirectionCard({
  example,
}: {
  example: (typeof BACKWARD_GRAD_EXAMPLES)[number];
}) {
  const isPositive = example.tone === "rose";

  return (
    <div
      className={cn(
        "rounded-xl p-5 ring-1 md:p-6",
        isPositive ? "bg-rose-950/30 ring-rose-500/40" : "bg-teal-950/30 ring-teal-500/40",
      )}
    >
      <p
        className={cn(
          "text-base font-bold uppercase tracking-wide md:text-lg",
          isPositive ? "text-rose-200" : "text-teal-200",
        )}
      >
        {example.label} gradient
      </p>
      <p className="mt-4 font-mono text-xl font-bold text-white md:text-2xl">∂L/∂w = {example.value}</p>
      <div className="mt-4 rounded-lg bg-gray-950/60 p-3 ring-1 ring-gray-700">
        <svg viewBox="0 0 200 120" className="h-[100px] w-full md:h-[120px]" aria-hidden>
          <text x="8" y="20" fill="#9ca3af" fontSize="14" fontWeight="600">
            Loss
          </text>
          <text x="165" y="112" fill="#9ca3af" fontSize="14" fontWeight="600">
            w
          </text>
          <line x1="30" y1="100" x2="180" y2="100" stroke="#4b5563" strokeWidth="2" />
          <line x1="30" y1="20" x2="30" y2="100" stroke="#4b5563" strokeWidth="2" />
          <line
            x1="40"
            y1={isPositive ? "35" : "85"}
            x2="170"
            y2={isPositive ? "85" : "35"}
            stroke={isPositive ? "#f43f5e" : "#14b8a6"}
            strokeWidth="4"
          />
          <polygon
            points={
              isPositive
                ? "170,85 160,85 170,75"
                : "170,35 160,35 170,45"
            }
            fill={isPositive ? "#f43f5e" : "#14b8a6"}
          />
        </svg>
      </div>
      <p className="mt-4 text-lg text-gray-100 md:text-xl">{example.direction}</p>
      <p className="mt-2 text-lg text-gray-300 md:text-xl">{example.verdict}</p>
    </div>
  );
}

function BackwardDefinitionView() {
  const [subIdx, setSubIdx] = useState(0);

  return (
    <motion.div
      key="backward-definition"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <SubTabList
        tabs={BACKWARD_DEF_SUBTABS.map((t) => ({ id: t.id, label: t.label }))}
        activeIdx={subIdx}
        onChange={setSubIdx}
        accent="amber"
        ariaLabel="Backward definition"
      />
      <AnimatePresence mode="wait">
        {subIdx === 0 ? (
          <motion.div
            key="backward-what"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-700 md:p-6">
              <p className="text-lg leading-relaxed text-gray-100 md:text-xl">
                After the forward pass you have <span className="font-mono font-bold text-rose-300">one loss</span>{" "}
                number — say <span className="font-mono font-bold text-rose-300">2.41</span>.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-100 md:text-xl">
                The backward pass answers: <span className="font-bold text-amber-200">which weights caused this loss,
                and by exactly how much?</span>
              </p>
            </div>
            <div className="rounded-xl bg-amber-950/30 p-5 ring-1 ring-amber-500/30 md:p-6">
              <p className="text-lg text-gray-100 md:text-xl">
                By the end, <span className="font-bold text-amber-200">every weight</span> — all billions of them — has
                exactly one gradient number. Nothing more, nothing less.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="backward-gradients"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-700 md:p-6">
              <p className="text-lg leading-relaxed text-gray-100 md:text-xl">
                A <span className="font-bold text-amber-200">gradient</span> is a blame score on a weight: if you
                increase this weight slightly, the loss moves by this much in this direction.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {BACKWARD_GRAD_EXAMPLES.map((example) => (
                <BackwardGradientDirectionCard key={example.id} example={example} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BackwardFlowView() {
  const [layerIdx, setLayerIdx] = useState(0);
  const layer = BACKWARD_LAYERS[layerIdx];

  return (
    <motion.div
      key="backward-flow"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <SubTabList
        tabs={BACKWARD_LAYERS.map((l) => ({ id: l.id, label: l.label }))}
        activeIdx={layerIdx}
        onChange={setLayerIdx}
        accent="amber"
        ariaLabel="Backward chain rule layers"
      />
      <BackwardLayerStack activeLayerId={layer.id} />
      <div className="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-700 md:p-6">
        <SectionLabel>At this layer</SectionLabel>
        <p className="text-lg leading-relaxed text-gray-100 md:text-xl">{layer.detail}</p>
        <p className="mt-4 font-mono text-lg font-bold text-amber-200 md:text-xl">{layer.question}</p>
      </div>
    </motion.div>
  );
}

function BackwardExampleView() {
  const [layerIdx, setLayerIdx] = useState(0);
  const layer = BACKWARD_WEIGHT_LAYERS[layerIdx] ?? BACKWARD_WEIGHT_LAYERS[0];

  return (
    <motion.div
      key="backward-example"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="rounded-xl bg-rose-950/30 px-5 py-3 text-center ring-1 ring-rose-500/30">
        <p className="text-base font-bold uppercase tracking-wide text-rose-200 md:text-lg">Batch loss</p>
        <p className="mt-1 font-mono text-3xl font-bold text-white md:text-4xl">2.41</p>
      </div>

      <BackwardLayerStack activeLayerId={layer.id} compact />

      <SubTabList
        tabs={BACKWARD_WEIGHT_LAYERS.map((t) => ({ id: t.id, label: t.label }))}
        activeIdx={layerIdx}
        onChange={setLayerIdx}
        accent="amber"
        ariaLabel="Layers with weight gradients"
      />

      <div>
        <SectionLabel>∂L/∂w — sample weights in {layer.label}</SectionLabel>
        <LayerWeightGradGrid layerId={layer.id} />
      </div>
    </motion.div>
  );
}

function BackwardPanel() {
  const [viewIdx, setViewIdx] = useState(0);

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Backward pass
      </p>
      <SubTabList
        tabs={BACKWARD_VIEW_TABS.map((t) => ({ id: t.id, label: t.label }))}
        activeIdx={viewIdx}
        onChange={setViewIdx}
        accent="amber"
        ariaLabel="Backward views"
      />
      <AnimatePresence mode="wait">
        {viewIdx === 0 ? (
          <BackwardDefinitionView />
        ) : viewIdx === 1 ? (
          <BackwardFlowView />
        ) : (
          <BackwardExampleView />
        )}
      </AnimatePresence>
      <PanelCaption>
        {viewIdx === 0
          ? "Gradients are blame scores — the optimizer uses them in the next step to update every weight."
          : viewIdx === 1
            ? "Chain rule: the answer at one layer becomes the question at the layer below — traced from loss to embeddings."
            : "Three sample weights per layer — every weight gets one ∂L/∂w. Rose hurts, teal helps. … + millions more."}
      </PanelCaption>
    </div>
  );
}

function OptimizerSgdView() {
  const ex = SGD_WORKED_EXAMPLE;

  return (
    <motion.div
      key="optimizer-sgd"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <p className="text-lg text-gray-100 md:text-xl">
        Optimizer takes each averaged <span className="font-mono font-bold text-blue-300">∂L/∂w</span> from
        backward pass and actually changes the weight.
      </p>

      <div className="rounded-xl bg-blue-950/30 p-5 ring-1 ring-blue-500/35 md:p-6">
        <SectionLabel>SGD — simplest optimizer</SectionLabel>
        <p className="font-mono text-xl font-bold text-white md:text-2xl">
          new w = old w − (learning rate × ∂L/∂w)
        </p>
      </div>

      <div className="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-700 md:p-6">
        <SectionLabel>Worked example — one weight</SectionLabel>
        <div className="space-y-3 text-lg text-gray-100 md:text-xl">
          <p>
            old w = <span className="font-mono font-bold text-white">{ex.oldWeight}</span>
          </p>
          <p>
            ∂L/∂w = <span className="font-mono font-bold text-rose-300">{ex.grad}</span>
            <span className="text-gray-300"> — positive, this weight pushes loss up</span>
          </p>
          <p>
            learning rate = <span className="font-mono font-bold text-blue-300">{ex.learningRate}</span>
          </p>
          <p className="font-mono text-lg font-bold leading-relaxed text-white md:text-xl">
            new w = {ex.oldWeight} − ({ex.learningRate} × {ex.gradNumeric}) ={" "}
            <span className="text-teal-300">{ex.newWeight}</span>
          </p>
        </div>
      </div>

      <p className="text-lg text-gray-200 md:text-xl">
        The minus sign handles direction: positive ∂L/∂w → weight down. Negative ∂L/∂w → weight up.
      </p>
    </motion.div>
  );
}

function OptimizerLearningRateView() {
  return (
    <motion.div
      key="optimizer-lr"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="rounded-xl bg-blue-950/30 p-5 ring-1 ring-blue-500/35 md:p-6">
        <SectionLabel>What learning rate does</SectionLabel>
        <p className="text-lg text-gray-100 md:text-xl">
          Scales each gradient <span className="font-bold">before</span> the nudge is applied.
        </p>
        <p className="mt-3 font-mono text-xl font-bold text-white md:text-2xl">
          lr = 3e-4 = 0.0003
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LEARNING_RATE_SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className={cn(
              "rounded-xl p-5 ring-1 md:p-6",
              scenario.tone === "rose"
                ? "bg-rose-950/25 ring-rose-500/35"
                : "bg-amber-950/25 ring-amber-500/35",
            )}
          >
            <p
              className={cn(
                "text-base font-bold uppercase tracking-wide md:text-lg",
                scenario.tone === "rose" ? "text-rose-200" : "text-amber-200",
              )}
            >
              {scenario.label}
            </p>
            <p className="mt-4 text-lg text-gray-100 md:text-xl">{scenario.outcome}</p>
          </div>
        ))}
      </div>

      <p className="text-lg text-gray-200 md:text-xl">
        Picking the right learning rate is one of the most important training decisions.
      </p>
    </motion.div>
  );
}

function OptimizerAdamView() {
  return (
    <motion.div
      key="optimizer-adam"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <p className="text-lg text-gray-100 md:text-xl">
        Adam is what most LLMs use in production — same averaged{" "}
        <span className="font-mono font-bold text-blue-300">∂L/∂w</span>, smarter step per weight.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {(["All positions", "Average ∂L/∂w", "Adam", "Weights updated"] as const).map((label, idx, arr) => (
          <div key={label} className="flex items-center gap-2 md:gap-3">
            <span className="rounded-xl bg-blue-950/40 px-4 py-3 text-base font-bold text-blue-100 ring-1 ring-blue-500/35 md:text-lg">
              {label}
            </span>
            {idx < arr.length - 1 ? (
              <span className="text-xl font-bold text-blue-400 md:text-2xl" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div>
        <SectionLabel>Sample weights — one Adam update each</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {OPTIMIZER_SAMPLE_WEIGHTS.map((w) => {
            const positiveGrad = w.avgGrad.startsWith("+");
            return (
              <div key={w.id} className="rounded-xl bg-gray-900 p-4 ring-1 ring-gray-700 md:p-5">
                <p className="font-mono text-base font-bold text-gray-300 md:text-lg">{w.id}</p>
                <p className="mt-2 font-mono text-lg font-bold text-white md:text-xl">
                  {w.before} → <span className="text-teal-300">{w.after}</span>
                </p>
                <p className="mt-2 text-base text-gray-300 md:text-lg">
                  avg ∂L/∂w ={" "}
                  <span
                    className={cn(
                      "font-mono font-bold",
                      positiveGrad ? "text-rose-300" : "text-teal-300",
                    )}
                  >
                    {w.avgGrad}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-lg text-gray-200 md:text-xl">
        Learning rate <span className="font-mono font-bold text-blue-300">3e-4</span> — billions of weights,
        one optimizer step
      </p>
    </motion.div>
  );
}

function OptimizerPanel() {
  const [viewIdx, setViewIdx] = useState(0);

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Optimizer — turn gradients into weight updates
      </p>

      <SubTabList
        tabs={OPTIMIZER_VIEW_TABS.map((t) => ({ id: t.id, label: t.label }))}
        activeIdx={viewIdx}
        onChange={setViewIdx}
        accent="blue"
        ariaLabel="Optimizer views"
      />

      <AnimatePresence mode="wait">
        {viewIdx === 0 ? (
          <OptimizerSgdView />
        ) : viewIdx === 1 ? (
          <OptimizerLearningRateView />
        ) : (
          <OptimizerAdamView />
        )}
      </AnimatePresence>

      <PanelCaption>
        {viewIdx === 0
          ? "Gradients are averaged across the batch first — then SGD updates every weight once. See Adam tab for the production optimizer."
          : viewIdx === 1
            ? "3e-4 is a typical pre-training learning rate — small nudges, billions of times."
            : "Adam adapts step size per weight using gradient history — same averaged ∂L/∂w, smarter nudge. … + billions more weights."}
      </PanelCaption>
    </div>
  );
}

function RepeatPanel({
  checkpointIdx,
  onCheckpointChange,
  isPlaying,
  onTogglePlay,
}: {
  checkpointIdx: number;
  onCheckpointChange: (idx: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  const parisPosition = FORWARD_POSITIONS[4];
  const checkpointTabs = CHECKPOINT_LABELS.map((label, i) => ({ id: `ckpt-${i}`, label }));

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Training progress — scrub checkpoints
      </p>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="flex-1">
          <SubTabList
            tabs={checkpointTabs}
            activeIdx={checkpointIdx}
            onChange={onCheckpointChange}
            accent="violet"
            ariaLabel="Training checkpoints"
          />
        </div>
        <button
          type="button"
          onClick={onTogglePlay}
          className="shrink-0 rounded-xl border-2 border-teal-500/50 bg-teal-950/40 px-5 py-3 text-base font-bold text-teal-100 md:text-lg"
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={checkpointIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div>
            <SectionLabel>Context at Paris position</SectionLabel>
            <ContextRow contextLength={parisPosition.contextLength} />
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
          <div>
            <SectionLabel>Top predictions</SectionLabel>
            <PredictionBarChart
              predictions={CANDIDATES.map((c) => ({
                token: c.token,
                prob: Math.round((c.probs[checkpointIdx] ?? c.probs[0]) * 100),
              }))}
              correctToken="Paris"
            />
          </div>
        </motion.div>
      </AnimatePresence>
      <PanelCaption>
        {checkpointIdx === 0
          ? "Back to step 2 — load the next batch and run the loop again."
          : checkpointIdx >= 5
            ? "Paris dominates — the model learned the fact."
            : "Paris rises batch after batch — loss falls."}
      </PanelCaption>
    </div>
  );
}

function MonitorPanel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const view = MONITOR_VIEWS[activeIdx] ?? MONITOR_VIEWS[0];

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Validation check — pick a scenario
      </p>
      <SubTabList
        tabs={MONITOR_VIEWS.map((v) => ({ id: v.id, label: v.label }))}
        activeIdx={activeIdx}
        onChange={setActiveIdx}
        accent="teal"
        ariaLabel="Monitor scenarios"
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={view.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox="0 0 480 160" className="h-[140px] w-full md:h-[160px]" aria-hidden>
            <line x1="52" y1="130" x2="460" y2="130" stroke="#4b5563" strokeWidth="2" />
            <line x1="52" y1="20" x2="52" y2="130" stroke="#4b5563" strokeWidth="2" />
            <text
              x="14"
              y="78"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="16"
              fontWeight="600"
              transform="rotate(-90 14 78)"
            >
              Loss
            </text>
            {LOSS_Y_TICKS.map((tick) => {
              const y = Math.round(lossToChartY(tick.loss));
              return (
                <g key={tick.label}>
                  <line x1="48" y1={y} x2="52" y2={y} stroke="#6b7280" strokeWidth="2" />
                  <text x="44" y={y + 5} textAnchor="end" fill="#9ca3af" fontSize="16" fontWeight="600">
                    {tick.label}
                  </text>
                </g>
              );
            })}
            <text x="256" y="155" textAnchor="middle" fill="#9ca3af" fontSize="16" fontWeight="600">
              Training steps
            </text>
            <polyline
              points={buildLossPolyline(view.trainLosses)}
              fill="none"
              stroke="#14b8a6"
              strokeWidth="3"
            />
            <polyline
              points={buildLossPolyline(view.valLosses)}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeDasharray={view.valDashed ? "8 4" : undefined}
            />
            {view.annotation ? (
              <>
                <circle
                  cx={view.annotation.x - 10}
                  cy={view.annotation.y}
                  r="6"
                  fill="#f43f5e"
                />
                <text x={view.annotation.x} y={view.annotation.y} fill="#f43f5e" fontSize="16" fontWeight="700">
                  {view.annotation.text}
                </text>
              </>
            ) : null}
          </svg>
          <div className="mt-4 flex flex-wrap gap-4">
            <span className="flex items-center gap-2 text-lg text-gray-200 md:text-xl">
              <span className="h-3 w-8 rounded bg-teal-500" /> Train loss
            </span>
            <span className="flex items-center gap-2 text-lg text-gray-200 md:text-xl">
              <span className="h-3 w-8 rounded bg-violet-500" /> Val loss
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
      <PanelCaption>{view.caption}</PanelCaption>
    </div>
  );
}

function CheckpointPanel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const ckpt = CHECKPOINT_SAVES[activeIdx];

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Saved weights — one tab per checkpoint
      </p>
      <SubTabList
        tabs={CHECKPOINT_SAVES.map((c) => ({ id: c.id, label: c.label }))}
        activeIdx={activeIdx}
        onChange={setActiveIdx}
        accent="amber"
        ariaLabel="Saved checkpoints"
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={ckpt.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl bg-amber-500/15 p-6 text-center ring-1 ring-amber-500/30 md:p-8"
        >
          <p className="text-4xl" aria-hidden>
            💾
          </p>
          <p className="mt-4 font-mono text-3xl font-bold text-white md:text-4xl">{ckpt.step}</p>
          <p className="mt-2 text-lg text-gray-300 md:text-xl">{ckpt.size} on disk</p>
        </motion.div>
      </AnimatePresence>
      <PanelCaption>Crash at step 800K? Resume from 790K — not from zero.</PanelCaption>
    </div>
  );
}

function DonePanel() {
  const { activeIdx, setActiveIdx, tabs, position } = usePositionTabs(TRAINED_POSITIONS);

  return (
    <div className="space-y-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Trained base model — one tab per position
      </p>
      <SubTabList tabs={tabs} activeIdx={activeIdx} onChange={setActiveIdx} accent="teal" ariaLabel="Done positions" />
      <AnimatePresence mode="wait">
        <PositionTabContent position={position}>
          <div>
            <SectionLabel>Top predictions</SectionLabel>
            <PredictionBarChart predictions={position.predictions} correctToken={position.correctToken} />
          </div>
        </PositionTabContent>
      </AnimatePresence>
      <PanelCaption>
        Pre-training complete. The model completes documents — not yet how to follow instructions.
      </PanelCaption>
    </div>
  );
}

function BatchPairsPanel() {
  const [activeSequenceIdx, setActiveSequenceIdx] = useState(0);
  const activeSequence = BATCH_SEQUENCES[activeSequenceIdx];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
          One batch — loaded together
        </p>
        <span className="rounded-full bg-teal-500/20 px-4 py-2 text-base font-bold text-teal-200 ring-1 ring-teal-500/40 md:text-lg">
          {BATCH_SIZE} sequences
        </span>
      </div>

      <SubTabList
        tabs={BATCH_SEQUENCES.map((s) => ({ id: s.id, label: s.label }))}
        activeIdx={activeSequenceIdx}
        onChange={setActiveSequenceIdx}
        accent="teal"
        ariaLabel="Batch sequence examples"
      />

      <AnimatePresence mode="wait">
        {activeSequence ? <BatchSequencePreview key={activeSequence.id} sequence={activeSequence} /> : null}
      </AnimatePresence>

      <PanelCaption>
        … + {BATCH_SIZE - BATCH_SEQUENCES.length} more sequences in this batch. Each is 2048 tokens in
        production — every position predicts the next token simultaneously in one forward pass.
      </PanelCaption>
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
      className="flex flex-1 flex-col space-y-6"
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

      {/* Step-specific visual */}
      <div className="flex min-h-[300px] flex-1 flex-col rounded-2xl border border-gray-700 bg-gray-950/80 p-5 md:min-h-[340px] md:p-8">
        {step.id === "init" && <InitPanel />}
        {step.id === "batch" && <BatchPairsPanel />}
        {step.id === "forward" && <ForwardPassPanel />}
        {step.id === "loss" && <LossPanel />}
        {step.id === "backward" && <BackwardPanel />}
        {step.id === "optimizer" && <OptimizerPanel />}
        {step.id === "repeat" && (
          <RepeatPanel
            checkpointIdx={checkpointIdx}
            onCheckpointChange={onCheckpointChange}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
          />
        )}
        {step.id === "monitor" && <MonitorPanel />}
        {step.id === "checkpoint" && <CheckpointPanel />}
        {step.id === "done" && <DonePanel />}
      </div>
    </motion.div>
  );
}

export default function PreTrainingLoopExplorer({
  title,
  caption,
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
      className="flex min-h-[520px] w-full flex-col rounded-2xl border border-gray-700 bg-gray-900 p-6 md:min-h-[580px] md:p-10"
      data-local-navigation="true"
    >
      {title || caption ? (
        <div className="space-y-2">
          {title ? <h2 className="text-xl font-semibold text-gray-100 md:text-2xl">{title}</h2> : null}
          {caption ? <p className="text-lg text-gray-300 md:text-xl">{caption}</p> : null}
        </div>
      ) : null}

      <div
        className={cn(
          "flex gap-2 overflow-x-auto pb-2 md:gap-2.5",
          title || caption ? "mt-6 md:mt-8" : "",
        )}
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
        className="mt-6 flex flex-1 flex-col md:mt-8"
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
