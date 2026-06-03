"use client";

import { Children, isValidElement, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { useSessionPresentation } from "@/components/session/PresentationContext";
import { cn } from "@/lib/utils";

function isH2SlideMarker(child: ReactNode): boolean {
  if (!isValidElement(child)) {
    return false;
  }

  const marker = (child.props as { "data-session-slide-marker"?: string } | null)?.[
    "data-session-slide-marker"
  ];
  return marker === "h2";
}

function chunkPresentationChildren(children: ReactNode): ReactNode[][] {
  const items = Children.toArray(children).filter(Boolean);

  if (items.length === 0) {
    return [[]];
  }

  const chunks: ReactNode[][] = [];
  let current: ReactNode[] = [];

  for (const child of items) {
    if (isH2SlideMarker(child)) {
      if (current.length > 0) {
        chunks.push(current);
      }
      current = [child];
    } else {
      current.push(child);
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [items];
}

export interface SessionSectionProps {
  id: string;
  label: string;
  children: ReactNode;
}

export function SessionSection({ id, label, children }: SessionSectionProps) {
  const reducedMotion = useReducedMotion();
  const { isPresentationMode, activeSectionId } = useSessionPresentation();
  const isAnySlideInSectionActive =
    isPresentationMode &&
    (activeSectionId === id ||
      (activeSectionId != null && activeSectionId.startsWith(`${id}__`)));
  const [revealCycle, setRevealCycle] = useState(0);

  useEffect(() => {
    if (isPresentationMode && isAnySlideInSectionActive) {
      setRevealCycle((current) => current + 1);
    }
  }, [isAnySlideInSectionActive, isPresentationMode]);

  const presentationChunks = useMemo(
    () => (isPresentationMode ? chunkPresentationChildren(children) : []),
    [children, isPresentationMode],
  );

  if (isPresentationMode) {
    return (
      <>
        {presentationChunks.map((chunk, slideIndex) => {
          const slideId = slideIndex === 0 ? id : `${id}__${slideIndex}`;

          return (
            <section
              key={`${id}-slide-${slideIndex}`}
              id={slideId}
              aria-roledescription="slide"
              data-session-label={label}
              data-session-section="true"
              data-presentation-slide="true"
              data-session-section-label={label}
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
                className="flex max-h-full w-full flex-col overflow-hidden rounded-[32px] border border-gray-800/80 bg-gray-950/70 px-6 pb-8 pt-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.85)] backdrop-blur sm:px-8 sm:pb-10 sm:pt-10 lg:px-12 lg:pb-12 lg:pt-12"
              >
                <div className="mb-8 flex items-center gap-3 border-b border-gray-800/70 pb-6 text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/75 sm:mb-10 sm:pb-8">
                  <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                  {label}
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto sm:gap-12">
                  {chunk.map((child, index) => (
                    <motion.div
                      key={`${slideId}-${revealCycle}-${index}`}
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
        })}
      </>
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
      {/* Slide-style MDX stacks ## then diagram repeatedly; add air before each ## after the first block */}
      <div className="flex flex-col [&>*+h2]:mt-16 sm:[&>*+h2]:mt-24">
        {children}
      </div>
    </motion.section>
  );
}
