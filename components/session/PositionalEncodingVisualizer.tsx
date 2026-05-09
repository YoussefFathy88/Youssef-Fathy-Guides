"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: "order", label: "Order" },
  { id: "wave", label: "Position signal" },
  { id: "add", label: "Meaning + position" },
] as const;

/** Vaswani sinusoidal PE: PE(pos,2i)=sin(·), PE(pos,2i+1)=cos(·) with angle pos / 10000^(2i/d_model). */
export function sinusoidalPe(pos: number, dim: number, dModel: number): number {
  if (dModel < 2 || dim < 0 || dim >= dModel) return 0;
  const pairIndex = Math.floor(dim / 2);
  const angle = pos / Math.pow(10000, (2 * pairIndex) / dModel);
  return dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}

export function peVector(pos: number, dModel: number): number[] {
  return Array.from({ length: dModel }, (_, d) => sinusoidalPe(pos, d, dModel));
}

export interface PositionalEncodingVisualizerProps {
  title?: string;
  caption?: string;
  /** Token row for demos (length ≥ 3). */
  tokens?: string[];
  /** Model width for PE (even, ≥ 4). Display-only — keep small for readability. */
  dModel?: number;
  /** Number of PE dimensions to show in the numeric table (≤ dModel). */
  tableDims?: number;
  /** Initial step index 0–2. */
  initialStep?: number;
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
}

const DEFAULT_TOKENS = ["dog", "bites", "man"];

function clampEvenDModel(n: number): number {
  const x = Math.min(32, Math.max(4, Math.round(n)));
  return x % 2 === 0 ? x : x + 1;
}

