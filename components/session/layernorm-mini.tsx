"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const LN_BEFORE = [100, 200, 300, 400] as const;
const LN_AFTER = [-1.3, -0.4, 0.4, 1.3] as const;

function formatVector(values: readonly number[]): string {
  return `[${values.join(", ")}]`;
}

export function LayerNormMini({ reducedMotion }: { reducedMotion: boolean }) {
  const vectorClass =
    "whitespace-nowrap font-mono text-2xl font-bold tabular-nums leading-none tracking-tight text-gray-950 dark:text-white md:text-4xl lg:text-5xl";
  const labelClass = "text-xl font-bold text-slate-900 dark:text-slate-200 md:text-2xl";

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-10 py-6 md:gap-12 md:py-8"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-900/[0.04] dark:bg-white/[0.06] px-6 py-8 text-center md:px-10 md:py-10"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className={labelClass}>Before LayerNorm</p>
        <p className={cn(vectorClass, "mt-5 text-[color:var(--warning)]")}>{formatVector(LN_BEFORE)}</p>
      </motion.div>

      <motion.div
        className="text-[color:var(--success)]"
        animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <svg width="40" height="48" viewBox="0 0 20 24" fill="none" className="h-12 w-10 md:h-14 md:w-12">
          <path
            d="M10 4v14M6 14l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        className="w-full max-w-3xl rounded-2xl border border-[color:var(--success)]/35 bg-[color:var(--success)]/10 px-6 py-8 text-center md:px-10 md:py-10"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: reducedMotion ? 0 : 0.15 }}
      >
        <p className={labelClass}>After LayerNorm</p>
        <p className={cn(vectorClass, "mt-5 text-[color:var(--success)]")}>{formatVector(LN_AFTER)}</p>
      </motion.div>
    </motion.div>
  );
}
