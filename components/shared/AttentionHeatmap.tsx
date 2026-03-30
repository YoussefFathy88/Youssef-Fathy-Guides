"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface AttentionHeatmapProps {
  tokens?: string[];
  weights?: number[][];
  colorRamp?: "amber" | "violet" | "teal";
  title?: string;
  caption?: string;
}

const defaultTokens = ["Input", "goes", "here"];
const defaultWeights = [
  [1, 0.4, 0.2],
  [0.35, 1, 0.45],
  [0.2, 0.55, 1],
];

const rampMap = {
  amber: { rgb: "245 158 11", border: "border-amber-500" },
  violet: { rgb: "139 92 246", border: "border-violet-500" },
  teal: { rgb: "20 184 166", border: "border-teal-500" },
} as const;

function normalizeMatrix(tokens: string[], weights: number[][]) {
  return tokens.map((_, rowIndex) =>
    tokens.map((_, colIndex) => {
      const value = weights[rowIndex]?.[colIndex] ?? 0;
      return Math.min(Math.max(value, 0), 1);
    }),
  );
}

export default function AttentionHeatmap({
  tokens = defaultTokens,
  weights = defaultWeights,
  colorRamp = "amber",
  title = "Attention pattern",
  caption = "Click a row label to lock a token's attention pattern.",
}: AttentionHeatmapProps) {
  const reducedMotion = useReducedMotion();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const matrix = useMemo(() => normalizeMatrix(tokens, weights), [tokens, weights]);
  const ramp = rampMap[colorRamp];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRow(null)}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition hover:border-violet-500 hover:text-violet-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-400 dark:hover:text-violet-400"
            aria-label="Reset selected attention row"
          >
            Reset
          </button>
        </div>

        <div className="-mx-2 overflow-x-auto px-2">
          <div
            className="grid min-w-max gap-2"
            style={{ gridTemplateColumns: `minmax(112px, auto) repeat(${tokens.length}, minmax(32px, 1fr))` }}
          >
            <div />
            {tokens.map((token, index) => (
              <div
                key={`column-${token}-${index}`}
                className="min-w-8 px-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {token}
              </div>
            ))}

            {tokens.map((token, rowIndex) => {
              const isHovered = hoveredRow === rowIndex;
              const isSelected = selectedRow === rowIndex;
              const isDimmed = selectedRow !== null && !isSelected;

              return (
                <div className="contents" key={`row-${token}-${rowIndex}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredRow(rowIndex)}
                    onMouseLeave={() => setHoveredRow((current) => (current === rowIndex ? null : current))}
                    onFocus={() => setHoveredRow(rowIndex)}
                    onBlur={() => setHoveredRow((current) => (current === rowIndex ? null : current))}
                    onClick={() =>
                      setSelectedRow((current) => (current === rowIndex ? null : rowIndex))
                    }
                    className={cn(
                      "flex min-h-8 items-center rounded-xl border border-transparent px-3 text-left text-sm font-medium text-gray-900 transition dark:text-gray-100",
                      isHovered && "border-gray-300 bg-white/80 dark:border-gray-600 dark:bg-gray-900/50",
                      isSelected && `${ramp.border} border-l-4 bg-white dark:bg-gray-900/60`,
                      isDimmed && "opacity-50",
                    )}
                    aria-label={`Highlight attention row for ${token}`}
                  >
                    {token}
                  </button>

                  {matrix[rowIndex]?.map((weight, columnIndex) => {
                    const alpha = 0.08 + weight * 0.9;

                    return (
                      <motion.div
                        key={`cell-${rowIndex}-${columnIndex}`}
                        title={`${token} -> ${tokens[columnIndex]}: ${weight.toFixed(2)}`}
                        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
                        animate={{
                          opacity: selectedRow === null || isSelected ? 1 : 0.35,
                          scale: isSelected || isHovered ? 1.02 : 1,
                        }}
                        transition={{
                          duration: isSelected || isHovered ? 0.3 : 0.6,
                          ease: "easeOut",
                        }}
                        onMouseEnter={() => setHoveredRow(rowIndex)}
                        onMouseLeave={() => setHoveredRow((current) => (current === rowIndex ? null : current))}
                        className={cn(
                          "flex min-h-8 min-w-8 items-center justify-center rounded-lg border border-white/70 text-[11px] font-mono text-gray-700 shadow-sm dark:border-gray-900/40 dark:text-gray-100",
                          (isSelected || isHovered) && "ring-1 ring-inset ring-white/70 dark:ring-white/10",
                        )}
                        style={{
                          backgroundColor: `rgb(${ramp.rgb} / ${alpha})`,
                        }}
                      >
                        <span className="sr-only">{weight.toFixed(2)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
