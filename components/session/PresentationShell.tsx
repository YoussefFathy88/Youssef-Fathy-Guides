"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";

import { PresentationProvider } from "@/components/session/PresentationContext";
import { GridBackground } from "@/components/ui/grid-background";
import { cn } from "@/lib/utils";

type PresentationShellProps = {
  slug: string;
  module: number;
  moduleName: string;
  children: ReactNode;
  outline?: string[];
  outlineSectionMap?: Record<string, number>;
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
  module,
  moduleName,
  children,
  outline,
  outlineSectionMap,
}: PresentationShellProps) {
  const reducedMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [slides, setSlides] = useState<{ id: string; sectionLabel: string }[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) {
      return undefined;
    }

    const refreshSlides = () => {
      const nodes = [...root.querySelectorAll<HTMLElement>("[data-presentation-slide]")].filter(
        (el) => Boolean(el.id),
      );
      const next = nodes.map((el) => ({
        id: el.id,
        sectionLabel: el.dataset.sessionSectionLabel ?? "",
      }));
      setSlides((prev) => {
        if (
          prev.length === next.length &&
          prev.every(
            (slide, index) =>
              slide.id === next[index]?.id && slide.sectionLabel === next[index]?.sectionLabel,
          )
        ) {
          return prev;
        }
        return next;
      });
    };

    refreshSlides();

    const article = root.querySelector("article");
    const observeRoot = article ?? root;
    const mo = new MutationObserver(() => {
      refreshSlides();
    });
    mo.observe(observeRoot, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, [slug]);

  useEffect(() => {
    if (slides.length === 0) {
      return;
    }

    setActiveSectionId((prev) =>
      prev && slides.some((slide) => slide.id === prev) ? prev : slides[0].id,
    );
  }, [slides]);

  const slideMatchIndex =
    activeSectionId === null ? -1 : slides.findIndex((slide) => slide.id === activeSectionId);
  const currentIndex =
    slides.length === 0 ? 0 : slideMatchIndex >= 0 ? slideMatchIndex : 0;

  const activeSectionLabel =
    slides[currentIndex]?.sectionLabel ?? slides[0]?.sectionLabel ?? "Session";

  const activeOutlineIndex =
    outlineSectionMap && activeSectionId
      ? (outlineSectionMap[activeSectionId] ?? -1)
      : -1;

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
    if (!root || slides.length === 0) {
      return undefined;
    }

    const observedSlides = slides
      .map((slide) => root.querySelector<HTMLElement>(`#${CSS.escape(slide.id)}`))
      .filter((element): element is HTMLElement => element !== null);

    if (observedSlides.length === 0) {
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

    observedSlides.forEach((slideEl) => observer.observe(slideEl));
    return () => observer.disconnect();
  }, [slides]);

  const scrollToSlideId = useCallback(
    (slideId: string) => {
      setActiveSectionId(slideId);
      scrollerRef.current
        ?.querySelector<HTMLElement>(`#${CSS.escape(slideId)}`)
        ?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
    },
    [reducedMotion],
  );

  const goToRelativeSlide = (offset: number) => {
    const nextIndex = currentIndex + offset;
    if (nextIndex < 0 || nextIndex >= slides.length) {
      return;
    }

    scrollToSlideId(slides[nextIndex].id);
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
        if (slides[0]) {
          scrollToSlideId(slides[0].id);
        }
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        const last = slides[slides.length - 1];
        if (last) {
          scrollToSlideId(last.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, slides, reducedMotion, scrollToSlideId]);

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
            {/* Left: module badge + outline tracker (or section label fallback) */}
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-violet-200/75">
                <span className="rounded-full border border-violet-400/20 bg-violet-500/12 px-3 py-1 font-semibold text-violet-200">
                  Module {module}
                </span>
                <span>{moduleName}</span>
              </div>

              {outline && outline.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {outline.map((label, index) => {
                    const isActive = index === activeOutlineIndex;
                    const isPast = activeOutlineIndex >= 0 && index < activeOutlineIndex;
                    return (
                      <div
                        key={label}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300",
                          isActive
                            ? "bg-violet-600 text-white ring-1 ring-violet-400/50"
                            : isPast
                              ? "bg-teal-900/40 text-teal-300/60 ring-1 ring-teal-700/30"
                              : "bg-gray-800/60 text-gray-500 ring-1 ring-gray-700/30",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                            isActive
                              ? "bg-white/20 text-white"
                              : isPast
                                ? "bg-teal-700/40 text-teal-300/60"
                                : "bg-gray-700/50 text-gray-500",
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="hidden sm:inline">{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center text-xs uppercase tracking-[0.2em] text-gray-400">
                  {activeSectionLabel}
                </div>
              )}
            </div>

            {/* Right: slide counter + nav */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full border border-gray-700 bg-gray-950/70 px-3 py-2 text-gray-300">
                {slides.length === 0 ? "—" : `${currentIndex + 1} / ${slides.length}`}
              </span>
              <button
                type="button"
                onClick={() => goToRelativeSlide(-1)}
                disabled={currentIndex === 0 || slides.length === 0}
                className={cn(
                  "rounded-full border border-gray-700 bg-gray-950/70 px-3 py-2 text-gray-200 transition hover:border-violet-400 hover:text-white",
                  (currentIndex === 0 || slides.length === 0) &&
                    "cursor-not-allowed opacity-40 hover:border-gray-700 hover:text-gray-200",
                )}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => goToRelativeSlide(1)}
                disabled={currentIndex >= slides.length - 1 || slides.length === 0}
                className={cn(
                  "rounded-full border border-gray-700 bg-gray-950/70 px-3 py-2 text-gray-200 transition hover:border-violet-400 hover:text-white",
                  (currentIndex >= slides.length - 1 || slides.length === 0) &&
                    "cursor-not-allowed opacity-40 hover:border-gray-700 hover:text-gray-200",
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
        </div>

        <div
          ref={scrollerRef}
          className="relative z-10 h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain px-4 sm:px-6 lg:px-8"
          style={{ scrollBehavior: reducedMotion ? "auto" : "smooth" }}
        >
          <article className="mx-auto max-w-[1496px] w-full">
            {children}
          </article>
        </div>
      </div>
    </PresentationProvider>
  );
}
