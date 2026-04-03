"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ComparePanel {
  label: string;
  description?: string;
  /** Rich visual content rendered above bullet points (e.g. chat replays, mini diagrams) */
  visual?: ReactNode;
  points?: string[];
  color?: "violet" | "teal" | "amber" | "gray" | "rose" | "blue";
}

export interface ConceptCompareProps {
  left?: ComparePanel;
  right?: ComparePanel;
  mode?: "side-by-side" | "toggle";
  title?: string;
  caption?: string;
}

const accentMap = {
  violet: {
    dot: "bg-violet-500 dark:bg-violet-400",
    glow: "shadow-[0_0_0_2px_rgba(139,92,246,0.35),0_0_20px_rgba(139,92,246,0.18)]",
    border: "border-violet-300 dark:border-violet-500/60",
    tab: "bg-violet-500 text-white dark:bg-violet-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-violet-500 to-violet-400",
    ring: "ring-2 ring-violet-400/50 dark:ring-violet-500/50",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    text: "text-violet-700 dark:text-violet-300",
  },
  teal: {
    dot: "bg-teal-500 dark:bg-teal-400",
    glow: "shadow-[0_0_0_2px_rgba(20,184,166,0.35),0_0_20px_rgba(20,184,166,0.18)]",
    border: "border-teal-300 dark:border-teal-500/60",
    tab: "bg-teal-500 text-white dark:bg-teal-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-teal-500 to-teal-400",
    ring: "ring-2 ring-teal-400/50 dark:ring-teal-500/50",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    text: "text-teal-700 dark:text-teal-300",
  },
  amber: {
    dot: "bg-amber-500 dark:bg-amber-400",
    glow: "shadow-[0_0_0_2px_rgba(245,158,11,0.35),0_0_20px_rgba(245,158,11,0.18)]",
    border: "border-amber-300 dark:border-amber-500/60",
    tab: "bg-amber-500 text-white dark:bg-amber-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    ring: "ring-2 ring-amber-400/50 dark:ring-amber-500/50",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    dot: "bg-rose-500 dark:bg-rose-400",
    glow: "shadow-[0_0_0_2px_rgba(244,63,94,0.35),0_0_20px_rgba(244,63,94,0.18)]",
    border: "border-rose-300 dark:border-rose-500/60",
    tab: "bg-rose-500 text-white dark:bg-rose-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-rose-500 to-rose-400",
    ring: "ring-2 ring-rose-400/50 dark:ring-rose-500/50",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    text: "text-rose-700 dark:text-rose-300",
  },
  blue: {
    dot: "bg-blue-500 dark:bg-blue-400",
    glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.35),0_0_20px_rgba(59,130,246,0.18)]",
    border: "border-blue-300 dark:border-blue-500/60",
    tab: "bg-blue-500 text-white dark:bg-blue-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-blue-500 to-blue-400",
    ring: "ring-2 ring-blue-400/50 dark:ring-blue-500/50",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-300",
  },
  gray: {
    dot: "bg-gray-400 dark:bg-gray-500",
    glow: "shadow-[0_0_0_2px_rgba(148,163,184,0.25)]",
    border: "border-gray-200 dark:border-gray-600",
    tab: "bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-gray-400 to-gray-300",
    ring: "ring-2 ring-gray-300 dark:ring-gray-600",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    text: "text-gray-700 dark:text-gray-300",
  },
} as const;

