"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export interface NextSessionCardProps {
  title: string;
  slug: string;
  teaser: string;
  module: number;
}

export function NextSessionCard({
  title,
  slug,
  teaser,
  module,
}: NextSessionCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div whileHover={reducedMotion ? undefined : { x: 4 }} transition={{ duration: 0.2 }}>
      <Link
        href={`/sessions/${slug}`}
        className="flex w-full items-start gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 transition-colors hover:bg-violet-100/70 dark:border-violet-800 dark:bg-violet-900/20 dark:hover:bg-violet-900/30"
      >
        <span
          aria-hidden="true"
          className="mt-1 text-3xl font-light leading-none text-violet-500 dark:text-violet-400"
        >
          -&gt;
        </span>

        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
            Next Session
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-500/80 dark:text-violet-300/80">
            Module {module}
          </p>
          <h3 className="text-2xl font-semibold text-gray-950 dark:text-gray-50">{title}</h3>
          <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">{teaser}</p>
        </div>
      </Link>
    </motion.div>
  );
}
