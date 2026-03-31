"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";

import { PresentationProvider } from "@/components/session/PresentationContext";
import { GridBackground } from "@/components/ui/grid-background";
import { cn } from "@/lib/utils";

type PresentationSection = {
  id: string;
  label: string;
};

type PresentationShellProps = {
  slug: string;
  title: string;
  module: number;
  moduleName: string;
  sections: PresentationSection[];
  children: ReactNode;
};

const INTERACTIVE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "option",
  "button",
  "a[href]",
  "summary",
  "[role='button']",
  "[contenteditable='true']",
].join(", ");

function isIgnoredKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.closest("[data-local-navigation='true']") !== null ||
    target.closest(INTERACTIVE_SELECTOR) !== null
  );
}

export function PresentationShell({
  slug,
  title,
  module,
  moduleName,
  sections,
  children,
}: PresentationShellProps) {
  const reducedMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sections[0]?.id ?? null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIndex = useMemo(() => {
    if (!activeSectionId) {
      return 0;
    }

    const matchIndex = sections.findIndex((section) => section.id === activeSectionId);
    return matchIndex >= 0 ? matchIndex : 0;
  }, [activeSectionId, sections]);

  const activeSectionLabel = sections[currentIndex]?.label ?? sections[0]?.label ?? "Goal";

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();

    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) {
      return undefined;
    }

    const observedSections = sections
      .map((section) => root.querySelector<HTMLElement>(`#${section.id}`))
      .filter((element): element is HTMLElement => element !== null);

    if (observedSections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries[0]?.target.id) {
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        root,
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-8% 0px -20% 0px",
      },
    );

    observedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    scrollerRef.current
      ?.querySelector<HTMLElement>(`#${sectionId}`)
      ?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
  };

  const goToRelativeSlide = (offset: number) => {
    const nextIndex = currentIndex + offset;
    if (nextIndex < 0 || nextIndex >= sections.length) {
      return;
    }

    scrollToSection(sections[nextIndex].id);
  };

  const toggleFullscreen = async () => {
    if (!shellRef.current) {
      return;
    }

    if (document.fullscreenElement === shellRef.current) {
      await document.exitFullscreen();
      return;
    }

    await shellRef.current.requestFullscreen();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isIgnoredKeyboardTarget(event.target)) {
        return;
      }

      if (event.key === "Escape") {
        if (document.fullscreenElement === shellRef.current) {
          event.preventDefault();
          void document.exitFullscreen();
        }
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageDown" || (event.code === "Space" && !event.shiftKey)) {
        event.preventDefault();
        goToRelativeSlide(1);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp" || (event.code === "Space" && event.shiftKey)) {
        event.preventDefault();
        goToRelativeSlide(-1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        scrollToSection(sections[0]?.id ?? "goal");
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        scrollToSection(sections[sections.length - 1]?.id ?? "next-session");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, reducedMotion, sections]);

  return (
    <PresentationProvider
      value={{
        isPresentationMode: true,
        activeSectionId,
      }}
    >
      <div
        ref={shellRef}
        className="relative h-[100dvh] overflow-hidden bg-[#060914] text-gray-50"
      >
        <GridBackground className="opacity-70" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-[#060914] via-[#060914]/92 to-transparent">
          <div className="pointer-events-auto mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-violet-200/75">
                <span className="rounded-full border border-violet-400/20 bg-violet-500/12 px-3 py-1 font-semibold text-violet-200">
                  Module {module}
                </span>
                <span>{moduleName}</span>
                <span className="text-gray-400">{activeSectionLabel}</span>
              </div>
              <h1 className="text-balance text-xl font-semibold text-white sm:text-2xl">
                {title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full border border-gray-700 bg-gray-950/70 px-3 py-2 text-gray-300">
                {currentIndex + 1} / {sections.length}
              </span>
              <button
                type="button"
                onClick={() => goToRelativeSlide(-1)}
                disabled={currentIndex === 0}
                className={cn(
                  "rounded-full border border-gray-700 bg-gray-950/70 px-3 py-2 text-gray-200 transition hover:border-violet-400 hover:text-white",
                  currentIndex === 0 && "cursor-not-allowed opacity-40 hover:border-gray-700 hover:text-gray-200",
                )}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => goToRelativeSlide(1)}
                disabled={currentIndex === sections.length - 1}
                className={cn(
                  "rounded-full border border-gray-700 bg-gray-950/70 px-3 py-2 text-gray-200 transition hover:border-violet-400 hover:text-white",
                  currentIndex === sections.length - 1 && "cursor-not-allowed opacity-40 hover:border-gray-700 hover:text-gray-200",
                )}
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="rounded-full border border-gray-700 bg-gray-950/70 px-3 py-2 text-gray-200 transition hover:border-violet-400 hover:text-white"
              >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
              <Link
                href={`/sessions/${slug}`}
                className="rounded-full border border-violet-400/25 bg-violet-500/12 px-3 py-2 text-violet-100 transition hover:bg-violet-500/20"
              >
                Exit Presenter
              </Link>
            </div>
          </div>

          <div className="pointer-events-none mx-auto max-w-[1600px] px-4 pb-4 text-xs text-gray-400 sm:px-6 lg:px-8">
            Use Left/Right, Page Up/Down, or Space to navigate slides. Press Esc to exit fullscreen.
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="relative z-10 h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:px-8"
          style={{ scrollBehavior: reducedMotion ? "auto" : "smooth" }}
        >
          <article className="mx-auto max-w-6xl">
            {children}
          </article>
        </div>
      </div>
    </PresentationProvider>
  );
}
