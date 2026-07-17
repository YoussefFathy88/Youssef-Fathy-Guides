"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface TokenSplitExampleProps {
  title?: string;
  caption?: string;
}

interface WordBreakdown {
  word: string;
  pieces: string[];
}

const PROMPT = "the tokenizer helps";

const BREAKDOWN: WordBreakdown[] = [
  { word: "the", pieces: ["the"] },
  { word: "tokenizer", pieces: ["token", "izer"] },
  { word: "helps", pieces: ["helps"] },
];

export default function TokenSplitExample({
  title = "One prompt, three words — two different outcomes",
  caption = "The model never reads the words themselves — only the tokens below.",
}: TokenSplitExampleProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 space-y-2 md:mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl dark:text-gray-100">
          {title}
        </h2>
        <p className="text-lg leading-relaxed text-gray-600 md:text-xl dark:text-gray-300">{caption}</p>
      </div>

      <div className="mb-6 rounded-xl bg-white px-5 py-4 text-center ring-1 ring-gray-200 md:mb-8 dark:bg-gray-900 dark:ring-gray-700">
        <p className="text-base font-bold uppercase tracking-[0.12em] text-gray-500 md:text-lg dark:text-gray-400">
          Prompt
        </p>
        <p className="mt-1 text-xl font-semibold text-gray-900 md:text-2xl dark:text-gray-100">
          &quot;{PROMPT}&quot;
        </p>
      </div>

      <div className="space-y-4">
        {BREAKDOWN.map((w, i) => {
          const isWhole = w.pieces.length === 1;
          return (
            <motion.div
              key={w.word}
              initial={reducedMotion ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reducedMotion ? 0 : i * 0.15, duration: 0.35 }}
              className="flex flex-col gap-3 rounded-xl bg-white p-5 ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-900 dark:ring-gray-700"
            >
              <span className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
                &quot;{w.word}&quot;
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {w.pieces.map((p) => (
                  <span
                    key={p}
                    className={
                      isWhole
                        ? "rounded-lg bg-teal-500/15 px-4 py-2 font-mono text-lg font-bold text-teal-900 ring-1 ring-teal-600/20 md:text-xl dark:bg-teal-500/25 dark:text-teal-100 dark:ring-teal-400/20"
                        : "rounded-lg bg-rose-500/15 px-4 py-2 font-mono text-lg font-bold text-rose-900 ring-1 ring-rose-600/20 md:text-xl dark:bg-rose-500/25 dark:text-rose-100 dark:ring-rose-400/20"
                    }
                  >
                    {p}
                  </span>
                ))}
                <span className="text-base font-semibold text-gray-500 md:text-lg dark:text-gray-400">
                  {w.pieces.length} {w.pieces.length > 1 ? "tokens" : "token"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 text-base italic text-gray-500 md:text-lg dark:text-gray-400">
        Simplified example — common words often stay whole; rarer or compound words split into pieces.
      </p>
    </div>
  );
}
