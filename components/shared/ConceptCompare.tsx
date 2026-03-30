"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ComparePanel {
  label: string;
  description?: string;
  visual?: ReactNode;
  points?: string[];
  color?: "violet" | "teal" | "amber" | "gray";
}

export interface ConceptCompareProps {
  left?: ComparePanel;
  right?: ComparePanel;
  mode?: "side-by-side" | "toggle";
  title?: string;
  caption?: string;
}

const defaultLeft: ComparePanel = {
  label: "Option A",
  description: "Describe the first concept here.",
  points: ["Trait one", "Trait two", "Trait three"],
  color: "violet",
};

const defaultRight: ComparePanel = {
  label: "Option B",
  description: "Describe the second concept here.",
  points: ["Tradeoff one", "Tradeoff two", "Tradeoff three"],
  color: "teal",
};

const accentMap = {
  violet: "bg-violet-500 dark:bg-violet-400",
  teal: "bg-teal-500 dark:bg-teal-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  gray: "bg-gray-400 dark:bg-gray-500",
} as const;

function PanelCard({ panel }: { panel: ComparePanel }) {
  const accent = accentMap[panel.color ?? "gray"];

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900/60">
      <div className={cn("mb-4 h-1.5 rounded-full", accent)} />
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{panel.label}</h3>
          {panel.description ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{panel.description}</p>
          ) : null}
        </div>
        {panel.visual ? <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">{panel.visual}</div> : null}
        {panel.points?.length ? (
          <ul className="space-y-2">
            {panel.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <span className={cn("mt-1.5 h-2 w-2 rounded-full", accent)} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default function ConceptCompare({
  left = defaultLeft,
  right = defaultRight,
  mode = "side-by-side",
  title = "Compare concepts",
  caption = "Use toggle mode on smaller screens for clearer focus.",
}: ConceptCompareProps) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const resolvedMode = useMemo(() => (isMobile ? "toggle" : mode), [isMobile, mode]);
  const visiblePanel = activeSide === "left" ? left : right;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        {resolvedMode === "side-by-side" ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
            <PanelCard panel={left} />
            <div className="hidden items-center justify-center md:flex">
              <div className="relative flex h-full items-center justify-center">
                <div className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  VS
                </div>
              </div>
            </div>
            <PanelCard panel={right} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setActiveSide("left")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  activeSide === "left"
                    ? "bg-violet-500 text-white dark:bg-violet-400 dark:text-gray-950"
                    : "text-gray-500 dark:text-gray-400",
                )}
                aria-label={`Show ${left.label} panel`}
              >
                {left.label}
              </button>
              <button
                type="button"
                onClick={() => setActiveSide("right")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  activeSide === "right"
                    ? "bg-teal-500 text-white dark:bg-teal-400 dark:text-gray-950"
                    : "text-gray-500 dark:text-gray-400",
                )}
                aria-label={`Show ${right.label} panel`}
              >
                {right.label}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSide}
                initial={reducedMotion ? false : { opacity: 0, x: activeSide === "left" ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: activeSide === "left" ? 24 : -24 }}
                transition={{ duration: reducedMotion ? 0.2 : 0.3, ease: "easeOut" }}
              >
                <PanelCard panel={visiblePanel} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
