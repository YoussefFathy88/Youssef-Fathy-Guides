"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type ChainGradientStory = "vanish" | "explode";

export interface LinearChainGradientExplorerProps {
  story: ChainGradientStory;
  title?: string;
  caption?: string;
}

const VANISH_STEPS = [
  {
    label: "Two layers",
    hint: "Chain two lines: Layer 1 → Layer 2. Forward pass flows left to right.",
  },
  {
    label: "Backprop",
    hint: "To update m₁, gradient must travel backward through Layer 2 first.",
  },
  {
    label: "Multiply by m₂",
    hint: "∂m₁ = (gradient at output) × m₂. With m₂ = 0.1: 1.0 × 0.1 = 0.1",
  },
  {
    label: "Five layers",
    hint: "Chain 5 layers, all weights = 0.1: gradient shrinks at every step.",
  },
  {
    label: "Nearly zero",
    hint: "1.0 × 0.1⁵ = 0.00001 — Layer 1 barely updates. It stops learning.",
  },
] as const;

const EXPLODE_STEPS = [
  {
    label: "Two layers",
    hint: "Chain two lines: Layer 1 → Layer 2. Forward pass flows left to right.",
  },
  {
    label: "Backprop",
    hint: "To update m₁, gradient must travel backward through Layer 2 first.",
  },
  {
    label: "Multiply by m₂",
    hint: "∂m₁ = (gradient at output) × m₂. With m₂ = 10: 1.0 × 10 = 10",
  },
  {
    label: "Five layers",
    hint: "Chain 5 layers, all weights = 10: gradient grows at every step.",
  },
  {
    label: "Huge update",
    hint: "1.0 × 10⁵ = 100,000 — weights jump wildly. Training becomes unstable.",
  },
] as const;

function formatProduct(weight: number, layers: number): string {
  const factors = ["1.0", ...Array(layers).fill(String(weight))];
  const product = factors.reduce<number>((acc, _, i) => {
    if (i === 0) return 1;
    return acc * weight;
  }, 1);
  const chain = factors.join(" × ");
  const result =
    product >= 1000
      ? product.toLocaleString("en-US")
      : product < 0.01
        ? product.toExponential(0)
        : String(product);
  return `${chain} = ${result}`;
}

export default function LinearChainGradientExplorer({
  story,
  title,
  caption,
}: LinearChainGradientExplorerProps) {
  const reduced = useReducedMotion();
  const steps = story === "vanish" ? VANISH_STEPS : EXPLODE_STEPS;
  const weight = story === "vanish" ? 0.1 : 10;
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const magnitudes = useMemo(() => {
    const mags = [1];
    for (let i = 0; i < 5; i++) {
      mags.push(mags[mags.length - 1]! * weight);
    }
    return mags;
  }, [weight]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing || reduced) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      setPhase((p) => (p + 1) % steps.length);
    }, 3500);
    return clearTimer;
  }, [playing, reduced, steps.length, clearTimer]);

  const step = steps[phase]!;
  const panelTone =
    story === "explode"
      ? "border-rose-500/45 bg-rose-500/10 ring-1 ring-rose-500/25"
      : "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20";

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 shadow-xl">
      {title ? (
        <div className="border-b border-gray-200/60 dark:border-gray-800/60 px-6 py-4">
          <p className="text-balance text-base font-semibold text-gray-950 dark:text-white md:text-lg">{title}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        {steps.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setPhase(i)}
            className={cn(
              "rounded-full border px-3 py-2 text-sm font-medium transition md:px-4 md:text-base",
              i === phase
                ? story === "explode"
                  ? "border-rose-400/40 bg-rose-500/20 text-rose-800 dark:text-rose-200"
                  : "border-violet-400/40 bg-violet-500/20 text-violet-800 dark:text-violet-200"
                : "border-gray-200/50 dark:border-gray-800/50 bg-gray-50/40 dark:bg-gray-900/40 text-gray-600 dark:text-gray-500 hover:bg-gray-100/40 dark:hover:bg-gray-800/40",
            )}
          >
            {i + 1}. {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-violet-500 md:text-base"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="min-h-[3rem] px-5 pt-2 pb-1">
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 md:text-lg">{step.hint}</p>
      </div>

      <div className="px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className={cn("rounded-2xl border px-6 py-8 md:px-10 md:py-10", panelTone)}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={
              reduced
                ? { opacity: 1, y: 0 }
                : {
                    opacity: 1,
                    y: 0,
                    x: story === "explode" && phase >= 3 ? [0, -3, 3, 0] : 0,
                  }
            }
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {phase <= 2 ? (
              <TwoLayerDiagram phase={phase} weight={weight} story={story} />
            ) : (
              <FiveLayerChain
                magnitudes={magnitudes}
                weight={weight}
                story={story}
                phase={phase}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-gray-800/60 px-5 py-3">
        <button
          type="button"
          onClick={() => setPhase(Math.max(0, phase - 1))}
          disabled={phase === 0}
          className={cn(
            "rounded-full border px-4 py-2 text-base font-medium transition",
            phase === 0
              ? "cursor-not-allowed border-gray-200 dark:border-gray-800 text-gray-700"
              : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-500",
          )}
        >
          ← Prev
        </button>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPhase(i)}
              aria-label={`Step ${i + 1}`}
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                i === phase ? "bg-violet-400" : "bg-gray-200 dark:bg-gray-700",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPhase(Math.min(steps.length - 1, phase + 1))}
          disabled={phase === steps.length - 1}
          className={cn(
            "rounded-full border px-4 py-2 text-base font-medium transition",
            phase === steps.length - 1
              ? "cursor-not-allowed border-gray-200 dark:border-gray-800 text-gray-700"
              : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-500",
          )}
        >
          Next →
        </button>
      </div>
      {caption ? <p className="px-6 pb-4 text-base text-gray-600 dark:text-gray-400">{caption}</p> : null}
    </div>
  );
}

