"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type TokenBlock = {
  id: string;
  label: string;
  tokens: number;
  color: "rose" | "gray" | "amber" | "teal" | "blue" | "violet";
};

export type ContextLimitStep = {
  id: string;
  label: string;
  caption: string;
  blocks: TokenBlock[];
  sideNote: string | null;
  errorState: boolean;
  resetBar: boolean;
};

export interface ContextLimitSimulatorProps {
  title: string;
  caption: string;
  windowSize: number;
  steps: ContextLimitStep[];
}

type RenderedTokenBlock = TokenBlock & {
  widthPct: number;
  targetWidthPct: number;
  delayMs: number;
};

const colorStyles = {
  rose: {
    bar: "bg-rose-400 dark:bg-rose-500",
    pill:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
    dot: "bg-rose-500",
  },
  gray: {
    bar: "bg-gray-400 dark:bg-gray-500",
    pill:
      "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200",
    dot: "bg-gray-500",
  },
  amber: {
    bar: "bg-amber-400 dark:bg-amber-500",
    pill:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  teal: {
    bar: "bg-teal-400 dark:bg-teal-500",
    pill:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200",
    dot: "bg-teal-500",
  },
  blue: {
    bar: "bg-blue-400 dark:bg-blue-500",
    pill:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
    dot: "bg-blue-500",
  },
  violet: {
    bar: "bg-violet-400 dark:bg-violet-500",
    pill:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200",
    dot: "bg-violet-500",
  },
} as const;

const BLOCK_TRANSITION_MS = 400;
const BLOCK_STAGGER_MS = 120;
const COUNT_ANIMATION_MS = 300;
const NOTE_DELAY_MS = 160;
const ERROR_BADGE_MIN_DELAY_MS = 180;
const INLINE_LABEL_MIN_WIDTH_PX = 60;

function formatTokens(value: number) {
  return value.toLocaleString("en-US");
}

function getStepSummary(label: string) {
  return label.replace(/^Step\s+\d+\s*[—-]\s*/u, "");
}

function getStepTotal(step: ContextLimitStep | undefined) {
  return step?.blocks.reduce((sum, block) => sum + block.tokens, 0) ?? 0;
}

function buildCollapsedBlocks(step: ContextLimitStep, windowSize: number): RenderedTokenBlock[] {
  const denominator = Math.max(windowSize, 1);

  return step.blocks.map((block, index) => {
    const targetWidthPct = Math.max((block.tokens / denominator) * 100, 0);

    return {
      ...block,
      widthPct: 0,
      targetWidthPct,
      delayMs: index * BLOCK_STAGGER_MS,
    };
  });
}

function getAnimationDurationMs(blockCount: number) {
  if (blockCount <= 0) {
    return BLOCK_TRANSITION_MS;
  }

  return (blockCount - 1) * BLOCK_STAGGER_MS + BLOCK_TRANSITION_MS;
}

export default function ContextLimitSimulator({
  title,
  caption,
  windowSize,
  steps,
}: ContextLimitSimulatorProps) {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transitionTokenRef = useRef(0);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trackWidthPx, setTrackWidthPx] = useState(0);
  const [renderedBlocks, setRenderedBlocks] = useState<RenderedTokenBlock[]>([]);
  const [runningTotal, setRunningTotal] = useState(0);
  const [showSideNote, setShowSideNote] = useState(false);
  const [showErrorBadge, setShowErrorBadge] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const currentStep = steps[currentStepIndex];
  const maxTotal = Math.max(windowSize, 1);

  const narrowBlocks = useMemo(
    () =>
      renderedBlocks.filter(
        (block) => (block.targetWidthPct / 100) * trackWidthPx < INLINE_LABEL_MIN_WIDTH_PX,
      ),
    [renderedBlocks, trackWidthPx],
  );

  const inlineBlocks = useMemo(
    () =>
      new Set(
        renderedBlocks
          .filter(
            (block) => (block.targetWidthPct / 100) * trackWidthPx >= INLINE_LABEL_MIN_WIDTH_PX,
          )
          .map((block) => block.id),
      ),
    [renderedBlocks, trackWidthPx],
  );

  const ticks = useMemo(
    () =>
      [
        { tokens: 16_384, label: "16k limit" },
        { tokens: 32_768, label: "32k limit" },
      ].filter((tick) => tick.tokens < windowSize),
    [windowSize],
  );

  useEffect(() => {
    if (!trackRef.current) {
      return;
    }

    const updateTrackWidth = () => {
      if (trackRef.current) {
        setTrackWidthPx(trackRef.current.clientWidth);
      }
    };

    updateTrackWidth();

    const observer = new ResizeObserver(updateTrackWidth);
    observer.observe(trackRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [],
  );

  if (!currentStep) {
    return null;
  }

  const animateRunningTotal = (targetTotal: number) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (reducedMotion) {
      setRunningTotal(targetTotal);
      return;
    }

    const startTotal = runningTotal;
    const delta = targetTotal - startTotal;
    const startTime = performance.now();

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / COUNT_ANIMATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setRunningTotal(Math.round(startTotal + delta * eased));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const revealBlocks = (transitionToken: number, targetBlocks: RenderedTokenBlock[]) => {
    requestAnimationFrame(() => {
      if (transitionTokenRef.current !== transitionToken) {
        return;
      }

      setRenderedBlocks(
        targetBlocks.map((block) => ({
          ...block,
          widthPct: block.targetWidthPct,
        })),
      );
    });
  };

  const collapseRenderedBlocks = (transitionToken: number) => {
    setRenderedBlocks((existingBlocks) =>
      existingBlocks.map((block, index) => ({
        ...block,
        widthPct: 0,
        delayMs: reducedMotion
          ? 0
          : (existingBlocks.length - 1 - index) * BLOCK_STAGGER_MS,
      })),
    );

    if (reducedMotion || transitionTokenRef.current !== transitionToken) {
      return 0;
    }

    return getAnimationDurationMs(renderedBlocks.length);
  };

  const moveToStep = (targetIndex: number, direction: "next" | "prev", toPristine = false) => {
    const targetStep = steps[targetIndex];

    if (!targetStep || isAnimating) {
      return;
    }

    const transitionToken = transitionTokenRef.current + 1;
    transitionTokenRef.current = transitionToken;
    setIsAnimating(true);
    setShowSideNote(false);
    setShowErrorBadge(false);
    setCurrentStepIndex(targetIndex);

    const targetTotal = toPristine ? 0 : getStepTotal(targetStep);
    animateRunningTotal(targetTotal);

    const shouldResetBar = targetStep.resetBar || direction === "prev" || toPristine;
    const collapseDuration = shouldResetBar ? collapseRenderedBlocks(transitionToken) : 0;

    window.setTimeout(() => {
      if (transitionTokenRef.current !== transitionToken) {
        return;
      }

      if (toPristine) {
        setRenderedBlocks([]);
        setHasStarted(false);
        setIsAnimating(false);
        return;
      }

      setHasStarted(true);

      const nextBlocks = buildCollapsedBlocks(targetStep, maxTotal);
      const preparedBlocks =
        direction === "next" && !targetStep.resetBar
          ? nextBlocks.map((block) => {
              const currentBlock = renderedBlocks.find((item) => item.id === block.id);
              const shouldPreserve =
                currentBlock !== undefined && currentBlock.targetWidthPct === block.targetWidthPct;

              return {
                ...block,
                widthPct: shouldPreserve ? currentBlock.widthPct : 0,
                delayMs: shouldPreserve ? 0 : block.delayMs,
              };
            })
          : nextBlocks;

      setRenderedBlocks(preparedBlocks);
      revealBlocks(transitionToken, preparedBlocks);

      const enterDuration = reducedMotion
        ? 0
        : Math.max(getAnimationDurationMs(targetStep.blocks.length), ERROR_BADGE_MIN_DELAY_MS);

      window.setTimeout(() => {
        if (transitionTokenRef.current !== transitionToken) {
          return;
        }

        if (targetStep.sideNote) {
          setShowSideNote(true);
        }

        if (targetStep.errorState) {
          setShowErrorBadge(true);
          setPulseKey((current) => current + 1);
        }

        setIsAnimating(false);
      }, enterDuration + NOTE_DELAY_MS);
    }, collapseDuration);
  };

  const handleNextStep = () => {
    if (!hasStarted) {
      moveToStep(0, "next");
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      moveToStep(currentStepIndex + 1, "next");
    }
  };

  const handlePrevStep = () => {
    if (!hasStarted) {
      return;
    }

    if (currentStepIndex === 0) {
      moveToStep(0, "prev", true);
      return;
    }

    moveToStep(currentStepIndex - 1, "prev");
  };

  const complete = hasStarted && currentStepIndex === steps.length - 1;
  const noteToneClass = currentStep.errorState
    ? "text-rose-600 dark:text-rose-300"
    : currentStep.resetBar
      ? "text-emerald-600 dark:text-emerald-300"
      : "text-gray-700 dark:text-gray-300";

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
              Step {currentStepIndex + 1} of {steps.length} - {getStepSummary(currentStep.label)}
            </p>
            <div className="flex items-center gap-2">
              {hasStarted && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isAnimating}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  ← Prev Step
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                disabled={complete || isAnimating}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed",
                  complete
                    ? "border border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
                    : "border border-violet-300 bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60 dark:border-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400",
                )}
              >
                {complete ? "Simulation Complete" : "Next Step →"}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showErrorBadge && currentStep.errorState && (
            <motion.div
              key="context-error-badge"
              initial={reducedMotion ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 28, duration: 0.2 }
              }
              className="inline-flex w-fit items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
            >
              ❌ context_length_exceeded
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              <span>0 tokens</span>
              <span>{formatTokens(windowSize)} tokens</span>
            </div>

            <div
              ref={trackRef}
              className="relative h-16 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50"
            >
              {ticks.map((tick) => (
                <div
                  key={tick.tokens}
                  className="pointer-events-none absolute inset-y-0 z-10"
                  style={{ left: `${(tick.tokens / maxTotal) * 100}%` }}
                >
                  <div className="h-full w-px bg-gray-400/40 dark:bg-gray-500/50" />
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:bg-gray-950/80 dark:text-gray-400">
                    {tick.label}
                  </span>
                </div>
              ))}

              <div className="flex h-full w-full">
                {renderedBlocks.map((block) => {
                  const tone = colorStyles[block.color];
                  const showInlineLabel = inlineBlocks.has(block.id);

                  return (
                    <div
                      key={block.id}
                      className={cn(
                        "relative flex h-full shrink-0 items-center overflow-hidden border-r border-white/30 px-3 last:border-r-0 dark:border-gray-950/20",
                        tone.bar,
                      )}
                      style={{
                        width: `${Math.min(block.widthPct, 100)}%`,
                        transition: reducedMotion
                          ? "none"
                          : "width 400ms ease-out",
                        transitionDelay: reducedMotion ? "0ms" : `${block.delayMs}ms`,
                      }}
                    >
                      {showInlineLabel && (
                        <span className="truncate text-xs font-bold text-white drop-shadow-sm">
                          {block.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <AnimatePresence>
                {showErrorBadge && currentStep.errorState && (
                  <motion.div
                    key={`context-pulse-${pulseKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="context-limit-pulse pointer-events-none absolute inset-0"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  Running total
                </p>
                <p className="font-mono text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTokens(runningTotal)}
                  <span className="ml-2 text-base font-semibold text-gray-400 dark:text-gray-500">
                    / {formatTokens(windowSize)} tokens
                  </span>
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                Full window scale
              </p>
            </div>

            {narrowBlocks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {narrowBlocks.map((block) => (
                  <span
                    key={`legend-${block.id}`}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold",
                      colorStyles[block.color].pill,
                    )}
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", colorStyles[block.color].dot)}
                    />
                    {block.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {hasStarted && showSideNote && currentStep.sideNote ? (
              <motion.div
                key={`${currentStep.id}-side-note`}
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/50"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <p className={cn("mt-3 text-base font-semibold leading-7", noteToneClass)}>
                  {currentStep.sideNote}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty-side-note"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden min-h-[110px] rounded-2xl border border-dashed border-gray-200 bg-white/40 dark:border-gray-700 dark:bg-gray-900/20 lg:block"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep.id}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="rounded-2xl border border-gray-200 bg-white/70 p-5 text-base leading-8 text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200"
          >
            {currentStep.caption}
          </motion.p>
        </AnimatePresence>

        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{caption}</p>
      </div>

      <style jsx>{`
        .context-limit-pulse {
          animation: context-limit-pulse 450ms ease-in-out 3;
        }

        @keyframes context-limit-pulse {
          0%,
          100% {
            background-color: rgba(244, 63, 94, 0.55);
          }

          50% {
            background-color: rgba(254, 205, 211, 0.75);
          }
        }
      `}</style>
    </motion.div>
  );
}
