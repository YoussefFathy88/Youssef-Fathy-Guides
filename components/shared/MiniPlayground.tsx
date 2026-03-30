"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface MiniPlaygroundProps {
  placeholder?: string;
  inputLabel?: string;
  outputLabel?: string;
  simulationFn?: (input: string) => string;
  debounceMs?: number;
  showCharCount?: boolean;
  maxLength?: number;
  outputClassName?: string;
  title?: string;
  caption?: string;
  hint?: string;
}

const defaultSimulationFn = (input: string) =>
  input.trim() ? `Simulated output: ${input.trim()}` : "";

export default function MiniPlayground({
  placeholder = "Type a prompt or example input...",
  inputLabel = "Input",
  outputLabel = "Output",
  simulationFn = defaultSimulationFn,
  debounceMs = 400,
  showCharCount = true,
  maxLength = 200,
  outputClassName,
  title = "Mini playground",
  caption = "Type to simulate how a concept transforms input into output.",
  hint = "Try changing the wording to see the simulation update.",
}: MiniPlaygroundProps) {
  const reducedMotion = useReducedMotion();
  const [input, setInput] = useState("");
  const [resolvedOutput, setResolvedOutput] = useState("");
  const [displayedOutput, setDisplayedOutput] = useState("");
  const [isPending, setIsPending] = useState(false);

  const remainingChars = useMemo(() => maxLength - input.length, [input.length, maxLength]);

  useEffect(() => {
    setIsPending(true);

    const timeoutId = window.setTimeout(() => {
      const nextOutput = input.trim() ? simulationFn(input) : "";
      setResolvedOutput(nextOutput);
      setIsPending(false);
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, input, simulationFn]);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayedOutput(resolvedOutput);
      return undefined;
    }

    let currentIndex = 0;
    setDisplayedOutput("");

    const intervalId = window.setInterval(() => {
      currentIndex += 1;
      setDisplayedOutput(resolvedOutput.slice(0, currentIndex));

      if (currentIndex >= resolvedOutput.length) {
        window.clearInterval(intervalId);
      }
    }, 20);

    return () => window.clearInterval(intervalId);
  }, [reducedMotion, resolvedOutput]);

  const handleClear = () => {
    setInput("");
    setResolvedOutput("");
    setDisplayedOutput("");
    setIsPending(false);
  };

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
            onClick={handleClear}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition hover:border-violet-500 hover:text-violet-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-400 dark:hover:text-violet-400"
            aria-label="Clear playground input and output"
          >
            Clear
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {inputLabel}
              </label>
              {showCharCount ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {input.length}/{maxLength}
                </span>
              ) : null}
            </div>
            <textarea
              aria-label={inputLabel}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, maxLength))}
              placeholder={placeholder}
              className="min-h-[180px] w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {hint} {showCharCount ? `Remaining: ${remainingChars}.` : null}
            </p>
          </div>

          <div className="hidden items-center justify-center text-sm font-mono text-gray-400 md:flex">
            -&gt;
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {outputLabel}
            </label>
            <div
              className={cn(
                "min-h-[180px] rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4 text-sm text-gray-900 dark:text-gray-100",
                isPending && "animate-pulse",
                outputClassName,
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayedOutput || "empty"}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="whitespace-pre-wrap break-words"
                >
                  {displayedOutput || (
                    <span className="text-gray-500 dark:text-gray-400">
                      Simulated output will appear here.
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
