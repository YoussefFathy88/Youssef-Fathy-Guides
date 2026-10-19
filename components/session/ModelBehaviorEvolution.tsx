"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type BadgeColor = "gray" | "teal" | "amber" | "violet" | "rose" | "blue";

export interface ModelBehaviorStage {
  label: string;
  badgeColor: BadgeColor;
  explanation: string;
  tokens: string[];
}

export interface ModelBehaviorEvolutionProps {
  title?: string;
  caption?: string;
  prompt: string;
  stages: ModelBehaviorStage[];
}

const badgeColorMap: Record<
  BadgeColor,
  { dot: string; border: string; glow: string; label: string }
> = {
  gray: {
    dot: "bg-gray-400",
    border: "border-gray-400",
    glow: "shadow-gray-400/30",
    label: "text-gray-900 dark:text-gray-200",
  },
  teal: {
    dot: "bg-teal-400",
    border: "border-teal-400",
    glow: "shadow-teal-400/30",
    label: "text-teal-800 dark:text-teal-200",
  },
  amber: {
    dot: "bg-amber-400",
    border: "border-amber-400",
    glow: "shadow-amber-400/30",
    label: "text-amber-800 dark:text-amber-200",
  },
  violet: {
    dot: "bg-violet-400",
    border: "border-violet-400",
    glow: "shadow-violet-400/30",
    label: "text-violet-800 dark:text-violet-200",
  },
  rose: {
    dot: "bg-rose-400",
    border: "border-rose-400",
    glow: "shadow-rose-400/30",
    label: "text-rose-800 dark:text-rose-200",
  },
  blue: {
    dot: "bg-blue-400",
    border: "border-blue-400",
    glow: "shadow-blue-400/30",
    label: "text-blue-800 dark:text-blue-200",
  },
};

type AnimState = "idle" | "running" | "done";