/** Swap indices floor(n/2)-1 and floor(n/2) when n ≥ 3 (adjacent pair left of center for odd n). */
function swapMiddleAdjacent(tokens: string[], swapped: boolean): string[] {
  if (!swapped) return tokens;
  const copy = [...tokens];
  const n = copy.length;
  const j = Math.floor(n / 2);
  const i = j - 1;
  if (i >= 0 && j < n) {
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Deterministic mock embedding (same spirit as EmbeddingVectorsTable) for sum demo. */
function mockEmbeddingComponent(token: string, pos: number, dim: number, dModel: number): number {
  let h = pos * 10007 + dim * 911382323;
  for (let c = 0; c < token.length; c++) {
    h = Math.imul(h ^ token.charCodeAt(c), 2654435761);
  }
  const u = ((h >>> 0) % 20000) / 10000 - 1;
  return Math.round(u * (0.85 + (dim % 3) * 0.05) * 100) / 100;
}

export default function PositionalEncodingVisualizer({
  title = "Why positional encoding exists",
  caption = "Step through: order matters, sinusoidal values per position, then add to the embedding.",
  tokens: tokensProp,
  dModel: dModelProp,
  tableDims: tableDimsProp,
  initialStep = 0,
  autoPlay = false,
  autoPlayIntervalMs = 9000,
}: PositionalEncodingVisualizerProps) {
  const reducedMotion = useReducedMotion();
  const tokens = tokensProp?.length && tokensProp.length >= 3 ? tokensProp : DEFAULT_TOKENS;
  const dModel = clampEvenDModel(dModelProp ?? 8);
  const tableDims = Math.min(dModel, Math.max(4, tableDimsProp ?? Math.min(8, dModel)));

  const [step, setStep] = useState(() => Math.min(2, Math.max(0, initialStep)));
  const [swapped, setSwapped] = useState(false);

  const displayOrder = useMemo(() => swapMiddleAdjacent(tokens, swapped), [tokens, swapped]);

  const peRows = useMemo(
    () => displayOrder.map((_, pos) => peVector(pos, dModel)),
    [displayOrder, dModel],
  );

  const nextStep = useCallback(() => {
    setStep((s) => (s + 1) % STEPS.length);
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => (s - 1 + STEPS.length) % STEPS.length);
  }, []);

  useEffect(() => {
    if (!autoPlay || reducedMotion) return;
    const t = window.setInterval(nextStep, autoPlayIntervalMs);
    return () => window.clearInterval(t);
  }, [autoPlay, autoPlayIntervalMs, nextStep, reducedMotion]);

  const demoPos = 0;
  const demoTok = displayOrder[demoPos] ?? "?";
  const demoEmb = useMemo(
    () => Array.from({ length: Math.min(4, dModel) }, (_, d) => mockEmbeddingComponent(demoTok, demoPos, d, dModel)),
    [demoTok, demoPos, dModel],
  );
  const demoPe = useMemo(
    () => Array.from({ length: demoEmb.length }, (_, d) => sinusoidalPe(demoPos, d, dModel)),
    [demoPos, demoEmb.length, dModel],
  );
  const demoSum = demoEmb.map((e, i) => Math.round((e + demoPe[i]) * 100) / 100);

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
        step === 1 ? "p-4 md:p-6" : "p-8 md:p-10",
      )}
    >
      {(title || caption) && step !== 1 && (
        <div className="mb-6 space-y-2">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 md:text-xl dark:text-gray-100">
              {title}
            </h2>
          )}
          {caption && (
            <p className="text-base font-medium leading-relaxed text-gray-700 md:text-lg dark:text-gray-200">
              {caption}
            </p>
          )}
        </div>
      )}

      <div className={cn("flex flex-wrap gap-3", step === 1 ? "mb-4" : "mb-6")}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "rounded-full px-4 py-2.5 text-base font-bold transition-colors md:px-5 md:py-3 md:text-lg",
              step === i
                ? "bg-violet-600 text-white shadow-md dark:bg-violet-500"
                : "bg-white text-gray-700 ring-2 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-600",
            )}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className={cn(step === 1 ? "min-h-0" : "min-h-[200px]")}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="order"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {displayOrder.map((t, i) => (
                  <motion.span
                    key={`${t}-${i}`}
                    layout={!reducedMotion}
                    className="rounded-xl bg-teal-500/15 px-4 py-3 text-lg font-bold tracking-tight text-teal-950 ring-1 ring-teal-600/20 md:px-6 md:py-4 md:text-2xl dark:bg-teal-500/25 dark:text-teal-50 dark:ring-teal-400/25"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSwapped((s) => !s)}
                  className="rounded-xl bg-gray-200 px-6 py-3 text-base font-bold text-gray-900 shadow-sm hover:bg-gray-300 md:text-lg dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                >
                  {swapped ? "Restore order" : "Swap middle pair"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="wave"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <div className="overflow-x-auto rounded-2xl border-2 border-gray-300 bg-white shadow-sm dark:border-gray-500 dark:bg-slate-950">
                <table className="w-full min-w-full border-collapse text-left text-lg md:text-xl lg:text-2xl">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-900">
                      <th className="px-4 py-5 font-bold text-gray-950 md:px-6 md:py-6 dark:text-white">pos</th>
                      <th className="px-4 py-5 font-bold text-gray-950 md:px-6 md:py-6 dark:text-white">token</th>
                      {Array.from({ length: tableDims }, (_, d) => (
                        <th
                          key={d}
                          className="px-3 py-5 text-center font-mono font-bold text-gray-900 md:px-5 md:py-6 dark:text-gray-100"
                        >
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrder.map((tok, pos) => (
                      <tr
                        key={`${tok}-${pos}`}
                        className="border-b border-gray-200 last:border-0 dark:border-gray-700"
                      >
                        <td className="px-4 py-4 font-mono font-bold text-gray-700 md:px-6 md:py-5 dark:text-gray-300">
                          {pos}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-950 md:px-6 md:py-5 dark:text-white">{tok}</td>
                        {Array.from({ length: tableDims }, (_, d) => (
                          <td
                            key={d}
                            className="px-3 py-4 text-center font-mono font-bold tabular-nums text-gray-900 md:px-5 md:py-5 dark:text-gray-100"
                          >
                            {peRows[pos]?.[d] !== undefined ? peRows[pos][d].toFixed(2) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="add"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <p className="text-balance text-base font-medium leading-relaxed text-gray-800 md:text-lg dark:text-gray-100">
                Add the position vector to the embedding vector (element-wise). One combined vector carries{" "}
                <strong>what</strong> the token means and <strong>where</strong> it sits.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Meaning (embedding)", pct: 72, tone: "bg-teal-500/80" },
                  { label: "Position (sin/cos pattern)", pct: 45, tone: "bg-rose-500/80" },
                  { label: "Sum → into encoder", pct: 85, tone: "bg-violet-500/80" },
                ].map((row, i) => (
                  <div key={row.label} className="space-y-2">
                    <div className="flex justify-between text-base font-bold text-gray-800 md:text-lg dark:text-gray-200">
                      <span>{row.label}</span>
                      {i === 2 && (
                        <span className="text-violet-700 dark:text-violet-300">one vector per token</span>
                      )}
                    </div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        className={cn("h-full rounded-full", row.tone)}
                        initial={reducedMotion ? false : { width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : i * 0.12 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-600 dark:bg-gray-900/60">
                <p className="mb-3 text-base font-bold uppercase tracking-wide text-gray-700 md:text-lg dark:text-gray-200">
                  Element-wise sum (first 4 dims, position {demoPos}: “{demoTok}”, illustrative embedding)
                </p>
                <div className="grid gap-2 font-mono text-base font-semibold leading-relaxed text-gray-900 md:text-lg dark:text-gray-100">
                  <div>
                    emb: [{demoEmb.map((v) => v.toFixed(2)).join(", ")}]
                  </div>
                  <div>
                    +PE: [{demoPe.map((v) => v.toFixed(2)).join(", ")}]
                  </div>
                  <div className="font-semibold text-violet-700 dark:text-violet-300">
                    = [{demoSum.map((v) => v.toFixed(2)).join(", ")}]
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-600">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-xl px-5 py-3 text-base font-bold text-gray-900 ring-2 ring-gray-300 hover:bg-gray-100 md:text-lg dark:text-gray-100 dark:ring-gray-500 dark:hover:bg-gray-700"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="rounded-xl px-5 py-3 text-base font-bold text-gray-900 ring-2 ring-gray-300 hover:bg-gray-100 md:text-lg dark:text-gray-100 dark:ring-gray-500 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
