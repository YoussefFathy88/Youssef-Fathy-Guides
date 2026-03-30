"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface TokenCandidate {
  token: string;
  rawProb: number;
}

export interface TokenProbDistProps {
  candidates?: TokenCandidate[];
  showTemperature?: boolean;
  showTopP?: boolean;
  defaultTemperature?: number;
  defaultTopP?: number;
  highlightTop?: number;
  title?: string;
  caption?: string;
}

const defaultCandidates: TokenCandidate[] = [
  { token: "mat", rawProb: 0.34 },
  { token: "floor", rawProb: 0.19 },
  { token: "sofa", rawProb: 0.16 },
  { token: "chair", rawProb: 0.13 },
  { token: "rug", rawProb: 0.11 },
  { token: "table", rawProb: 0.07 },
];

function applyTemperatureScaling(candidates: TokenCandidate[], temperature: number) {
  const scaled = candidates.map((candidate) => {
    const safeProb = Math.max(candidate.rawProb, 1e-6);
    return {
      ...candidate,
      scaled: Math.exp(Math.log(safeProb) / Math.max(temperature, 1e-3)),
    };
  });

  const total = scaled.reduce((sum, candidate) => sum + candidate.scaled, 0);
  return scaled.map((candidate) => ({
    token: candidate.token,
    probability: candidate.scaled / Math.max(total, 1e-6),
  }));
}

function applyTopP(
  candidates: Array<{ token: string; probability: number }>,
  topP: number,
) {
  const sorted = [...candidates].sort((left, right) => right.probability - left.probability);
  let cumulative = 0;

  const filtered = sorted.filter((candidate) => {
    cumulative += candidate.probability;
    return cumulative <= topP || cumulative - candidate.probability === 0;
  });

  const total = filtered.reduce((sum, candidate) => sum + candidate.probability, 0);
  return filtered.map((candidate) => ({
    ...candidate,
    probability: candidate.probability / Math.max(total, 1e-6),
  }));
}

function sampleCandidate(candidates: Array<{ token: string; probability: number }>) {
  const random = Math.random();
  let cumulative = 0;

  for (const candidate of candidates) {
    cumulative += candidate.probability;
    if (random <= cumulative) {
      return candidate.token;
    }
  }

  return candidates[candidates.length - 1]?.token ?? "";
}

export default function TokenProbDist({
  candidates = defaultCandidates,
  showTemperature = true,
  showTopP = false,
  defaultTemperature = 1,
  defaultTopP = 1,
  highlightTop = 1,
  title = "Next-token distribution",
  caption = "Adjust sampling controls to see how the distribution reshapes.",
}: TokenProbDistProps) {
  const reducedMotion = useReducedMotion();
  const safeCandidates = candidates.length > 0 ? candidates : defaultCandidates;
  const [temperature, setTemperature] = useState(defaultTemperature);
  const [topP, setTopP] = useState(defaultTopP);
  const [sampledToken, setSampledToken] = useState("");

  const processedCandidates = useMemo(() => {
    const temperatureAdjusted = applyTemperatureScaling(safeCandidates, temperature);
    const filtered = showTopP ? applyTopP(temperatureAdjusted, topP) : temperatureAdjusted;
    return [...filtered].sort((left, right) => right.probability - left.probability);
  }, [safeCandidates, showTopP, temperature, topP]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        <div className="space-y-3">
          {processedCandidates.map((candidate, index) => {
            const isHighlighted = index < highlightTop;

            return (
              <motion.div
                key={candidate.token}
                layout={!reducedMotion}
                className="grid h-10 grid-cols-[88px_minmax(0,1fr)_72px] items-center gap-3"
              >
                <span className="truncate text-sm font-mono text-gray-900 dark:text-gray-100">
                  {candidate.token}
                </span>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    layout={!reducedMotion}
                    className={cn(
                      "h-full rounded-r-full",
                      isHighlighted
                        ? "bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.35)] dark:bg-violet-400"
                        : "bg-gray-300 dark:bg-gray-600",
                    )}
                    animate={{ width: `${candidate.probability * 100}%` }}
                    transition={{ duration: reducedMotion ? 0.2 : 0.6, ease: "easeOut" }}
                  />
                </div>
                <span className="text-right text-sm font-mono text-gray-500 dark:text-gray-400">
                  {(candidate.probability * 100).toFixed(1)}%
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSampledToken(sampleCandidate(processedCandidates))}
            className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300"
            aria-label="Sample a token from the distribution"
          >
            Sample
          </button>

          <AnimatePresence mode="wait">
            <motion.span
              key={sampledToken || "empty-sample"}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {sampledToken ? `Sampled token: ${sampledToken}` : "Click sample to draw a token."}
            </motion.span>
          </AnimatePresence>
        </div>

        {showTemperature ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Temperature
              </label>
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                {temperature.toFixed(2)}
              </span>
            </div>
            <input
              aria-label="Temperature"
              type="range"
              min={0.2}
              max={2}
              step={0.05}
              value={temperature}
              onChange={(event) => setTemperature(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-violet-200 to-amber-400 dark:from-violet-900 dark:to-amber-500"
            />
          </div>
        ) : null}

        {showTopP ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Top-p</label>
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                {topP.toFixed(2)}
              </span>
            </div>
            <input
              aria-label="Top-p"
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={topP}
              onChange={(event) => setTopP(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-teal-200 to-violet-400 dark:from-teal-900 dark:to-violet-500"
            />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
