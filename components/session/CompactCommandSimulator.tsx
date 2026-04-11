"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type CompactPhase = "normal" | "warning" | "compressing" | "compacted";

export type CompactBlock = {
  id: string;
  label: string;
  tokens: number;
  color: "rose" | "gray" | "amber" | "teal" | "blue" | "violet";
};

export type CompactStep = {
  id: string;
  label: string;
  caption: string;
  blocks: CompactBlock[];
  tokenCount: number;
  sideNote: string;
  phase: CompactPhase;
};

export interface CompactCommandSimulatorProps {
  title: string;
  caption: string;
  windowSize: number;
  steps: CompactStep[];
}

const colorStyles: Record<
  CompactBlock["color"],
  { row: string; dot: string }
> = {
  rose: {
    row: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100",
    dot: "bg-rose-500",
  },
  gray: {
    row: "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-800/70 dark:text-gray-100",
    dot: "bg-gray-500",
  },
  amber: {
    row: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
    dot: "bg-amber-500",
  },
  teal: {
    row: "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-100",
    dot: "bg-teal-500",
  },
  blue: {
    row: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100",
    dot: "bg-blue-500",
  },
  violet: {
    row: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100",
    dot: "bg-violet-500",
  },
};

function formatTokens(value: number) {
  return value.toLocaleString("en-US");
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default function CompactCommandSimulator({
  title,
  caption,
  windowSize,
  steps,
}: CompactCommandSimulatorProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [compressStage, setCompressStage] = useState<"idle" | "scan" | "exiting" | "done">("idle");
  const [summaryIn, setSummaryIn] = useState(false);

  const current = steps[stepIndex];
  const max = Math.max(windowSize, 1);
  const fillPct = Math.min((current.tokenCount / max) * 100, 100);

  const isCompressing = current.phase === "compressing";
  const isCompacted = current.phase === "compacted";

  useEffect(() => {
    if (!isCompressing) {
      setCompressStage("idle");
      return;
    }

    if (reducedMotion) {
      setCompressStage("done");
      return;
    }

    setCompressStage("scan");
    const tExit = window.setTimeout(() => setCompressStage("exiting"), 400);
    const tDone = window.setTimeout(() => setCompressStage("done"), 1500);
    return () => {
      window.clearTimeout(tExit);
      window.clearTimeout(tDone);
    };
  }, [stepIndex, isCompressing, reducedMotion]);

  useEffect(() => {
    if (!isCompacted) {
      setSummaryIn(false);
      return;
    }

    if (reducedMotion) {
      setSummaryIn(true);
      return;
    }

    const id = window.requestAnimationFrame(() => setSummaryIn(true));
    return () => window.cancelAnimationFrame(id);
  }, [stepIndex, isCompacted, reducedMotion]);

  const barFillClass = useMemo(() => {
    switch (current.phase) {
      case "warning":
        return "bg-amber-400 dark:bg-amber-500";
      case "compressing":
        return "bg-violet-500 dark:bg-violet-400 motion-safe:animate-pulse";
      case "compacted":
        return "bg-blue-500 dark:bg-blue-400";
      default:
        return "bg-gray-400 dark:bg-gray-500";
    }
  }, [current.phase]);

  const sideNoteClass = useMemo(() => {
    if (current.phase === "warning") {
      return "text-amber-700 dark:text-amber-300";
    }
    if (current.phase === "compacted") {
      return "text-emerald-700 dark:text-emerald-300";
    }
    return "text-gray-600 dark:text-gray-400";
  }, [current.phase]);

  const showBlockRows = current.blocks.length > 0;
  const hideBlocksWhileCompressing =
    isCompressing && (compressStage === "exiting" || compressStage === "done");

  const goPrev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const goNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
  };

  if (!current) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes compact-scan-down {
  from { top: 0; }
  to { top: calc(100% - 6px); }
}
.compact-scan-beam {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 6px;
  border-radius: 9999px;
  animation: compact-scan-down 1.5s ease-in-out forwards;
}
@media (prefers-reduced-motion: reduce) {
  .compact-scan-beam { animation: none; opacity: 0; }
}
`,
        }}
      />

      <div className="space-y-5">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</p>

        <div className="space-y-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{current.label}</p>
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">{current.caption}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            <span>0</span>
            <span>{formatTokens(windowSize)} tokens</span>
          </div>
          <div className="relative h-4 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900/60">
            <div
              className={cn("h-full rounded-full transition-[width] duration-500 ease-out", barFillClass)}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="text-center font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
            {formatTokens(current.tokenCount)} / {formatTokens(windowSize)} tokens
          </p>
        </div>

        <div className="relative min-h-[7rem] overflow-hidden rounded-xl border border-gray-200 bg-white/70 dark:border-gray-700 dark:bg-gray-900/40">
          {isCompressing && compressStage !== "idle" && (
            <div
              className="compact-scan-beam pointer-events-none z-20 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_14px_rgba(139,92,246,0.85)] dark:via-violet-200"
              aria-hidden="true"
            />
          )}

          <div className="relative z-10 space-y-2 p-3">
            {isCompacted ? (
              current.blocks.map((block) => {
                const tone = colorStyles[block.color];
                return (
                  <div
                    key={block.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-500 ease-out motion-reduce:transition-none",
                      tone.row,
                      summaryIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} />
                      <span className="leading-snug">{block.label}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                      {formatTokens(block.tokens)}
                    </span>
                  </div>
                );
              })
            ) : !showBlockRows ? (
              <div className="flex min-h-[6.5rem] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
                Context stack is empty — advance to load files, output, and conversation into the window.
              </div>
            ) : (
              current.blocks.map((block) => {
                const tone = colorStyles[block.color];
                const collapsing = isCompressing && hideBlocksWhileCompressing;

                return (
                  <div
                    key={block.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-700 ease-out motion-reduce:transition-none",
                      tone.row,
                      collapsing
                        ? "pointer-events-none max-h-0 translate-y-1 scale-95 overflow-hidden border-transparent py-0 opacity-0"
                        : "max-h-40 opacity-100",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} />
                      <span className="truncate">{block.label}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                      {formatTokens(block.tokens)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className={cn("text-center text-sm font-medium", sideNoteClass)}>{current.sideNote}</p>

        <p className="text-center text-sm leading-6 text-gray-500 dark:text-gray-400">{caption}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={stepIndex === 0}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={stepIndex >= steps.length - 1}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
              stepIndex >= steps.length - 1
                ? "border border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
                : "border border-violet-300 bg-violet-600 text-white hover:bg-violet-500 dark:border-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400",
            )}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
