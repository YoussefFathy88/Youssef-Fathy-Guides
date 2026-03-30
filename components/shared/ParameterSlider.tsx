"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface ParameterSliderState {
  max?: number;
  description: string;
  examples?: string[];
  colorClassName?: string;
}

export interface ParameterSliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  states?: ParameterSliderState[];
  outputFn?: (value: number) => string;
  outputExamples?: (value: number) => string[];
  colorFn?: (value: number) => string;
}

const defaultOutputFn = (value: number) => `Current setting: ${value.toFixed(2)}`;

const defaultExamples = (value: number) => [
  `Example A: ${value.toFixed(2)}`,
  `Example B: ${(value * 1.5).toFixed(2)}`,
  `Example C: ${(value * 2).toFixed(2)}`,
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPrecision(step: number) {
  const stepString = step.toString();
  const decimalIndex = stepString.indexOf(".");
  return decimalIndex >= 0 ? stepString.length - decimalIndex - 1 : 0;
}

function getResolvedState(states: ParameterSliderState[] | undefined, value: number) {
  if (!states || states.length === 0) {
    return undefined;
  }

  return states.find((state) => state.max === undefined || value <= state.max) ?? states.at(-1);
}

export default function ParameterSlider({
  label = "Parameter",
  min = 0,
  max = 1,
  step = 0.1,
  defaultValue = 0.5,
  unit = "",
  states,
  outputFn = defaultOutputFn,
  outputExamples,
  colorFn,
}: ParameterSliderProps) {
  const reducedMotion = useReducedMotion();
  const sliderId = useId();
  const [value, setValue] = useState(clamp(defaultValue, min, max));

  const precision = useMemo(() => getPrecision(step), [step]);
  const resolvedState = useMemo(() => getResolvedState(states, value), [states, value]);
  const accentClass =
    resolvedState?.colorClassName ??
    colorFn?.(value) ??
    "bg-violet-500 dark:bg-violet-400";
  const percent = ((value - min) / Math.max(max - min, Number.EPSILON)) * 100;
  const description = resolvedState?.description ?? outputFn(value);
  const examples =
    resolvedState?.examples ?? outputExamples?.(value) ?? defaultExamples(value);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor={sliderId}
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
          </label>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-mono text-white shadow-sm transition-colors",
              accentClass,
            )}
          >
            {value.toFixed(precision)}
            {unit}
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative pt-4">
            <div className="relative h-4">
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-200 via-violet-300 to-amber-400 shadow-inner dark:from-violet-900 dark:via-violet-700 dark:to-amber-500" />
              <motion.div
                className={cn(
                  "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_4px_16px_rgba(15,23,42,0.25)] dark:border-gray-900",
                  accentClass,
                )}
                animate={reducedMotion ? undefined : { left: `calc(${percent}% - 0.625rem)` }}
                style={reducedMotion ? { left: `calc(${percent}% - 0.625rem)` } : undefined}
                transition={{ duration: 0.3, ease: "easeOut" }}
                aria-hidden="true"
              />
              <input
                id={sliderId}
                aria-label={label}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => setValue(Number(event.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Low - {min.toFixed(precision)}
              {unit}
            </span>
            <span>
              High - {max.toFixed(precision)}
              {unit}
            </span>
          </div>
        </div>

        <div className="min-h-16 rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <AnimatePresence mode="wait">
            <motion.p
              key={description}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-sm text-gray-700 dark:text-gray-200"
            >
              {description}
            </motion.p>
          </AnimatePresence>
        </div>

        {examples.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {examples.slice(0, 3).map((example, index) => (
              <motion.span
                key={`${index}-${example}`}
                layout={!reducedMotion}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {example}
              </motion.span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
