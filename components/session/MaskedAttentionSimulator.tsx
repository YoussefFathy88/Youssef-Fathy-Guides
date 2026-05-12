"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

import { cn } from "@/lib/utils";

export interface MaskedAttentionSimulatorProps {
  tokens?: string[];
  title?: string;
  caption?: string;
}

const defaultTokens = ["The", "capital", "of", "Egypt", "is", "Cairo"];

export default function MaskedAttentionSimulator({
  tokens = defaultTokens,
  title = "Masked Self-Attention (Causal Masking)",
  caption = "Click 'Next Token' to simulate autoregressive generation. Notice how future tokens are masked out (−∞) so the model cannot cheat by looking ahead.",
}: MaskedAttentionSimulatorProps) {
  const reducedMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Generate pseudo-random attention weights for visual purposes
  const weights = useMemo(() => {
    let rngSeed = 42;
    const random = () => {
      rngSeed = (rngSeed * 9301 + 49297) % 233280;
      return rngSeed / 233280;
    };

    return tokens.map((_, rowIndex) => {
      let rowSum = 0;
      const rowVals = tokens.map((_, colIndex) => {
        if (colIndex > rowIndex) return 0;
        const val = random() * 0.5 + (rowIndex === colIndex ? 0.4 : 0.1);
        rowSum += val;
        return val;
      });
      return rowVals.map((v) => (v === 0 ? 0 : v / rowSum));
    });
  }, [tokens]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, tokens.length - 1));
  };

  const handlePrev = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (activeStep >= tokens.length - 1) {
      setIsAutoPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setActiveStep((prev) => prev + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isAutoPlaying, activeStep, tokens.length]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm md:p-8 dark:border-gray-700 dark:bg-gray-800/80"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{caption}</p>
        </div>

        <div className="-mx-2 overflow-x-auto px-2 pb-4">
          <div
            className="grid min-w-max gap-2 md:gap-3"
            style={{
              gridTemplateColumns: `minmax(100px, auto) repeat(${tokens.length}, minmax(40px, 1fr))`,
            }}
          >
            {/* Column Headers (Keys) */}
            <div className="flex items-end justify-end pb-2 pr-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Query \ Key
            </div>
            {tokens.map((token, index) => (
              <div
                key={`col-${index}`}
                className={cn(
                  "min-w-10 px-1 text-center font-mono text-sm font-semibold transition-colors duration-300",
                  index <= activeStep
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-300 dark:text-gray-600",
                )}
              >
                {token}
              </div>
            ))}

            {/* Matrix Rows (Queries) */}
            {tokens.map((token, rowIndex) => {
              const isActiveRow = rowIndex <= activeStep;
              const isCurrentRow = rowIndex === activeStep;

              return (
                <div className="contents" key={`row-${rowIndex}`}>
                  {/* Row Label (Query) */}
                  <div
                    className={cn(
                      "flex min-h-10 items-center justify-end rounded-xl border border-transparent px-4 text-right font-mono text-sm font-semibold transition-all duration-300",
                      isCurrentRow
                        ? "border-amber-200 bg-white shadow-sm dark:border-amber-900/50 dark:bg-gray-900"
                        : "",
                      isActiveRow && !isCurrentRow ? "text-gray-700 dark:text-gray-300" : "",
                      !isActiveRow ? "opacity-40 text-gray-300 dark:text-gray-600" : "",
                      isCurrentRow ? "text-amber-700 dark:text-amber-400" : "",
                    )}
                  >
                    {token}
                  </div>

                  {/* Matrix Cells */}
                  {tokens.map((_, colIndex) => {
                    const isMasked = colIndex > rowIndex;
                    const isVisible = rowIndex <= activeStep;
                    const weight = weights[rowIndex]![colIndex]!;
                    const alpha = 0.1 + weight * 0.9;

                    return (
                      <motion.div
                        key={`cell-${rowIndex}-${colIndex}`}
                        initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: isVisible ? 1 : 0.3,
                          scale: isCurrentRow && isVisible && !isMasked ? 1.05 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "flex min-h-10 min-w-10 items-center justify-center rounded-xl border font-mono text-xs font-medium transition-colors duration-300",
                          !isVisible &&
                            "border-gray-100 bg-gray-50 text-transparent dark:border-gray-800 dark:bg-gray-900/20",
                          isVisible &&
                            isMasked &&
                            "border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500",
                          isVisible &&
                            !isMasked &&
                            "border-amber-200/50 text-gray-800 shadow-sm dark:border-amber-900/30 dark:text-gray-100",
                          isCurrentRow &&
                            !isMasked &&
                            "z-10 ring-2 ring-amber-400 dark:ring-amber-500",
                        )}
                        style={
                          isVisible && !isMasked
                            ? { backgroundColor: `rgba(245, 158, 11, ${alpha})` }
                            : {}
                        }
                      >
                        {isVisible ? (isMasked ? "−∞" : weight.toFixed(2)) : ""}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={activeStep === tokens.length - 1}
            className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            Next Token
          </button>

          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            disabled={activeStep === tokens.length - 1}
            className="rounded-full border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
          >
            {isAutoPlaying ? "Pause" : "Auto Play"}
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleReset}
            disabled={activeStep === 0}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
}
