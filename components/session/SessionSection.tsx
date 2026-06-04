"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { useSessionPresentation } from "@/components/session/PresentationContext";
import { useOutlineTopics } from "@/components/session/OutlineTopicsContext";
import { PresentationSlideFrame } from "@/components/session/presentation-slide-frame";
import {
  buildPresentationSlides,
  collectExplicitSlides,
} from "@/lib/session-presentation-slides";
import { cn } from "@/lib/utils";

export type { CollectedSessionSlide, PresentationSlideChunk } from "@/lib/session-presentation-slides";

export interface SessionSectionProps {
  id: string;
  label: string;
  children: ReactNode;
}

export function SessionSection({ id, label, children }: SessionSectionProps) {
  const reducedMotion = useReducedMotion();
  const outlineTopics = useOutlineTopics();
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

  const presentationSlides = useMemo(() => {
    if (!isPresentationMode) {
      return [];
    }

    const explicit = collectExplicitSlides(children, outlineTopics);
    if (explicit.length > 0) {
      return explicit.map((slide) => ({
        nodes: Array.isArray(slide.nodes)
          ? slide.nodes.filter(Boolean)
          : [slide.nodes].filter(Boolean),
        outlineIndex: slide.outlineIndex,
      }));
    }

    return buildPresentationSlides(children, outlineTopics);
  }, [children, isPresentationMode, outlineTopics]);

  if (isPresentationMode) {
    return (
      <>
        {presentationSlides.map((slide, slideIndex) => {
          const slideId = slideIndex === 0 ? id : `${id}__${slideIndex}`;
          const nodes = Array.isArray(slide.nodes) ? slide.nodes : [slide.nodes];

          return (
            <PresentationSlideFrame
              key={`${id}-slide-${slideIndex}`}
              slideId={slideId}
              sectionLabel={label}
              outlineIndex={slide.outlineIndex}
              revealCycle={revealCycle}
            >
              {nodes.map((child, index) => (
                <motion.div
                  key={`${slideId}-${revealCycle}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: reducedMotion ? 0 : 18 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: reducedMotion ? 0.18 : 0.4, ease: "easeOut" }}
                  className="min-h-0 shrink"
                >
                  {child}
                </motion.div>
              ))}
            </PresentationSlideFrame>
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
      <div className="flex flex-col gap-16 sm:gap-24 [&_[data-session-slide-marker=slide]]:scroll-mt-28">
        {children}
      </div>
    </motion.section>
  );
}
