"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

export interface StackFrame {
  id: string;
  fn: string;
  args?: string;
  locals?: string;
  returnValue?: string;
  state: "active" | "waiting" | "returning";
}

export interface CallStackStep {
  id: string;
  frames: StackFrame[];
  highlightCode: string;
  description: string;
}

export interface CallStackVisualizerProps {
  title?: string;
  caption?: string;
  steps?: CallStackStep[];
  autoPlay?: boolean;
  autoPlayMs?: number;
}

const PSEUDO_CODE = `def fib(n):
  if n <= 1: return n
  return fib(n-1) + fib(n-2)

# in main()
result = fib(5)
print(result)`;

const DEFAULT_STEPS: CallStackStep[] = [
  {
    id: "s1",
    frames: [{ id: "main", fn: "main()", state: "active" }],
    highlightCode: "result = fib(5)",
    description: "main() calls fib(5). A new frame is pushed onto the call stack for this invocation.",
  },
  {
    id: "s2",
    frames: [
      { id: "main", fn: "main()", state: "waiting" },
      { id: "f5", fn: "fib(n)", args: "n = 5", state: "active" },
    ],
    highlightCode: "if n <= 1: return n",
    description: "fib(5) starts. n=5 > 1, so it won't hit the base case — it will call fib(4) + fib(3).",
  },
  {
    id: "s3",
    frames: [
      { id: "main", fn: "main()", state: "waiting" },
      { id: "f5", fn: "fib(n)", args: "n = 5", state: "waiting" },
      { id: "f4", fn: "fib(n)", args: "n = 4", state: "active" },
    ],
    highlightCode: "return fib(n-1) + fib(n-2)",
    description: "fib(4) is pushed. The stack now has 3 frames. Every waiting frame is blocked, consuming memory.",
  },
  {
    id: "s4",
    frames: [
      { id: "main", fn: "main()", state: "waiting" },
      { id: "f5", fn: "fib(n)", args: "n = 5", state: "waiting" },
      { id: "f4", fn: "fib(n)", args: "n = 4", state: "waiting" },
      { id: "f3a", fn: "fib(n)", args: "n = 3", state: "active" },
    ],
    highlightCode: "return fib(n-1) + fib(n-2)",
    description: "fib(3) is pushed. Each recursive call adds a frame — deep recursion can cause a stack overflow.",
  },
  {
    id: "s5",
    frames: [
      { id: "main", fn: "main()", state: "waiting" },
      { id: "f5", fn: "fib(n)", args: "n = 5", state: "waiting" },
      { id: "f4", fn: "fib(n)", args: "n = 4", state: "waiting" },
      { id: "f3a", fn: "fib(n)", args: "n = 3", state: "waiting" },
      { id: "f1a", fn: "fib(n)", args: "n = 1", returnValue: "1", state: "returning" },
    ],
    highlightCode: "if n <= 1: return n",
    description: "fib(1) hits the base case — n ≤ 1, so it returns 1 immediately. Its frame pops off the stack.",
  },
  {
    id: "s6",
    frames: [
      { id: "main", fn: "main()", state: "waiting" },
      { id: "f5", fn: "fib(n)", args: "n = 5", state: "waiting" },
      { id: "f4", fn: "fib(n)", args: "n = 4", state: "waiting" },
      { id: "f3a", fn: "fib(n)", args: "n = 3", locals: "fib(2)=1, fib(1)=1", returnValue: "2", state: "returning" },
    ],
    highlightCode: "return fib(n-1) + fib(n-2)",
    description: "fib(3) = fib(2) + fib(1) = 1 + 1 = 2. It returns and pops. The stack is shrinking.",
  },
  {
    id: "s7",
    frames: [
      { id: "main", fn: "main()", state: "waiting" },
      { id: "f5", fn: "fib(n)", args: "n = 5", state: "waiting" },
      { id: "f4", fn: "fib(n)", args: "n = 4", locals: "fib(3)=2, fib(2)=1", returnValue: "3", state: "returning" },
    ],
    highlightCode: "return fib(n-1) + fib(n-2)",
    description: "fib(4) = fib(3) + fib(2) = 2 + 1 = 3. Results bubble back up as frames pop off.",
  },
  {
    id: "s8",
    frames: [
      { id: "main", fn: "main()", state: "waiting" },
      { id: "f5", fn: "fib(n)", args: "n = 5", locals: "fib(4)=3, fib(3)=2", returnValue: "5", state: "returning" },
    ],
    highlightCode: "return fib(n-1) + fib(n-2)",
    description: "fib(5) = fib(4) + fib(3) = 3 + 2 = 5. Only one more frame to pop.",
  },
  {
    id: "s9",
    frames: [
      { id: "main", fn: "main()", args: "result = 5", state: "active" },
    ],
    highlightCode: "print(result)",
    description: "fib(5) returned 5 to main(). Stack is back to one frame. Each call cost one push + one pop — that's the overhead of recursion.",
  },
];

