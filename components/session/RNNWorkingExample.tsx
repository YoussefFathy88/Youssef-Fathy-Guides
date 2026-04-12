"use client";

import { useEffect, useState } from "react";

const TEAL = "#1D9E75";
const TEAL_FILL = "#E1F5EE";
const AMBER = "#BA7517";
const GRAY_BAR = "#888780";

const TABS = [
  { id: "read", label: "How the RNN reads it" },
  { id: "carry", label: "What h₇ carries" },
  { id: "out", label: "Next-token prediction" },
] as const;

/** Declarative sentence: autocompletion will target “Cairo” after “is”. */
const TOKENS = ["The", "capital", "of", "Egypt", "is", "Cairo", "."];

const SUB = "₀₁₂₃₄₅₆₇";

const STEP_COPY: { desc: string }[] = [
  {
    desc: `"The" enters. h${SUB[0]} = zero vector. The cell produces h${SUB[1]}. The hidden state now reflects the start of a noun phrase.`,
  },
  {
    desc: `"capital" + h${SUB[1]} → h${SUB[2]}. Here the word means a seat of government — not finance or typography.`,
  },
  {
    desc: `"of" + h${SUB[2]} → h${SUB[3]}. The model expects the place name next.`,
  },
  {
    desc: `Key anchor. "Egypt" + h${SUB[3]} → h${SUB[4]}. The state locks onto one country.`,
  },
  {
    desc: `"is" + h${SUB[4]} → h${SUB[5]}. A copula: the model now expects the city name that completes the sentence.`,
  },
  {
    desc: `Key anchor. "Cairo" + h${SUB[5]} → h${SUB[6]}. The city is named; the full fact has been read in.`,
  },
  {
    desc: `"." + h${SUB[6]} → h${SUB[7]}. Final hidden state after a short clause — still dominated by recent, relevant words.`,
  },
];

const SURVIVAL: { token: string; pct: number; tone: "amber" | "teal" | "gray" }[] = [
  { token: "The", pct: 3.2, tone: "gray" },
  { token: "capital", pct: 11, tone: "amber" },
  { token: "of", pct: 7.5, tone: "gray" },
  { token: "Egypt", pct: 26, tone: "amber" },
  { token: "is", pct: 16, tone: "gray" },
  { token: "Cairo", pct: 38, tone: "amber" },
  { token: ".", pct: 62, tone: "teal" },
];

const OUTPUT_STEPS: { token: string; prob: number; desc: string }[] = [
  {
    token: "Cairo",
    prob: 97,
    desc: "After the prefix The capital of Egypt is, the next token is almost always the city name. The hidden state still strongly encodes both the country and the capital-city reading — autocomplete locks onto Cairo.",
  },
  {
    token: ".",
    prob: 93,
    desc: "Once Cairo has been read in, a period is the natural way to end this declarative clause.",
  },
];

export interface RNNWorkingExampleProps {
  title?: string;
  caption?: string;
}