function TwoLayerDiagram({
  phase,
  weight,
  story,
}: {
  phase: number;
  weight: number;
  story: ChainGradientStory;
}) {
  const forward = phase === 0;
  const backprop = phase >= 1;
  const showFormula = phase >= 2;
  const accent = story === "explode" ? "text-rose-700 dark:text-rose-300" : "text-violet-700 dark:text-violet-300";

  return (
    <div className="mx-auto max-w-3xl space-y-8 text-center">
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-10">
        <LayerBlock label="Layer 1" eq="y₁ = m₁·x + c₁" active={backprop} />
        <Arrow direction={forward ? "right" : "left"} label={forward ? "forward" : "backward"} accent={accent} />
        <LayerBlock label="Layer 2" eq={`y₂ = m₂·y₁ + c₂`} active={!backprop} highlight={`m₂ = ${weight}`} />
      </div>
      {showFormula ? (
        <p className={cn("font-mono text-xl font-bold md:text-2xl", accent)}>
          ∂m₁ = (gradient at output) × m₂ = 1.0 × {weight} = {weight}
        </p>
      ) : backprop ? (
        <p className="text-base text-gray-700 dark:text-gray-300 md:text-lg">
          Gradient travels <span className="font-semibold text-gray-950 dark:text-white">backward</span> through Layer 2 before Layer 1 can update
        </p>
      ) : (
        <p className="text-base text-gray-700 dark:text-gray-300 md:text-lg">
          Input x flows through Layer 1, then Layer 2 produces the prediction
        </p>
      )}
    </div>
  );
}

function FiveLayerChain({
  magnitudes,
  weight,
  story,
  phase,
}: {
  magnitudes: number[];
  weight: number;
  story: ChainGradientStory;
  phase: number;
}) {
  const layers = ["L5 (output)", "L4", "L3", "L2", "L1"];
  const maxMag = story === "explode" ? magnitudes[magnitudes.length - 1]! : 1;
  const productStr = formatProduct(weight, 5);
  const accent = story === "explode" ? "rose" : "violet";

  return (
    <div className="space-y-8 text-center">
      <p className={cn("text-xl font-bold md:text-2xl", story === "explode" ? "text-rose-800 dark:text-rose-200" : "text-violet-800 dark:text-violet-200")}>
        {story === "explode" ? "Exploding gradient" : "Vanishing gradient"}
      </p>
      <p className="font-mono text-lg font-bold text-gray-950 dark:text-white md:text-2xl">{productStr}</p>
      <div className="mx-auto max-w-lg space-y-3">
        {layers.map((label, i) => {
          const mag = magnitudes[layers.length - i] ?? magnitudes[0]!;
          const pct = Math.min(100, (mag / maxMag) * 100);
          const active = phase === 4 ? i === layers.length - 1 : i === phase - 3;
          return (
            <div
              key={label}
              className={cn(
                "flex items-center gap-4 rounded-xl border px-4 py-3 md:py-4",
                active
                  ? accent === "rose"
                    ? "border-rose-400/70 bg-rose-500/20 ring-2 ring-rose-400/40"
                    : "border-violet-400/60 bg-violet-500/20 ring-2 ring-violet-400/30"
                  : "border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/[0.04]",
              )}
            >
              <span className="w-24 shrink-0 text-left text-base font-bold text-gray-900 dark:text-gray-200 md:w-28 md:text-lg">
                {label}
              </span>
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-900/[0.07] dark:bg-white/10 md:h-5">
                <motion.div
                  className={cn("h-full rounded-full", accent === "rose" ? "bg-rose-400" : "bg-violet-400")}
                  animate={{ width: `${Math.max(story === "vanish" ? 2 : pct, pct)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span
                className={cn(
                  "w-24 shrink-0 text-right font-mono text-base font-bold tabular-nums md:text-lg",
                  active ? (accent === "rose" ? "text-rose-700 dark:text-rose-300" : "text-violet-700 dark:text-violet-300") : "text-gray-600 dark:text-gray-500",
                )}
              >
                {mag >= 1000 ? mag.toLocaleString("en-US") : mag < 0.01 ? mag.toExponential(1) : mag.toFixed(mag < 1 ? 5 : 1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LayerBlock({
  label,
  eq,
  active,
  highlight,
}: {
  label: string;
  eq: string;
  active?: boolean;
  highlight?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-6 py-5 md:px-8 md:py-6",
        active ? "border-violet-400/60 bg-violet-500/15 ring-2 ring-violet-400/30" : "border-gray-200 dark:border-white/15 bg-gray-900/[0.04] dark:bg-white/[0.06]",
      )}
    >
      <p className="text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 md:text-base">{label}</p>
      <p className="mt-2 font-mono text-lg font-bold text-gray-950 dark:text-white md:text-xl">{eq}</p>
      {highlight ? <p className="mt-2 font-mono text-base text-violet-700 dark:text-violet-300 md:text-lg">{highlight}</p> : null}
    </div>
  );
}

function Arrow({
  direction,
  label,
  accent,
}: {
  direction: "left" | "right";
  label: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="48" height="32" viewBox="0 0 48 32" aria-hidden className={accent}>
        {direction === "right" ? (
          <path d="M4 16h32M30 10l8 6-8 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M44 16H12M18 10l-8 6 8 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span className={cn("text-sm font-bold uppercase md:text-base", accent)}>{label}</span>
    </div>
  );
}
