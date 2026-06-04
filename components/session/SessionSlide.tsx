"use client";

import type { ReactNode } from "react";

import { useSessionPresentation } from "@/components/session/PresentationContext";
import { cn } from "@/lib/utils";

export interface SessionSlideProps {
  /**
   * Outline pill to highlight — must match a label in frontmatter `outline`
   * (e.g. topic="Motivation").
   */
  topic?: string;
  /** 0-based outline index (alternative to `topic`). */
  index?: number;
  children: ReactNode;
}

/**
 * One presenter slide: ## title + one interactive.
 * In presenter mode, SessionSection extracts children and renders full-viewport slides.
 * Use the same `topic` on multiple SessionSlides to keep one outline pill active.
 */
export function SessionSlide({ children }: SessionSlideProps) {
  const { isPresentationMode } = useSessionPresentation();

  if (isPresentationMode) {
    return null;
  }

  return (
    <div
      data-session-slide-marker="slide"
      className={cn("flex flex-col [&>*+h2]:mt-16 sm:[&>*+h2]:mt-24")}
    >
      {children}
    </div>
  );
}

SessionSlide.displayName = "SessionSlide";