export default function RNNWorkingExample({ title, caption }: RNNWorkingExampleProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("read");
  const [activeStep, setActiveStep] = useState(0);
  const [outputStep, setOutputStep] = useState(0);
  const [barWidths, setBarWidths] = useState<number[]>(() => SURVIVAL.map(() => 0));
  const [carryCycle, setCarryCycle] = useState(0);

  useEffect(() => {
    if (tab !== "carry") return;
    setBarWidths(SURVIVAL.map(() => 0));
    const timers: ReturnType<typeof setTimeout>[] = [];
    SURVIVAL.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setBarWidths((prev) => {
            const next = [...prev];
            next[i] = SURVIVAL[i].pct;
            return next;
          });
        }, 80 * i),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [tab, carryCycle]);

  function handleTabChange(next: (typeof TABS)[number]["id"]) {
    setTab(next);
    if (next === "carry") setCarryCycle((c) => c + 1);
  }

  const tabActiveClass =
    "border-2 bg-[#E1F5EE] dark:bg-emerald-950/40";
  const tabIdleClass =
    "border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900/60";

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && (
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          )}
          {caption && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabChange(t.id)}
            className={[
              "rounded-lg px-3 py-2 text-xs font-medium transition-[border-color,background-color] duration-200",
              tab === t.id
                ? `${tabActiveClass} text-gray-900 dark:text-gray-100`
                : `${tabIdleClass} text-gray-600 hover:border-gray-400 dark:text-gray-300`,
            ].join(" ")}
            style={
              tab === t.id
                ? { borderColor: TEAL }
                : undefined
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
        {tab === "read" && (
          <div className="space-y-4">
            <p className="text-center text-base font-medium leading-relaxed text-gray-900 dark:text-gray-100">
              The capital of Egypt is Cairo.
            </p>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Same sentence as token chips below — step through each word.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {TOKENS.map((tok, i) => {
                const on = i === activeStep;
                return (
                  <span
                    key={tok + i}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium transition-[border-color,background-color] duration-200"
                    style={
                      on
                        ? {
                            border: `2px solid ${TEAL}`,
                            backgroundColor: TEAL_FILL,
                            color: "#0f172a",
                          }
                        : {
                            border: "2px solid transparent",
                            backgroundColor: "rgba(243,244,246,0.9)",
                            color: "#374151",
                          }
                    }
                  >
                    &quot;{tok}&quot;
                  </span>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setActiveStep((s) => Math.min(TOKENS.length - 1, s + 1))}
              >
                Next
              </button>
              <div className="flex gap-1.5">
                {TOKENS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Step ${i + 1}`}
                    onClick={() => setActiveStep(i)}
                    className="h-2.5 w-2.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === activeStep ? TEAL : "#d1d5db",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Hidden state: h{SUB[activeStep + 1]}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {STEP_COPY[activeStep]?.desc}
              </p>
            </div>
          </div>
        )}

        {tab === "carry" && (
          <div className="space-y-4">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              How much of each token’s influence survives into h₇ (after the final period), assuming ~60% retention per step.
            </p>
            <div className="space-y-3">
              {SURVIVAL.map((row, i) => {
                const color =
                  row.tone === "amber" ? AMBER : row.tone === "teal" ? TEAL : GRAY_BAR;
                return (
                  <div key={row.token} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {row.token}
                    </span>
                    <div className="relative h-6 min-w-0 flex-1 rounded bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded transition-[width] duration-[600ms] ease-out"
                        style={{
                          width: `${barWidths[i] ?? 0}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-gray-700 dark:text-gray-300">
                      {row.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Recent words dominate — but this clause is short, so “Egypt”, “is”, and especially “Cairo” still leave
              enough signal for the next-token head to pick <strong className="font-medium text-gray-700 dark:text-gray-300">Cairo</strong> right after <strong className="font-medium text-gray-700 dark:text-gray-300">is</strong>.
            </p>
          </div>
        )}

        {tab === "out" && (
          <div className="space-y-4">
            <p className="text-center text-xs font-medium text-gray-700 dark:text-gray-300">
              Where the next token is predicted
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-center text-sm text-gray-800 dark:text-gray-200">
              <span className="font-mono text-xs sm:text-sm">The capital of Egypt is</span>
              <span
                className="inline-flex min-w-[2rem] items-center justify-center rounded-md border-2 border-dashed border-violet-500 bg-violet-50 px-2 py-1 text-sm font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-200"
                title="Model predicts one token here"
              >
                ?
              </span>
              <span className="font-mono text-xs sm:text-sm">Cairo .</span>
            </p>
            <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
              The <span className="font-semibold text-gray-600 dark:text-gray-300">?</span> is not a real token — it
              marks the position <span className="font-medium">right after is</span>, where the model should output{" "}
              <span className="font-medium">Cairo</span>.
            </p>
            <div className="flex min-h-[120px] flex-wrap items-start justify-center gap-3">
              {OUTPUT_STEPS.map((row, i) => {
                const visible = i <= outputStep;
                const active = i === outputStep;
                return (
                  <div
                    key={row.token}
                    className="flex flex-col items-center gap-1 transition-opacity duration-300"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: active ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <span
                      className="rounded-lg px-3 py-2 text-sm font-semibold transition-transform duration-200"
                      style={{
                        backgroundColor: "#EEEDFE",
                        border: "2px solid #534AB7",
                        color: "#534AB7",
                      }}
                    >
                      {row.token}
                    </span>
                    {active && (
                      <span className="text-[11px] font-medium" style={{ color: TEAL }}>
                        {row.prob}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setOutputStep((s) => Math.max(0, s - 1))}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setOutputStep((s) => Math.min(OUTPUT_STEPS.length - 1, s + 1))}
              >
                Next
              </button>
              <div className="flex gap-1.5">
                {OUTPUT_STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Output step ${i + 1}`}
                    onClick={() => setOutputStep(i)}
                    className="h-2.5 w-2.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === outputStep ? TEAL : "#d1d5db",
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {OUTPUT_STEPS[outputStep]?.desc}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              The clause is short — Cairo is still strong in the hidden state — so autocomplete stays sensible. Add
              many more tokens after Cairo, and that signal can fade before a later prediction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
