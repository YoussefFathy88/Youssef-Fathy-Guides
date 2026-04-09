"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

// Loss surface: L(x, y) = 2*(x − 0.68)² + (y − 0.62)²
// Minimum at (0.68, 0.62) — slightly off-center to make the landscape interesting
const MIN_X = 0.68;
const MIN_Y = 0.62;

function loss(x: number, y: number) {
  return 2 * (x - MIN_X) ** 2 + (y - MIN_Y) ** 2;
}

function gradient(x: number, y: number) {
  return { dx: 4 * (x - MIN_X), dy: 2 * (y - MIN_Y) };
}

const START_X = 0.1;
const START_Y = 0.15;
const NUM_STEPS = 22;
const VIEWBOX = 300;

function toSvg(v: number) {
  return v * VIEWBOX;
}

function computeSteps(lr: number) {
  const steps = [{ x: START_X, y: START_Y, l: loss(START_X, START_Y) }];
  let x = START_X, y = START_Y;
  for (let i = 0; i < NUM_STEPS; i++) {
    const { dx, dy } = gradient(x, y);
    x = Math.max(0.04, Math.min(0.96, x - lr * dx));
    y = Math.max(0.04, Math.min(0.96, y - lr * dy));
    steps.push({ x, y, l: loss(x, y) });
  }
  return steps;
}

const CONTOUR_LEVELS = [0.02, 0.07, 0.15, 0.27, 0.43, 0.62];

const LR_OPTIONS = [
  { label: "0.05", lr: 0.05, desc: "Too slow — many steps needed to reach the minimum.", color: "teal" as const },
  { label: "0.15", lr: 0.15, desc: "Good balance — converges smoothly in ~15 steps.", color: "teal" as const },
  { label: "0.40", lr: 0.40, desc: "Aggressive — faster but slightly oscillates around the minimum.", color: "amber" as const },
  { label: "0.85", lr: 0.85, desc: "Too large — overshoots and diverges away from the minimum!", color: "rose" as const },
];

export interface GradientDescentSimulatorProps {
  title?: string;
  caption?: string;
  defaultLearningRate?: number;
}