/** Staggered bullet list that reveals each item with a slide-in animation */
function AnimatedPoints({
  points,
  color,
  isVisible,
}: {
  points: string[];
  color: keyof typeof accentMap;
  isVisible: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const tone = accentMap[color];

  return (
    <ul className="space-y-2.5">
      {points.map((point, i) => (
        <motion.li
          key={point}
          initial={reducedMotion ? false : { opacity: 0, x: -12 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          transition={{
            duration: reducedMotion ? 0 : 0.25,
            delay: isVisible ? i * 0.06 : 0,
            ease: "easeOut",
          }}
          className="flex items-start gap-2.5 text-sm leading-snug text-gray-700 dark:text-gray-200"
        >
          <span
            className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", tone.dot)}
            aria-hidden="true"
          />
          <span>{point}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function PanelCard({
  panel,
  isActive,
  alwaysVisible,
}: {
  panel: ComparePanel;
  isActive: boolean;
  alwaysVisible?: boolean;
}) {
  const tone = accentMap[panel.color ?? "gray"];
  const [pointsVisible, setPointsVisible] = useState(alwaysVisible ?? isActive);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (alwaysVisible) {
      setPointsVisible(true);
      return;
    }
    if (isActive) {
      timerRef.current = setTimeout(() => setPointsVisible(true), 80);
    } else {
      setPointsVisible(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, alwaysVisible]);

  return (
    <div
      className={cn(
        "h-full rounded-2xl border bg-white transition-all duration-300 dark:bg-gray-900/60",
        isActive || alwaysVisible ? cn("border-transparent p-5", tone.glow) : "border-gray-200 p-5 dark:border-gray-700",
      )}
    >
      {/* Accent bar */}
      <div className={cn("mb-4 h-1.5 w-full rounded-full", tone.bar)} />

      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {panel.label}
          </h3>
          {panel.description && (
            <p className="text-sm leading-snug text-gray-500 dark:text-gray-400">
              {panel.description}
            </p>
          )}
        </div>

        {/* Rich visual content area */}
        {panel.visual && (
          <div className="overflow-hidden rounded-xl bg-gray-50 p-3 dark:bg-gray-800/80">
            {panel.visual}
          </div>
        )}

        {/* Bullet points with staggered reveal */}
        {panel.points && panel.points.length > 0 && (
          <AnimatedPoints
            points={panel.points}
            color={panel.color ?? "gray"}
            isVisible={pointsVisible}
          />
        )}
      </div>
    </div>
  );
}

export default function ConceptCompare({
  left = {
    label: "Option A",
    description: "Describe the first concept here.",
    points: ["Trait one", "Trait two", "Trait three"],
    color: "violet",
  },
  right = {
    label: "Option B",
    description: "Describe the second concept here.",
    points: ["Tradeoff one", "Tradeoff two", "Tradeoff three"],
    color: "teal",
  },
  mode = "side-by-side",
  title = "Compare concepts",
  caption = "Toggle between the two sides to compare.",
}: ConceptCompareProps) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const resolvedMode = useMemo(() => (isMobile ? "toggle" : mode), [isMobile, mode]);
  const leftTone = accentMap[left.color ?? "gray"];
  const rightTone = accentMap[right.color ?? "gray"];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>

        {resolvedMode === "side-by-side" ? (
          /* ── Side-by-side layout ── */
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
            <PanelCard panel={left} isActive alwaysVisible />

            {/* VS divider */}
            <div className="hidden items-center justify-center md:flex">
              <div className="relative flex h-full items-center justify-center">
                <div className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  VS
                </div>
              </div>
            </div>

            <PanelCard panel={right} isActive alwaysVisible />
          </div>
        ) : (
          /* ── Toggle layout ── */
          <div className="space-y-4">
            {/* Tab switcher with animated underline */}
            <div className="relative inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
              {/* Sliding pill background */}
              <motion.div
                layout
                layoutId="compare-tab-pill"
                className={cn(
                  "absolute top-1 bottom-1 rounded-full",
                  activeSide === "left" ? leftTone.tab : rightTone.tab,
                )}
                style={{
                  left: activeSide === "left" ? "4px" : "50%",
                  width: "calc(50% - 4px)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />

              <button
                type="button"
                onClick={() => setActiveSide("left")}
                className={cn(
                  "relative z-10 min-w-[120px] rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  activeSide === "left"
                    ? "text-white dark:text-gray-950"
                    : "text-gray-500 dark:text-gray-400",
                )}
                aria-label={`Show ${left.label} panel`}
                aria-pressed={activeSide === "left"}
              >
                {left.label}
              </button>
              <button
                type="button"
                onClick={() => setActiveSide("right")}
                className={cn(
                  "relative z-10 min-w-[120px] rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  activeSide === "right"
                    ? "text-white dark:text-gray-950"
                    : "text-gray-500 dark:text-gray-400",
                )}
                aria-label={`Show ${right.label} panel`}
                aria-pressed={activeSide === "right"}
              >
                {right.label}
              </button>
            </div>

            {/* Panel with slide transition */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSide}
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, x: activeSide === "left" ? -28 : 28 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reducedMotion
                    ? undefined
                    : { opacity: 0, x: activeSide === "left" ? 28 : -28 }
                }
                transition={{ duration: reducedMotion ? 0.1 : 0.28, ease: "easeOut" }}
              >
                <PanelCard
                  panel={activeSide === "left" ? left : right}
                  isActive
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
