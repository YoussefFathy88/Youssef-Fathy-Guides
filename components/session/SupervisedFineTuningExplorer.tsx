"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AccentColor = "amber" | "teal" | "rose" | "violet" | "blue" | "gray";

export interface SftStep {
  id: string;
  number: number;
  shortLabel: string;
  label: string;
  emoji: string;
  color: AccentColor;
  description: string;
}

export interface SupervisedFineTuningExplorerProps {
  title?: string;
  caption?: string;
  steps?: SftStep[];
}

const ACCENT: Record<
  AccentColor,
  { tab: string; ring: string; badge: string }
> = {
  gray: {
    tab: "border-gray-500/70 bg-gray-950/40 text-gray-100 ring-gray-500/30",
    ring: "ring-gray-500/35",
    badge: "bg-gray-500/20 text-gray-200",
  },
  teal: {
    tab: "border-teal-500/70 bg-teal-950/40 text-teal-100 ring-teal-500/30",
    ring: "ring-teal-500/35",
    badge: "bg-teal-500/20 text-teal-200",
  },
  blue: {
    tab: "border-blue-500/70 bg-blue-950/40 text-blue-100 ring-blue-500/30",
    ring: "ring-blue-500/35",
    badge: "bg-blue-500/20 text-blue-200",
  },
  violet: {
    tab: "border-violet-500/70 bg-violet-950/40 text-violet-100 ring-violet-500/30",
    ring: "ring-violet-500/35",
    badge: "bg-violet-500/20 text-violet-200",
  },
  rose: {
    tab: "border-rose-500/70 bg-rose-950/40 text-rose-100 ring-rose-500/30",
    ring: "ring-rose-500/35",
    badge: "bg-rose-500/20 text-rose-200",
  },
  amber: {
    tab: "border-amber-500/70 bg-amber-950/40 text-amber-100 ring-amber-500/30",
    ring: "ring-amber-500/35",
    badge: "bg-amber-500/20 text-amber-200",
  },
};

const PROMPT = "What is the capital of France?";
const BAD_OUTPUT = "What is the capital of Germany?";
const GOOD_OUTPUT = "The capital of France is Paris.";

const TRAINING_PAIRS = [
  { prompt: PROMPT, response: GOOD_OUTPUT },
  {
    prompt: "Explain gravity simply.",
    response: "Gravity is a force that pulls objects toward each other.",
  },
  {
    prompt: "Write a poem about rain.",
    response: "Raindrops fall like whispered songs…",
  },
] as const;

const RESPONSE_TOKENS = ["The", "capital", "of", "France", "is", "Paris"];

/** Full training sequence: prompt tokens then response tokens (one row on slide). */
const FULL_SEQUENCE = [
  "What",
  "is",
  "the",
  "capital",
  "of",
  "France?",
  "The",
  "capital",
  "of",
  "France",
  "is",
  "Paris",
] as const;

const RESPONSE_START_INDEX = 6;

const LOOP_STEPS = [
  { label: "Batch", emoji: "📦", color: "teal" },
  { label: "Forward", emoji: "⚡", color: "violet" },
  { label: "Loss", emoji: "📉", color: "rose" },
  { label: "Backward", emoji: "↩", color: "blue" },
  { label: "Optimizer", emoji: "⚙", color: "amber" },
  { label: "Repeat", emoji: "🔁", color: "gray" },
] as const;

const DEFAULT_STEPS: SftStep[] = [
  {
    id: "base",
    number: 1,
    shortLabel: "Base",
    label: "Start with the pretrained base model",
    emoji: "🧠",
    color: "gray",
    description:
      "The base model knows language but has no idea how to be helpful. It just continues text patterns.",
  },
  {
    id: "pairs",
    number: 2,
    shortLabel: "Pairs",
    label: "Collect human-written prompt → response pairs",
    emoji: "✍",
    color: "teal",
    description:
      "People write the ideal answer for each prompt. These answers are the labels. InstructGPT used about 13,000 of these pairs.",
  },
  {
    id: "format",
    number: 3,
    shortLabel: "Format",
    label: "Format each example as prompt + response",
    emoji: "📋",
    color: "blue",
    description:
      "Each prompt and answer is combined into one input. The model learns to produce the answer given the prompt.",
  },
  {
    id: "loop",
    number: 4,
    shortLabel: "Loop",
    label: "Run the same training loop",
    emoji: "🔁",
    color: "violet",
    description:
      "The training loop is the same as pretraining. Only the data changed — now we feed question-and-answer pairs.",
  },
  {
    id: "mask",
    number: 5,
    shortLabel: "Loss",
    label: "Compute loss on response tokens only",
    emoji: "🎯",
    color: "rose",
    description:
      "Forward pass still runs on the full prompt plus answer — the model needs that context. Loss is zeroed on prompt tokens and only counts from the first answer token onward.",
  },
  {
    id: "result",
    number: 6,
    shortLabel: "Result",
    label: "Result: an instruction-following model",
    emoji: "✅",
    color: "amber",
    description:
      "The model still has all its pretrained knowledge. Now it also knows how to answer helpfully instead of just continuing random text.",
  },
];

