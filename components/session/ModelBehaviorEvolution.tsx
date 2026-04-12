"use client";

import { useEffect, useRef, useState } from "react";

type BadgeColor = "gray" | "teal" | "amber" | "violet" | "rose" | "blue";

export interface ModelBehaviorStage {
  label: string;
  badgeColor: BadgeColor;
  explanation: string;
  tokens: string[];
}

export interface ModelBehaviorEvolutionProps {
  title: string;
  caption: string;
  prompt: string;
  stages: ModelBehaviorStage[];
}

const badgeColorMap: Record<BadgeColor, { dot: string; border: string; glow: string; badge: string }> = {
  gray: {
    dot: "bg-gray-400",
    border: "border-gray-400",
    glow: "shadow-gray-400/30",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
  },
  teal: {
    dot: "bg-teal-400",
    border: "border-teal-400",
    glow: "shadow-teal-400/30",
    badge: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  },
  amber: {
    dot: "bg-amber-400",
    border: "border-amber-400",
    glow: "shadow-amber-400/30",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  violet: {
    dot: "bg-violet-400",
    border: "border-violet-400",
    glow: "shadow-violet-400/30",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  rose: {
    dot: "bg-rose-400",
    border: "border-rose-400",
    glow: "shadow-rose-400/30",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
  blue: {
    dot: "bg-blue-400",
    border: "border-blue-400",
    glow: "shadow-blue-400/30",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
};

type AnimState = "idle" | "running" | "done";

export default function ModelBehaviorEvolution({
  title,
  caption,
  prompt,
  stages,
}: ModelBehaviorEvolutionProps) {
  // animState: overall pipeline state
  const [animState, setAnimState] = useState<AnimState>("idle");
  // activeStageIdx: which stage is currently animating (-1 = none)
  const [activeStageIdx, setActiveStageIdx] = useState(-1);
  // tokenCounts[i] = how many tokens of stage i have been appended
  const [tokenCounts, setTokenCounts] = useState<number[]>(stages.map(() => 0));
  // explanationVisible[i] = whether the explanation strip for stage i is visible
  const [explanationVisible, setExplanationVisible] = useState<boolean[]>(stages.map(() => false));
  // headerPulse[i] = triggers the header scale animation
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
    // Pulse the header
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
        // Stage complete
        clearTimer();
        setExplanationVisible((prev) => {
          const next = [...prev];
          next[si] = true;
          return next;
        });

        const nextStageIdx = si + 1;
        if (nextStageIdx < stages.length) {
          // Small pause before next stage
          setTimeout(() => {
            startStage(nextStageIdx);
          }, 600);
        } else {
          // All stages done
          setAnimState("done");
          setActiveStageIdx(-1);
        }
      }
    }, 200);
  }

  function handleRunReplay() {
    resetAll();
    // Small timeout to let state settle before starting
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
    <div className="my-8 w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-gray-700/60 dark:bg-gray-900/70">
      {/* Header */}
      <div className="border-b border-gray-200/70 px-6 py-4 dark:border-gray-700/50">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{caption}</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Prompt box */}
        <div className="rounded-xl bg-gray-900 px-5 py-4 dark:bg-gray-950 dark:border dark:border-gray-700">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Prompt:
          </p>
          <p className="font-mono text-sm text-white leading-relaxed">{prompt}</p>
        </div>

        {/* Panels */}
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
                className={[
                  "flex flex-col rounded-xl border transition-all duration-300",
                  isActive
                    ? `${colors.border} shadow-lg ${colors.glow} border-2`
                    : "border-gray-200/80 dark:border-gray-700/60",
                  isDimmed ? "opacity-40" : "opacity-100",
                ].join(" ")}
              >
                {/* Panel header */}
                <div
                  className={[
                    "flex items-center gap-2 rounded-t-xl px-4 py-3 transition-transform duration-200",
                    headerPulse[i] ? "scale-[1.04]" : "scale-100",
                    isActive
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-gray-50/60 dark:bg-gray-800/40",
                  ].join(" ")}
                >
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}
                  >
                    {stage.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-[10px] font-medium text-gray-400 dark:text-gray-500 animate-pulse">
                      Generating…
                    </span>
                  )}
                  {isComplete && !isActive && (
                    <span className="ml-auto text-[10px] font-medium text-gray-400 dark:text-gray-500">
                      Done
                    </span>
                  )}
                </div>

                {/* Response body */}
                <div className="flex-1 min-h-[120px] rounded-none bg-gray-950 px-4 py-3 font-mono text-sm leading-relaxed text-gray-100">
                  {displayedTokens.length === 0 ? (
                    <span className="text-gray-600 dark:text-gray-600 italic text-xs">
                      Response will appear here…
                    </span>
                  ) : (
                    <>
                      {displayedTokens.join("")}
                      {showCursor && (
                        <span className="inline-block w-[2px] h-[1em] bg-gray-300 align-middle ml-0.5 animate-pulse" />
                      )}
                    </>
                  )}
                </div>

                {/* Explanation strip */}
                <div
                  className={[
                    "overflow-hidden transition-all duration-400 rounded-b-xl",
                    explanationVisible[i] ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
                  ].join(" ")}
                >
                  <div className="border-t border-gray-200/60 bg-gray-50/80 px-4 py-3 dark:border-gray-700/40 dark:bg-gray-800/40">
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {stage.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Run / Replay button */}
        <div className="flex justify-center pt-1">
          <button
            onClick={handleRunReplay}
            disabled={animState === "running"}
            className={[
              "rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200",
              animState === "running"
                ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                : "bg-violet-600 text-white shadow-sm hover:bg-violet-700 active:bg-violet-800",
            ].join(" ")}
          >
            {animState === "done" ? "↺ Replay" : "▶ Run Pipeline"}
          </button>
        </div>
      </div>
    </div>
  );
}