export default function ModelBehaviorEvolution({
  title,
  caption,
  prompt,
  stages,
}: ModelBehaviorEvolutionProps) {
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [activeStageIdx, setActiveStageIdx] = useState(-1);
  const [tokenCounts, setTokenCounts] = useState<number[]>(stages.map(() => 0));
  const [explanationVisible, setExplanationVisible] = useState<boolean[]>(stages.map(() => false));
  const [headerPulse, setHeaderPulse] = useState<boolean[]>(stages.map(() => false));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentStageRef = useRef(0);
  const currentTokenRef = useRef(0);

  function clearTimer() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function resetAll() {
    clearTimer();
    setAnimState("idle");
    setActiveStageIdx(-1);
    setTokenCounts(stages.map(() => 0));
    setExplanationVisible(stages.map(() => false));
    setHeaderPulse(stages.map(() => false));
    currentStageRef.current = 0;
    currentTokenRef.current = 0;
  }

  function startStage(stageIdx: number) {
    currentStageRef.current = stageIdx;
    currentTokenRef.current = 0;

    setActiveStageIdx(stageIdx);
    setHeaderPulse((prev) => {
      const next = [...prev];
      next[stageIdx] = true;
      return next;
    });
    setTimeout(() => {
      setHeaderPulse((prev) => {
        const next = [...prev];
        next[stageIdx] = false;
        return next;
      });
    }, 400);

    intervalRef.current = setInterval(() => {
      const si = currentStageRef.current;
      const ti = currentTokenRef.current;
      const total = stages[si].tokens.length;

      if (ti < total) {
        setTokenCounts((prev) => {
          const next = [...prev];
          next[si] = ti + 1;
          return next;
        });
        currentTokenRef.current = ti + 1;
      } else {
        clearTimer();
        setExplanationVisible((prev) => {
          const next = [...prev];
          next[si] = true;
          return next;
        });

        const nextStageIdx = si + 1;
        if (nextStageIdx < stages.length) {
          setTimeout(() => {
            startStage(nextStageIdx);
          }, 600);
        } else {
          setAnimState("done");
          setActiveStageIdx(-1);
        }
      }
    }, 200);
  }

  function handleRunReplay() {
    resetAll();
    setTimeout(() => {
      setAnimState("running");
      startStage(0);
    }, 50);
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <div
      className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 font-sans antialiased md:p-8"
      data-local-navigation="true"
    >
      {title || caption ? (
        <div className="mb-6 space-y-2">
          {title ? (
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl">{title}</p>
          ) : null}
          {caption ? <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl">{caption}</p> : null}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="rounded-xl bg-white dark:bg-gray-950 px-5 py-4 ring-1 ring-gray-300 dark:ring-gray-700 md:px-6 md:py-5">
          <p className="text-base font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 md:text-lg">Prompt</p>
          <p className="mt-3 font-mono text-lg leading-relaxed text-gray-900 dark:text-gray-100 md:text-xl">{prompt}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stages.map((stage, i) => {
            const colors = badgeColorMap[stage.badgeColor];
            const isActive = activeStageIdx === i;
            const isDimmed = animState === "running" && activeStageIdx !== -1 && !isActive;
            const isComplete = tokenCounts[i] === stage.tokens.length && tokenCounts[i] > 0;
            const displayedTokens = stage.tokens.slice(0, tokenCounts[i]);
            const showCursor = isActive && tokenCounts[i] < stage.tokens.length;

            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col rounded-xl border transition-all duration-300",
                  isActive
                    ? cn(colors.border, "border-2 shadow-lg", colors.glow)
                    : "border-gray-300 dark:border-gray-700",
                  isDimmed ? "opacity-40" : "opacity-100",
                )}
              >
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-t-xl px-4 py-4 transition-transform duration-200 md:px-5",
                    headerPulse[i] ? "scale-[1.02]" : "scale-100",
                    isActive ? "bg-gray-100/80 dark:bg-gray-800/80" : "bg-gray-100/40 dark:bg-gray-800/40",
                  )}
                >
                  <span className={cn("mt-2 h-3 w-3 shrink-0 rounded-full", colors.dot)} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-base font-bold leading-snug md:text-lg", colors.label)}>
                      {stage.label}
                    </p>
                    {isActive ? (
                      <p className="mt-1 text-base font-bold text-gray-600 dark:text-gray-400 md:text-lg">Generating…</p>
                    ) : null}
                    {isComplete && !isActive ? (
                      <p className="mt-1 text-base font-bold text-gray-600 dark:text-gray-400 md:text-lg">Done</p>
                    ) : null}
                  </div>
                </div>

                <div className="min-h-[140px] flex-1 bg-white dark:bg-gray-950 px-4 py-4 font-mono text-lg leading-relaxed text-gray-900 dark:text-gray-100 md:min-h-[160px] md:px-5 md:text-xl">
                  {displayedTokens.length === 0 ? (
                    <span className="text-base text-gray-600 dark:text-gray-500 md:text-lg">
                      Response will appear here…
                    </span>
                  ) : (
                    <>
                      {displayedTokens.join("")}
                      {showCursor ? (
                        <span className="ml-0.5 inline-block h-[1em] w-[3px] animate-pulse bg-gray-300 align-middle" />
                      ) : null}
                    </>
                  )}
                </div>

                <div
                  className={cn(
                    "overflow-hidden rounded-b-xl transition-all duration-400",
                    explanationVisible[i] ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-800/60 px-4 py-4 md:px-5">
                    <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-200 md:text-xl">{stage.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRunReplay}
            disabled={animState === "running"}
            className={cn(
              "rounded-xl px-6 py-3 text-base font-bold transition-all duration-200 md:text-lg",
              animState === "running"
                ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-500"
                : "bg-violet-600 text-white shadow-sm hover:bg-violet-500 active:bg-violet-700",
            )}
          >
            {animState === "done" ? "↺ Replay" : "▶ Run Pipeline"}
          </button>
        </div>
      </div>
    </div>
  );
}
