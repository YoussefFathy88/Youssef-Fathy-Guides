"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Deterministic token sequences for greedy vs sampled modes */
const PROMPTS: Record<string, { greedy: string[]; sampled: string[][] }> = {
  "The weather today is": {
    greedy:  ["sunny", " and", " warm", ".", " Perfect", " for", " a", " walk", "."],
    sampled: [
      ["sunny", " and", " mild", ".", " A", " great", " day", " outside", "."],
      ["cloudy", " with", " a", " chance", " of", " rain", " later", " today", "."],
      ["warm", " and", " humid", " —", " dress", " light", " and", " stay", " hydrated", "."],
    ],
  },
  "The best programming language is": {
    greedy:  ["Python", " because", " of", " its", " readability", " and", " vast", " ecosystem", "."],
    sampled: [
      ["TypeScript", " for", " large", " codebases", " where", " type", " safety", " matters", "."],
      ["Rust", ",", " without", " question", " —", " memory", " safety", " at", " zero", " cost", "."],
      ["it", " depends", " entirely", " on", " the", " problem", " you", " are", " solving", "."],
    ],
  },
  "The capital of France is": {
    greedy:  ["Paris", "."],
    sampled: [
      ["Paris", " —", " a", " city", " of", " art", ",", " culture", ",", " and", " history", "."],
      ["Paris", ",", " known", " for", " the", " Eiffel", " Tower", " and", " more", "."],
      ["Paris", "."],
    ],
  },
};

const PROMPT_KEYS = Object.keys(PROMPTS);

/** Mini per-token probability bars shown during generation */
const TOKEN_PROBS: Record<string, { token: string; prob: number }[]> = {
  sunny:      [{ token: "sunny", prob: 0.72 }, { token: "warm", prob: 0.14 }, { token: "cloudy", prob: 0.09 }],
  cloudy:     [{ token: "sunny", prob: 0.72 }, { token: "warm", prob: 0.14 }, { token: "cloudy", prob: 0.09 }],
  warm:       [{ token: "sunny", prob: 0.72 }, { token: "warm", prob: 0.14 }, { token: "cold", prob: 0.09 }],
  Python:     [{ token: "Python", prob: 0.68 }, { token: "TypeScript", prob: 0.18 }, { token: "Rust", prob: 0.08 }],
  TypeScript: [{ token: "Python", prob: 0.68 }, { token: "TypeScript", prob: 0.18 }, { token: "Rust", prob: 0.08 }],
  Rust:       [{ token: "Python", prob: 0.68 }, { token: "TypeScript", prob: 0.18 }, { token: "Rust", prob: 0.08 }],
  Paris:      [{ token: "Paris", prob: 0.91 }, { token: "Lyon", prob: 0.05 }, { token: "Nice", prob: 0.02 }],
};

const DEFAULT_PROBS = [
  { token: "…", prob: 0.5 },
  { token: "…", prob: 0.3 },
  { token: "…", prob: 0.15 },
];

export interface AutoregressiveDemoProps {
  title?: string;
  caption?: string;
}