export default function GradientDescentSimulator({
  title,
  caption,
  defaultLearningRate = 0.15,
}: GradientDescentSimulatorProps) {
  const reducedMotion = useReducedMotion();
  const [lrIndex, setLrIndex] = useState(
    Math.max(0, LR_OPTIONS.findIndex(l => l.lr === defaultLearningRate)) || 1
  );
  const lrOpt = LR_OPTIONS[lrIndex];
  const steps = computeSteps(lrOpt.lr);

  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLast = stepIdx === steps.length - 1;

  const stepForward = useCallback(() => {
    setStepIdx(i => {
      if (i < steps.length - 1) return i + 1;
      setPlaying(false);
      return i;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    timerRef.current = setTimeout(stepForward, 380);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, stepIdx, stepForward]);

  const handleLrChange = (idx: number) => {
    setLrIndex(idx);
    setStepIdx(0);
    setPlaying(false);
  };

  const cur = steps[stepIdx];
  const startLoss = loss(START_X, START_Y);
  const pctReduced = Math.max(0, (1 - cur.l / startLoss) * 100);

  const noticeColors = {
    teal: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Learning rate selector */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Learning rate η:</span>
        {LR_OPTIONS.map((l, i) => (
          <button
            key={l.label}
            type="button"
            onClick={() => handleLrChange(i)}
            className={cn(
              "rounded-lg border px-3 py-1 font-mono text-xs font-medium transition",
              i === lrIndex
                ? "border-violet-300 bg-violet-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Loss landscape SVG */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <svg
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            className="w-full"
            style={{ maxHeight: 280 }}
            aria-label="Loss landscape contour plot"
          >
            <defs>
              <radialGradient id="lgGrad" cx="68%" cy="62%" r="70%">
                <stop offset="0%" stopColor="#5eead4" stopOpacity={0.3} />
                <stop offset="35%" stopColor="#fbbf24" stopOpacity={0.25} />
                <stop offset="70%" stopColor="#f87171" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.3} />
              </radialGradient>
            </defs>
            <rect width={VIEWBOX} height={VIEWBOX} fill="url(#lgGrad)" />

            {/* Contour ellipses */}
            {CONTOUR_LEVELS.map(level => {
              const rx = Math.sqrt(level / 2) * VIEWBOX;
              const ry = Math.sqrt(level) * VIEWBOX;
              return (
                <ellipse
                  key={level}
                  cx={toSvg(MIN_X)}
                  cy={toSvg(MIN_Y)}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={0.8}
                  strokeOpacity={0.2}
                  className="text-gray-700 dark:text-gray-300"
                />
              );
            })}

            {/* Path trace */}
            {stepIdx > 0 && (
              <polyline
                points={steps.slice(0, stepIdx + 1).map(p => `${toSvg(p.x)},${toSvg(p.y)}`).join(" ")}
                fill="none"
                stroke="#7c3aed"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Historical dots */}
            {steps.slice(0, stepIdx).map((p, i) => (
              <circle key={i} cx={toSvg(p.x)} cy={toSvg(p.y)} r={3} fill="#7c3aed" fillOpacity={0.3} />
            ))}

            {/* Current ball */}
            <motion.circle
              cx={toSvg(cur.x)}
              cy={toSvg(cur.y)}
              r={9}
              fill="#7c3aed"
              stroke="white"
              strokeWidth={2}
              animate={{ cx: toSvg(cur.x), cy: toSvg(cur.y) }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
            />

            {/* Minimum marker */}
            <circle cx={toSvg(MIN_X)} cy={toSvg(MIN_Y)} r={5} fill="#10b981" />
            <circle cx={toSvg(MIN_X)} cy={toSvg(MIN_Y)} r={10} fill="none" stroke="#10b981" strokeWidth={1.5} strokeOpacity={0.5} />

            {/* Labels */}
            <text x={6} y={14} fontSize={8.5} fill="#94a3b8">High loss ↑</text>
            <text x={toSvg(MIN_X) + 12} y={toSvg(MIN_Y) - 12} fontSize={8.5} fill="#10b981">minimum</text>
            <text x={6} y={VIEWBOX - 5} fontSize={8} fill="#94a3b8">Gradient Descent — Loss Surface</text>
          </svg>
        </div>

        {/* Stats panel */}
        <div className="flex flex-col gap-3">
          {/* Loss value + bar */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Current Loss</span>
              <span className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">
                {cur.l.toFixed(4)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-violet-500"
                animate={{ width: `${Math.max(2, pctReduced)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-gray-400">
              <span>0 (min)</span>
              <span>{startLoss.toFixed(3)} (start)</span>
            </div>
          </div>

          {/* Position + step */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-2 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Step {stepIdx} / {steps.length - 1}
            </p>
            <div className="space-y-1 font-mono text-[12px]">
              <div className="flex justify-between">
                <span className="text-gray-400">θ₁</span>
                <span className="text-gray-700 dark:text-gray-300">{cur.x.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">θ₂</span>
                <span className="text-gray-700 dark:text-gray-300">{cur.y.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">η</span>
                <span className="text-violet-600 dark:text-violet-400">{lrOpt.label}</span>
              </div>
            </div>
          </div>

          {/* Learning rate commentary */}
          <div className={cn("rounded-xl border px-3 py-2 text-[11px] leading-relaxed", noticeColors[lrOpt.color])}>
            {lrOpt.desc}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2">
        <span className="mr-1 text-[11px] text-gray-400 dark:text-gray-500">
          {stepIdx}/{steps.length - 1}
        </span>
        <button
          type="button"
          disabled={stepIdx === 0}
          onClick={() => { setPlaying(false); setStepIdx(i => Math.max(0, i - 1)); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => { setPlaying(false); stepForward(); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Step →
        </button>
        <button
          type="button"
          onClick={() => {
            if (playing) { setPlaying(false); }
            else { if (isLast) setStepIdx(0); setPlaying(true); }
          }}
          className={cn(
            "flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition",
            playing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
              : "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          {playing ? "⏸ Pause" : isLast ? "↩ Replay" : "▶ Play"}
        </button>
      </div>
    </motion.div>
  );
}
