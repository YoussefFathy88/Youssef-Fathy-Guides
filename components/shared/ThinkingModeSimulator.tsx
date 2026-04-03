"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ─── Scripted content ──────────────────────────────────────────────────── */

const PROMPT = "Write a function that checks if a string is a palindrome.";

interface TokenSequence {
  text: string;
  type: "scratchpad" | "answer";
  delay: number; // ms from generation start
}

const FAST_SEQUENCE: TokenSequence[] = [
  { text: "def",         type: "answer",     delay: 0    },
  { text: " is",         type: "answer",     delay: 220  },
  { text: "_palindrome", type: "answer",     delay: 440  },
  { text: "(s):",        type: "answer",     delay: 660  },
  { text: "\n    return",type: "answer",     delay: 880  },
  { text: " s",          type: "answer",     delay: 1100 },
  { text: " ==",         type: "answer",     delay: 1320 },
  { text: " s[::-1]",    type: "answer",     delay: 1540 },
];

const THINK_SEQUENCE: TokenSequence[] = [
  // Scratchpad phase
  { text: "A palindrome reads the same",     type: "scratchpad", delay: 0    },
  { text: " forwards and backwards.",        type: "scratchpad", delay: 480  },
  { text: " I can reverse and compare.",     type: "scratchpad", delay: 960  },
  { text: " But wait — should I handle",     type: "scratchpad", delay: 1440 },
  { text: " empty strings?",                type: "scratchpad", delay: 1920 },
  { text: " Yes — empty and single-char",   type: "scratchpad", delay: 2400 },
  { text: " are always palindromes.",        type: "scratchpad", delay: 2880 },
  { text: " Revised approach: strip, lower",type: "scratchpad", delay: 3360 },
  { text: ", then reverse and compare.",    type: "scratchpad", delay: 3840 },
  // Answer phase
  { text: "def",            type: "answer", delay: 4600  },
  { text: " is_palindrome", type: "answer", delay: 4820  },
  { text: "(s):",           type: "answer", delay: 5040  },
  { text: "\n    s =",      type: "answer", delay: 5260  },
  { text: " s.strip()",     type: "answer", delay: 5480  },
  { text: ".lower()",       type: "answer", delay: 5700  },
  { text: "\n    return",   type: "answer", delay: 5920  },
  { text: " s",             type: "answer", delay: 6140  },
  { text: " ==",            type: "answer", delay: 6360  },
  { text: " s[::-1]",       type: "answer", delay: 6580  },
];

const FAST_TOTAL_MS   = 1800;
const THINK_TOTAL_MS  = 7000;
const FAST_TOKENS     = 8;
const THINK_TOKENS    = 9 + 10; // 9 scratchpad + 10 answer

export interface ThinkingModeSimulatorProps {
  title?:   string;
  caption?: string;
}

