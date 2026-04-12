"use client";

import { useEffect, useRef, useState } from "react";

const BAR_COLOR_MAP: Record<string, string> = {
  teal: "#1D9E75",
  amber: "#BA7517",
  rose: "#A32D2D",
  violet: "#534AB7",
  gray: "#888780",
  blue: "#185FA5",
};

export interface HiddenStateDecayDiagramProps {
  title?: string;
  caption?: string;
  tokens: string[];
  decayHeights: number[];
  colors: ("teal" | "amber" | "rose" | "violet" | "gray" | "blue")[];
  sublabels: string[];
  stepDescriptions: string[];
}

const BAR_CONTAINER_HEIGHT = 88;
const INTERVAL_MS = 1100;

export default function HiddenStateDecayDiagram({
  title,
  caption,
  tokens,
  decayHeights,
  colors,
  sublabels,
  stepDescriptions,
}: HiddenStateDecayDiagramProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = tokens.length;
  const isComplete = currentStep >= totalSteps - 1;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= totalSteps - 1) {
            setPlaying(false);
          }
          return next;
        });
      }, INTERVAL_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, totalSteps]);

  function handlePlay() {
    if (isComplete) {
      handleReset();
      return;
    }
    setPlaying((p) => !p);
  }

  function handleReset() {
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentStep(-1);
  }

  const ghostLineHeight = currentStep >= 0 ? decayHeights[0] : null;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && (
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          )}
          {caption && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          )}
        </div>
      )}

      {/* Bar chart area */}
      <div className="rounded-xl border border-gray-200 bg-white px-4 pb-4 pt-5 dark:border-gray-700 dark:bg-gray-900/60">
        <div className="flex items-end justify-around gap-2">
          {tokens.map((token, i) => {
            const isActive = currentStep >= i;
            const barColor = BAR_COLOR_MAP[colors[i]] ?? "#888780";
            const barHeight = isActive ? decayHeights[i] : 0;

            return (
              <div key={token + i} className="flex flex-col items-center gap-1.5">
                {/* Bar container */}
                <div
                  className="relative flex w-10 items-end justify-center"
                  style={{ height: BAR_CONTAINER_HEIGHT }}
                >
                  {/* Ghost dashed reference line (only visible after step 0 and from token 1+) */}
                  {ghostLineHeight !== null && i > 0 && (
                    <div
                      className="pointer-events-none absolute left-0 right-0"
                      style={{
                        bottom: ghostLineHeight,
                        borderTop: `1.5px dashed ${BAR_COLOR_MAP[colors[0]] ?? "#1D9E75"}`,
                        opacity: 0.3,
                      }}
                    />
                  )}
                  {/* Ghost line on bar 0 itself (under the bar, visible always after step 0) */}
                  {ghostLineHeight !== null && i === 0 && (
                    <div
                      className="pointer-events-none absolute left-0 right-0"
                      style={{
                        bottom: ghostLineHeight,
                        borderTop: `1.5px dashed ${BAR_COLOR_MAP[colors[0]] ?? "#1D9E75"}`,
                        opacity: 0.3,
                      }}
                    />
                  )}
                  <div
                    style={{
                      height: barHeight,
                      backgroundColor: barColor,
                      width: "100%",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.5s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </div>

                {/* Step dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isActive ? barColor : "transparent",
                    border: `2px solid ${barColor}`,
                    transition: "background 0.3s",
                    flexShrink: 0,
                  }}
                />

                {/* Token label */}
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  {token}
                </span>

                {/* Sublabel */}
                {isActive && (
                  <span
                    className="text-center text-[10px] leading-tight text-gray-500 dark:text-gray-400"
                    style={{ maxWidth: 52 }}
                  >
                    {sublabels[i]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Ghost line legend */}
        {ghostLineHeight !== null && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
            <div
              style={{
                width: 24,
                borderTop: `1.5px dashed ${BAR_COLOR_MAP[colors[0]] ?? "#1D9E75"}`,
                opacity: 0.6,
              }}
            />
            <span>Original signal height of &quot;{tokens[0]}&quot;</span>
          </div>
        )}
      </div>

      {/* Description panel */}
      <div className="mt-4 min-h-[56px] rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {currentStep >= 0 && currentStep < stepDescriptions.length
            ? stepDescriptions[currentStep]
            : "Press Play to begin."}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlay}
          className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50"
        >
          {isComplete ? "Replay" : playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Reset
        </button>

        {/* Step dots */}
        <div className="ml-2 flex items-center gap-1.5">
          {tokens.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPlaying(false);
                setCurrentStep(i);
              }}
              aria-label={`Jump to step ${i + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: currentStep >= i ? BAR_COLOR_MAP[colors[i]] : "transparent",
                border: `2px solid ${BAR_COLOR_MAP[colors[i]]}`,
                transition: "background 0.3s",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
