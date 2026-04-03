"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TokenCandidate {
  token: string;
  prob: number;
}

export interface AutoregressiveDemoCandidateStep {
  step: number;
  candidates: TokenCandidate[];
}

/** Deterministic token sequences for greedy vs sampled modes. */
const PROMPTS: Record<string, { greedy: string[]; sampled: string[][] }> = {
  "The weather today is": {
    greedy: ["sunny", " and", " warm", ".", " Perfect", " for", " a", " walk", "."],
    sampled: [
      ["sunny", " and", " mild", ".", " A", " great", " day", " outside", "."],
      ["cloudy", " with", " a", " chance", " of", " rain", " later", " today", "."],
      [
        "warm",
        " and",
        " humid",
        " -",
        " dress",
        " light",
        " and",
        " stay",
        " hydrated",
        ".",
      ],
    ],
  },
  "The best programming language is": {
    greedy: [
      "Python",
      " because",
      " of",
      " its",
      " readability",
      " and",
      " vast",
      " ecosystem",
      ".",
    ],
    sampled: [
      [
        "TypeScript",
        " for",
        " large",
        " codebases",
        " where",
        " type",
        " safety",
        " matters",
        ".",
      ],
      [
        "Rust",
        ",",
        " without",
        " question",
        " -",
        " memory",
        " safety",
        " at",
        " zero",
        " cost",
        ".",
      ],
      [
        "it",
        " depends",
        " entirely",
        " on",
        " the",
        " problem",
        " you",
        " are",
        " solving",
        ".",
      ],
    ],
  },
  "The capital of France is": {
    greedy: ["Paris", "."],
    sampled: [
      [
        "Paris",
        " -",
        " a",
        " city",
        " of",
        " art",
        ",",
        " culture",
        ",",
        " and",
        " history",
        ".",
      ],
      ["Paris", ",", " known", " for", " the", " Eiffel", " Tower", " and", " more", "."],
      ["Paris", "."],
    ],
  },
};

const PROMPT_KEYS = Object.keys(PROMPTS);

/** Mini per-token probability bars shown during generation. */
const TOKEN_PROBS: Record<string, TokenCandidate[]> = {
  sunny: [
    { token: "sunny", prob: 0.72 },
    { token: "warm", prob: 0.14 },
    { token: "cloudy", prob: 0.09 },
  ],
  cloudy: [
    { token: "sunny", prob: 0.72 },
    { token: "warm", prob: 0.14 },
    { token: "cloudy", prob: 0.09 },
  ],
  warm: [
    { token: "sunny", prob: 0.72 },
    { token: "warm", prob: 0.14 },
    { token: "cold", prob: 0.09 },
  ],
  Python: [
    { token: "Python", prob: 0.68 },
    { token: "TypeScript", prob: 0.18 },
    { token: "Rust", prob: 0.08 },
  ],
  TypeScript: [
    { token: "Python", prob: 0.68 },
    { token: "TypeScript", prob: 0.18 },
    { token: "Rust", prob: 0.08 },
  ],
  Rust: [
    { token: "Python", prob: 0.68 },
    { token: "TypeScript", prob: 0.18 },
    { token: "Rust", prob: 0.08 },
  ],
  Paris: [
    { token: "Paris", prob: 0.91 },
    { token: "Lyon", prob: 0.05 },
    { token: "Nice", prob: 0.02 },
  ],
};

const DEFAULT_PROBS = [
  { token: "...", prob: 0.5 },
  { token: "...", prob: 0.3 },
  { token: "...", prob: 0.15 },
];

export interface AutoregressiveDemoProps {
  title?: string;
  caption?: string;
  question?: string;
  contextPrefix?: string;
  tokens?: string[];
  topCandidates?: AutoregressiveDemoCandidateStep[];
  autoRunDelayMs?: number;
  decisionRevealDelayMs?: number;
}

