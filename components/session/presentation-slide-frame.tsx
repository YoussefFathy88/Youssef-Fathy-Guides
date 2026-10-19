"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function PresentationSlideFrame({
  slideId,
  sectionLabel,
  outlineIndex,
  revealCycle,
  children,
}: {
  slideId: string;
  sectionLabel: string;
  outlineIndex?: number;
  revealCycle: number;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id={slideId}
      aria-roledescription="slide"
      data-session-label={sectionLabel}
      data-session-section="true"
      data-presentation-slide="true"
      data-session-section-label={sectionLabel}
      {...(outlineIndex !== undefined ? { "data-outline-index": String(outlineIndex) } : {})}
      className="flex h-[100dvh] snap-start snap-always flex-col justify-center overflow-hidden pb-4 pt-28 sm:pt-32"
    >
      <motion.div
        key={`${slideId}-${revealCycle}`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: reducedMotion ? 0 : 0.08,
              staggerChildren: reducedMotion ? 0 : 0.09,
            },
          },
        }}
        className="flex h-full max-h-full w-full flex-col overflow-hidden rounded-[32px] border border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-950/70 px-6 pb-8 pt-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.85)] backdrop-blur sm:px-8 sm:pb-10 sm:pt-10 lg:px-12 lg:pb-12 lg:pt-12"
      >
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: reducedMotion ? 0 : 0.09,
              },
            },
          }}
          className="flex min-h-0 flex-1 flex-col justify-center gap-8 overflow-hidden sm:gap-10"
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
