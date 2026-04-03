"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ─── Scripted tool results ────────────────────────────────────────────── */

const QUESTION = "Can I afford to fly from Cairo to London next weekend? What's the weather like?";

interface Tool {
  id: string;
  name: string;
  emoji: string;
  color: "amber" | "violet" | "teal";
  args: string;
  latencyMs: number; // parallel latency
  result: string;
  resultDetail: string;
}

const TOOLS: Tool[] = [
  {
    id: "flights",
    name: "get_flight_prices",
    emoji: "✈️",
    color: "violet",
    args: 'origin="CAI", dest="LHR", date="next weekend"',
    latencyMs: 1100,
    result: "£320",
    resultDetail: "Cheapest: EgyptAir direct, dep Fri 23:15 → arr Sat 03:30 · Also: £389 (KLM via AMS)",
  },
  {
    id: "exchange",
    name: "get_exchange_rate",
    emoji: "💱",
    color: "amber",
    args: 'from="GBP", to="EGP"',
    latencyMs: 800,
    result: "1 GBP = 49.8 EGP",
    resultDetail: "£320 ≈ 15,936 EGP at today's mid-market rate",
  },
  {
    id: "weather",
    name: "get_weather_forecast",
    emoji: "🌦️",
    color: "teal",
    args: 'city="London", dates="next weekend"',
    latencyMs: 950,
    result: "12°C, rainy",
    resultDetail: "Sat: 11°C, showers · Sun: 13°C, partly cloudy · Bring a waterproof jacket",
  },
];

const PARALLEL_TOTAL_MS  = Math.max(...TOOLS.map(t => t.latencyMs)) + 200;
const SEQUENTIAL_TOTAL_MS = TOOLS.reduce((s, t) => s + t.latencyMs, 0) + 200;

const FINAL_ANSWER =
  "The cheapest flight is £320 (≈ 15,936 EGP) on EgyptAir departing Friday night. London next weekend will be around 12°C and rainy — pack a waterproof jacket.";

