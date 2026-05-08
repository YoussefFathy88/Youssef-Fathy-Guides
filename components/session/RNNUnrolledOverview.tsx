"use client";

import { Fragment, useState } from "react";

const TEAL = "#1D9E75";
const AMBER = "#BA7517";

/** Prefix tokens only — the first predicted word after the sequence is `terminalNextToken` (default Cairo). */
const DEFAULT_TOKENS = ["The", "capital", "of", "Egypt", "is"];

/** Gallery / teaching builds can pass full strings; sessions default to animation-only (empty). */
const DEFAULT_STEP_DESCRIPTIONS: string[] = [];

/** Intermediate columns: prediction head exists but is not the teaching focus — hidden state h carries context. */
function IntermediateYHat({ step, muted }: { step: number; muted: boolean }) {
  return (
    <span
      className={`text-sm tabular-nums sm:text-base ${muted ? "text-gray-400 dark:text-gray-500" : "font-semibold text-violet-700 dark:text-violet-300"}`}
      title="Intermediate next-token head — details omitted; focus on hidden state flow."
    >
      <span className="italic">y</span>
      <sup className="relative -top-[0.35em] text-[0.55em] leading-none">^</sup>
      <sub className="text-[0.65em]">{step}</sub>
    </span>
  );
}

function FinalPredictionToken({ label, muted }: { label: string; muted: boolean }) {
  return (
    <span
      className={`max-w-[6rem] truncate font-mono text-sm tabular-nums sm:max-w-[7rem] sm:text-base ${
        muted ? "text-gray-400 dark:text-gray-500" : "font-semibold text-violet-700 dark:text-violet-300"
      }`}
      title={`Target prediction: ${label}`}
    >
      {label}
    </span>
  );
}

export interface RNNUnrolledOverviewProps {
  title?: string;
  caption?: string;
  tokens?: string[];
  /** Shown as the predicted next token on the last visible column (instead of ⟨end⟩). */
  terminalNextToken?: string;
  stepDescriptions?: string[];
  initialActiveStep?: number;
  lockToStep?: boolean;
}

