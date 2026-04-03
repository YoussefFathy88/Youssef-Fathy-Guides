"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface InferenceWalkthroughCandidate {
  token: string;
  logit: number;
  rawProb: number;
}

export interface InferenceWalkthroughProps {
  title: string;
  caption: string;
  question: string;
  answer: string;
  logitCandidates: InferenceWalkthroughCandidate[];
}

const defaultCandidates: InferenceWalkthroughCandidate[] = [
  { token: "Paris", logit: 9.2, rawProb: 0.91 },
  { token: "Lyon", logit: 3.1, rawProb: 0.04 },
  { token: "a", logit: 1.8, rawProb: 0.02 },
  { token: "the", logit: 1.4, rawProb: 0.01 },
  { token: "France", logit: 1.3, rawProb: 0.01 },
  { token: "located", logit: 1.2, rawProb: 0.01 },
];

const stages = [
  {
    label: "Prompt enters",
    description: "Your user message is tokenized and placed into the context window.",
    tone: "violet",
  },
  {
    label: "Weights loaded",
    description: "The frozen parameters produced during training are loaded for inference.",
    tone: "gray",
  },
  {
    label: "Forward pass",
    description: "The prompt representation flows through each transformer layer.",
    tone: "teal",
  },
  {
    label: "Logits produced",
    description: "The model emits one raw score per vocabulary token.",
    tone: "amber",
  },
  {
    label: "Softmax -> sample",
    description: "Softmax normalizes the logits and the decoder samples one next token.",
    tone: "violet",
  },
  {
    label: "Append token -> loop",
    description: "The sampled token is appended to context and the loop restarts.",
    tone: "teal",
  },
] as const;

const toneClasses = {
  violet: {
    bg: "bg-violet-500 dark:bg-violet-400",
    chip: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    border: "border-violet-300 dark:border-violet-500/50",
  },
  teal: {
    bg: "bg-teal-500 dark:bg-teal-400",
    chip: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
    border: "border-teal-300 dark:border-teal-500/50",
  },
  amber: {
    bg: "bg-amber-500 dark:bg-amber-400",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-500/50",
  },
  gray: {
    bg: "bg-gray-400 dark:bg-gray-500",
    chip: "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
  },
} as const;

function getLogitWidth(logit: number, minLogit: number, maxLogit: number) {
  const span = Math.max(maxLogit - minLogit, 1e-6);
  return 16 + ((logit - minLogit) / span) * 84;
}

function splitAnswer(answer: string, sampledToken: string) {
  const tokenIndex = answer.indexOf(sampledToken);

  if (tokenIndex === -1) {
    return { prefix: answer, highlight: sampledToken, suffix: "" };
  }

  return {
    prefix: answer.slice(0, tokenIndex),
    highlight: answer.slice(tokenIndex, tokenIndex + sampledToken.length),
    suffix: answer.slice(tokenIndex + sampledToken.length),
  };
}