const colorMap = {
  violet: { border: "border-violet-200 dark:border-violet-500/30", bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" },
  amber:  { border: "border-amber-200 dark:border-amber-500/30",   bg: "bg-amber-50 dark:bg-amber-500/10",   text: "text-amber-700 dark:text-amber-300",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"   },
  teal:   { border: "border-teal-200 dark:border-teal-500/30",     bg: "bg-teal-50 dark:bg-teal-500/10",     text: "text-teal-700 dark:text-teal-300",     badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300"     },
};

export interface ParallelToolRunnerProps {
  title?:   string;
  caption?: string;
}

export default function ParallelToolRunner({
  title   = "Three tool calls dispatch simultaneously — then one combined answer",
  caption = "Toggle Parallel vs Sequential and click Run to see the time difference.",
}: ParallelToolRunnerProps) {
  const reducedMotion   = useReducedMotion();
  const [mode, setMode] = useState<"parallel" | "sequential">("parallel");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [doneTools, setDoneTools] = useState<Set<string>>(new Set());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef    = useRef<number>(0);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  function reset() {
    clearAll();
    setPhase("idle");
    setDoneTools(new Set());
    setElapsedMs(0);
    setShowAnswer(false);
  }

  function runTools() {
    reset();
    setPhase("running");
    startRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 30);

    const speedFactor = reducedMotion ? 0.15 : 1;

    if (mode === "parallel") {
      // All tools fire at once, finish at their own latency
      TOOLS.forEach(tool => {
        const t = setTimeout(() => {
          setDoneTools(prev => new Set([...prev, tool.id]));
        }, tool.latencyMs * speedFactor);
        timeoutsRef.current.push(t);
      });

      const tDone = setTimeout(() => {
        setShowAnswer(true);
        setPhase("done");
        clearInterval(intervalRef.current!);
      }, PARALLEL_TOTAL_MS * speedFactor);
      timeoutsRef.current.push(tDone);

    } else {
      // Sequential — each tool waits for the previous
      let offset = 0;
      TOOLS.forEach(tool => {
        offset += tool.latencyMs;
        const t = setTimeout(() => {
          setDoneTools(prev => new Set([...prev, tool.id]));
        }, offset * speedFactor);
        timeoutsRef.current.push(t);
      });

      const tDone = setTimeout(() => {
        setShowAnswer(true);
        setPhase("done");
        clearInterval(intervalRef.current!);
      }, SEQUENTIAL_TOTAL_MS * speedFactor);
      timeoutsRef.current.push(tDone);
    }
  }

  const totalMs = mode === "parallel" ? PARALLEL_TOTAL_MS : SEQUENTIAL_TOTAL_MS;
  const displayMs = phase === "done" ? totalMs : Math.min(elapsedMs, totalMs);

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

        {/* User question */}
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900/60">
          <span className="mt-0.5 text-lg">👤</span>
          <p className="text-sm text-gray-800 dark:text-gray-200">{QUESTION}</p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Execution mode:</span>
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            {(["parallel", "sequential"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); reset(); }}
                disabled={phase === "running"}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize transition",
                  mode === m
                    ? m === "parallel"
                      ? "bg-violet-500 text-white dark:bg-violet-400 dark:text-gray-950"
                      : "bg-amber-500 text-white dark:bg-amber-400 dark:text-gray-950"
                    : "text-gray-500 dark:text-gray-400",
                  phase === "running" && "cursor-not-allowed",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Tool cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {TOOLS.map((tool, i) => {
            const isDone = doneTools.has(tool.id);
            const isRunning = phase === "running" && !isDone;
            const tone = colorMap[tool.color];

            // In sequential, a tool is "pending" if the previous hasn't finished
            const sequentialStartMs = mode === "sequential"
              ? TOOLS.slice(0, i).reduce((s, t) => s + t.latencyMs, 0)
              : 0;
            const isPending = mode === "sequential" && phase === "running"
              && !isDone && elapsedMs < sequentialStartMs;

            return (
              <div
                key={tool.id}
                className={cn(
                  "rounded-xl border p-3 transition-all",
                  isDone ? cn(tone.bg, tone.border) : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/50",
                  isRunning && !isPending && "border-dashed",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{tool.emoji}</span>
                  <div>
                    <p className={cn("text-xs font-bold", isDone ? tone.text : "text-gray-500")}>
                      {tool.name}
                    </p>
                    <p className="font-mono text-[10px] text-gray-400">{(tool.latencyMs / 1000).toFixed(1)}s</p>
                  </div>
                </div>

                <p className="font-mono text-[10px] text-gray-400 break-all">{tool.args}</p>

                {/* State indicator */}
                <div className="mt-2">
                  {isPending && (
                    <p className="text-[10px] text-gray-400">⏳ Waiting…</p>
                  )}
                  {isRunning && !isPending && (
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className={cn("h-3 w-3 rounded-full border-2 border-transparent border-t-current", tone.text)}
                      />
                      <p className={cn("text-[10px]", tone.text)}>Fetching…</p>
                    </div>
                  )}
                  {isDone && (
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className={cn("text-sm font-bold", tone.text)}>{tool.result}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{tool.resultDetail}</p>
                    </motion.div>
                  )}
                  {phase === "idle" && (
                    <p className="text-[10px] text-gray-300 dark:text-gray-600">idle</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timer bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {mode === "parallel" ? "All 3 tools run simultaneously" : "Tools run one after another"}
            </span>
            <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
              {(displayMs / 1000).toFixed(2)}s / {(totalMs / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className={cn(
                "h-full rounded-full",
                mode === "parallel"
                  ? "bg-gradient-to-r from-violet-500 to-teal-400"
                  : "bg-gradient-to-r from-amber-500 to-rose-400",
              )}
              animate={{ width: phase === "idle" ? "0%" : `${Math.min((displayMs / totalMs) * 100, 100)}%` }}
              transition={{ duration: 0.04, ease: "linear" }}
            />
          </div>
        </div>

        {/* Final answer */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">🤖</span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">Final answer</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-800 dark:text-gray-200">{FINAL_ANSWER}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison row when both modes have been seen */}
        {phase === "done" && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              mode === "parallel"
                ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
            )}
          >
            {mode === "parallel"
              ? `✅ Parallel: ${(PARALLEL_TOTAL_MS / 1000).toFixed(1)}s total — limited by the slowest tool (${(Math.max(...TOOLS.map(t => t.latencyMs)) / 1000).toFixed(1)}s)`
              : `⚠️ Sequential: ${(SEQUENTIAL_TOTAL_MS / 1000).toFixed(1)}s total — ${((SEQUENTIAL_TOTAL_MS / PARALLEL_TOTAL_MS)).toFixed(1)}× slower than parallel. Try switching to parallel mode →`}
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={phase === "idle" || phase === "done" ? runTools : reset}
            disabled={false}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              phase === "running"
                ? "bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-600"
                : "bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300",
            )}
          >
            {phase === "running" ? "⏹ Stop" : phase === "done" ? "▶ Run again" : "▶ Run"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
