"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PhaseTab {
  label: string;
}

export interface LinearMappingShellProps {
  title?: string;
  caption?: string;
  hint?: string;
  phases: PhaseTab[];
  phase: number;
  onPhaseChange: (index: number) => void;
  footerCallout?: string;
  playing?: boolean;
  onTogglePlay?: () => void;
  children: ReactNode;
}

export function LinearMappingShell({
  title,
  caption,
  hint,
  phases,
  phase,
  onPhaseChange,
  footerCallout,
  playing,
  onTogglePlay,
  children,
}: LinearMappingShellProps) {
  const last = phase === phases.length - 1;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/80 shadow-xl">
      {title ? (
        <div className="border-b border-gray-800/60 px-6 py-4">
          <p className="text-balance text-base font-semibold text-white md:text-lg">{title}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        {phases.map((ph, i) => (
          <button
            key={ph.label}
            type="button"
            onClick={() => onPhaseChange(i)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition md:px-4 md:text-base",
              i === phase
                ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                : i < phase
                  ? "border-gray-700/50 bg-gray-800/60 text-gray-300 hover:bg-gray-700/60"
                  : "border-gray-800/50 bg-gray-900/40 text-gray-500 hover:bg-gray-800/40",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold md:h-6 md:w-6",
                i === phase
                  ? "bg-violet-500 text-white"
                  : i < phase
                    ? "bg-gray-600 text-gray-300"
                    : "bg-gray-800 text-gray-600",
              )}
            >
              {i + 1}
            </span>
            <span className="hidden sm:inline">{ph.label}</span>
          </button>
        ))}
        {onTogglePlay ? (
          <button
            type="button"
            onClick={onTogglePlay}
            className="ml-auto rounded-full border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:border-violet-500 hover:text-white md:text-base"
          >
            {playing ? "Pause" : "Play"}
          </button>
        ) : null}
      </div>

      {hint ? (
        <div className="min-h-[3rem] px-5 pt-2 pb-1">
          <p className="text-base leading-relaxed text-gray-300 md:text-lg">{hint}</p>
        </div>
      ) : null}

      {children}

      <div className="flex items-center justify-between border-t border-gray-800/60 px-5 py-3">
        <button
          type="button"
          onClick={() => onPhaseChange(Math.max(0, phase - 1))}
          disabled={phase === 0}
          className={cn(
            "rounded-full border px-4 py-2 text-base font-medium transition",
            phase === 0
              ? "cursor-not-allowed border-gray-800 text-gray-700"
              : "border-gray-700 text-gray-300 hover:border-violet-500 hover:text-white",
          )}
        >
          ← Prev
        </button>

        {last && footerCallout ? (
          <div className="flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/15 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span className="text-sm font-medium text-violet-200 md:text-base">{footerCallout}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {phases.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPhaseChange(i)}
                aria-label={`Go to step ${i + 1}`}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition",
                  i === phase ? "bg-violet-400" : "bg-gray-700 hover:bg-gray-500",
                )}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onPhaseChange(Math.min(phases.length - 1, phase + 1))}
          disabled={last}
          className={cn(
            "rounded-full border px-4 py-2 text-base font-medium transition",
            last
              ? "cursor-not-allowed border-gray-800 text-gray-700"
              : "border-gray-700 text-gray-300 hover:border-violet-500 hover:text-white",
          )}
        >
          Next →
        </button>
      </div>

      {caption ? <p className="px-6 pb-4 text-base text-gray-400">{caption}</p> : null}
    </div>
  );
}