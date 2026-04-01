"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface SequenceStep {
  number: number;
  phase: string;
  title: string;
  detail: string;
  icon?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
}

export interface StepSequenceProps {
  steps: SequenceStep[];
  title?: string;
  caption?: string;
  orientation?: "horizontal" | "vertical";
}

const colorMap = {
  violet: {
    bg: "bg-violet-500",
    light: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-300 dark:border-violet-500/50",
    text: "text-violet-700 dark:text-violet-300",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    arrow: "#8b5cf6",
    ring: "ring-violet-300 dark:ring-violet-600",
  },
  teal: {
    bg: "bg-teal-500",
    light: "bg-teal-50 dark:bg-teal-500/10",
    border: "border-teal-300 dark:border-teal-500/50",
    text: "text-teal-700 dark:text-teal-300",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    arrow: "#14b8a6",
    ring: "ring-teal-300 dark:ring-teal-600",
  },
  amber: {
    bg: "bg-amber-500",
    light: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-300 dark:border-amber-500/50",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    arrow: "#f59e0b",
    ring: "ring-amber-300 dark:ring-amber-600",
  },
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-300 dark:border-blue-500/50",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    arrow: "#3b82f6",
    ring: "ring-blue-300 dark:ring-blue-600",
  },
  rose: {
    bg: "bg-rose-500",
    light: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-300 dark:border-rose-500/50",
    text: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    arrow: "#f43f5e",
    ring: "ring-rose-300 dark:ring-rose-600",
  },
  gray: {
    bg: "bg-gray-400",
    light: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    arrow: "#94a3b8",
    ring: "ring-gray-200 dark:ring-gray-700",
  },
} as const;

function HorizontalSequence({ steps, reducedMotion }: { steps: SequenceStep[]; reducedMotion: boolean | null }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const tone = colorMap[step.color ?? "violet"];
        const isActive = activeStep === i;

        return (
          <div key={step.number} className="flex flex-1 items-start">
            {/* Card */}
            <motion.button
              type="button"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
              onClick={() => setActiveStep(isActive ? null : i)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-shadow hover:shadow-md",
                tone.light,
                tone.border,
                isActive && `ring-2 ${tone.ring}`,
              )}
            >
              {/* Number badge */}
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                    tone.bg,
                  )}
                >
                  {step.number}
                </span>
                <span className={cn("text-[11px] font-semibold uppercase tracking-wide", tone.text)}>
                  {step.phase}
                </span>
                {step.icon && <span className="ml-auto text-base">{step.icon}</span>}
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{step.title}</p>
              <motion.div
                animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                initial={false}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                  {step.detail}
                </p>
              </motion.div>
            </motion.button>

            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <div className="mt-5 flex shrink-0 items-center px-1">
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                  <motion.path
                    d="M0 7 H16 M10 1 L16 7 L10 13"
                    stroke={tone.arrow}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.08 + 0.25, ease: "easeOut" }}
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VerticalSequence({ steps, reducedMotion }: { steps: SequenceStep[]; reducedMotion: boolean | null }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const tone = colorMap[step.color ?? "violet"];
        const isActive = activeStep === i;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.number} className="flex gap-4">
            {/* Left column: number circle + connecting line */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm",
                  tone.bg,
                )}
              >
                {step.icon ?? step.number}
              </motion.div>
              {!isLast && (
                <motion.div
                  initial={reducedMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.07 + 0.15, ease: "easeOut" }}
                  style={{ transformOrigin: "top" }}
                  className={cn("w-0.5 flex-1 my-1", tone.bg, "opacity-30")}
                />
              )}
            </div>

            {/* Right column: card */}
            <motion.button
              type="button"
              initial={reducedMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
              onClick={() => setActiveStep(isActive ? null : i)}
              className={cn(
                "mb-4 min-w-0 flex-1 rounded-xl border px-4 py-3 text-left transition-shadow hover:shadow-md",
                tone.light,
                tone.border,
                isActive && `ring-2 ${tone.ring}`,
              )}
            >
              <div className="flex min-w-0 items-start gap-2 sm:items-center">
                <span className={cn("shrink-0 text-[11px] font-semibold uppercase tracking-wide", tone.text)}>
                  {step.phase}
                </span>
                <span className="min-w-0 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                  {step.title}
                </span>
              </div>
              <motion.div
                animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                initial={false}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {step.detail}
                </p>
              </motion.div>
              {!isActive && (
                <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-500 dark:text-gray-500">
                  {step.detail}
                </p>
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

export default function StepSequence({
  steps,
  title,
  caption,
  orientation = "vertical",
}: StepSequenceProps) {
  const reducedMotion = useReducedMotion();

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

      {orientation === "horizontal" ? (
        <HorizontalSequence steps={steps} reducedMotion={reducedMotion} />
      ) : (
        <VerticalSequence steps={steps} reducedMotion={reducedMotion} />
      )}
    </motion.div>
  );
}