function ensureSelectedTokenInCandidates(
  candidates: TokenCandidate[],
  selectedToken: string,
): TokenCandidate[] {
  const normalizedToken = selectedToken.trim();

  if (
    normalizedToken.length === 0 ||
    candidates.some((candidate) => candidate.token.trim() === normalizedToken)
  ) {
    return candidates;
  }

  return [{ token: normalizedToken, prob: 0.99 }, ...candidates].slice(0, 4);
}

export default function AutoregressiveDemo({
  title = "Autoregressive generation - one token at a time",
  caption = "Click Step Into once to reveal the next-token distribution, then click it again to append the chosen token. Run plays the full loop automatically.",
  question,
  contextPrefix,
  tokens,
  topCandidates,
  autoRunDelayMs = 900,
  decisionRevealDelayMs = 560,
}: AutoregressiveDemoProps) {
  const reducedMotion = useReducedMotion();
  const [promptIdx, setPromptIdx] = useState(0);
  const [mode, setMode] = useState<"greedy" | "sampled">("greedy");
  const [sampleVariant, setSampleVariant] = useState(0);
  const [runSequence, setRunSequence] = useState<string[] | null>(null);
  const [nextTokenIndex, setNextTokenIndex] = useState(0);
  const [pendingTokenIndex, setPendingTokenIndex] = useState<number | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);
  const [currentProbs, setCurrentProbs] = useState<TokenCandidate[] | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const customSequence = useMemo(
    () => (Array.isArray(tokens) && tokens.length > 0 ? tokens : null),
    [tokens],
  );
  const customCandidateMap = useMemo(() => {
    const map = new Map<number, TokenCandidate[]>();
    (topCandidates ?? []).forEach((entry) => {
      map.set(entry.step, entry.candidates);
    });
    return map;
  }, [topCandidates]);

  const selectedPrompt = PROMPT_KEYS[promptIdx];
  const selectedPromptData = PROMPTS[selectedPrompt];
  const activePrefix = customSequence ? contextPrefix ?? "" : selectedPrompt;
  const userQuestion = customSequence ? question : undefined;
  const controlsLocked = isAutoRunning;
  const hasPendingToken = pendingTokenIndex !== null && currentProbs !== null;
  const totalTokens =
    runSequence?.length ??
    customSequence?.length ??
    (mode === "greedy"
      ? selectedPromptData.greedy.length
      : selectedPromptData.sampled[sampleVariant % selectedPromptData.sampled.length].length);
  const activeTokenCount =
    hasPendingToken && pendingTokenIndex !== null ? pendingTokenIndex + 1 : nextTokenIndex;
  const autoStepDelay = reducedMotion ? 140 : autoRunDelayMs;
  const tokenRevealDelay = reducedMotion ? 70 : decisionRevealDelayMs;
  const accentClass =
    customSequence || mode === "greedy"
      ? "text-violet-600 dark:text-violet-400"
      : "text-teal-600 dark:text-teal-400";
  const accentBarClass =
    customSequence || mode === "greedy" ? "bg-violet-400" : "bg-teal-400";

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimeouts();
    setRunSequence(null);
    setNextTokenIndex(0);
    setPendingTokenIndex(null);
    setGenerated([]);
    setCurrentProbs(null);
    setIsAutoRunning(false);
    setIsDone(false);
  }, [clearTimeouts]);

  useEffect(() => () => clearTimeouts(), [clearTimeouts]);

  useEffect(() => {
    reset();
  }, [customSequence, contextPrefix, question, reset]);

  function lockSequenceForRun() {
    if (runSequence) {
      return runSequence;
    }

    const selectedSequence =
      customSequence ??
      (mode === "greedy"
        ? selectedPromptData.greedy
        : selectedPromptData.sampled[sampleVariant % selectedPromptData.sampled.length]);

    setRunSequence(selectedSequence);

    if (!customSequence && mode === "sampled") {
      setSampleVariant((variant) => (variant + 1) % selectedPromptData.sampled.length);
    }

    return selectedSequence;
  }

  function revealTokenDistribution(sequence: string[], tokenIndex: number) {
    const token = sequence[tokenIndex];
    const fallbackCandidates =
      customSequence && customCandidateMap.has(tokenIndex)
        ? customCandidateMap.get(tokenIndex) ?? DEFAULT_PROBS
        : TOKEN_PROBS[token.trim()] ?? DEFAULT_PROBS;

    setPendingTokenIndex(tokenIndex);
    setCurrentProbs(ensureSelectedTokenInCandidates(fallbackCandidates, token));
  }

  function commitToken(sequence: string[], tokenIndex: number) {
    const token = sequence[tokenIndex];

    setGenerated((previousTokens) => [...previousTokens, token]);
    setCurrentProbs(null);
    setPendingTokenIndex(null);
    setNextTokenIndex(tokenIndex + 1);

    if (tokenIndex === sequence.length - 1) {
      setIsDone(true);
      setIsAutoRunning(false);
      return true;
    }

    return false;
  }

  function queueTokenStep({
    sequence,
    tokenIndex,
    offsetMs,
  }: {
    sequence: string[];
    tokenIndex: number;
    offsetMs: number;
  }) {
    const revealProbsTimeout = setTimeout(() => {
      revealTokenDistribution(sequence, tokenIndex);
    }, offsetMs);

    const appendTokenTimeout = setTimeout(() => {
      commitToken(sequence, tokenIndex);
    }, offsetMs + tokenRevealDelay);

    timeoutsRef.current.push(revealProbsTimeout, appendTokenTimeout);
  }

  function stepInto() {
    if (controlsLocked || isDone) return;

    const activeSequence = lockSequenceForRun();

    if (hasPendingToken && pendingTokenIndex !== null) {
      clearTimeouts();
      commitToken(activeSequence, pendingTokenIndex);
      return;
    }

    if (nextTokenIndex >= activeSequence.length) {
      setIsDone(true);
      return;
    }

    clearTimeouts();
    revealTokenDistribution(activeSequence, nextTokenIndex);
  }

  function run() {
    if (controlsLocked || isDone) return;

    const activeSequence = lockSequenceForRun();
    let startTokenIndex = nextTokenIndex;

    if (hasPendingToken && pendingTokenIndex !== null) {
      const sequenceComplete = commitToken(activeSequence, pendingTokenIndex);

      if (sequenceComplete) {
        return;
      }

      startTokenIndex = pendingTokenIndex + 1;
    }

    if (startTokenIndex >= activeSequence.length) {
      setIsDone(true);
      return;
    }

    setIsAutoRunning(true);
    clearTimeouts();

    activeSequence.slice(startTokenIndex).forEach((_, relativeIndex) => {
      queueTokenStep({
        sequence: activeSequence,
        tokenIndex: startTokenIndex + relativeIndex,
        offsetMs: relativeIndex * autoStepDelay,
      });
    });
  }

  const pendingToken =
    pendingTokenIndex !== null ? runSequence?.[pendingTokenIndex]?.trim() ?? "" : "";

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
              Token {Math.min(activeTokenCount, totalTokens)} / {totalTokens}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        {!customSequence ? (
          <div className="flex flex-wrap gap-2">
            {PROMPT_KEYS.map((promptOption, index) => (
              <button
                key={promptOption}
                type="button"
                onClick={() => {
                  if (controlsLocked) return;
                  reset();
                  setPromptIdx(index);
                }}
                disabled={controlsLocked}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  index === promptIdx
                    ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/60 dark:bg-violet-500/10 dark:text-violet-300"
                    : "border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400",
                  controlsLocked && "cursor-not-allowed opacity-60",
                )}
              >
                &quot;{promptOption}&quot;
              </button>
            ))}
          </div>
        ) : null}

        {!customSequence ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Sampling mode:
            </span>
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
              {(["greedy", "sampled"] as const).map((modeOption) => (
                <button
                  key={modeOption}
                  type="button"
                  onClick={() => {
                    if (controlsLocked) return;
                    reset();
                    setMode(modeOption);
                  }}
                  disabled={controlsLocked}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold capitalize transition",
                    mode === modeOption
                      ? modeOption === "greedy"
                        ? "bg-violet-500 text-white dark:bg-violet-400 dark:text-gray-950"
                        : "bg-teal-500 text-white dark:bg-teal-400 dark:text-gray-950"
                      : "text-gray-500 dark:text-gray-400",
                    controlsLocked && "cursor-not-allowed",
                  )}
                >
                  {modeOption}
                </button>
              ))}
            </div>
            {mode === "sampled" ? (
              <span className="text-[11px] text-gray-400">
                Reset and run again to see variance
              </span>
            ) : null}
          </div>
        ) : null}

        {userQuestion ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              User
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {userQuestion}
            </p>
          </div>
        ) : null}

        <div className="min-h-[120px] rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {customSequence ? "Assistant" : "Context + generated tokens"}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-0.5 gap-y-1">
            {activePrefix ? (
              <span className="font-mono text-base text-gray-400 dark:text-gray-500">
                {activePrefix}&nbsp;
              </span>
            ) : null}

            <AnimatePresence initial={false}>
              {generated.map((token, index) => (
                <motion.span
                  key={`${index}-${token}`}
                  initial={reducedMotion ? false : { opacity: 0, y: -6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={cn("font-mono text-base font-semibold", accentClass)}
                >
                  {token}
                </motion.span>
              ))}
            </AnimatePresence>

            {controlsLocked ? (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="font-mono text-base font-bold text-gray-400"
              >
                |
              </motion.span>
            ) : null}

            {generated.length === 0 && !activePrefix ? (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                Waiting for the first sampled token...
              </span>
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {currentProbs ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/60"
            >
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Next-token candidates
              </p>
              <div className="space-y-1.5">
                {currentProbs.map((candidate, index) => {
                  const isSelected =
                    pendingToken.length > 0
                      ? candidate.token.trim() === pendingToken
                      : index === 0;

                  return (
                    <div key={`${candidate.token}-${index}`} className="flex items-center gap-2">
                      <span className="w-20 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                        {candidate.token}
                      </span>
                      <div className="relative h-4 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-700/60">
                        <motion.div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded",
                            isSelected ? accentBarClass : "bg-gray-300 dark:bg-gray-600",
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.prob * 100}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-xs text-gray-500">
                        {Math.round(candidate.prob * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
              {!isAutoRunning && pendingToken ? (
                <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                  Distribution computed. Click Step Into again to append
                  <span className="font-mono font-semibold text-gray-700 dark:text-gray-200">
                    {" "}
                    {pendingToken}
                  </span>{" "}
                  to the context.
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={stepInto}
            disabled={controlsLocked || isDone}
            className={cn(
              "rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300",
              (controlsLocked || isDone) && "cursor-not-allowed opacity-60",
            )}
          >
            Step Into
          </button>

          <button
            type="button"
            onClick={run}
            disabled={controlsLocked || isDone}
            className={cn(
              "rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-600 transition hover:bg-teal-50 dark:border-teal-500/50 dark:text-teal-400 dark:hover:bg-teal-500/10",
              (controlsLocked || isDone) && "cursor-not-allowed opacity-60",
            )}
          >
            {isAutoRunning ? "Running..." : "Run"}
          </button>

          {(generated.length > 0 || isDone || currentProbs) && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/40"
            >
              Reset
            </button>
          )}
        </div>

        {isDone && !customSequence && mode === "sampled" ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-teal-600 dark:text-teal-400"
          >
            Reset, then Run or Step Into again to draw a different sample. Same model, same prompt,
            different sequence.
          </motion.p>
        ) : null}

        {isDone && !customSequence && mode === "greedy" ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-violet-600 dark:text-violet-400"
          >
            Greedy always picks the highest-probability token. Reset and run again - the output
            stays identical.
          </motion.p>
        ) : null}

        {isDone && customSequence ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-violet-600 dark:text-violet-400"
          >
            Every visible word in the answer was generated by repeating the same reveal-and-append
            loop one token at a time.
          </motion.p>
        ) : null}
      </div>
    </motion.div>
  );
}
