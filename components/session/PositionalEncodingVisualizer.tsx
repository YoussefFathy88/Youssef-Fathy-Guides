"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: "order", label: "Order" },
  { id: "wave", label: "Position signal" },
  { id: "add", label: "Meaning + position" },
] as const;

export interface PositionalEncodingVisualizerProps {
  title?: string;
  caption?: string;
  /** Token row for the order demo (length ≥ 3; positions 1 and 2 swap). */
  tokens?: string[];
  /** Initial step index 0–2. */
  initialStep?: number;
  /** Advance steps on a timer (narrative mode). */
  autoPlay?: boolean;
  /** Ms between auto-advance. */
  autoPlayIntervalMs?: number;
}

const DEFAULT_TOKENS = ["dog", "bites", "man"];

function peValue(pos: number, dim: number): number {
  return Math.sin(pos / Math.pow(10000, dim / 8));
}

export default function PositionalEncodingVisualizer({
  title = "Why positional encoding exists",
  caption = "Step through: order matters, a fixed signal per index, then add it to the embedding.",
  tokens: tokensProp,
  initialStep = 0,
  autoPlay = false,
  autoPlayIntervalMs = 9000,
}: PositionalEncodingVisualizerProps) {
  const reducedMotion = useReducedMotion();
  const tokens = tokensProp?.length && tokensProp.length >= 3 ? tokensProp : DEFAULT_TOKENS;
  const [step, setStep] = useState(() => Math.min(2, Math.max(0, initialStep)));
  const [swapped, setSwapped] = useState(false);

  const displayOrder = useMemo(() => {
    if (!swapped) return tokens;
    const copy = [...tokens];
    [copy[1], copy[2]] = [copy[2], copy[1]];
    return copy;
  }, [tokens, swapped]);

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

  const plotW = 280;
  const plotH = 120;
  const pad = 24;
  const nPos = 6;
  const points = Array.from({ length: nPos }, (_, pos) => {
    const v = peValue(pos, 0);
    const x = pad + (pos / (nPos - 1)) * (plotW - pad * 2);
    const y = plotH / 2 - v * (plotH / 2 - 16);
    return { x, y, pos, v };
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-4 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              step === i
                ? "bg-violet-600 text-white dark:bg-violet-500"
                : "bg-white text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-600",
            )}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className="min-h-[168px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="order"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">
                The model sees all tokens at once. Swap two words — the idea is: <strong>meaning vectors</strong>{" "}
                alone do not record left-to-right order until we add something extra.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {displayOrder.map((t, i) => (
                  <motion.span
                    key={`${t}-${i}`}
                    layout={!reducedMotion}
                    className="rounded-lg bg-teal-500/15 px-3 py-2 text-sm font-semibold text-teal-800 dark:bg-teal-500/20 dark:text-teal-100"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSwapped((s) => !s)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  {swapped ? "Restore order" : "Swap middle words"}
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
              className="space-y-3"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">
                One simple pattern: a sine wave (and cosines at other frequencies) that depends only on the token
                index. Each position gets a predictable &quot;address.&quot;
              </p>
              <svg
                width="100%"
                viewBox={`0 0 ${plotW} ${plotH}`}
                className="max-w-full overflow-visible text-rose-500"
                aria-label="Sine-like positional pattern across indices"
              >
                <line x1={pad} y1={plotH / 2} x2={plotW - pad} y2={plotH / 2} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reducedMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.9, ease: "easeOut" }}
                />
                {points.map((p) => (
                  <circle key={p.pos} cx={p.x} cy={p.y} r={4} className="fill-rose-500" />
                ))}
                <text x={pad} y={plotH - 4} className="fill-gray-500 text-[9px] dark:fill-gray-400">
                  position index →
                </text>
              </svg>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="add"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Add the position vector to the embedding vector (element-wise). One combined vector carries{" "}
                <strong>what</strong> the token means and <strong>where</strong> it sits.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Meaning (embedding)", pct: 72, tone: "bg-teal-500/80" },
                  { label: "Position (fixed pattern)", pct: 45, tone: "bg-rose-500/80" },
                  { label: "Sum → into encoder", pct: 85, tone: "bg-violet-500/80" },
                ].map((row, i) => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-gray-600 dark:text-gray-300">
                      <span>{row.label}</span>
                      {i === 2 && <span className="text-violet-600 dark:text-violet-300">one vector per token</span>}
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-gray-600">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-100 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-100 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
