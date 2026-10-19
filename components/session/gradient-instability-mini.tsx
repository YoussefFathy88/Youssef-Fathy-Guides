"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type StoryPhase = "explode" | "vanish" | "layernorm";

const EXPLODE_MAGNITUDES = [1, 12, 180, 10_000] as const;
const EXPLODE_LAYERS = ["Layer 96 (loss)", "Layer 48", "Layer 24", "Layer 1"] as const;

const VANISH_MAGNITUDES = [1, 0.12, 0.015, 0.0001] as const;
const VANISH_LAYERS = ["Layer 96 (loss)", "Layer 48", "Layer 24", "Layer 1"] as const;

const LN_BEFORE = [100, 200, 300, 400] as const;
const LN_AFTER = [-1.3, -0.4, 0.4, 1.3] as const;

const STORY_PHASES: { id: StoryPhase; pill: string }[] = [
  { id: "explode", pill: "Exploding" },
  { id: "vanish", pill: "Vanishing" },
  { id: "layernorm", pill: "LayerNorm fix" },
];

function formatMagnitude(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US");
  if (n > 0 && n < 0.01) return n.toExponential(1);
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(n < 1 ? 4 : 1);
}

function formatVector(values: readonly number[]): string {
  return `[${values.join(", ")}]`;
}

