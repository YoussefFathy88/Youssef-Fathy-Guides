"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface Step {
  title: string;
  caption: string;
  visual: ReactNode;
}

export interface ConceptStepperProps {
  steps?: Step[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  title?: string;
}

const defaultSteps: Step[] = [
  {
    title: "Step one",
    caption: "Introduce the first stage of the concept.",
    visual: (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-violet-500/10 text-sm text-violet-500 dark:text-violet-300">
        Stage 1
      </div>
    ),
  },
  {
    title: "Step two",
    caption: "Show how the second stage transforms the input.",
    visual: (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-teal-500/10 text-sm text-teal-500 dark:text-teal-300">
        Stage 2
      </div>
    ),
  },
  {
    title: "Step three",
    caption: "Wrap the flow with the final output state.",
    visual: (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-amber-500/10 text-sm text-amber-500 dark:text-amber-300">
        Stage 3
      </div>
    ),
  },
];

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

export default function ConceptStepper({
  steps = defaultSteps,
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  title = "Concept walkthrough",
}: ConceptStepperProps) {
  const reducedMotion = useReducedMotion();
  const safeSteps = steps.length > 0 ? steps : defaultSteps;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const activeStep = safeSteps[currentIndex] ?? safeSteps[0];
  const animationVariants = useMemo(
    () => ({
      enter: (customDirection: number) => ({
        opacity: 0,
        x: reducedMotion ? 0 : customDirection > 0 ? 32 : -32,
      }),
      center: { opacity: 1, x: 0 },
      exit: (customDirection: number) => ({
        opacity: 0,
        x: reducedMotion ? 0 : customDirection > 0 ? -32 : 32,
      }),
    }),
    [reducedMotion],
  );

  useEffect(() => {
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  useEffect(() => {
    if (!isPlaying || safeSteps.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setDirection(1);
      setCurrentIndex((current) => wrapIndex(current + 1, safeSteps.length));
    }, autoPlayInterval);

    return () => window.clearInterval(intervalId);
  }, [autoPlayInterval, isPlaying, safeSteps.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setDirection(1);
        setCurrentIndex((current) => wrapIndex(current + 1, safeSteps.length));
      }

      if (event.key === "ArrowLeft") {
        setDirection(-1);
        setCurrentIndex((current) => wrapIndex(current - 1, safeSteps.length));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [safeSteps.length]);

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
            <p className="text-xs text-gray-500 dark:text-gray-400">{activeStep.caption}</p>
          </div>
          <div className="flex items-center gap-2">
            {autoPlay ? (
              <button
                type="button"
                onClick={() => setIsPlaying((current) => !current)}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition hover:border-violet-500 hover:text-violet-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-400 dark:hover:text-violet-400"
                aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            ) : null}
            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Step {currentIndex + 1} of {safeSteps.length}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white/60 p-5 dark:border-gray-600 dark:bg-gray-900/40">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`${currentIndex}-${activeStep.title}`}
              custom={direction}
              variants={animationVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reducedMotion ? 0.2 : 0.6, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {activeStep.title}
                  </h3>
                </div>
              </div>
              <div className="min-h-[240px]">{activeStep.visual}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDirection(-1);
                setCurrentIndex((current) => wrapIndex(current - 1, safeSteps.length));
              }}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-violet-500 hover:text-violet-500 dark:border-gray-700 dark:text-gray-200 dark:hover:border-violet-400 dark:hover:text-violet-400"
              aria-label="Show previous concept step"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection(1);
                setCurrentIndex((current) => wrapIndex(current + 1, safeSteps.length));
              }}
              className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300"
              aria-label="Show next concept step"
            >
              Next
            </button>
          </div>

          {showDots ? (
            <div className="flex items-center gap-2" aria-label="Concept step progress">
              {safeSteps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "h-3 w-3 rounded-full border transition",
                    index === currentIndex
                      ? "border-violet-500 bg-violet-500 dark:border-violet-400 dark:bg-violet-400"
                      : "border-gray-300 bg-transparent dark:border-gray-600",
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
