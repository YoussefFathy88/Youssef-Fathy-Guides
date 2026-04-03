"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TokenCandidate {
  token: string;
  /** Probability at epoch 0 (untrained, uniform-ish) */
  initProb: number;
  /** Probability at epoch 100 (fully trained) */
  finalProb: number;
  color: string;
}

const DEFAULT_PROMPT = "The capital of France is";
const CANDIDATES: TokenCandidate[] = [
  { token: "Paris",    initProb: 0.17, finalProb: 0.91, color: "#8b5cf6" },
  { token: "Lyon",     initProb: 0.16, finalProb: 0.04, color: "#14b8a6" },
  { token: "a",        initProb: 0.14, finalProb: 0.02, color: "#f59e0b" },
  { token: "the",      initProb: 0.13, finalProb: 0.01, color: "#3b82f6" },
  { token: "located",  initProb: 0.12, finalProb: 0.01, color: "#94a3b8" },
  { token: "not",      initProb: 0.14, finalProb: 0.01, color: "#f43f5e" },
];

const MAX_EPOCHS = 80;
const LOSS_START  = 2.42;
const LOSS_END    = 0.09;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

/** Ease-out cubic for natural convergence curve */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function formatLoss(epoch: number): string {
  const t = easeOutCubic(epoch / MAX_EPOCHS);
  return lerp(LOSS_START, LOSS_END, t).toFixed(3);
}

function probAtEpoch(candidate: TokenCandidate, epoch: number): number {
  const t = easeOutCubic(epoch / MAX_EPOCHS);
  return lerp(candidate.initProb, candidate.finalProb, t);
}

export interface TrainingLoopSimulatorProps {
  title?: string;
  caption?: string;
}

export default function TrainingLoopSimulator({
  title = "Watch the model learn — distribution shifts as training runs",
  caption = "Click Train to run one training step. Watch 'Paris' rise and the loss fall.",
}: TrainingLoopSimulatorProps) {
  const reducedMotion = useReducedMotion();
  const [epoch, setEpoch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sampledToken, setSampledToken] = useState<string | null>(null);
  const [showSampled, setShowSampled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlaying = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlaying = useCallback(() => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setEpoch(prev => {
        if (prev >= MAX_EPOCHS) {
          stopPlaying();
          return MAX_EPOCHS;
        }
        return prev + 1;
      });
    }, 80);
  }, [stopPlaying]);

  useEffect(() => {
    if (epoch >= MAX_EPOCHS) stopPlaying();
  }, [epoch, stopPlaying]);

  useEffect(() => () => stopPlaying(), [stopPlaying]);

  function reset() {
    stopPlaying();
    setEpoch(0);
    setSampledToken(null);
    setShowSampled(false);
  }

  function sampleToken() {
    const probs = CANDIDATES.map(c => probAtEpoch(c, epoch));
    const total = probs.reduce((a, b) => a + b, 0);
    const r = Math.random() * total;
    let acc = 0;
    for (let i = 0; i < CANDIDATES.length; i++) {
      acc += probs[i];
      if (r <= acc) {
        setSampledToken(CANDIDATES[i].token);
        setShowSampled(true);
        setTimeout(() => setShowSampled(false), 2000);
        return;
      }
    }
    setSampledToken(CANDIDATES[CANDIDATES.length - 1].token);
    setShowSampled(true);
    setTimeout(() => setShowSampled(false), 2000);
  }

  const progress = epoch / MAX_EPOCHS;
  const loss = formatLoss(epoch);
  const isFinished = epoch >= MAX_EPOCHS;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        {/* Prompt */}
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Prompt</span>
          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
            &quot;{DEFAULT_PROMPT}&quot;
          </span>
          <span className="font-mono text-sm text-gray-400">___</span>
        </div>

        {/* Distribution bars */}
        <div className="space-y-2">
          {CANDIDATES.map(candidate => {
            const prob = probAtEpoch(candidate, epoch);
            const pct = Math.round(prob * 100 * 10) / 10;
            return (
              <div key={candidate.token} className="flex items-center gap-3">
                <span className="w-16 text-right font-mono text-xs font-medium text-gray-700 dark:text-gray-200">
                  {candidate.token}
                </span>
                <div className="relative flex-1 h-7 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700/60">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{ backgroundColor: candidate.color }}
                    animate={{ width: `${prob * 100}%` }}
                    transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Epoch</p>
            <p className="mt-0.5 font-mono text-xl font-bold text-gray-900 dark:text-gray-100">
              {epoch}
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Loss</p>
            <p
              className={cn(
                "mt-0.5 font-mono text-xl font-bold",
                epoch === 0
                  ? "text-rose-500 dark:text-rose-400"
                  : isFinished
                  ? "text-teal-500 dark:text-teal-400"
                  : "text-amber-500 dark:text-amber-400",
              )}
            >
              {loss}
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Progress</p>
            <p className="mt-0.5 font-mono text-xl font-bold text-violet-600 dark:text-violet-400">
              {Math.round(progress * 100)}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-teal-400"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.15, ease: "linear" }}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!isPlaying ? (
            <button
              type="button"
              onClick={isFinished ? reset : startPlaying}
              className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300"
            >
              {isFinished ? "↺ Reset" : epoch === 0 ? "▶ Start Training" : "▶ Continue"}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopPlaying}
              className="rounded-full bg-gray-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-gray-600"
            >
              ⏸ Pause
            </button>
          )}

          {!isPlaying && epoch > 0 && !isFinished && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
            >
              ↺ Reset
            </button>
          )}

          <button
            type="button"
            onClick={sampleToken}
            className="rounded-full border border-violet-300 px-4 py-2 text-sm font-medium text-violet-600 transition hover:bg-violet-50 dark:border-violet-500/50 dark:text-violet-400 dark:hover:bg-violet-500/10"
          >
            🎲 Sample token
          </button>

          <AnimatePresence>
            {showSampled && sampledToken && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-300 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/40"
              >
                <span>Sampled:</span>
                <span className="font-mono">&quot;{sampledToken}&quot;</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isFinished && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-teal-600 dark:text-teal-400"
          >
            ✅ Training complete — the model now assigns 91% probability to &quot;Paris&quot;. The weights have compressed this fact into numbers.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