function MagnitudeBar({
  value,
  max,
  tone,
  reducedMotion,
}: {
  value: number;
  max: number;
  tone: "rose" | "slate" | "success";
  reducedMotion: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const barTone =
    tone === "rose"
      ? "bg-rose-400"
      : tone === "slate"
        ? "bg-slate-400"
        : "bg-[color:var(--success)]";

  return (
    <motion.div
      className="mx-auto h-5 w-full max-w-md overflow-hidden rounded-full bg-gray-900/[0.07] dark:bg-white/10 md:h-6"
      initial={false}
    >
      <motion.div
        className={cn("h-full rounded-full", barTone)}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}

function BackpropLayerStrip({
  step,
  layers,
  magnitudes,
  mode,
  reducedMotion,
}: {
  step: number;
  layers: readonly string[];
  magnitudes: readonly number[];
  mode: "explode" | "vanish";
  reducedMotion: boolean;
}) {
  const maxMag = mode === "explode" ? 10_000 : 1;
  const activeTone =
    mode === "explode"
      ? "border-rose-400/70 bg-rose-500/20 ring-2 ring-rose-400/40"
      : "border-slate-300/60 bg-slate-500/20 ring-2 ring-slate-300/30";
  const idleTone = "border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/[0.04]";
  const barTone = mode === "explode" ? "bg-rose-400" : "bg-slate-400";
  const magText = mode === "explode" ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-slate-200";

  return (
    <motion.div
      className="mx-auto w-full max-w-lg space-y-3"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 md:text-base">
        Backward pass (loss → earlier layers)
      </p>
      <div className="space-y-2">
        {layers.map((label, i) => {
          const mag = magnitudes[i] ?? magnitudes[0];
          const active = i === step;
          const barPct = Math.min(100, (mag / maxMag) * 100);
          return (
            <motion.div
              key={label}
              className={cn(
                "flex items-center gap-4 rounded-xl border px-4 py-3 md:gap-6 md:px-5 md:py-4",
                active ? activeTone : idleTone,
              )}
              animate={
                reducedMotion || !active
                  ? undefined
                  : mode === "explode"
                    ? { scale: [1, 1.02, 1] }
                    : { opacity: [1, 0.85, 1] }
              }
              transition={{ duration: 0.5 }}
            >
              <span className="w-28 shrink-0 text-left text-base font-bold text-slate-900 dark:text-slate-200 md:w-36 md:text-lg">
                {label}
              </span>
              <motion.div
                className="h-4 flex-1 overflow-hidden rounded-full bg-gray-900/[0.07] dark:bg-white/10 md:h-5"
                initial={false}
              >
                <motion.div
                  className={cn("h-full rounded-full", barTone)}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
                />
              </motion.div>
              <span
                className={cn(
                  "w-20 shrink-0 text-right font-mono text-base font-bold tabular-nums md:w-24 md:text-lg",
                  active ? magText : "text-slate-600 dark:text-slate-500",
                )}
              >
                {formatMagnitude(mag)}
              </span>
            </motion.div>
          );
        })}
      </div>
      {step < layers.length - 1 ? (
        <p className="text-base font-medium text-slate-600 dark:text-slate-400 md:text-lg" aria-live="polite">
          {mode === "explode"
            ? "Each step backward multiplies the gradient — it blows up"
            : "Each step backward shrinks the gradient — it fades away"}
        </p>
      ) : (
        <p className="text-base font-bold text-slate-900 dark:text-slate-200 md:text-lg" aria-live="polite">
          {mode === "explode"
            ? "Early layers get huge updates — training explodes"
            : "Early layers get almost zero signal — they cannot learn"}
        </p>
      )}
    </motion.div>
  );
}

function ExplodeStory({
  step,
  reducedMotion,
}: {
  step: number;
  reducedMotion: boolean;
}) {
  const magnitude = EXPLODE_MAGNITUDES[step] ?? EXPLODE_MAGNITUDES[0];

  return (
    <div className="space-y-6 text-center md:space-y-8">
      <p className="text-xl font-bold text-rose-800 dark:text-rose-200 md:text-2xl">Exploding gradients</p>
      <p className="text-base font-medium text-slate-700 dark:text-slate-300 md:text-lg">
        Backprop multiplies large factors — the gradient grows at every layer
      </p>

      <BackpropLayerStrip
        step={step}
        layers={EXPLODE_LAYERS}
        magnitudes={EXPLODE_MAGNITUDES}
        mode="explode"
        reducedMotion={reducedMotion}
      />

      <div className="space-y-3">
        <p className="text-base font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300/90 md:text-lg">
          Gradient at highlighted layer
        </p>
        <motion.p
          key={magnitude}
          className="font-mono text-5xl font-bold tabular-nums text-rose-700 dark:text-rose-300 md:text-7xl"
          initial={reducedMotion ? false : { scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          {formatMagnitude(magnitude)}
        </motion.p>
        <MagnitudeBar value={magnitude} max={10_000} tone="rose" reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}

function VanishStory({
  step,
  reducedMotion,
}: {
  step: number;
  reducedMotion: boolean;
}) {
  const magnitude = VANISH_MAGNITUDES[step] ?? VANISH_MAGNITUDES[0];

  return (
    <div className="space-y-6 text-center md:space-y-8">
      <p className="text-xl font-bold text-slate-900 dark:text-slate-200 md:text-2xl">Vanishing gradients</p>
      <p className="text-base font-medium text-slate-700 dark:text-slate-300 md:text-lg">
        Backprop multiplies small factors — the gradient shrinks at every layer
      </p>

      <BackpropLayerStrip
        step={step}
        layers={VANISH_LAYERS}
        magnitudes={VANISH_MAGNITUDES}
        mode="vanish"
        reducedMotion={reducedMotion}
      />

      <div className="space-y-3">
        <p className="text-base font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 md:text-lg">
          Gradient at highlighted layer
        </p>
        <motion.p
          key={magnitude}
          className="font-mono text-5xl font-bold tabular-nums text-slate-700 dark:text-slate-300 md:text-7xl"
          initial={reducedMotion ? false : { scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          {formatMagnitude(magnitude)}
        </motion.p>
        <MagnitudeBar value={magnitude} max={1} tone="slate" reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}

function LayerNormStory({ reducedMotion }: { reducedMotion: boolean }) {
  const vectorClass =
    "whitespace-nowrap font-mono text-2xl font-bold tabular-nums leading-none md:text-4xl lg:text-5xl";

  return (
    <div className="space-y-6 text-center md:space-y-8">
      <p className="text-xl font-bold text-[color:var(--success)] md:text-2xl">LayerNorm fixes the scale</p>
      <p className="text-base font-medium text-slate-700 dark:text-slate-300 md:text-lg">
        Re-center and rescale activations — stable range before attention and FFN
      </p>

      <motion.div
        className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-900/[0.04] dark:bg-white/[0.06] px-5 py-6 md:px-8 md:py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-lg font-bold text-slate-900 dark:text-slate-200 md:text-xl">Before LayerNorm</p>
        <p className={cn(vectorClass, "mt-4 text-[color:var(--warning)]")}>{formatVector(LN_BEFORE)}</p>
      </motion.div>

      <motion.div
        className="text-[color:var(--success)]"
        animate={reducedMotion ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <svg width="36" height="44" viewBox="0 0 20 24" fill="none" className="mx-auto h-11 w-9">
          <path
            d="M10 4v14M6 14l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        className="mx-auto w-full max-w-3xl rounded-2xl border border-[color:var(--success)]/40 bg-[color:var(--success)]/12 px-5 py-6 md:px-8 md:py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reducedMotion ? 0 : 0.12 }}
      >
        <p className="text-lg font-bold text-slate-900 dark:text-slate-200 md:text-xl">After LayerNorm</p>
        <p className={cn(vectorClass, "mt-4 text-[color:var(--success)]")}>{formatVector(LN_AFTER)}</p>
      </motion.div>

      <p className="text-base font-medium text-slate-600 dark:text-slate-400 md:text-lg">
        Keeps values in a safe band — GPT applies this before every sub-layer
      </p>
    </div>
  );
}

export function GradientInstabilityMini({
  reducedMotion,
  story: lockedStory,
}: {
  reducedMotion: boolean;
  story?: StoryPhase;
}) {
  const initialIdx = lockedStory
    ? Math.max(
        0,
        STORY_PHASES.findIndex((p) => p.id === lockedStory),
      )
    : 0;
  const [phaseIdx, setPhaseIdx] = useState(initialIdx);
  const [subStep, setSubStep] = useState(0);

  const phase = STORY_PHASES[phaseIdx] ?? STORY_PHASES[0];
  const showPills = !lockedStory;

  useEffect(() => {
    if (lockedStory) {
      const idx = STORY_PHASES.findIndex((p) => p.id === lockedStory);
      if (idx >= 0) setPhaseIdx(idx);
    }
  }, [lockedStory]);

  useEffect(() => {
    if (reducedMotion || lockedStory) return;
    const id = window.setInterval(() => {
      setPhaseIdx((i) => {
        const next = (i + 1) % STORY_PHASES.length;
        if (next !== i) setSubStep(0);
        return next;
      });
    }, 10_000);
    return () => window.clearInterval(id);
  }, [reducedMotion, lockedStory]);

  useEffect(() => {
    if (reducedMotion || phase.id === "layernorm") return;
    const id = window.setInterval(() => {
      setSubStep((s) => {
        const max = phase.id === "explode" ? EXPLODE_MAGNITUDES.length : VANISH_MAGNITUDES.length;
        return (s + 1) % max;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [reducedMotion, phase.id]);

  const panelClass =
    phase.id === "explode"
      ? "border-rose-500/45 bg-rose-500/10 ring-1 ring-rose-500/25"
      : phase.id === "vanish"
        ? "border-slate-500/40 bg-slate-500/10"
        : "border-[color:var(--success)]/35 bg-[color:var(--success)]/8 ring-1 ring-[color:var(--success)]/20";

  return (
    <motion.div className="flex flex-col items-center gap-8 py-2 md:gap-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase.id}
          className={cn(
            "w-full max-w-4xl rounded-2xl border px-6 py-8 md:px-10 md:py-10",
            panelClass,
          )}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={
            reducedMotion
              ? { opacity: 1, y: 0, x: 0 }
              : {
                  opacity: 1,
                  y: 0,
                  x: phase.id === "explode" && subStep >= 2 ? [0, -2, 2, 0] : 0,
                }
          }
          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          {phase.id === "explode" ? (
            <ExplodeStory step={subStep} reducedMotion={reducedMotion} />
          ) : phase.id === "vanish" ? (
            <VanishStory step={subStep} reducedMotion={reducedMotion} />
          ) : (
            <LayerNormStory reducedMotion={reducedMotion} />
          )}
        </motion.div>
      </AnimatePresence>

      {showPills ? (
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {STORY_PHASES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPhaseIdx(i);
                setSubStep(0);
              }}
              className={cn(
                "rounded-full px-4 py-2.5 text-base font-bold transition-colors md:px-5 md:py-3 md:text-lg",
                i === phaseIdx
                  ? "bg-gray-900/10 dark:bg-white/15 text-gray-950 dark:text-white ring-2 ring-gray-300 dark:ring-white/25"
                  : "bg-gray-900/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-900/[0.07] dark:hover:bg-white/10",
              )}
              aria-current={i === phaseIdx ? "step" : undefined}
            >
              {p.pill}
            </button>
          ))}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
