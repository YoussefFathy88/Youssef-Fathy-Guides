"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

export interface LoopStep {
  id: string;
  actor: "user" | "model" | "your-code";
  label: string;
  bubble: string;
  /** "message" = plain chat-style line (like a real chat turn). "code" (default) = monospace block, e.g. a tool call. */
  bubbleKind?: "message" | "code";
  /** Small caps header shown above a "code" bubble, e.g. "Tool call". */
  bubbleLabel?: string;
  detail: string;
}

export interface AgentLoopStepperProps {
  title?: string;
  caption?: string;
  steps: LoopStep[];
}

const actor = {
  user: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    cardBg: "bg-gray-50 dark:bg-gray-800/60",
    cardBorder: "border-gray-200 dark:border-gray-700",
    dotBg: "bg-gray-400",
    dotActive: "bg-gray-500 ring-gray-300 dark:ring-gray-600",
    bubbleBg: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    label: "YOU",
    icon: "👤",
  },
  model: {
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    cardBg: "bg-violet-50/40 dark:bg-violet-500/5",
    cardBorder: "border-violet-200 dark:border-violet-500/30",
    dotBg: "bg-violet-300 dark:bg-violet-700",
    dotActive: "bg-violet-500 ring-violet-300 dark:ring-violet-600",
    bubbleBg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30",
    label: "MODEL",
    icon: "🤖",
  },
  "your-code": {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    cardBg: "bg-amber-50/40 dark:bg-amber-500/5",
    cardBorder: "border-amber-200 dark:border-amber-500/30",
    dotBg: "bg-amber-300 dark:bg-amber-700",
    dotActive: "bg-amber-500 ring-amber-300 dark:ring-amber-600",
    bubbleBg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30",
    label: "YOUR CODE",
    icon: "⚙️",
  },
} as const;

export default function AgentLoopStepper({ title, caption, steps }: AgentLoopStepperProps) {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (next: number) => {
      setDirection(next > current ? 1 : -1);
      setCurrent(next);
    },
    [current],
  );

  const stepForward = useCallback(() => {
    if (current < steps.length - 1) {
      go(current + 1);
    } else {
      setPlaying(false);
    }
  }, [current, steps.length, go]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(stepForward, 2200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, current, stepForward]);

  const step = steps[current];
  const tone = actor[step.actor];
  const isLast = current === steps.length - 1;

  const variants = {
    enter: (d: number) => ({
      x: reducedMotion ? 0 : d * 28,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: reducedMotion ? 0 : d * -28,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-6 md:mb-8 space-y-2">
          {title && (
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">
              {title}
            </h2>
          )}
          {caption && (
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">{caption}</p>
          )}
        </div>
      )}

      {/* Step dots */}
      <div className="mb-6 md:mb-8 flex items-center gap-2">
        {steps.map((s, i) => {
          const t = actor[s.actor];
          const isCurrent = i === current;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                "h-3 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
                isCurrent
                  ? cn("w-8 ring-2 ring-offset-1", t.dotActive)
                  : cn("w-3 opacity-40 hover:opacity-70", t.dotBg),
              )}
            />
          );
        })}
        <span className="ml-auto text-base md:text-lg font-semibold text-gray-500 dark:text-gray-400">
          {current + 1} / {steps.length}
        </span>
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-xl" style={{ minHeight: 280 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "rounded-xl border p-6 md:p-7",
              tone.cardBg,
              tone.cardBorder,
            )}
          >
            {/* Actor badge + step label */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm md:text-base font-bold uppercase tracking-wider",
                tone.badge,
              )}>
                <span className="text-xl leading-none">{tone.icon}</span>
                {tone.label}
              </span>
              <span className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
                {step.label}
              </span>
            </div>

            {/* Bubble — a plain chat line, or a code/tool-call block */}
            {step.bubbleKind === "message" ? (
              <div className={cn(
                "mb-5 flex justify-center rounded-full border px-5 py-3 text-center md:px-6",
                tone.bubbleBg,
              )}>
                <p className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-100">
                  {step.bubble}
                </p>
              </div>
            ) : (
              <div className={cn(
                "mb-5 rounded-lg border p-4 md:p-5",
                tone.bubbleBg,
              )}>
                {step.bubbleLabel && (
                  <p className="mb-2 text-sm md:text-base font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {step.bubbleLabel}
                  </p>
                )}
                <p className="font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-100">
                  {step.bubble}
                </p>
              </div>
            )}

            {/* Detail */}
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
              {step.detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={current === 0}
          onClick={() => { setPlaying(false); go(current - 1); }}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-base md:text-lg font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          ← Prev
        </button>

        <button
          type="button"
          disabled={isLast}
          onClick={() => { setPlaying(false); stepForward(); }}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-base md:text-lg font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Step →
        </button>

        <button
          type="button"
          onClick={() => {
            if (playing) {
              setPlaying(false);
            } else {
              if (isLast) go(0);
              setPlaying(true);
            }
          }}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg px-5 py-3 text-base md:text-lg font-semibold transition",
            playing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              : "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          {playing ? "⏸ Pause" : isLast ? "↩ Replay" : "▶ Play"}
        </button>

        {isLast && (
          <span className="ml-auto text-base md:text-lg font-medium text-gray-500 dark:text-gray-400">
            ↩ loop repeats for multi-step agents
          </span>
        )}
      </div>
    </motion.div>
  );
}
