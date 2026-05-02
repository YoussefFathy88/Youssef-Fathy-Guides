"use client";

import { useState } from "react";

type DemoPhase = "data-preparation" | "training" | "inference";

type RNNStep = {
  id: number;
  word: string;
  hiddenLabel: string;
  egyptRetention: number | null;
  caption: string;
  isFailure: boolean;
  prediction: string | null;
};

const WORDS = ["In", "Egypt", "there", "are", "pyramids", "and", "the", "capital", "city", "is"] as const;
const EXPECTED_CONTEXT_WORD = "Egypt";

const TRAINING_SEQUENCE = [
  "In",
  "Egypt",
  "there",
  "are",
  "pyramids",
  "and",
  "the",
  "capital",
  "city",
  "is",
] as const;

const STEPS: RNNStep[] = [
  {
    id: 1,
    word: "In",
    hiddenLabel: "h1",
    egyptRetention: null,
    caption: "The RNN starts reading tokens one by one and builds hidden state h_t over time.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 2,
    word: "Egypt",
    hiddenLabel: "h2",
    egyptRetention: 100,
    caption: "Egypt enters the hidden state strongly at this step.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 3,
    word: "there",
    hiddenLabel: "h3",
    egyptRetention: 72,
    caption: "Each new token updates hidden state and begins diluting older signals.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 4,
    word: "are",
    hiddenLabel: "h4",
    egyptRetention: 48,
    caption: "Egypt memory keeps decaying as newer words are integrated.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 5,
    word: "pyramids",
    hiddenLabel: "h5",
    egyptRetention: 28,
    caption: "State now prioritizes nearby context over older country signal.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 6,
    word: "and",
    hiddenLabel: "h6",
    egyptRetention: 12,
    caption: "Egypt is now weak in memory compared with recent tokens.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 7,
    word: "the",
    hiddenLabel: "h7",
    egyptRetention: 8,
    caption: "Vanishing-memory effect continues as sequence grows.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 8,
    word: "capital",
    hiddenLabel: "h8",
    egyptRetention: 5,
    caption: "By now, Egypt contributes only a tiny fraction of the state.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 9,
    word: "city",
    hiddenLabel: "h9",
    egyptRetention: 3,
    caption: "The hidden state is dominated by local words near prediction point.",
    isFailure: false,
    prediction: null,
  },
  {
    id: 10,
    word: "is",
    hiddenLabel: "h10",
    egyptRetention: 1,
    caption: "Failure moment: Egypt memory is too faded to influence the next token.",
    isFailure: true,
    prediction: "Paris",
  },
];

/** Illustrative % of “Egypt signal” inside hₜ after each word (same numbers as step.egyptRetention). */
function egyptShareAfterColumn(colIndex: number): number | null {
  const s = STEPS[colIndex];
  return s?.egyptRetention ?? null;
}

function egyptSegmentClass(pct: number): string {
  if (pct > 50) return "bg-amber-400";
  if (pct > 20) return "bg-amber-600";
  if (pct > 5) return "bg-rose-600";
  return "bg-rose-900";
}

