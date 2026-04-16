"use client";

import { useEffect, useState } from "react";

const TEAL = "#1D9E75";
const TEAL_FILL = "#E1F5EE";
const AMBER = "#BA7517";
const GRAY_BAR = "#888780";

const TABS = [
  { id: "read", label: "How the RNN reads it" },
  { id: "carry", label: "Influence in h₅" },
  { id: "out", label: "Next-token prediction" },
] as const;

/** Index of "is" — default view: h₅ is live, next emitted token should be the city. */
const DEFAULT_READ_STEP = 4;

/** Declarative sentence: autocompletion targets “Cairo” after “is”. */
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

/**
 * Illustrative composition of h₅ — after reading through `is`, before Cairo.
 * Rows are **newest → oldest**; weights **strictly decrease** with distance in time (vanilla RNN sketch:
 * recent inputs dominate, earlier words fade — unlike attention, there is no direct skip back).
 * Sum 100 before normalization (no drift).
 */
const H5_COMPOSITION_RAW: { token: string; weight: number; tone: "amber" | "teal" | "gray" }[] = [
  { token: "is", weight: 38, tone: "teal" },
  { token: "Egypt", weight: 26, tone: "amber" },
  { token: "of", weight: 18, tone: "gray" },
  { token: "capital", weight: 12, tone: "gray" },
  { token: "The", weight: 6, tone: "gray" },
];

function normalizeWeightsToPercent(
  rows: { token: string; weight: number; tone: "amber" | "teal" | "gray" }[],
): { token: string; pct: number; tone: "amber" | "teal" | "gray" }[] {
  const sumW = rows.reduce((a, r) => a + r.weight, 0);
  const scaled = rows.map((r) => (r.weight / sumW) * 100);
  const rounded = scaled.map((v) => Math.round(v * 10) / 10);
  const drift = Math.round((100 - rounded.reduce((a, b) => a + b, 0)) * 10) / 10;
  if (drift !== 0 && rounded.length > 0) {
    rounded[rounded.length - 1] = Math.round((rounded[rounded.length - 1]! + drift) * 10) / 10;
  }
  return rows.map((r, i) => ({ token: r.token, pct: rounded[i]!, tone: r.tone }));
}

const H5_COMPOSITION = normalizeWeightsToPercent(H5_COMPOSITION_RAW);

/** Illustrative P(next token) after consuming through `… is` (not observed yet). */
const NEXT_AFTER_IS: { token: string; prob: number }[] = [
  { token: "Cairo", prob: 97 },
  { token: "Alexandria", prob: 2 },
  { token: "Giza", prob: 0.5 },
  { token: "Luxor", prob: 0.3 },
  { token: "the", prob: 0.2 },
];

/** Illustrative P(next token) after `Cairo` is in context. */
const NEXT_AFTER_CAIRO: { token: string; prob: number }[] = [
  { token: ".", prob: 93 },
  { token: ",", prob: 4 },
  { token: " and", prob: 2 },
  { token: " (!", prob: 1 },
];

const OUTPUT_SLOTS: {
  id: string;
  title: string;
  prefixMono: string;
  hint: string;
  candidates: { token: string; prob: number }[];
  desc: string;
}[] = [
  {
    id: "after-is",
    title: "Slot 1 — right after “is”",
    prefixMono: "The capital of Egypt is",
    hint: "The model emits exactly one token here. Nothing after the slot has been read yet.",
    candidates: NEXT_AFTER_IS,
    desc: "After the prefix The capital of Egypt is, the next token is almost always the city name. The hidden state still strongly encodes both the country and the capital-city reading — autocomplete locks onto Cairo.",
  },
  {
    id: "after-cairo",
    title: "Slot 2 — right after “Cairo”",
    prefixMono: "The capital of Egypt is Cairo",
    hint: "A different timestep: Cairo is already in the hidden state; the head now chooses how the clause ends.",
    candidates: NEXT_AFTER_CAIRO,
    desc: "Once Cairo has been read in, a period is the natural way to end this declarative clause.",
  },
];

export interface RNNWorkingExampleProps {
  title?: string;
  caption?: string;
}

function barColorForNextToken(token: string, slotIndex: number): string {
  if (slotIndex === 0 && token === "Cairo") return TEAL;
  if (slotIndex === 1 && token === ".") return TEAL;
  return GRAY_BAR;
}

