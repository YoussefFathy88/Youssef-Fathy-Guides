"use client";

import { useMemo, useState } from "react";

type DemoPhase = "data-preparation" | "training" | "inference";

type FNNStep = {
  id: number;
  windowWords: [string, string, string];
  prediction: string;
  caption: string;
  isFailure: boolean;
  egyptInWindow: boolean;
};

const SENTENCE = ["In", "Egypt", "there", "are", "pyramids", "and", "the", "capital", "city", "is"] as const;
const WINDOW_SIZE = 3;
const EXPECTED_CONTEXT_WORD = "Egypt";

const TRAINING_EXAMPLES: Array<{
  window: [string, string, string];
  target: string;
}> = [
  { window: ["In", "Egypt", "there"], target: "are" },
  { window: ["Egypt", "there", "are"], target: "pyramids" },
  { window: ["there", "are", "pyramids"], target: "and" },
  { window: ["are", "pyramids", "and"], target: "the" },
  { window: ["pyramids", "and", "the"], target: "capital" },
  { window: ["and", "the", "capital"], target: "city" },
  { window: ["the", "capital", "city"], target: "is" },
  { window: ["capital", "city", "is"], target: "Cairo" },
];

const STEPS: FNNStep[] = [
  {
    id: 1,
    windowWords: ["In", "Egypt", "there"],
    prediction: "are",
    caption: "The model only sees the first 3 words, then predicts the next token.",
    isFailure: false,
    egyptInWindow: false,
  },
  {
    id: 2,
    windowWords: ["Egypt", "there", "are"],
    prediction: "pyramids",
    caption: "Sliding window moves right by one word and predicts again.",
    isFailure: false,
    egyptInWindow: false,
  },
  {
    id: 3,
    windowWords: ["there", "are", "pyramids"],
    prediction: "and",
    caption: "Egypt is now directly visible in the fixed input window.",
    isFailure: false,
    egyptInWindow: true,
  },
  {
    id: 4,
    windowWords: ["are", "pyramids", "and"],
    prediction: "the",
    caption: "Prediction uses only the current 3-word slice.",
    isFailure: false,
    egyptInWindow: true,
  },
  {
    id: 5,
    windowWords: ["pyramids", "and", "the"],
    prediction: "capital",
    caption: "Still good: the key context word Egypt remains inside the window.",
    isFailure: false,
    egyptInWindow: true,
  },
  {
    id: 6,
    windowWords: ["and", "the", "capital"],
    prediction: "city",
    caption: "Egypt is already outside the window, but local pattern completion still works.",
    isFailure: false,
    egyptInWindow: false,
  },
  {
    id: 7,
    windowWords: ["the", "capital", "city"],
    prediction: "Paris",
    caption:
      "Failure: with only local words in view, the model predicts a generic city instead of Egypt-specific context.",
    isFailure: true,
    egyptInWindow: false,
  },
];

const NETWORK_INPUT_X = 45;
const NETWORK_HIDDEN_X = 170;
const NETWORK_OUTPUT_X = 300;
const INPUT_Y = [35, 85, 135] as const;
const HIDDEN_Y = [35, 85, 135] as const;
const OUTPUT_Y = 85;

