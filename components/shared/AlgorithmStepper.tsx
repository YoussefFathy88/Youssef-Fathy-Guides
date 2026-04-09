"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

type BarState = "default" | "comparing" | "swapping" | "sorted" | "pivot" | "found";

interface ArrayBar {
  value: number;
  state: BarState;
}

interface AlgoStep {
  bars: ArrayBar[];
  description: string;
}

function bubbleSortSteps(arr: number[]): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const a = [...arr];
  const n = a.length;

  steps.push({
    bars: a.map(v => ({ value: v, state: "default" })),
    description: "Starting bubble sort — we'll repeatedly swap adjacent elements that are out of order, bubbling the largest to the end each pass.",
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const sorted: Record<number, BarState> = {};
      for (let k = n - i; k < n; k++) sorted[k] = "sorted";

      steps.push({
        bars: a.map((v, idx) => ({
          value: v,
          state: idx === j || idx === j + 1 ? "comparing" : sorted[idx] ?? "default",
        })),
        description: `Comparing ${a[j]} and ${a[j + 1]} — are they out of order?`,
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          bars: a.map((v, idx) => ({
            value: v,
            state: idx === j || idx === j + 1 ? "swapping" : sorted[idx] ?? "default",
          })),
          description: `Swap! ${a[j + 1]} was larger — it shifts one position to the right.`,
        });
      }
    }
    const sortedCount: Record<number, BarState> = {};
    for (let k = n - i - 1; k < n; k++) sortedCount[k] = "sorted";
    steps.push({
      bars: a.map((v, idx) => ({ value: v, state: sortedCount[idx] ?? "default" })),
      description: `Pass ${i + 1} complete — the ${i + 1} largest element${i > 0 ? "s are" : " is"} now in final position.`,
    });
  }

  steps.push({
    bars: a.map(v => ({ value: v, state: "sorted" })),
    description: "Fully sorted! Bubble sort: O(n²) comparisons worst case — useful for teaching, slow for large data.",
  });

  return steps;
}

function binarySearchSteps(arr: number[], target: number): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const a = [...arr].sort((x, y) => x - y);
  let low = 0, high = a.length - 1;

  steps.push({
    bars: a.map(v => ({ value: v, state: "default" })),
    description: `Binary search for ${target}. The array must be sorted — ours already is. We'll halve the search space each step.`,
  });

  let found = false;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({
      bars: a.map((v, idx) => ({
        value: v,
        state: idx < low || idx > high ? "sorted" : idx === mid ? "pivot" : "default",
      })),
      description: `Range [${low}–${high}]. Midpoint is index ${mid} = ${a[mid]}. Is it our target?`,
    });

    if (a[mid] === target) {
      steps.push({
        bars: a.map((v, idx) => ({ value: v, state: idx === mid ? "found" : "sorted" })),
        description: `Found ${target} at index ${mid}! Binary search: O(log n) — far fewer comparisons than linear scan.`,
      });
      found = true;
      break;
    } else if (a[mid] < target) {
      low = mid + 1;
      steps.push({
        bars: a.map((v, idx) => ({
          value: v,
          state: idx <= mid || idx > high ? "sorted" : "default",
        })),
        description: `${a[mid]} < ${target} — discard the left half. New range: [${low}–${high}].`,
      });
    } else {
      high = mid - 1;
      steps.push({
        bars: a.map((v, idx) => ({
          value: v,
          state: idx >= mid || idx < low ? "sorted" : "default",
        })),
        description: `${a[mid]} > ${target} — discard the right half. New range: [${low}–${high}].`,
      });
    }
  }

  if (!found) {
    steps.push({
      bars: a.map(v => ({ value: v, state: "sorted" })),
      description: `${target} not found. Every search space was eliminated — O(log n) steps total.`,
    });
  }

  return steps;
}