export default function RNNWorkingExample({ title, caption }: RNNWorkingExampleProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("read");
  const [activeStep, setActiveStep] = useState(DEFAULT_READ_STEP);
  const [outputStep, setOutputStep] = useState(0);
  const [barWidths, setBarWidths] = useState<number[]>(() => H5_COMPOSITION.map(() => 0));
  const [carryCycle, setCarryCycle] = useState(0);

  const slot = OUTPUT_SLOTS[outputStep] ?? OUTPUT_SLOTS[0]!;

  const [nextWidths, setNextWidths] = useState<number[]>(() => slot.candidates.map(() => 0));
  const [nextAnimCycle, setNextAnimCycle] = useState(0);

  useEffect(() => {
    if (tab !== "carry") return;
    setBarWidths(H5_COMPOSITION.map(() => 0));
    const timers: ReturnType<typeof setTimeout>[] = [];
    H5_COMPOSITION.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setBarWidths((prev) => {
            const next = [...prev];
            next[i] = H5_COMPOSITION[i]!.pct;
            return next;
          });
        }, 80 * i),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [tab, carryCycle]);

  useEffect(() => {
    if (tab !== "out") return;
    setNextWidths(slot.candidates.map(() => 0));
    const timers: ReturnType<typeof setTimeout>[] = [];
    slot.candidates.forEach((row, i) => {
      timers.push(
        setTimeout(() => {
          setNextWidths((prev) => {
            const next = [...prev];
            next[i] = row.prob;
            return next;
          });
        }, 70 * i),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [tab, slot, nextAnimCycle]);

  function handleTabChange(next: (typeof TABS)[number]["id"]) {
    setTab(next);
    if (next === "carry") setCarryCycle((c) => c + 1);
    if (next === "out") setNextAnimCycle((c) => c + 1);
  }

  function handleOutputStepChange(i: number) {
    const nextSlot = OUTPUT_SLOTS[i] ?? OUTPUT_SLOTS[0]!;
    setOutputStep(i);
    setNextWidths(nextSlot.candidates.map(() => 0));
    if (tab === "out") setNextAnimCycle((c) => c + 1);
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
              Each chip is the word consumed at that step; the panel shows{" "}
              <span className="font-mono text-[11px]">hₜ</span> right after.               For an illustrative <span className="font-medium">recency</span> mix in{" "}
              <span className="font-mono text-[11px]">h₅</span> (newest token at top) at the same moment as{" "}
              <span className="font-medium">“is”</span>, open{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">Influence in h₅</span>. For{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">P(next token)</span> after{" "}
              <span className="font-mono text-[11px]">… Egypt is</span>, open{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">Next-token prediction</span>.
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
            <p className="text-center text-xs font-medium text-gray-600 dark:text-gray-300">
              Composition of h₅ (after reading … is)
            </p>
            <p className="text-center text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              Same moment as the default chip on <span className="font-medium text-gray-600 dark:text-gray-300">“is”</span>
              : Cairo has <span className="font-medium">not</span> been read in yet. Rows run{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">newest → oldest</span>; each step further
              back carries <span className="font-medium">less</span> illustrative weight (recency decay in a compact
              state). This is <span className="font-medium">not</span>{" "}
              <span className="font-mono text-[10px]">P(next token)</span> (see the next tab). Percents sum to 100%.
            </p>
            <div className="space-y-3">
              {H5_COMPOSITION.map((row, i) => {
                const color =
                  row.tone === "amber" ? AMBER : row.tone === "teal" ? TEAL : GRAY_BAR;
                return (
                  <div key={row.token} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">
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
              The latest word (<strong className="font-medium text-gray-700 dark:text-gray-300">is</strong>) leaves the
              strongest fingerprint; each hop backward is weaker. Older cues (e.g.{" "}
              <strong className="font-medium text-gray-700 dark:text-gray-300">Egypt</strong>,{" "}
              <strong className="font-medium text-gray-700 dark:text-gray-300">capital</strong>) can still matter, but
              only if they survive the chain — here the clause is short, so{" "}
              <span className="font-mono text-[11px]">h₅</span> still supports putting most mass on{" "}
              <strong className="font-medium text-gray-700 dark:text-gray-300">Cairo</strong>.
            </p>
          </div>
        )}

        {tab === "out" && (
          <div className="space-y-4">
            <p className="text-center text-xs font-semibold text-gray-800 dark:text-gray-200">{slot.title}</p>
            <p className="text-center text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">{slot.hint}</p>

            <div className="flex flex-col items-center gap-2 rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-3 dark:border-violet-900/50 dark:bg-violet-950/20">
              <p className="text-center text-sm text-gray-800 dark:text-gray-200">
                <span className="font-mono text-xs sm:text-sm">{slot.prefixMono}</span>{" "}
                <span
                  className="inline-flex min-w-[2rem] items-center justify-center rounded-md border-2 border-dashed border-violet-500 bg-white px-2 py-1 text-sm font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-200"
                  title="Model predicts one token here"
                >
                  ?
                </span>
              </p>
              <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-600 dark:text-gray-300">?</span> = one missing token at this
                position (ground truth for this lesson:{" "}
                {outputStep === 0 ? (
                  <span className="font-medium text-gray-700 dark:text-gray-200">Cairo</span>
                ) : (
                  <span className="font-medium text-gray-700 dark:text-gray-200">.</span>
                )}
                ).
              </p>
            </div>

            <div>
              <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                P(next token) — illustrative
              </p>
              <div className="space-y-2.5">
                {slot.candidates.map((row, i) => {
                  const w = nextWidths[i] ?? 0;
                  const fill = barColorForNextToken(row.token, outputStep);
                  return (
                    <div key={row.token + i} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <span className="font-mono">&quot;{row.token}&quot;</span>
                      </span>
                      <div className="relative h-6 min-w-0 flex-1 rounded bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded transition-[width] duration-[500ms] ease-out"
                          style={{
                            width: `${w}%`,
                            backgroundColor: fill,
                          }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-gray-700 dark:text-gray-300">
                        {row.prob}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => handleOutputStepChange(Math.max(0, outputStep - 1))}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => handleOutputStepChange(Math.min(OUTPUT_SLOTS.length - 1, outputStep + 1))}
              >
                Next
              </button>
              <div className="flex gap-1.5">
                {OUTPUT_SLOTS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Prediction slot ${i + 1}`}
                    onClick={() => handleOutputStepChange(i)}
                    className="h-2.5 w-2.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === outputStep ? TEAL : "#d1d5db",
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{slot.desc}</p>

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