export default function ThinkingModeSimulator({
  title   = "Same prompt, same model — the only difference is a scratchpad",
  caption = "Press Play to watch both modes run simultaneously. Notice when each first answer token appears.",
}: ThinkingModeSimulatorProps) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase]   = useState<"idle" | "running" | "done">("idle");
  const [fastTokens, setFastTokens]   = useState<string[]>([]);
  const [thinkTokens, setThinkTokens] = useState<TokenSequence[]>([]);
  const [fastDone, setFastDone]   = useState(false);
  const [thinkDone, setThinkDone] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef    = useRef<number>(0);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  function reset() {
    clearAll();
    setPhase("idle");
    setFastTokens([]);
    setThinkTokens([]);
    setFastDone(false);
    setThinkDone(false);
    setElapsedMs(0);
  }

  function play() {
    reset();
    setPhase("running");
    startRef.current = Date.now();

    // Tick elapsed ms
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 50);

    const speedFactor = reducedMotion ? 0.2 : 1;

    // ── Fast mode tokens ──
    FAST_SEQUENCE.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        setFastTokens(prev => [...prev, text]);
      }, delay * speedFactor);
      timeoutsRef.current.push(t);
    });
    const tFastDone = setTimeout(() => {
      setFastDone(true);
    }, (FAST_TOTAL_MS + 200) * speedFactor);
    timeoutsRef.current.push(tFastDone);

    // ── Thinking mode tokens ──
    THINK_SEQUENCE.forEach(item => {
      const t = setTimeout(() => {
        setThinkTokens(prev => [...prev, item]);
      }, item.delay * speedFactor);
      timeoutsRef.current.push(t);
    });
    const tThinkDone = setTimeout(() => {
      setThinkDone(true);
      setPhase("done");
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, (THINK_TOTAL_MS + 200) * speedFactor);
    timeoutsRef.current.push(tThinkDone);
  }

  const fastMs   = fastDone   ? FAST_TOTAL_MS  : Math.min(elapsedMs, FAST_TOTAL_MS);
  const thinkMs  = thinkDone  ? THINK_TOTAL_MS : Math.min(elapsedMs, THINK_TOTAL_MS);
  const fastCost  = 0.0004;
  const thinkCost = 0.0032;

  const scratchpadTokens = thinkTokens.filter(t => t.type === "scratchpad");
  const answerTokens     = thinkTokens.filter(t => t.type === "answer");

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

        {/* Shared prompt */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900/60">
          <div className="flex items-baseline gap-3">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400">Prompt</span>
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{PROMPT}</span>
          </div>
        </div>

        {/* Side-by-side panels */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Fast mode */}
          <div className="rounded-xl border border-teal-200 bg-white p-4 dark:border-teal-500/30 dark:bg-gray-900/60">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Fast Mode</p>
                <p className="text-[10px] text-gray-400">No scratchpad — direct answer</p>
              </div>
              <div className="rounded-full bg-teal-50 px-2 py-1 text-[11px] font-mono font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                {(fastMs / 1000).toFixed(1)}s
              </div>
            </div>

            <div className="min-h-[90px] rounded-lg bg-gray-50 p-3 font-mono text-sm dark:bg-gray-800">
              <AnimatePresence initial={false}>
                {fastTokens.map((tok, i) => (
                  <motion.span
                    key={`fast-${i}`}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-teal-700 dark:text-teal-300 whitespace-pre-wrap"
                  >
                    {tok}
                  </motion.span>
                ))}
              </AnimatePresence>
              {phase === "running" && !fastDone && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="font-bold text-teal-500"
                >|</motion.span>
              )}
            </div>

            {fastDone && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center justify-between text-xs"
              >
                <span className="text-teal-600 dark:text-teal-400">✅ {FAST_TOKENS} tokens</span>
                <span className="text-gray-400">${fastCost.toFixed(4)}</span>
              </motion.div>
            )}
          </div>

          {/* Thinking mode */}
          <div className="rounded-xl border border-violet-200 bg-white p-4 dark:border-violet-500/30 dark:bg-gray-900/60">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Thinking Mode</p>
                <p className="text-[10px] text-gray-400">Scratchpad first, then answer</p>
              </div>
              <div className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-mono font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                {(thinkMs / 1000).toFixed(1)}s
              </div>
            </div>

            <div className="min-h-[90px] rounded-lg bg-gray-50 p-3 font-mono text-xs dark:bg-gray-800">
              {/* Scratchpad */}
              {scratchpadTokens.length > 0 && (
                <div className="mb-2 rounded border border-dashed border-violet-200 bg-violet-50/60 p-2 dark:border-violet-500/20 dark:bg-violet-500/5">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-violet-400">scratchpad — hidden</p>
                  <AnimatePresence initial={false}>
                    {scratchpadTokens.map((tok, i) => (
                      <motion.span
                        key={`sp-${i}`}
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-pre-wrap text-violet-400 dark:text-violet-500"
                      >
                        {tok.text}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {phase === "running" && scratchpadTokens.length > 0 && answerTokens.length === 0 && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="font-bold text-violet-400"
                    >|</motion.span>
                  )}
                </div>
              )}

              {/* Answer */}
              {answerTokens.length > 0 && (
                <div>
                  <AnimatePresence initial={false}>
                    {answerTokens.map((tok, i) => (
                      <motion.span
                        key={`ans-${i}`}
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-pre-wrap text-sm text-violet-700 dark:text-violet-300"
                      >
                        {tok.text}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {phase === "running" && !thinkDone && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="font-bold text-violet-500"
                    >|</motion.span>
                  )}
                </div>
              )}
            </div>

            {thinkDone && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center justify-between text-xs"
              >
                <span className="text-violet-600 dark:text-violet-400">✅ {THINK_TOKENS} tokens ({FAST_TOKENS} answer + {THINK_TOKENS - FAST_TOKENS} scratchpad)</span>
                <span className="text-gray-400">${thinkCost.toFixed(4)}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Summary row when done */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="rounded-xl bg-white px-3 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
                <p className="text-[10px] text-gray-400">Time saved</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-teal-500">
                  {((THINK_TOTAL_MS - FAST_TOTAL_MS) / 1000).toFixed(1)}s faster
                </p>
                <p className="text-[10px] text-gray-400">Fast mode</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
                <p className="text-[10px] text-gray-400">Cost difference</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-amber-500">
                  8× more
                </p>
                <p className="text-[10px] text-gray-400">Thinking mode</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-3 text-center ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
                <p className="text-[10px] text-gray-400">Answer quality</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-violet-500">
                  Better
                </p>
                <p className="text-[10px] text-gray-400">handles edge cases</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {phase === "idle" ? (
            <button
              type="button"
              onClick={play}
              className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 dark:bg-violet-400 dark:text-gray-950 dark:hover:bg-violet-300"
            >
              ▶ Play both modes
            </button>
          ) : phase === "running" ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
            >
              ↺ Reset
            </button>
          ) : (
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-gray-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-gray-600"
            >
              ↺ Play again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