const BAR_COLORS: Record<BarState, string> = {
  default: "bg-slate-400 dark:bg-slate-500",
  comparing: "bg-amber-400",
  swapping: "bg-rose-500",
  sorted: "bg-teal-500",
  pivot: "bg-violet-500",
  found: "bg-emerald-500",
};

const LEGEND: { state: BarState; label: string }[] = [
  { state: "default", label: "Unsorted" },
  { state: "comparing", label: "Comparing" },
  { state: "swapping", label: "Swapping" },
  { state: "sorted", label: "Done" },
  { state: "pivot", label: "Midpoint" },
  { state: "found", label: "Found!" },
];

const ALGORITHMS = [
  {
    id: "bubble" as const,
    label: "Bubble Sort",
    complexity: "O(n²)",
    defaultArr: [38, 27, 43, 3, 9, 82, 10],
    generate: (arr: number[]) => bubbleSortSteps(arr),
  },
  {
    id: "binary" as const,
    label: "Binary Search",
    complexity: "O(log n)",
    defaultArr: [3, 9, 10, 27, 38, 43, 82],
    generate: (arr: number[]) => binarySearchSteps(arr, 27),
  },
];

export interface AlgorithmStepperProps {
  title?: string;
  caption?: string;
  defaultAlgorithm?: "bubble" | "binary";
}

export default function AlgorithmStepper({
  title,
  caption,
  defaultAlgorithm = "bubble",
}: AlgorithmStepperProps) {
  const reducedMotion = useReducedMotion();
  const [algoId, setAlgoId] = useState<"bubble" | "binary">(defaultAlgorithm);
  const algo = ALGORITHMS.find(a => a.id === algoId)!;

  const [steps, setSteps] = useState<AlgoStep[]>(() => algo.generate(algo.defaultArr));
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback((id: "bubble" | "binary") => {
    const a = ALGORITHMS.find(x => x.id === id)!;
    setAlgoId(id);
    setSteps(a.generate(a.defaultArr));
    setCurrent(0);
    setPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    setCurrent(c => {
      if (c < steps.length - 1) return c + 1;
      setPlaying(false);
      return c;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    timerRef.current = setTimeout(stepForward, 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, current, stepForward]);

  const step = steps[current];
  const maxValue = Math.max(...step.bars.map(b => b.value));
  const isLast = current === steps.length - 1;
  const activeStates = new Set(step.bars.map(b => b.state));

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

      {/* Algorithm tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {ALGORITHMS.map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => reset(a.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              algoId === a.id
                ? "border-violet-300 bg-violet-600 text-white dark:border-violet-500"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
            )}
          >
            {a.label}
            <span className={cn(
              "rounded px-1 py-0.5 font-mono text-[10px]",
              algoId === a.id
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
            )}>
              {a.complexity}
            </span>
          </button>
        ))}
      </div>

      {/* Array bars */}
      <div
        className="mb-4 flex items-end justify-center gap-2 rounded-xl bg-gray-100 p-4 dark:bg-gray-900"
        style={{ minHeight: 148 }}
      >
        {step.bars.map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{bar.value}</span>
            <motion.div
              className={cn("w-8 rounded-t-md transition-colors duration-300", BAR_COLORS[bar.state])}
              animate={{ height: `${(bar.value / maxValue) * 90}px` }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>

      {/* Legend — only show active states */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1">
        {LEGEND.filter(l => activeStates.has(l.state)).map(l => (
          <div key={l.state} className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-sm", BAR_COLORS[l.state])} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mb-4 min-h-[48px] rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {step.description}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <span className="mr-1 text-[11px] text-gray-400 dark:text-gray-500">
          {current + 1}/{steps.length}
        </span>
        <button
          type="button"
          disabled={current === 0}
          onClick={() => { setPlaying(false); setCurrent(c => Math.max(0, c - 1)); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          ← Prev
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
            else { if (isLast) { setCurrent(0); setSteps(algo.generate(algo.defaultArr)); } setPlaying(true); }
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