export function FNNAutocompleteDemo() {
  const [phase, setPhase] = useState<DemoPhase>("data-preparation");
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const windowStart = step.id - 1;
  const trainingExample = TRAINING_EXAMPLES[trainingIndex];

  const highlightedSlots = useMemo(
    () => [windowStart, windowStart + 1, windowStart + 2],
    [windowStart],
  );

  const egyptSlotValue = step.windowWords.includes("Egypt")
    ? "Egypt"
    : step.isFailure
      ? "❌ not available"
      : "—";

  return (
    <section className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-zinc-900 dark:text-zinc-100 sm:p-6">
      <header className="mb-4 space-y-1">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg">
          🧱 Feedforward Network — Fixed Window Autocomplete
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Window = 3 words</p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPhase("data-preparation")}
          className={[
            "rounded-md border px-3 py-1.5 text-sm transition-all duration-300",
            phase === "data-preparation"
              ? "border-violet-500 bg-violet-950 text-violet-800 dark:text-violet-200"
              : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300",
          ].join(" ")}
        >
          1) Data Preparation
        </button>
        <button
          type="button"
          onClick={() => setPhase("training")}
          className={[
            "rounded-md border px-3 py-1.5 text-sm transition-all duration-300",
            phase === "training"
              ? "border-amber-500 bg-amber-950 text-amber-800 dark:text-amber-200"
              : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300",
          ].join(" ")}
        >
          2) Training
        </button>
        <button
          type="button"
          onClick={() => setPhase("inference")}
          className={[
            "rounded-md border px-3 py-1.5 text-sm transition-all duration-300",
            phase === "inference"
              ? "border-teal-500 bg-gray-50 dark:bg-zinc-900 text-teal-700 dark:text-teal-300"
              : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300",
          ].join(" ")}
        >
          3) Inference
        </button>
      </div>

      {phase === "data-preparation" ? (
        <>
          <div className="mb-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/70 p-4">
            <p className="mb-3 text-sm text-zinc-700 dark:text-zinc-300">
              Start from raw text, then split it into fixed-size training pairs.
            </p>
            <div className="mb-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-3">
              <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-500">Raw text (from books/articles):</p>
              <p className="font-mono text-sm text-zinc-900 dark:text-zinc-200">
                In Egypt there are pyramids and the capital city is Cairo.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {TRAINING_EXAMPLES.slice(0, 4).map((example, idx) => (
                <div key={`prep-${idx}`} className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-2">
                  <p className="mb-1 text-[10px] text-zinc-600 dark:text-zinc-500">Pair {idx + 1}</p>
                  <div className="flex flex-wrap items-center gap-1">
                    {example.window.map((word, i) => (
                      <span
                        key={`prep-word-${idx}-${i}`}
                        className="rounded border border-amber-500 bg-amber-950 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:text-amber-200"
                      >
                        {word}
                      </span>
                    ))}
                    <span className="text-zinc-600 dark:text-zinc-500">→</span>
                    <span className="rounded border border-teal-500 bg-gray-50 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-teal-700 dark:text-teal-300">
                      {example.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPhase("training")}
            className="rounded-md border border-amber-500 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-amber-800 dark:text-amber-200 transition-all duration-300"
          >
            Continue to training →
          </button>
        </>
      ) : phase === "training" ? (
        <>
          <div className="mb-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/70 p-4">
            <p className="mb-3 text-sm text-zinc-700 dark:text-zinc-300">
              The model trains on many <span className="font-mono text-amber-700 dark:text-amber-300">3-word windows</span> and learns to
              predict the next token.
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {trainingExample.window.map((word, idx) => (
                <span
                  key={`train-window-${word}-${idx}`}
                  className="rounded border border-amber-500 bg-amber-950 px-2 py-1 font-mono text-sm text-amber-800 dark:text-amber-200"
                >
                  {word}
                </span>
              ))}
              <span className="text-zinc-600 dark:text-zinc-500">→</span>
              <span className="rounded border border-teal-500 bg-gray-50 dark:bg-zinc-900 px-2 py-1 font-mono text-sm text-teal-700 dark:text-teal-300">
                {trainingExample.target}
              </span>
            </div>
            <div className="grid gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-3 py-2">
                Input: fixed 3 words
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-3 py-2">
                Objective: next-token accuracy
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-3 py-2">
                Limitation: no memory outside window
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-zinc-800 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTrainingIndex((prev) => Math.max(prev - 1, 0))}
                disabled={trainingIndex === 0}
                className="rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() =>
                  setTrainingIndex((prev) => Math.min(prev + 1, TRAINING_EXAMPLES.length - 1))
                }
                disabled={trainingIndex === TRAINING_EXAMPLES.length - 1}
                className="rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{`Training pair ${trainingIndex + 1} of ${TRAINING_EXAMPLES.length}`}</p>
          </div>

          <button
            type="button"
            onClick={() => setPhase("inference")}
            className="rounded-md border border-teal-500 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-teal-700 dark:text-teal-300 transition-all duration-300"
          >
            Continue to inference →
          </button>
        </>
      ) : (
        <>
      <div className="mb-5 overflow-x-auto">
        <div className="inline-flex min-w-max flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded border border-amber-400/60 bg-amber-950/70 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200">
              Window
            </span>
            <span className="text-amber-700 dark:text-amber-300">↓</span>
          </div>
          <div className="flex items-center gap-2">
            {SENTENCE.map((word, idx) => {
              const inWindow = highlightedSlots.includes(idx);
              const passedWindow = idx < windowStart;
              return (
                <span
                  key={`${word}-${idx}`}
                  className={[
                    "font-mono rounded px-2 py-1 text-sm transition-all duration-300",
                    inWindow
                      ? "border border-amber-400 bg-amber-950 text-amber-800 dark:text-amber-100"
                      : "bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
                    passedWindow ? "opacity-40" : "opacity-100",
                  ].join(" ")}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/70 p-3 sm:grid-cols-3">
        {step.windowWords.map((word, idx) => (
          <div key={`slot-${idx}`} className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-3 py-2">
            <p className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">{`Word -${3 - idx}`}</p>
            <p className="font-mono text-teal-700 dark:text-teal-300 transition-all duration-300">{word}</p>
          </div>
        ))}
        <div className="sm:col-span-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-3 py-2">
          <p className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Egypt context slot</p>
          <p
            className={[
              "font-mono transition-all duration-300",
              step.windowWords.includes("Egypt") ? "text-amber-700 dark:text-amber-300" : "text-zinc-600 dark:text-zinc-500",
            ].join(" ")}
          >
            {egyptSlotValue}
          </p>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/70 p-3">
        <svg viewBox="0 0 340 170" className="h-44 min-w-[340px] w-full text-zinc-700 dark:text-zinc-300">
          {INPUT_Y.flatMap((inputY) =>
            HIDDEN_Y.map((hiddenY) => (
              <line
                key={`i-${inputY}-h-${hiddenY}`}
                x1={NETWORK_INPUT_X}
                y1={inputY}
                x2={NETWORK_HIDDEN_X}
                y2={hiddenY}
                className="stroke-zinc-700 transition-all duration-300"
                strokeWidth="1.3"
              />
            )),
          )}
          {HIDDEN_Y.map((hiddenY) => (
            <line
              key={`h-${hiddenY}-o`}
              x1={NETWORK_HIDDEN_X}
              y1={hiddenY}
              x2={NETWORK_OUTPUT_X}
              y2={OUTPUT_Y}
              className={[
                "stroke-zinc-700 transition-all duration-300",
                step.isFailure ? "opacity-60" : "opacity-100",
              ].join(" ")}
              strokeWidth="1.5"
            />
          ))}

          {INPUT_Y.map((y, i) => (
            <g key={`input-node-${y}`}>
              <circle
                cx={NETWORK_INPUT_X}
                cy={y}
                r="13"
                className="fill-zinc-900 stroke-zinc-500 transition-all duration-300"
                strokeWidth="2"
              />
              <text x={NETWORK_INPUT_X} y={y + 4} textAnchor="middle" className="fill-zinc-300 text-[10px]">
                {`x${i + 1}`}
              </text>
            </g>
          ))}
          {HIDDEN_Y.map((y, i) => (
            <g key={`hidden-node-${y}`}>
              <circle
                cx={NETWORK_HIDDEN_X}
                cy={y}
                r="13"
                className="fill-zinc-900 stroke-teal-600 transition-all duration-300"
                strokeWidth="2"
              />
              <text x={NETWORK_HIDDEN_X} y={y + 4} textAnchor="middle" className="fill-teal-300 text-[10px]">
                {`h${i + 1}`}
              </text>
            </g>
          ))}
          <g>
            <circle
              cx={NETWORK_OUTPUT_X}
              cy={OUTPUT_Y}
              r="16"
              className={[
                "transition-all duration-300",
                step.isFailure ? "fill-rose-950 stroke-rose-500" : "fill-zinc-900 stroke-teal-400",
              ].join(" ")}
              strokeWidth="2"
            />
            <text x={NETWORK_OUTPUT_X} y={OUTPUT_Y + 4} textAnchor="middle" className="fill-zinc-100 text-[10px]">
              y
            </text>
          </g>

          <text x={40} y={160} className="fill-zinc-500 text-[10px]">
            Input
          </text>
          <text x={160} y={160} className="fill-zinc-500 text-[10px]">
            Hidden
          </text>
          <text x={286} y={160} className="fill-zinc-500 text-[10px]">
            Output
          </text>
          <text
            x={205}
            y={18}
            className={[
              "text-[10px]",
              step.isFailure ? "fill-rose-300" : "fill-teal-300",
              "transition-all duration-300",
            ].join(" ")}
          >
            → signal flow
          </text>
        </svg>
      </div>

      <div
        className={[
          "mb-4 rounded-xl border px-4 py-3 transition-all duration-300",
          step.isFailure
            ? "border-rose-500 bg-rose-950 text-rose-800 dark:text-rose-200"
            : "border-teal-500/70 bg-gray-50 dark:bg-zinc-900 text-teal-700 dark:text-teal-300",
        ].join(" ")}
      >
        <p className="text-sm">
          Predicted next word: <span className="font-mono font-semibold">{step.prediction}</span>
        </p>
        {step.isFailure ? (
          <p className="mt-2 text-sm">
            ❌ &quot;{EXPECTED_CONTEXT_WORD}&quot; is outside the window — prediction ignores your context.
          </p>
        ) : null}
        {step.isFailure ? (
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
            The word &quot;{EXPECTED_CONTEXT_WORD}&quot; is no longer in the fixed window. The model has no memory of it.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-zinc-800 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
            disabled={stepIndex === 0}
            className="rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))}
            disabled={stepIndex === STEPS.length - 1}
            className="rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{`Step ${step.id} of ${STEPS.length}`}</p>
      </div>

      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{step.caption}</p>
        </>
      )}
    </section>
  );
}

export default FNNAutocompleteDemo;