function ScoreBars({
  candidates,
  mode,
}: {
  candidates: InferenceWalkthroughCandidate[];
  mode: "logits" | "probabilities";
}) {
  const stats = useMemo(() => {
    const logits = candidates.map((candidate) => candidate.logit);
    const probabilities = candidates.map((candidate) => candidate.rawProb);
    const minLogit = Math.min(...logits);
    const maxLogit = Math.max(...logits);
    const maxProb = Math.max(...probabilities, 1e-6);
    const topToken = candidates.reduce((winner, candidate) =>
      candidate.rawProb > winner.rawProb ? candidate : winner,
    ).token;

    return { minLogit, maxLogit, maxProb, topToken };
  }, [candidates]);

  return (
    <div className="space-y-2.5">
      {candidates.map((candidate) => {
        const widthPercent =
          mode === "logits"
            ? getLogitWidth(candidate.logit, stats.minLogit, stats.maxLogit)
            : (candidate.rawProb / stats.maxProb) * 100;
        const isTopToken = candidate.token === stats.topToken;

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
              {mode === "logits"
                ? candidate.logit.toFixed(1)
                : `${(candidate.rawProb * 100).toFixed(1)}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function InferenceWalkthrough({
  title,
  caption,
  question,
  answer,
  logitCandidates,
}: InferenceWalkthroughProps) {
  const reducedMotion = useReducedMotion();
  const safeCandidates = logitCandidates.length > 0 ? logitCandidates : defaultCandidates;
  const topCandidate = useMemo(
    () =>
      safeCandidates.reduce((winner, candidate) =>
        candidate.rawProb > winner.rawProb ? candidate : winner,
      ),
    [safeCandidates],
  );
  const answerParts = useMemo(
    () => splitAnswer(answer, topCandidate.token),
    [answer, topCandidate.token],
  );

  const [activeStage, setActiveStage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeStageMeta = stages[activeStage];

  useEffect(() => {
    if (!isAutoPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (activeStage >= stages.length - 1) {
      setIsAutoPlaying(false);
      return;
    }

    timerRef.current = setTimeout(
      () => setActiveStage((current) => Math.min(stages.length - 1, current + 1)),
      2000,
    );

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activeStage, isAutoPlaying]);

  function goBack() {
    setIsAutoPlaying(false);
    setActiveStage((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setIsAutoPlaying(false);
    setActiveStage((current) => Math.min(stages.length - 1, current + 1));
  }

  function toggleAutoPlay() {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      return;
    }

    if (activeStage >= stages.length - 1) {
      setActiveStage(0);
    }

    setIsAutoPlaying(true);
  }

  function renderPromptStage() {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">User</p>
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {question}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/40 dark:bg-violet-500/10">
          <p className="text-xs leading-relaxed text-violet-700 dark:text-violet-200">
            This prompt is converted into tokens and appended to the active context window before
            the decoder starts predicting the first answer token.
          </p>
        </div>
      </div>
    );
  }

  function renderWeightsStage() {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950">
          <div
            className={cn(
              "mx-auto flex h-32 w-32 items-center justify-center rounded-[2rem] border border-violet-200 bg-violet-50 text-4xl shadow-[0_0_30px_rgba(139,92,246,0.18)] dark:border-violet-500/40 dark:bg-violet-500/10",
              !reducedMotion && "animate-pulse",
            )}
          >
            {"{}"}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
            Frozen model weights loaded from storage
          </p>
          <p className="mt-2 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            These parameters are read during inference, not updated. The model behavior is already
            baked into these numbers from training.
          </p>
        </div>
      </div>
    );
  }

  function renderForwardPassStage() {
    const layers = ["Embedding + positions", "Transformer layer 1", "Transformer layer 2", "Transformer layer N"];

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Active context
          </p>
          <p className="mt-2 font-mono text-sm text-gray-900 dark:text-gray-100">
            {question}
          </p>
        </div>

        <div className="space-y-3">
          {layers.map((layer, index) => (
            <div
              key={layer}
              className="relative overflow-hidden rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-500/30 dark:bg-teal-500/10"
            >
              <div className="relative z-10 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {layer}
                </span>
                <span className="font-mono text-[11px] text-teal-700 dark:text-teal-300">
                  h_{index + 1}
                </span>
              </div>
              {!reducedMotion ? (
                <span
                  className="layer-pulse absolute inset-y-1 left-0 w-24 rounded-full bg-gradient-to-r from-transparent via-teal-400/70 to-transparent"
                  style={{ animationDelay: `${index * 0.18}s` }}
                />
              ) : null}
            </div>
          ))}
        </div>

        <style jsx>{`
          .layer-pulse {
            animation: layer-sweep 1.65s ease-in-out infinite;
          }

          @keyframes layer-sweep {
            0% {
              opacity: 0;
              transform: translateX(-30%);
            }
            35% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translateX(520%);
            }
          }
        `}</style>
      </div>
    );
  }

  function renderDistributionStage(mode: "logits" | "probabilities") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {mode === "logits" ? "Logits - one score per vocabulary token" : "Softmax output"}
            </p>
            {mode === "probabilities" ? (
              <span className="rounded-full bg-violet-50 px-3 py-1 font-mono text-[11px] text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                softmax(z_i) = e^(z_i) / Sum e^(z_j)
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <ScoreBars candidates={safeCandidates} mode={mode} />
          </div>
        </div>

        {mode === "probabilities" ? (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/40 dark:bg-violet-500/10">
            <p className="text-xs leading-relaxed text-violet-700 dark:text-violet-200">
              Sampled token:
              <span
                className={cn(
                  "ml-2 inline-flex rounded-full bg-violet-500 px-3 py-1 font-mono text-xs font-semibold text-white dark:bg-violet-400 dark:text-gray-950",
                  !reducedMotion && "animate-pulse",
                )}
              >
                {topCandidate.token}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  function renderAppendStage() {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Assistant answer
          </p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-1 font-mono text-base text-gray-400 dark:text-gray-500">
            <span>{answerParts.prefix}</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              {answerParts.highlight}
            </span>
            <span>{answerParts.suffix}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/40 dark:bg-teal-500/10">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Loop back to Stage 3
          </p>
          <p className="mt-2 text-xs leading-relaxed text-teal-700 dark:text-teal-200">
            The sampled token joins the context, then the model runs another forward pass for the
            next token. This repeats until a stop token ends the response.
          </p>
        </div>
      </div>
    );
  }

  function renderActivePanel() {
    if (activeStage === 0) return renderPromptStage();
    if (activeStage === 1) return renderWeightsStage();
    if (activeStage === 2) return renderForwardPassStage();
    if (activeStage === 3) return renderDistributionStage("logits");
    if (activeStage === 4) return renderDistributionStage("probabilities");
    return renderAppendStage();
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
              Stage {activeStage + 1} / {stages.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/60">
            <div className="space-y-2">
              {stages.map((stage, index) => {
                const tone = toneClasses[stage.tone];
                const isActive = index === activeStage;
                const isPassed = index < activeStage;

                return (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveStage(index);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                      isActive
                        ? `${tone.border} ${tone.chip}`
                        : "border-transparent text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        isActive || isPassed
                          ? `${tone.bg} text-white dark:text-gray-950`
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {stage.label}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                        {stage.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900/60">
            <p
              className={cn(
                "mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                toneClasses[activeStageMeta.tone].chip,
              )}
            >
              {activeStageMeta.label}
            </p>
            <div className="min-h-[280px]">{renderActivePanel()}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={activeStage === 0}
            className={cn(
              "rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/40",
              activeStage === 0 && "cursor-not-allowed opacity-50",
            )}
          >
            {"<- Back"}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={activeStage === stages.length - 1}
            className={cn(
              "rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300",
              activeStage === stages.length - 1 && "cursor-not-allowed opacity-50",
            )}
          >
            {activeStage === stages.length - 1 ? "Complete" : "Next stage ->"}
          </button>

          <button
            type="button"
            onClick={toggleAutoPlay}
            className="rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50 dark:border-teal-500/50 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            {isAutoPlaying ? "Pause auto-play" : "Auto-play"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
