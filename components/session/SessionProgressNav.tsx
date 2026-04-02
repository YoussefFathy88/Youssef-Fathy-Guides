"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface SessionProgressNavProps {
  sections: { id: string; label: string }[];
  activeSection: string;
}

export function SessionProgressNav({
  sections,
  activeSection,
}: SessionProgressNavProps) {
  const reducedMotion = useReducedMotion();
  const [currentSection, setCurrentSection] = useState(activeSection);

  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);

  useEffect(() => {
    setCurrentSection(activeSection);
  }, [activeSection]);

  useEffect(() => {
    const observedSections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (observedSections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        if (visibleEntries[0]?.target.id) {
          setCurrentSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.2, 0.45, 0.75],
      },
    );

    observedSections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  return (
    <nav
      aria-label="Session progress"
      className="sticky top-20 z-20 mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white/90 p-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/75 lg:top-24"
    >
      <ul className="flex min-w-max items-center gap-2">
        {sections.map((section) => {
          const isActive = section.id === currentSection;

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => {
                  setCurrentSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({
                    behavior: reducedMotion ? "auto" : "smooth",
                    block: "start",
                  });
                }}
                className={cn(
                  "whitespace-nowrap rounded-xl px-4 py-2.5 text-[0.96rem] font-medium transition-colors",
                  isActive
                    ? "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                )}
              >
                {section.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