export function RNNAutocompleteDemo() {
  const [phase, setPhase] = useState<DemoPhase>("data-preparation");
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const activePosition = step.id - 1;
  const trainingWord = TRAINING_SEQUENCE[trainingIndex];

  return (
    <section className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-100 sm:p-6">
      <header className="mb-4 space-y-1">
        <h3 className="text-base font-semibold text-zinc-100 sm:text-lg">
          🔄 Recurrent Network — Sequential Memory Autocomplete
        </h3>
        <p className="text-sm text-zinc-400">
          One vector hₜ is updated each step — early context (e.g. Egypt) competes with new words and fades.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPhase("data-preparation")}
          className={[
            "rounded-md border px-3 py-1.5 text-sm transition-all duration-300",
            phase === "data-preparation"
              ? "border-violet-500 bg-violet-950 text-violet-200"
              : "border-zinc-700 bg-zinc-900 text-zinc-300",
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
              ? "border-teal-500 bg-zinc-900 text-teal-300"
              : "border-zinc-700 bg-zinc-900 text-zinc-300",
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
              ? "border-rose-500 bg-zinc-900 text-rose-300"
              : "border-zinc-700 bg-zinc-900 text-zinc-300",
          ].join(" ")}
        >
          3) Inference
        </button>
      </div>

      {phase === "data-preparation" ? (
        <>
          <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="mb-3 text-sm text-zinc-300">
              Start from raw text, then convert it into sequential training targets for next-token prediction.
            </p>
            <div className="mb-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <p className="mb-2 text-xs text-zinc-500">Raw text (from books/articles):</p>
              <p className="font-mono text-sm text-zinc-200">
                In Egypt there are pyramids and the capital city is Cairo.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {TRAINING_SEQUENCE.slice(0, 6).map((token, idx) => (
                <div key={`rnn-prep-${idx}`} className="rounded-lg border border-zinc-800 bg-zinc-900 p-2">
                  <p className="mb-1 text-[10px] text-zinc-500">Step {idx + 1}</p>
                  <p className="font-mono text-xs text-zinc-300">
                    seen: {TRAINING_SEQUENCE.slice(0, idx + 1).join(" ")}
                  </p>
                  <p className="mt-1 text-xs text-teal-300">
                    next target: {TRAINING_SEQUENCE[idx + 1] ?? "Cairo"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPhase("training")}
            className="rounded-md border border-teal-500 bg-zinc-900 px-3 py-1.5 text-sm text-teal-300 transition-all duration-300"
          >
            Continue to training →
          </button>
        </>
      ) : phase === "training" ? (
        <>
          <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="mb-3 text-sm text-zinc-300">
              During training, the RNN reads tokens one by one and updates hidden state each step:
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {TRAINING_SEQUENCE.map((word, idx) => {
                const seen = idx <= trainingIndex;
                const active = idx === trainingIndex;
                return (
                  <span
                    key={`${word}-${idx}`}
                    className={[
                      "rounded px-2 py-1 text-sm font-mono transition-all duration-300",
                      seen ? "bg-zinc-800 text-zinc-200" : "bg-zinc-900 text-zinc-500",
                      active ? "border border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.25)]" : "",
                    ].join(" ")}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
            <div className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                Input at step t: current token x_t
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                State update: h_t = f(x_t, h_t-1)
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                Objective: predict next token at each step
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Current training step: <span className="font-mono text-teal-300">{trainingWord}</span> updates{" "}
              <span className="font-mono text-amber-300">{`h${trainingIndex + 1}`}</span>.
            </p>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTrainingIndex((prev) => Math.max(prev - 1, 0))}
                disabled={trainingIndex === 0}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setTrainingIndex((prev) => Math.min(prev + 1, TRAINING_SEQUENCE.length - 1))}
                disabled={trainingIndex === TRAINING_SEQUENCE.length - 1}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
            <p className="text-sm text-zinc-400">{`Training step ${trainingIndex + 1} of ${TRAINING_SEQUENCE.length}`}</p>
          </div>

          <button
            type="button"
            onClick={() => setPhase("inference")}
            className="rounded-md border border-rose-500 bg-zinc-900 px-3 py-1.5 text-sm text-rose-300 transition-all duration-300"
          >
            Continue to inference →
          </button>
        </>
      ) : (
        <>
      <div className="mb-4 rounded-xl border border-zinc-700 bg-zinc-900/80 p-3 text-sm text-zinc-300">
        <p className="font-medium text-zinc-200">Inference recap — RNN autocomplete</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          After each word, the same cell writes a new <span className="font-mono text-teal-400">hₜ</span>. Only that
          vector holds the past — so <span className="text-amber-300">Egypt</span> must survive inside{" "}
          <span className="font-mono text-teal-400">hₜ</span> while every later word also squeezes in. The bar below
          is an <span className="italic">illustrative</span> split: how much of the current state we still treat as
          &quot;Egypt signal&quot; vs everything else (newer words, syntax, etc.).
        </p>
      </div>

      <div className="mb-5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
        <div className="flex min-w-max items-start gap-3">
          {WORDS.map((word, idx) => {
            const processed = idx <= activePosition;
            const isActive = idx === activePosition;
            const share = egyptShareAfterColumn(idx);
            return (
              <div
                key={`${word}-${idx}`}
                className={[
                  "flex w-[5.25rem] flex-col items-center gap-1 rounded-lg p-2 transition-all duration-300",
                  processed ? "opacity-100" : "opacity-50",
                ].join(" ")}
              >
                <span className="font-mono text-xs text-zinc-200">{word}</span>
                <div
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded border-2 bg-zinc-900 text-xs text-teal-300 transition-all duration-300",
                    isActive
                      ? "border-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.4)]"
                      : "border-teal-700",
                  ].join(" ")}
                >
                  RNN
                </div>
                <span className="font-mono text-xs text-teal-400">{`h${idx + 1}`}</span>
                {processed ? (
                  <span
                    className={[
                      "text-center font-mono text-[10px] leading-tight transition-all duration-300",
                      share === null ? "text-zinc-600" : share > 20 ? "text-amber-300" : "text-rose-400",
                    ].join(" ")}
                  >
                    {share === null ? (
                      <>Egypt in h: —</>
                    ) : (
                      <>
                        Egypt
                        <br />→ {share}%
                      </>
                    )}
                  </span>
                ) : (
                  <span className="text-center font-mono text-[10px] text-zinc-600">…</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex min-w-max items-center gap-3 text-[10px] text-zinc-500">
          {WORDS.slice(0, WORDS.length - 1).map((_, idx) => (
            <span key={`arrow-${idx}`} className="inline-flex w-[5.25rem] justify-center">
              hₜ → hₜ₊₁
            </span>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-zinc-500">
          Numbers under each <span className="font-mono">h</span> = illustrative share of &quot;Egypt&quot; inside that
          hidden state after reading that word (decays as more tokens arrive).
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
        <p className="mb-1 text-sm font-medium text-zinc-200">Current hₜ — Egypt vs the rest (illustrative)</p>
        <p className="mb-3 text-xs text-zinc-500">
          After reading up to &quot;{step.word}&quot; ({step.hiddenLabel}). Bar width tracks the same Egypt% as the
          highlighted column above.
        </p>
        {(() => {
          const egyptPct = step.egyptRetention ?? 0;
          const restPct = Math.max(0, 100 - egyptPct);
          return (
            <div>
              <div className="flex h-8 w-full overflow-hidden rounded-lg border border-zinc-700">
                <div
                  className={`flex items-center justify-center border-r border-zinc-800/80 text-[10px] font-semibold text-zinc-950 transition-all duration-300 ${egyptSegmentClass(egyptPct)}`}
                  style={{ width: `${egyptPct}%` }}
                  title="Illustrative Egypt signal share"
                >
                  {egyptPct > 8 ? `${egyptPct}%` : ""}
                </div>
                <div
                  className="flex items-center justify-center bg-teal-700/90 text-[10px] font-medium text-teal-50 transition-all duration-300"
                  style={{ width: `${restPct}%` }}
                  title="Other factors in the same vector (recent words, patterns, etc.)"
                >
                  {restPct > 8 ? `${restPct}% other` : ""}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-zinc-400">
                <span>
                  <span className="inline-block h-2 w-2 rounded bg-amber-400 align-middle" /> Egypt in{" "}
                  <span className="font-mono">{step.hiddenLabel}</span>:{" "}
                  <span className="font-mono text-amber-200">{egyptPct}%</span>
                </span>
                <span>
                  <span className="inline-block h-2 w-2 rounded bg-teal-600 align-middle" /> Competing context:{" "}
                  <span className="font-mono text-teal-200">{restPct}%</span>
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      <div
        className={[
          "mb-4 rounded-xl border px-4 py-3 transition-all duration-300",
          step.isFailure
            ? "border-rose-500 bg-rose-950 text-rose-200"
            : "border-teal-700 bg-zinc-900 text-teal-300",
        ].join(" ")}
      >
        <p className="text-sm">{`Currently processing: "${step.word}" → ${step.hiddenLabel}`}</p>
        {step.prediction ? (
          <p className="mt-1 text-sm">
            Predicted next word: <span className="font-mono font-semibold">{step.prediction}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-400">Prediction is shown after the final word.</p>
        )}
        {step.isFailure ? (
          <>
            <p className="mt-2 text-sm">
              ❌ Vanishing Memory — &quot;{EXPECTED_CONTEXT_WORD}&quot; ({step.egyptRetention}% retained) is too faded to
              influence prediction.
            </p>
            <p className="mt-1 text-xs text-rose-300">
              Should have been &quot;Cairo&quot; given the Egypt context.
            </p>
            <p className="mt-1 text-xs text-rose-200">
              ⚠️ &quot;{EXPECTED_CONTEXT_WORD}&quot; retention: {step.egyptRetention}% — model has nearly forgotten your context.
            </p>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
            disabled={stepIndex === 0}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))}
            disabled={stepIndex === STEPS.length - 1}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
        <p className="text-sm text-zinc-400">{`Processing word ${step.id} of ${STEPS.length}`}</p>
      </div>

      <p className="mt-3 text-sm text-zinc-300">{step.caption}</p>
        </>
      )}
    </section>
  );
}

export default RNNAutocompleteDemo;
