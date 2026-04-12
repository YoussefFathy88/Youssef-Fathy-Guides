"use client";

import { Fragment, useState } from "react";

const TEAL = "#1D9E75";
const AMBER = "#BA7517";

const DEFAULT_TOKENS = ["The", "capital", "of", "Egypt", "is", "Cairo"];

const DEFAULT_STEP_DESCRIPTIONS: string[] = [
  "Timestep 1: the previous hidden state h₀ (often a zero vector) enters the RNN together with the first word, The. The cell writes a new summary h₁ and emits scores ŷ₁ for what might come next.",
  "Timestep 2: h₁ is passed forward (orange arrow). The word capital is read in; the cell compresses it with everything already in h₁ into h₂, and emits ŷ₂.",
  "Timestep 3: h₂ carries the phrase so far; of updates it to h₃. Each step reuses the same weights — only the hidden vector and input word change.",
  "Timestep 4: Egypt is processed into h₄. Information from early words is not stored in separate slots; it is mixed into one vector that keeps getting overwritten.",
  "Timestep 5: is arrives; the hidden state becomes h₅. Recent tokens weigh heavily; anything about The or capital must still live inside this single bottleneck.",
  "Timestep 6: Cairo is processed into h₆. There is still no direct wire from The to Cairo — anything about the subject has to have survived every intermediate update.",
];

function Yhat({ n, muted }: { n: number; muted: boolean }) {
  return (
    <span
      className={`text-sm tabular-nums sm:text-base ${muted ? "text-gray-400 dark:text-gray-500" : "font-semibold text-violet-700 dark:text-violet-300"}`}
    >
      <span className="italic">y</span>
      <sup className="relative -top-[0.35em] text-[0.55em] leading-none">^</sup>
      <sub className="text-[0.65em]">{n}</sub>
    </span>
  );
}

export interface RNNUnrolledOverviewProps {
  title?: string;
  caption?: string;
  tokens?: string[];
  stepDescriptions?: string[];
}

export default function RNNUnrolledOverview({
  title = "RNN unrolled over time — one cell, reused every step",
  caption = "Use Prev / Next (or the dots) to move through timesteps. Each column is the same RNN logic: previous hidden state + current word → new hidden state + next-token scores.",
  tokens = DEFAULT_TOKENS,
  stepDescriptions = DEFAULT_STEP_DESCRIPTIONS,
}: RNNUnrolledOverviewProps) {
  const n = tokens.length;
  const [active, setActive] = useState(0);

  const desc =
    stepDescriptions[Math.min(active, Math.max(0, stepDescriptions.length - 1))] ?? "";

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          )}
          {caption && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          )}
        </div>
      )}

      <p className="mb-3 text-center text-[11px] text-gray-500 dark:text-gray-400">
        Click a step dot or use Next — the active column shows which word is being processed now; dashed lines are next-token predictions; orange arrows are hidden state passed along the chain.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white px-2 py-5 dark:border-gray-700 dark:bg-gray-900/60 sm:px-4">
        <div className="flex min-w-0 justify-center overflow-x-auto pb-2">
          <div className="flex min-w-max flex-row items-center">
            {/* h₀ before first column */}
            <div className="flex flex-col items-center pr-1 sm:pr-2">
              <div className="h-7 sm:h-8" />
              <div
                className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 px-1.5 py-1 dark:border-gray-600"
                style={{
                  opacity: active === 0 ? 1 : 0.35,
                  borderColor: active === 0 ? AMBER : undefined,
                }}
              >
                <span className="text-[9px] uppercase tracking-wide text-gray-400">start</span>
                <span
                  className="text-[11px] font-semibold tabular-nums sm:text-xs"
                  style={{ color: active === 0 ? AMBER : "#9ca3af" }}
                >
                  h₀
                </span>
              </div>
              <div className="h-7 sm:h-8" />
              <div className="h-8" />
            </div>
            <div
              className="flex items-center self-center pb-[4.5rem] text-lg sm:pb-[5rem]"
              style={{ color: active === 0 ? AMBER : "#d1d5db" }}
            >
              →
            </div>

            {tokens.map((tok, i) => (
              <Fragment key={`${tok}-${i}`}>
                <div className="flex flex-col items-center px-0.5 sm:px-1">
                  <div className="flex h-7 items-end justify-center sm:h-8">
                    <Yhat n={i + 1} muted={active !== i} />
                  </div>
                  <div
                    className="mb-0.5 h-4 w-px border-l border-dashed border-gray-400 dark:border-gray-500"
                    style={{ opacity: active === i ? 1 : 0.35 }}
                  />
                  <div
                    className={`w-[4.25rem] rounded-lg border-2 px-1 py-2 text-center text-[10px] font-semibold leading-tight transition-[opacity,border-color,background-color] duration-200 sm:w-[5.25rem] sm:text-[11px] ${
                      active === i
                        ? "border-teal-600 bg-teal-50 text-gray-900 dark:border-teal-500 dark:bg-teal-950/40 dark:text-gray-100"
                        : "border-gray-200 text-gray-600 opacity-45 dark:border-gray-600 dark:text-gray-400"
                    }`}
                    style={active === i ? { borderColor: TEAL } : undefined}
                  >
                    RNN step {i + 1}
                  </div>
                  <div
                    className="mt-0.5 h-4 w-px border-l border-dashed border-gray-400 dark:border-gray-500"
                    style={{
                      opacity: active === i ? 1 : 0.35,
                      borderColor: active === i ? TEAL : undefined,
                    }}
                  />
                  <div
                    className={`rounded-md px-2 py-1 text-center text-[11px] font-bold sm:text-xs ${
                      active === i
                        ? "bg-white text-gray-900 ring-2 ring-teal-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-teal-500"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {tok}
                  </div>
                </div>

                {i < n - 1 && (
                  <div
                    className="flex flex-col items-center justify-center self-center pb-[4.5rem] sm:pb-[5rem]"
                    style={{ color: active === i + 1 ? AMBER : "#d1d5db" }}
                  >
                    <span className="text-lg leading-none">→</span>
                    <span
                      className="mt-0.5 text-[10px] font-semibold tabular-nums"
                      style={{ color: active === i + 1 ? AMBER : "#9ca3af" }}
                    >
                      h<sub className="text-[0.85em]">{i + 1}</sub>
                    </span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => setActive((s) => Math.max(0, s - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => setActive((s) => Math.min(n - 1, s + 1))}
          >
            Next
          </button>
          <div className="flex gap-1.5">
            {tokens.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Timestep ${i + 1}`}
                onClick={() => setActive(i)}
                className="h-2.5 w-2.5 rounded-full transition-colors"
                style={{
                  backgroundColor: i === active ? TEAL : "#d1d5db",
                }}
              />
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{desc}</p>
      </div>
    </div>
  );
}