function PromptResponseRow({
  prompt,
  response,
  compact = false,
}: {
  prompt: string;
  response?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-3", compact ? "space-y-2" : "space-y-4")}>
      <div className="rounded-xl border-2 border-gray-600 bg-gray-900/80 p-4 md:p-5">
        <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">Prompt</p>
        <p className="mt-2 text-lg text-gray-100 md:text-xl">{prompt}</p>
      </div>
      {response ? (
        <div className="rounded-xl border-2 border-teal-500/50 bg-teal-950/30 p-4 md:p-5">
          <p className="text-base font-bold uppercase tracking-wide text-teal-200 md:text-lg">Response</p>
          <p className="mt-2 text-lg text-teal-50 md:text-xl">{response}</p>
        </div>
      ) : null}
    </div>
  );
}

function BaseModelPanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-4">
        <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-4 md:p-5">
          <p className="text-base font-bold text-gray-400 md:text-lg">Prompt →</p>
          <p className="mt-2 text-lg text-gray-100 md:text-xl">{PROMPT}</p>
        </div>
        <div className="flex items-center justify-center text-2xl text-gray-500 md:text-3xl" aria-hidden>
          ↓
        </div>
        <div className="rounded-xl border-2 border-rose-500/40 bg-rose-950/25 p-4 md:p-5">
          <p className="text-base font-bold text-rose-200 md:text-lg">Model output →</p>
          <p className="mt-2 text-lg text-rose-100 md:text-xl">{BAD_OUTPUT}</p>
          <p className="mt-3 text-xl font-bold text-rose-400 md:text-2xl">❌ Keeps the question going</p>
        </div>
      </div>
    </div>
  );
}

function PairsPanel() {
  const [pairIdx, setPairIdx] = useState(0);
  const pair = TRAINING_PAIRS[pairIdx];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {TRAINING_PAIRS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPairIdx(idx)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:px-5 md:text-lg",
              pairIdx === idx
                ? "border-teal-500/60 bg-teal-950/40 text-teal-100 ring-2 ring-teal-500/30"
                : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-600",
            )}
          >
            Pair {idx + 1}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pairIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <PromptResponseRow prompt={pair.prompt} response={pair.response} />
          <p className="mt-4 text-lg font-bold text-emerald-400 md:text-xl">✅ Good example for training</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FormatPanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 md:flex-row md:gap-8">
      <div className="w-full max-w-xl space-y-3 rounded-2xl border-2 border-blue-500/40 bg-blue-950/20 p-5 md:p-6">
        <div className="rounded-xl border border-gray-600 bg-gray-900/80 p-4">
          <p className="text-base font-bold text-gray-300 md:text-lg">Prompt</p>
          <p className="mt-2 text-lg text-gray-100 md:text-xl">{PROMPT}</p>
        </div>
        <div className="rounded-xl border border-teal-500/40 bg-teal-950/30 p-4">
          <p className="text-base font-bold text-teal-200 md:text-lg">Response</p>
          <p className="mt-2 text-lg text-teal-50 md:text-xl">{GOOD_OUTPUT}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-3xl text-violet-300 md:text-4xl" aria-hidden>
          →
        </span>
        <div className="rounded-xl border-2 border-violet-500/50 bg-violet-950/30 px-5 py-4 md:px-6 md:py-5">
          <p className="text-lg font-bold text-violet-100 md:text-xl">One training example</p>
        </div>
      </div>
    </div>
  );
}

function LoopPanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Same loop as pretraining
      </p>
      <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-4">
        {LOOP_STEPS.map((item, idx) => (
          <div key={item.label} className="flex items-center gap-3 md:gap-4">
            <div
              className={cn(
                "flex min-w-[5.5rem] flex-col items-center rounded-xl border-2 px-4 py-4 md:min-w-[6.5rem] md:px-5 md:py-5",
                ACCENT[item.color as AccentColor].tab,
              )}
            >
              <span className="text-2xl md:text-3xl" aria-hidden>
                {item.emoji}
              </span>
              <span className="mt-2 text-base font-bold md:text-lg">{item.label}</span>
            </div>
            {idx < LOOP_STEPS.length - 1 ? (
              <span className="text-xl text-gray-500 md:text-2xl" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="text-lg text-gray-300 md:text-xl">Only the training data changed — not the loop itself.</p>
    </div>
  );
}

function LossSubTabs({
  active,
  onChange,
}: {
  active: "zones" | "walkthrough";
  onChange: (tab: "zones" | "walkthrough") => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {(
        [
          { id: "zones" as const, label: "Masked zones" },
          { id: "walkthrough" as const, label: "Next-token walkthrough" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:px-5 md:text-lg",
            active === tab.id
              ? "border-rose-500/60 bg-rose-950/40 text-rose-100 ring-2 ring-rose-500/30"
              : "border-gray-700 bg-gray-950/60 text-gray-300 hover:border-gray-600",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function LossZonesTab() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-4 md:p-5">
        <p className="text-base font-bold text-gray-400 md:text-lg">Prompt tokens — no loss</p>
        <p className="mt-2 text-lg text-gray-500 line-through decoration-gray-600 md:text-xl">{PROMPT}</p>
      </div>

      <div className="rounded-xl border-2 border-rose-500/50 bg-rose-950/25 p-4 md:p-5">
        <p className="text-base font-bold text-rose-200 md:text-lg">Response tokens — loss here</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {RESPONSE_TOKENS.map((token) => (
            <span
              key={token}
              className="rounded-lg border-2 border-rose-400/60 bg-rose-500/20 px-3 py-2 text-base font-bold text-rose-100 md:px-4 md:py-3 md:text-lg"
            >
              {token}
            </span>
          ))}
        </div>
        <p className="mt-4 text-lg text-rose-100 md:text-xl">
          Forward pass reads everything — only answer tokens are graded.
        </p>
      </div>
    </div>
  );
}

function LossWalkthroughTab() {
  const reducedMotion = useReducedMotion();
  const [posIdx, setPosIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** posIdx = index of the token being predicted; context = all tokens before it */
  const targetToken = FULL_SEQUENCE[posIdx];
  const contextTokens = FULL_SEQUENCE.slice(0, posIdx);
  const contextEndToken = posIdx > 0 ? FULL_SEQUENCE[posIdx - 1] : null;
  const isResponseToken = posIdx >= RESPONSE_START_INDEX;
  const contextLabel =
    contextTokens.length === 0
      ? "Start"
      : contextTokens.length <= 3
        ? contextTokens.join(" ")
        : `…${contextEndToken}`;

  const stopPlaying = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    setPosIdx((prev) => {
      if (prev >= FULL_SEQUENCE.length - 1) {
        stopPlaying();
        return prev;
      }
      return prev + 1;
    });
  }, [stopPlaying]);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    timerRef.current = setInterval(stepForward, 1100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, stepForward, reducedMotion]);

  useEffect(() => () => stopPlaying(), [stopPlaying]);

  function togglePlay() {
    if (playing) {
      stopPlaying();
      return;
    }
    if (posIdx >= FULL_SEQUENCE.length - 1) setPosIdx(0);
    setPlaying(true);
  }

  function renderTokenChip(token: string, idx: number) {
    const isPrompt = idx < RESPONSE_START_INDEX;
    const isTarget = idx === posIdx;
    const isContextEnd = posIdx > 0 && idx === posIdx - 1;
    const isPast = idx < posIdx && !isTarget && !isContextEnd;

    return (
      <div
        key={`${token}-${idx}`}
        className={cn(
          "flex flex-col items-center gap-1",
          (isTarget || isContextEnd) && "relative z-10",
        )}
      >
        {isContextEnd ? (
          <span className="text-base font-bold text-violet-300 md:text-lg" aria-hidden>
            ▲ read
          </span>
        ) : isTarget ? (
          <span className="text-base font-bold text-amber-400 md:text-lg" aria-hidden>
            next →
          </span>
        ) : (
          <span className="h-[1.25rem] md:h-[1.5rem]" aria-hidden />
        )}
        <motion.span
          animate={
            (isTarget || isContextEnd) && !reducedMotion ? { scale: [1, 1.06, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.45 }}
          className={cn(
            "rounded-xl border-[3px] px-2.5 py-2 text-base font-bold md:px-3 md:py-2.5 md:text-lg",
            isTarget
              ? "border-amber-400 bg-amber-500/35 text-white shadow-[0_0_16px_rgba(251,191,36,0.5)] ring-2 ring-amber-300/60"
              : isContextEnd
                ? "border-violet-400 bg-violet-500/20 text-violet-50 ring-2 ring-violet-400/50"
                : isPast || idx < posIdx
                  ? isPrompt
                    ? "border-gray-600 bg-gray-800/70 text-gray-300"
                    : "border-teal-600/50 bg-teal-950/40 text-teal-100"
                  : "border-gray-800 bg-gray-950/50 text-gray-600 opacity-45",
          )}
        >
          {token}
        </motion.span>
        <span
          className={cn("text-base font-bold md:text-lg", isPrompt ? "text-gray-500" : "text-emerald-400")}
          aria-hidden
        >
          {isPrompt ? "❌" : "✅"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="text-base font-bold uppercase tracking-wide text-gray-300 md:text-lg">
        Loss only on the answer
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-950/80 px-4 py-3 md:gap-3 md:px-5 md:py-4">
        <span className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-base font-bold text-gray-300 md:text-lg">
          {contextLabel}
        </span>
        <span className="text-xl font-bold text-gray-400 md:text-2xl" aria-hidden>
          →
        </span>
        <span className="rounded-xl border-[3px] border-amber-400 bg-amber-500/35 px-3 py-2 text-base font-bold text-white md:text-lg">
          {targetToken}
        </span>
        <span className="text-base text-gray-400 md:text-lg">next token</span>
      </div>

      <div className="flex items-end justify-between gap-4 md:gap-8">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <p className="text-base font-bold text-gray-400 md:text-lg">Prompt</p>
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {posIdx === 0 ? (
              <span className="mr-1 rounded-lg border border-violet-500/40 bg-violet-950/30 px-2 py-1.5 text-base font-bold text-violet-200 md:text-lg">
                Start
              </span>
            ) : null}
            {FULL_SEQUENCE.slice(0, RESPONSE_START_INDEX).map((token, idx) =>
              renderTokenChip(token, idx),
            )}
          </div>
        </div>

        <span className="shrink-0 pb-10 text-2xl font-bold text-gray-500 md:pb-12 md:text-3xl" aria-hidden>
          →
        </span>

        <div className="flex min-w-0 flex-col items-end gap-2">
          <p className="text-base font-bold text-teal-300 md:text-lg">Answer</p>
          <div className="flex flex-wrap justify-end gap-1.5 md:gap-2">
            {FULL_SEQUENCE.slice(RESPONSE_START_INDEX).map((token, idx) =>
              renderTokenChip(token, RESPONSE_START_INDEX + idx),
            )}
          </div>
        </div>
      </div>

      <p className="text-lg text-gray-300 md:text-xl">
        <span className="text-gray-500">❌</span> skipped &nbsp;·&nbsp;{" "}
        <span className="text-emerald-400">✅</span> counted
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={posIdx}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border-2 border-violet-500/35 bg-violet-950/20 px-4 py-3 md:px-5 md:py-4"
        >
          <p className="text-lg font-bold text-violet-100 md:text-xl">
            <span className="text-gray-300">{contextLabel}</span> → next token{" "}
            <span className="text-amber-200">&ldquo;{targetToken}&rdquo;</span> &nbsp;·&nbsp; Loss:{" "}
            {isResponseToken ? (
              <span className="text-emerald-400">counted</span>
            ) : (
              <span className="text-gray-400">skipped</span>
            )}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={posIdx === 0}
          onClick={() => {
            stopPlaying();
            setPosIdx((i) => Math.max(0, i - 1));
          }}
          className="rounded-xl border-2 border-gray-700 bg-gray-950 px-4 py-3 text-base font-bold text-gray-200 transition hover:border-gray-600 disabled:opacity-40 md:text-lg"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className={cn(
            "rounded-xl border-2 px-4 py-3 text-base font-bold transition md:text-lg",
            playing
              ? "border-gray-600 bg-gray-800 text-gray-100"
              : "border-rose-500/50 bg-rose-950/40 text-rose-100 hover:border-rose-400",
          )}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          disabled={posIdx >= FULL_SEQUENCE.length - 1}
          onClick={() => {
            stopPlaying();
            setPosIdx((i) => Math.min(FULL_SEQUENCE.length - 1, i + 1));
          }}
          className="rounded-xl border-2 border-violet-500/50 bg-violet-950/40 px-4 py-3 text-base font-bold text-violet-100 transition hover:border-violet-400 disabled:opacity-40 md:text-lg"
        >
          Next →
        </button>
        <span className="text-base text-gray-400 md:text-lg">
          {posIdx + 1} / {FULL_SEQUENCE.length}
        </span>
      </div>
    </div>
  );
}

function MaskedLossPanel() {
  const [lossTab, setLossTab] = useState<"zones" | "walkthrough">("zones");

  return (
    <div className="flex flex-1 flex-col">
      <LossSubTabs active={lossTab} onChange={setLossTab} />
      <AnimatePresence mode="wait">
        <motion.div
          key={lossTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col"
        >
          {lossTab === "zones" ? <LossZonesTab /> : <LossWalkthroughTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ResultPanel() {
  return (
    <div className="grid flex-1 gap-5 md:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border-2 border-gray-600 bg-gray-950/70 p-5 md:p-6">
        <p className="text-base font-bold uppercase tracking-wide text-gray-400 md:text-lg">Before SFT</p>
        <p className="mt-3 text-lg text-gray-200 md:text-xl">{PROMPT}</p>
        <p className="mt-4 text-lg text-rose-200 md:text-xl">→ {BAD_OUTPUT}</p>
        <p className="mt-3 text-xl font-bold text-rose-400 md:text-2xl">❌</p>
      </div>
      <div className="rounded-2xl border-2 border-teal-500/50 bg-teal-950/30 p-5 md:p-6">
        <p className="text-base font-bold uppercase tracking-wide text-teal-200 md:text-lg">After SFT</p>
        <p className="mt-3 text-lg text-teal-50 md:text-xl">{PROMPT}</p>
        <p className="mt-4 text-lg text-teal-100 md:text-xl">→ {GOOD_OUTPUT}</p>
        <p className="mt-3 text-xl font-bold text-emerald-400 md:text-2xl">✅</p>
      </div>
    </div>
  );
}

function StepVisual({ stepId }: { stepId: string }) {
  switch (stepId) {
    case "base":
      return <BaseModelPanel />;
    case "pairs":
      return <PairsPanel />;
    case "format":
      return <FormatPanel />;
    case "loop":
      return <LoopPanel />;
    case "mask":
      return <MaskedLossPanel />;
    case "result":
      return <ResultPanel />;
    default:
      return null;
  }
}

function StepPanel({ step }: { step: SftStep }) {
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="flex flex-1 flex-col space-y-5 md:space-y-6"
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

      <div className="flex min-h-[200px] flex-1 flex-col rounded-2xl border border-gray-700 bg-gray-950/80 p-5 md:min-h-[220px] md:p-6">
        <StepVisual stepId={step.id} />
      </div>
    </motion.div>
  );
}

export default function SupervisedFineTuningExplorer({
  title,
  caption,
  steps = DEFAULT_STEPS,
}: SupervisedFineTuningExplorerProps) {
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeStep = steps[activeIdx];

  function goPrev() {
    setActiveIdx((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setActiveIdx((i) => Math.min(steps.length - 1, i + 1));
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full flex-col rounded-2xl border border-gray-700 bg-gray-900 p-6 md:p-8"
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
        aria-label="Supervised fine-tuning steps"
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
          {activeStep ? <StepPanel key={activeStep.id} step={activeStep} /> : null}
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
