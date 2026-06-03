"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface SessionOutlineSlideProps {
  items?: string[];
}

export function SessionOutlineSlide({ items = [] }: SessionOutlineSlideProps) {
  const reducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.12,
        delayChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-[28rem] w-full items-center justify-center p-8 md:p-10">
      <div className="w-full max-w-3xl">
        <p className="mb-8 text-base font-bold uppercase tracking-widest text-violet-300 md:text-lg">
          What we&apos;ll cover
        </p>

        <motion.ol
          className="space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {items.map((item, index) => (
            <motion.li
              key={item}
              variants={itemVariants}
              className="flex items-center gap-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/30 ring-1 ring-violet-500/40 text-base font-bold text-violet-300 md:h-12 md:w-12 md:text-lg">
                {index + 1}
              </span>
              <span className="text-xl font-semibold text-gray-100 md:text-2xl">
                {item}
              </span>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </div>
  );
}
