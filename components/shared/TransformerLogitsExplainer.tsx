"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface TransformerLogitCandidate {
  token: string;
  logit: number;
  rawProb: number;
}

export interface TransformerLogitsExplainerProps {
  title: string;
  caption: string;
  candidates: TransformerLogitCandidate[];
}

const defaultCandidates: TransformerLogitCandidate[] = [
  { token: "Paris", logit: 9.2, rawProb: 0.91 },
  { token: "Lyon", logit: 3.1, rawProb: 0.04 },
  { token: "a", logit: 1.8, rawProb: 0.02 },
  { token: "the", logit: 1.4, rawProb: 0.01 },
  { token: "France", logit: 1.3, rawProb: 0.01 },
  { token: "located", logit: 1.2, rawProb: 0.01 },
];

const panels = [
  {
    id: "logits",
    label: "The model outputs raw scores",
    description:
      "Logits are raw, unnormalized scores. They can be any real number and do not need to sum to 1.",
    badge: "Panel 1",
  },
  {
    id: "probabilities",
    label: "Softmax converts logits to probabilities",
    description:
      "Softmax normalizes those scores into a probability distribution so every candidate gets a share of 1.",
    badge: "Panel 2",
  },
] as const;

function getLogitWidth(logit: number, minLogit: number, maxLogit: number) {
  const span = Math.max(maxLogit - minLogit, 1e-6);
  return 16 + ((logit - minLogit) / span) * 84;
}

function formatMetric(panelId: "logits" | "probabilities", candidate: TransformerLogitCandidate) {
  return panelId === "logits"
    ? candidate.logit.toFixed(1)
    : `${(candidate.rawProb * 100).toFixed(1)}%`;
}

export default function TransformerLogitsExplainer({
  title,
  caption,
  candidates,
}: TransformerLogitsExplainerProps) {
  const reducedMotion = useReducedMotion();
  const safeCandidates = candidates.length > 0 ? candidates : defaultCandidates;
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const activePanel = panels[activePanelIndex];

  const chartStats = useMemo(() => {
    const logits = safeCandidates.map((candidate) => candidate.logit);
    const probabilities = safeCandidates.map((candidate) => candidate.rawProb);
    const minLogit = Math.min(...logits);
    const maxLogit = Math.max(...logits);
    const maxProb = Math.max(...probabilities, 1e-6);
    const probSum = probabilities.reduce((sum, value) => sum + value, 0);
    const topToken =
      activePanel.id === "logits"
        ? safeCandidates.reduce((winner, candidate) =>
            candidate.logit > winner.logit ? candidate : winner,
          ).token
        : safeCandidates.reduce((winner, candidate) =>
            candidate.rawProb > winner.rawProb ? candidate : winner,
          ).token;

    return { minLogit, maxLogit, maxProb, probSum, topToken };
  }, [activePanel.id, safeCandidates]);

  function goBack() {
    setActivePanelIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setActivePanelIndex((current) => Math.min(panels.length - 1, current + 1));
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Step {activePanelIndex + 1} / {panels.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {panels.map((panel, index) => {
            const isActive = index === activePanelIndex;

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setActivePanelIndex(index)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  isActive
                    ? "border-violet-300 bg-violet-50 shadow-[0_0_0_1px_rgba(139,92,246,0.18)] dark:border-violet-500/50 dark:bg-violet-500/10"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-gray-600",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    isActive ? "text-violet-600 dark:text-violet-300" : "text-gray-400",
                  )}
                >
                  {panel.badge}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {panel.label}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {panel.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {activePanel.id === "logits"
                  ? "Logits - raw scores, not probabilities"
                  : "Probabilities - normalized and sum to 1"}
              </p>
              {activePanel.id === "probabilities" ? (
                <p className="font-mono text-[11px] text-violet-700 dark:text-violet-300">
                  softmax(z_i) = e^(z_i) / Sum e^(z_j)
                </p>
              ) : null}
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 font-mono text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {activePanel.id === "logits"
                ? `max logit = ${chartStats.maxLogit.toFixed(1)}`
                : `sum = ${chartStats.probSum.toFixed(2)}`}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {safeCandidates.map((candidate) => {
              const widthPercent =
                activePanel.id === "logits"
                  ? getLogitWidth(
                      candidate.logit,
                      chartStats.minLogit,
                      chartStats.maxLogit,
                    )
                  : (candidate.rawProb / chartStats.maxProb) * 100;
              const isTopToken = candidate.token === chartStats.topToken;

              return (
                <div
                  key={candidate.token}
                  className="grid grid-cols-[84px_minmax(0,1fr)_72px] items-center gap-3"
                >
                  <span className="truncate text-right font-mono text-xs font-medium text-gray-700 dark:text-gray-200">
                    {candidate.token}
                  </span>
                  <div className="relative h-8 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700/60">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-xl",
                        isTopToken
                          ? "bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.3)] dark:bg-violet-400"
                          : "bg-gray-300 dark:bg-gray-600",
                      )}
                      style={{
                        width: `${widthPercent}%`,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span className="text-right font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {formatMetric(activePanel.id, candidate)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={activePanelIndex === 0}
            className={cn(
              "rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/40",
              activePanelIndex === 0 && "cursor-not-allowed opacity-50",
            )}
          >
            {"<- Back"}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={activePanelIndex === panels.length - 1}
            className={cn(
              "rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300",
              activePanelIndex === panels.length - 1 && "cursor-not-allowed opacity-50",
            )}
          >
            {"Next ->"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