const frameColors = {
  active: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-300 dark:border-violet-500/40",
    label: "text-violet-700 dark:text-violet-300",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
  waiting: {
    bg: "bg-gray-50 dark:bg-gray-800/50",
    border: "border-gray-200 dark:border-gray-700",
    label: "text-gray-600 dark:text-gray-400",
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
  returning: {
    bg: "bg-teal-50 dark:bg-teal-500/10",
    border: "border-teal-300 dark:border-teal-500/40",
    label: "text-teal-700 dark:text-teal-300",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  },
} as const;

export default function CallStackVisualizer({
  title,
  caption,
  steps = DEFAULT_STEPS,
  autoPlay = false,
  autoPlayMs = 2200,
}: CallStackVisualizerProps) {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLast = current === steps.length - 1;

  const stepForward = useCallback(() => {
    setCurrent(c => {
      if (c < steps.length - 1) return c + 1;
      setPlaying(false);
      return c;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    timerRef.current = setTimeout(stepForward, autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, current, stepForward, autoPlayMs]);

  const step = steps[current];
  const pseudoLines = PSEUDO_CODE.split("\n");
  const highlightIdx = pseudoLines.findIndex(l => l.includes(step.highlightCode));

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left: pseudo-code with line highlight */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950 dark:border-gray-700">
          <div className="flex items-center gap-1.5 border-b border-gray-800 bg-gray-900 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500/70" />
            <span className="ml-2 text-[11px] text-gray-500">fibonacci.py</span>
          </div>
          <div className="p-4">
            {pseudoLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 rounded px-2 py-0.5 font-mono text-[12px] transition-colors",
                  i === highlightIdx
                    ? "bg-amber-500/20 text-amber-300"
                    : "text-gray-400",
                )}
              >
                <span className="w-4 shrink-0 select-none text-right text-gray-600">{i + 1}</span>
                <span className="whitespace-pre">{line || "\u00a0"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: call stack (bottom = first frame, top = newest) */}
        <div className="flex flex-col gap-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Call Stack
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {step.frames.length} frame{step.frames.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col-reverse gap-1.5" style={{ minHeight: 180 }}>
            <AnimatePresence initial={false}>
              {step.frames.map((frame, i) => {
                const colors = frameColors[frame.state];
                const isTop = i === step.frames.length - 1;
                return (
                  <motion.div
                    key={frame.id}
                    layout
                    initial={reducedMotion ? false : { opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reducedMotion ? {} : { opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={cn(
                      "rounded-lg border px-3 py-2 transition-colors",
                      colors.bg,
                      colors.border,
                      isTop && "shadow-sm",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("font-mono text-[12px] font-semibold", colors.label)}>
                        {frame.fn}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", colors.badge)}>
                        {frame.state}
                      </span>
                    </div>
                    {frame.args && (
                      <p className="mt-0.5 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {frame.args}
                      </p>
                    )}
                    {frame.locals && (
                      <p className="mt-0.5 font-mono text-[11px] text-teal-600 dark:text-teal-400">
                        {frame.locals}
                      </p>
                    )}
                    {frame.returnValue && (
                      <p className="mt-0.5 font-mono text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                        → returns {frame.returnValue}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 min-h-[40px] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {step.description}
        </motion.p>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2">
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
            else { if (isLast) setCurrent(0); setPlaying(true); }
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
