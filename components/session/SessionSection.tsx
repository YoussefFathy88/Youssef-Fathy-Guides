"use client";

import { Children, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { useSessionPresentation } from "@/components/session/PresentationContext";
import { cn } from "@/lib/utils";

export interface SessionSectionProps {
  id: string;
  label: string;
  children: ReactNode;
}

export function SessionSection({ id, label, children }: SessionSectionProps) {
  const reducedMotion = useReducedMotion();
  const { isPresentationMode, activeSectionId } = useSessionPresentation();
  const isActiveSlide = isPresentationMode && activeSectionId === id;
  const [revealCycle, setRevealCycle] = useState(0);

  useEffect(() => {
    if (isPresentationMode && isActiveSlide) {
      setRevealCycle((current) => current + 1);
    }
  }, [isActiveSlide, isPresentationMode]);

  if (isPresentationMode) {
    const childItems = Children.toArray(children);

    return (
      <section
        id={id}
        aria-roledescription="slide"
        data-session-label={label}
        data-session-section="true"
        className="flex min-h-[calc(100dvh-8rem)] snap-start snap-always items-center py-6"
      >
        <motion.div
          key={`${id}-${revealCycle}`}
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
          className="w-full overflow-y-auto rounded-[32px] border border-gray-800/80 bg-gray-950/70 px-6 py-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.85)] backdrop-blur sm:px-8 sm:py-10 lg:px-12 lg:py-12"
          style={{ maxHeight: "calc(100dvh - 9rem)" }}
        >
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/75">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-violet-400" />
            {label}
          </div>

          <div className="space-y-6">
            {childItems.map((child, index) => (
              <motion.div
                key={`${id}-${revealCycle}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: reducedMotion ? 0 : 18 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: reducedMotion ? 0.18 : 0.4, ease: "easeOut" }}
              >
                {child}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      data-session-label={label}
      data-session-section="true"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -18% 0px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "scroll-mt-28 border-t border-gray-100 pt-12 dark:border-gray-800 lg:scroll-mt-24",
        "[&:first-of-type]:border-transparent [&:first-of-type]:pt-0 [&:last-of-type]:pt-8",
      )}
    >
      {children}
    </motion.section>
  );
}
