"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface ContextBlock {
  id: string;
  label: string;
  tokens: number;
  color: "violet" | "teal" | "amber" | "blue" | "gray" | "rose";
  defaultOn?: boolean;
  icon?: string;
  description?: string;
}

export interface ContextWindowFillerProps {
  title?: string;
  caption?: string;
  windowSize: number;
  costPer1kTokens?: number;
  blocks: ContextBlock[];
  /** "lg" scales up padding, bar height, and type for full-slide use. Defaults to "md". */
  size?: "md" | "lg";
}

const colorTokens = {
  violet: {
    chipOff: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
    chipOn: "border-violet-500 bg-violet-100 text-violet-700 dark:border-violet-400 dark:bg-violet-500/20 dark:text-violet-300",
    bar: "bg-violet-400 dark:bg-violet-500",
    count: "text-violet-600 dark:text-violet-400",
  },
  teal: {
    chipOff: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300",
    chipOn: "border-teal-500 bg-teal-100 text-teal-700 dark:border-teal-400 dark:bg-teal-500/20 dark:text-teal-300",
    bar: "bg-teal-400 dark:bg-teal-500",
    count: "text-teal-600 dark:text-teal-400",
  },
  amber: {
    chipOff: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    chipOn: "border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-400 dark:bg-amber-500/20 dark:text-amber-300",
    bar: "bg-amber-400 dark:bg-amber-500",
    count: "text-amber-600 dark:text-amber-400",
  },
  blue: {
    chipOff: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    chipOn: "border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-300",
    bar: "bg-blue-400 dark:bg-blue-500",
    count: "text-blue-600 dark:text-blue-400",
  },
  rose: {
    chipOff: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    chipOn: "border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-400 dark:bg-rose-500/20 dark:text-rose-300",
    bar: "bg-rose-400 dark:bg-rose-500",
    count: "text-rose-600 dark:text-rose-400",
  },
  gray: {
    chipOff: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400",
    chipOn: "border-gray-400 bg-gray-100 text-gray-700 dark:border-gray-400 dark:bg-gray-700 dark:text-gray-200",
    bar: "bg-gray-400 dark:bg-gray-500",
    count: "text-gray-500 dark:text-gray-400",
  },
} as const;

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${n}`;
}

function formatCost(tokens: number, costPer1k: number): string {
  const cost = (tokens / 1000) * costPer1k;
  if (cost < 0.01) return "< $0.01";
  return `$${cost.toFixed(2)}`;
}

export default function ContextWindowFiller({
  title,
  caption,
  windowSize,
  costPer1kTokens = 0.003,
  blocks,
  size = "md",
}: ContextWindowFillerProps) {
  const reducedMotion = useReducedMotion();
  const lg = size === "lg";

  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(blocks.filter((b) => b.defaultOn).map((b) => b.id)),
  );

  const toggle = (id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeBlocks = blocks.filter((b) => enabled.has(b.id));
  const totalTokens = activeBlocks.reduce((sum, b) => sum + b.tokens, 0);
  const fillPct = Math.min((totalTokens / windowSize) * 100, 100);
  const overLimit = totalTokens > windowSize;
  const nearLimit = !overLimit && fillPct > 75;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "w-full rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
        lg ? "p-8 md:p-10" : "p-6",
      )}
    >
      {(title || caption) && (
        <div className={cn("space-y-1", lg ? "mb-7" : "mb-5")}>
          {title && (
            <p className={cn("font-semibold text-gray-900 dark:text-gray-100", lg ? "text-xl md:text-2xl" : "text-lg")}>
              {title}
            </p>
          )}
          {caption && (
            <p className={cn("leading-6 text-gray-500 dark:text-gray-400", lg ? "text-lg md:text-xl" : "text-sm")}>
              {caption}
            </p>
          )}
        </div>
      )}

      {/* Toggle chips */}
      <div className={cn("flex flex-wrap gap-2", lg ? "mb-7 gap-3" : "mb-5")}>
        {blocks.map((block) => {
          const on = enabled.has(block.id);
          const tone = colorTokens[block.color];
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => toggle(block.id)}
              aria-pressed={on}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl border text-left transition-all duration-150 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                lg ? "gap-3 px-5 py-4" : "px-3 py-2",
                on ? tone.chipOn : tone.chipOff,
                !on && "opacity-50 hover:opacity-70",
              )}
            >
              {block.icon && (
                <span className={cn("shrink-0 leading-none", lg ? "text-2xl" : "text-lg")}>{block.icon}</span>
              )}
              <div className="min-w-0">
                <p className={cn("font-semibold leading-none", lg ? "text-lg md:text-xl" : "text-sm")}>{block.label}</p>
                <p className={cn("mt-1 font-semibold leading-none", lg ? "text-base md:text-lg" : "text-xs", tone.count)}>
                  {formatTokens(block.tokens)} tokens
                </p>
              </div>
              <span
                className={cn(
                  "ml-1 flex shrink-0 items-center justify-center rounded-full font-bold",
                  lg ? "h-7 w-7 text-sm" : "h-5 w-5 text-[10px]",
                  on
                    ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500",
                )}
              >
                {on ? "✓" : "+"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fill bar track */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl transition-colors duration-300",
          lg ? "mb-3 h-16" : "mb-2 h-10",
          overLimit
            ? "bg-rose-100 dark:bg-rose-500/10"
            : nearLimit
              ? "bg-amber-50 dark:bg-amber-500/10"
              : "bg-gray-100 dark:bg-gray-700/50",
        )}
      >
        {/* 75% amber marker */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-amber-400/50"
          style={{ left: "75%" }}
        />

        {/* Colored segments */}
        <div className="flex h-full">
          {activeBlocks.map((block) => {
            const tone = colorTokens[block.color];
            const widthPct = (block.tokens / windowSize) * 100;
            return (
              <motion.div
                key={block.id}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("h-full shrink-0", tone.bar)}
                style={{ width: `${widthPct}%` }}
              />
            );
          })}
        </div>

        {/* Live token label inside bar */}
        {totalTokens > 0 && (
          <div className={cn("pointer-events-none absolute inset-0 flex items-center", lg ? "px-5" : "px-3")}>
            <span className={cn("font-bold text-white drop-shadow-sm", lg ? "text-xl md:text-2xl" : "text-sm")}>
              {totalTokens.toLocaleString()} tokens
            </span>
          </div>
        )}

        {/* Right label */}
        <div className={cn("pointer-events-none absolute inset-y-0 flex items-center", lg ? "right-5" : "right-3")}>
          <span
            className={cn(
              "font-semibold",
              lg ? "text-base md:text-lg" : "text-xs",
              overLimit
                ? "text-rose-500 dark:text-rose-400"
                : nearLimit
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-400 dark:text-gray-500",
            )}
          >
            {overLimit
              ? "OVER LIMIT"
              : nearLimit
                ? "NEAR LIMIT"
                : `/ ${formatTokens(windowSize)}`}
          </span>
        </div>
      </div>

      {/* Zone legend */}
      <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", lg ? "mb-6" : "mb-4")}>
        <div className="flex items-center gap-1.5">
          <div className={cn("rounded-sm bg-teal-400", lg ? "h-3 w-4" : "h-2 w-3")} />
          <span className={cn("text-gray-400", lg ? "text-base md:text-lg" : "text-xs")}>0–75% safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("rounded-sm bg-amber-400", lg ? "h-3 w-4" : "h-2 w-3")} />
          <span className={cn("text-gray-400", lg ? "text-base md:text-lg" : "text-xs")}>75–100% getting full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("rounded-sm bg-rose-400", lg ? "h-3 w-4" : "h-2 w-3")} />
          <span className={cn("text-gray-400", lg ? "text-base md:text-lg" : "text-xs")}>over limit — truncated</span>
        </div>
      </div>

      {/* Stats row */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60",
          lg ? "px-6 py-5" : "px-4 py-3",
        )}
      >
        <div>
          <p className={cn("uppercase tracking-wide text-gray-400", lg ? "text-sm md:text-base" : "text-xs")}>tokens used</p>
          <p
            className={cn(
              "font-bold tabular-nums leading-tight",
              lg ? "text-3xl md:text-4xl" : "text-2xl",
              overLimit
                ? "text-rose-600 dark:text-rose-400"
                : "text-gray-900 dark:text-gray-100",
            )}
          >
            {totalTokens.toLocaleString()}
            <span className={cn("ml-1 font-normal text-gray-400", lg ? "text-lg md:text-xl" : "text-sm")}>
              / {windowSize.toLocaleString()}
            </span>
          </p>
        </div>

        <div>
          <p className={cn("uppercase tracking-wide text-gray-400", lg ? "text-sm md:text-base" : "text-xs")}>window fill</p>
          <p
            className={cn(
              "font-bold tabular-nums leading-tight",
              lg ? "text-3xl md:text-4xl" : "text-2xl",
              overLimit
                ? "text-rose-600 dark:text-rose-400"
                : nearLimit
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-900 dark:text-gray-100",
            )}
          >
            {Math.min(Math.round(fillPct), 100)}%
          </p>
        </div>

        <div>
          <p className={cn("uppercase tracking-wide text-gray-400", lg ? "text-sm md:text-base" : "text-xs")}>est. input cost</p>
          <p className={cn("font-bold tabular-nums leading-tight text-gray-900 dark:text-gray-100", lg ? "text-3xl md:text-4xl" : "text-2xl")}>
            {totalTokens > 0 ? formatCost(totalTokens, costPer1kTokens) : "—"}
          </p>
        </div>

        {totalTokens === 0 && (
          <p className={cn("italic text-gray-400", lg ? "text-lg" : "text-sm")}>Toggle blocks above to fill the window</p>
        )}
      </div>

      {/* Overflow warning */}
      <AnimatePresence>
        {overLimit && (
          <motion.div
            key="overflow-warning"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10"
          >
            <span className="mt-0.5 shrink-0 text-base leading-none">⚠️</span>
            <p className="text-sm leading-6 text-rose-700 dark:text-rose-300">
              <strong>Over limit by {formatTokens(totalTokens - windowSize)} tokens.</strong>{" "}
              The API will error or truncate the oldest messages to fit. Remove blocks or reduce their size.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