export default function AutoregressiveDemo({
  title  = "Autoregressive generation — one token at a time",
  caption = "Click Generate to watch tokens appear one by one. Toggle between Greedy and Sampled modes.",
}: AutoregressiveDemoProps) {
  const reducedMotion   = useReducedMotion();
  const [promptIdx, setPromptIdx]   = useState(0);
  const [mode, setMode]             = useState<"greedy" | "sampled">("greedy");
  const [sampleVariant, setSampleVariant] = useState(0);
  const [generated, setGenerated]   = useState<string[]>([]);
  const [currentProbs, setCurrentProbs] = useState<{ token: string; prob: number }[] | null>(null);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isDone, setIsDone]         = useState(false);
  const timeoutsRef                 = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => () => clearTimeouts(), [clearTimeouts]);

  const prompt = PROMPT_KEYS[promptIdx];
  const promptData = PROMPTS[prompt];
  const sequence = mode === "greedy"
    ? promptData.greedy
    : promptData.sampled[sampleVariant % promptData.sampled.length];

  function reset() {
    clearTimeouts();
    setGenerated([]);
    setCurrentProbs(null);
    setIsGenerating(false);
    setIsDone(false);
  }

  function generate() {
    if (isGenerating) return;
    reset();

    // New sample variant each time
    if (mode === "sampled") {
      setSampleVariant(v => (v + 1) % promptData.sampled.length);
    }

    setIsGenerating(true);
    const delay = reducedMotion ? 80 : 420;

    sequence.forEach((token, i) => {
      // Show probs just before token appears
      const t1 = setTimeout(() => {
        setCurrentProbs(TOKEN_PROBS[token.trim()] ?? DEFAULT_PROBS);
      }, i * delay);

      const t2 = setTimeout(() => {
        setGenerated(prev => [...prev, token]);
        setCurrentProbs(null);
        if (i === sequence.length - 1) {
          setIsGenerating(false);
          setIsDone(true);
        }
      }, i * delay + (reducedMotion ? 40 : 280));

      timeoutsRef.current.push(t1, t2);
    });
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        {/* Prompt selector */}
        <div className="flex flex-wrap gap-2">
          {PROMPT_KEYS.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPromptIdx(i); reset(); }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                i === promptIdx
                  ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/60 dark:bg-violet-500/10 dark:text-violet-300"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400",
              )}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sampling mode:</span>
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            {(["greedy", "sampled"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); reset(); }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize transition",
                  mode === m
                    ? m === "greedy"
                      ? "bg-violet-500 text-white dark:bg-violet-400 dark:text-gray-950"
                      : "bg-teal-500 text-white dark:bg-teal-400 dark:text-gray-950"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          {mode === "sampled" && (
            <span className="text-[11px] text-gray-400">
              Run multiple times to see variance
            </span>
          )}
        </div>

        {/* Generation display */}
        <div className="min-h-[100px] rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
          <div className="flex flex-wrap items-baseline gap-x-0.5 gap-y-1">
            {/* Static prompt */}
            <span className="font-mono text-base text-gray-400 dark:text-gray-500">
              {prompt}&nbsp;
            </span>

            {/* Generated tokens */}
            <AnimatePresence initial={false}>
              {generated.map((token, i) => (
                <motion.span
                  key={`${i}-${token}`}
                  initial={reducedMotion ? false : { opacity: 0, y: -6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={cn(
                    "font-mono text-base font-semibold",
                    mode === "greedy"
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-teal-600 dark:text-teal-400",
                  )}
                >
                  {token}
                </motion.span>
              ))}
            </AnimatePresence>

            {/* Blinking cursor while generating */}
            {isGenerating && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="font-mono text-base font-bold text-gray-400"
              >
                |
              </motion.span>
            )}
          </div>
        </div>

        {/* Mini probability bars — show while deciding next token */}
        <AnimatePresence>
          {currentProbs && (
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
                {currentProbs.map((c, i) => (
                  <div key={`${c.token}-${i}`} className="flex items-center gap-2">
                    <span className="w-20 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                      {c.token}
                    </span>
                    <div className="relative flex-1 h-4 overflow-hidden rounded bg-gray-100 dark:bg-gray-700/60">
                      <motion.div
                        className={i === 0 ? "absolute inset-y-0 left-0 rounded bg-violet-400" : "absolute inset-y-0 left-0 rounded bg-gray-300 dark:bg-gray-600"}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.prob * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-xs text-gray-500">
                      {Math.round(c.prob * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={isDone ? reset : generate}
            disabled={isGenerating}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              isDone
                ? "bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-600"
                : "bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300",
              isGenerating && "cursor-not-allowed opacity-60",
            )}
          >
            {isDone ? "↺ Reset" : isGenerating ? "Generating…" : "▶ Generate"}
          </button>

          {isDone && (
            <button
              type="button"
              onClick={generate}
              className="rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-600 transition hover:bg-teal-50 dark:border-teal-500/50 dark:text-teal-400"
            >
              ▶ Generate again
            </button>
          )}
        </div>

        {isDone && mode === "sampled" && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-teal-600 dark:text-teal-400"
          >
            ↑ Click &quot;Generate again&quot; — you&apos;ll get a different sequence. Same model, same prompt, different sample.
          </motion.p>
        )}
        {isDone && mode === "greedy" && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-violet-600 dark:text-violet-400"
          >
            ↑ Greedy always picks the highest-probability token. Run it again — the output is identical every time.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