export default function RNNUnrolledOverview({
  title = "RNN unrolled over time — one cell, reused every step",
  caption = "",
  tokens = DEFAULT_TOKENS,
  terminalNextToken,
  stepDescriptions = DEFAULT_STEP_DESCRIPTIONS,
  initialActiveStep = 0,
  lockToStep = false,
}: RNNUnrolledOverviewProps) {
  const n = tokens.length;
  const safeInitial = Math.max(0, Math.min(n - 1, initialActiveStep));
  const [active, setActive] = useState(safeInitial);

  const desc =
    stepDescriptions[Math.min(active, Math.max(0, stepDescriptions.length - 1))] ?? "";
  const showHints = Boolean(caption) || stepDescriptions.length > 0;
  const eosLabel = (() => {
    if (terminalNextToken !== undefined) {
      return terminalNextToken === "" ? "⟨end⟩" : terminalNextToken;
    }
    const isDefaultSentence =
      tokens.length === DEFAULT_TOKENS.length && tokens.every((t, i) => t === DEFAULT_TOKENS[i]);
    return isDefaultSentence ? "Cairo" : "⟨end⟩";
  })();
  const onFinalColumn = active === n - 1;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          )}
          {caption && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          )}
        </div>
      )}

      {showHints ? (
        <p className="mb-3 text-center text-[11px] text-gray-500 dark:text-gray-400">
          Click a step dot or use Next — the active column shows which word is being processed now. Intermediate heads
          ŷ₁…ŷₙ₋₁ are abbreviated; only the last column shows the concrete target (e.g. Cairo). Orange arrows are hidden
          state h flowing forward — that is what accumulates context step by step.
        </p>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white px-2 py-5 dark:border-gray-700 dark:bg-gray-900/60 sm:px-4">
        <div className="flex min-w-0 justify-center overflow-x-auto pb-2">
          <div className="flex min-w-max flex-row items-center">
            {/* h₀ before first column */}
            <div className="flex flex-col items-center pr-1 sm:pr-2">
              <div className="h-7 sm:h-8" />
              <div
                className="flex min-h-[3.5rem] min-w-[4.5rem] flex-col items-center justify-center rounded-md border border-dashed border-gray-300 px-2 py-1.5 dark:border-gray-600"
                style={{
                  opacity: active === 0 ? 1 : 0.35,
                  borderColor: active === 0 ? AMBER : undefined,
                }}
              >
                <span className="text-xs uppercase tracking-wide text-gray-400">start</span>
                <span
                  className="text-sm font-semibold tabular-nums"
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

            {tokens.map((tok, i) => {
              const isLastColumn = i === n - 1;
              return (
              <Fragment key={`${tok}-${i}`}>
                <div className="flex flex-col items-center px-0.5 sm:px-1">
                  <div className="flex h-7 items-end justify-center sm:h-8">
                    {isLastColumn ? (
                      <FinalPredictionToken label={eosLabel} muted={active !== i} />
                    ) : (
                      <IntermediateYHat step={i + 1} muted={active !== i} />
                    )}
                  </div>
                  <div
                    className="mb-0.5 h-4 w-px border-l border-dashed border-gray-400 dark:border-gray-500"
                    style={{ opacity: active === i ? 1 : 0.45 }}
                  />
                  <div
                    className={`w-24 rounded-lg border-2 px-1 py-2 text-center text-xs font-semibold leading-tight transition-[opacity,border-color,background-color] duration-200 sm:w-28 sm:text-sm ${
                      active === i
                        ? "border-teal-600 bg-teal-50 text-gray-900 dark:border-teal-500 dark:bg-teal-950/40 dark:text-gray-100"
                        : "border-gray-200 text-gray-600 opacity-70 dark:border-gray-600 dark:text-gray-400"
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
                    className={`min-w-[4.5rem] rounded-md px-2 py-1.5 text-center text-sm font-bold sm:min-w-[5.5rem] sm:text-base ${
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
                      className="mt-0.5 text-xs font-semibold tabular-nums"
                      style={{ color: active === i + 1 ? AMBER : "#9ca3af" }}
                    >
                      h<sub className="text-[0.85em]">{i + 1}</sub>
                    </span>
                  </div>
                )}
              </Fragment>
            );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
          <span className="font-semibold">Current timestep:</span>{" "}
          {`x${active + 1}="${tokens[active]}" enters the cell, combines with `}
          <span className="font-mono">{active === 0 ? "h0" : `h${active}`}</span>, and outputs{" "}
          <span className="font-mono">{`h${active + 1}`}</span>.
        </div>
        <div className="mt-2 rounded-lg border border-violet-200/80 bg-violet-50/70 px-3 py-2 text-sm text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/20 dark:text-violet-200">
          {onFinalColumn ? (
            <>
              <span className="font-semibold">Target next token (after full prefix):</span>{" "}
              <span className="font-mono">{`"${eosLabel}"`}</span>
            </>
          ) : (
            <>
              <span className="font-semibold">At this step:</span> intermediate head{" "}
              <span className="font-mono">{`ŷ${active + 1}`}</span> — not the focus here.{" "}
              <span className="text-violet-800/90 dark:text-violet-300/90">
                What matters is how hidden state <span className="font-mono">h</span> is updated and passed forward.
              </span>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => {
              if (lockToStep) return;
              setActive((s) => Math.max(0, s - 1));
            }}
            disabled={lockToStep}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => {
              if (lockToStep) return;
              setActive((s) => Math.min(n - 1, s + 1));
            }}
            disabled={lockToStep}
          >
            Next
          </button>
          <div className="flex gap-1.5">
            {tokens.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Timestep ${i + 1}`}
                onClick={() => {
                  if (lockToStep) return;
                  setActive(i);
                }}
                className="h-2.5 w-2.5 rounded-full transition-colors"
                disabled={lockToStep}
                style={{
                  backgroundColor: i === active ? TEAL : "#d1d5db",
                }}
              />
            ))}
          </div>
        </div>

        {desc ? (
          <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{desc}</p>
        ) : null}
      </div>
    </div>
  );
}
