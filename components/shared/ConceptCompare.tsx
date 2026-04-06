"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type AccentColor = "violet" | "teal" | "amber" | "gray" | "rose" | "blue";

export interface ComparePanel {
  label: string;
  description?: string;
  /** Rich visual content rendered above bullet points (e.g. chat replays, mini diagrams) */
  visual?: ReactNode;
  points?: string[];
  color?: AccentColor;
}

export interface CompareRow {
  id: string;
  leftTitle: string;
  leftBody: string;
  leftDetail?: string;
  rightTitle: string;
  rightBody: string;
  rightDetail?: string;
}

export interface ConceptCompareProps {
  left?: ComparePanel;
  right?: ComparePanel;
  mode?: "side-by-side" | "toggle";
  layout?: "side-by-side" | "toggle";
  title?: string;
  caption?: string;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: AccentColor;
  rightColor?: AccentColor;
  rows?: CompareRow[];
}

const accentMap = {
  violet: {
    dot: "bg-violet-500 dark:bg-violet-400",
    glow: "shadow-[0_0_0_2px_rgba(139,92,246,0.35),0_0_20px_rgba(139,92,246,0.18)]",
    tab: "bg-violet-500 text-white dark:bg-violet-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-violet-500 to-violet-400",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    text: "text-violet-700 dark:text-violet-300",
  },
  teal: {
    dot: "bg-teal-500 dark:bg-teal-400",
    glow: "shadow-[0_0_0_2px_rgba(20,184,166,0.35),0_0_20px_rgba(20,184,166,0.18)]",
    tab: "bg-teal-500 text-white dark:bg-teal-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-teal-500 to-teal-400",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    text: "text-teal-700 dark:text-teal-300",
  },
  amber: {
    dot: "bg-amber-500 dark:bg-amber-400",
    glow: "shadow-[0_0_0_2px_rgba(245,158,11,0.35),0_0_20px_rgba(245,158,11,0.18)]",
    tab: "bg-amber-500 text-white dark:bg-amber-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    dot: "bg-rose-500 dark:bg-rose-400",
    glow: "shadow-[0_0_0_2px_rgba(244,63,94,0.35),0_0_20px_rgba(244,63,94,0.18)]",
    tab: "bg-rose-500 text-white dark:bg-rose-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-rose-500 to-rose-400",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    text: "text-rose-700 dark:text-rose-300",
  },
  blue: {
    dot: "bg-blue-500 dark:bg-blue-400",
    glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.35),0_0_20px_rgba(59,130,246,0.18)]",
    tab: "bg-blue-500 text-white dark:bg-blue-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-blue-500 to-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-300",
  },
  gray: {
    dot: "bg-gray-400 dark:bg-gray-500",
    glow: "shadow-[0_0_0_2px_rgba(148,163,184,0.25)]",
    tab: "bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-950",
    bar: "bg-gradient-to-r from-gray-400 to-gray-300",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    text: "text-gray-700 dark:text-gray-300",
  },
} as const;

function AnimatedPoints({
  points,
  color,
  isVisible,
}: {
  points: string[];
  color: AccentColor;
  isVisible: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const tone = accentMap[color];

  return (
    <ul className="space-y-2.5">
      {points.map((point, index) => (
        <motion.li
          key={point}
          initial={reducedMotion ? false : { opacity: 0, x: -12 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          transition={{
            duration: reducedMotion ? 0 : 0.25,
            delay: isVisible ? index * 0.06 : 0,
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
        "h-full rounded-2xl border bg-white p-5 transition-all duration-300 dark:bg-gray-900/60",
        isActive || alwaysVisible
          ? cn("border-transparent", tone.glow)
          : "border-gray-200 dark:border-gray-700",
      )}
    >
      <div className={cn("mb-4 h-1.5 w-full rounded-full", tone.bar)} />

      <div className="space-y-4">
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

        {panel.visual && (
          <div className="overflow-hidden rounded-xl bg-gray-50 p-3 dark:bg-gray-800/80">
            {panel.visual}
          </div>
        )}

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

function StagePanelCard({
  label,
  title,
  body,
  detail,
  color,
}: {
  label: string;
  title: string;
  body: string;
  detail?: string;
  color: AccentColor;
}) {
  const reducedMotion = useReducedMotion();
  const tone = accentMap[color];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.24, ease: "easeOut" }}
      className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900/60"
    >
      <div className={cn("mb-4 h-1.5 w-full rounded-full", tone.bar)} />

      <div className="space-y-4">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
            tone.badge,
          )}
        >
          {label}
        </span>

        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">{body}</p>
        </div>

        {detail && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0.1 : 0.24,
              delay: reducedMotion ? 0 : 0.06,
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300"
          >
            <p className="whitespace-pre-wrap break-words">{detail}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function SideToggle({
  activeSide,
  onChange,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
}: {
  activeSide: "left" | "right";
  onChange: (side: "left" | "right") => void;
  leftLabel: string;
  rightLabel: string;
  leftColor: AccentColor;
  rightColor: AccentColor;
}) {
  const pillLayoutId = useId().replace(/:/g, "");

  return (
    <div className="relative flex w-full max-w-full rounded-full border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
      <motion.div
        layout
        layoutId={`concept-compare-pill-${pillLayoutId}`}
        className={cn(
          "pointer-events-none absolute inset-y-1 rounded-full",
          activeSide === "left" ? accentMap[leftColor].tab : accentMap[rightColor].tab,
        )}
        style={{
          left: activeSide === "left" ? "0.25rem" : "50%",
          width: "calc(50% - 0.25rem)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      <button
        type="button"
        onClick={() => onChange("left")}
        className={cn(
          "relative z-10 min-h-[2.75rem] min-w-0 flex-1 basis-0 rounded-full px-3 py-2 text-center text-sm font-medium leading-snug transition-colors duration-200",
          activeSide === "left"
            ? "text-white dark:text-gray-950"
            : "text-gray-500 dark:text-gray-400",
        )}
        aria-label={`Show ${leftLabel} panel`}
        aria-pressed={activeSide === "left"}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("right")}
        className={cn(
          "relative z-10 min-h-[2.75rem] min-w-0 flex-1 basis-0 rounded-full px-3 py-2 text-center text-sm font-medium leading-snug transition-colors duration-200",
          activeSide === "right"
            ? "text-white dark:text-gray-950"
            : "text-gray-500 dark:text-gray-400",
        )}
        aria-label={`Show ${rightLabel} panel`}
        aria-pressed={activeSide === "right"}
      >
        {rightLabel}
      </button>
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
  layout,
  title = "Compare concepts",
  caption = "Toggle between the two sides to compare.",
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
  rows,
}: ConceptCompareProps) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");
  const [activeRowId, setActiveRowId] = useState<string | null>(rows?.[0]?.id ?? null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  useEffect(() => {
    if (!rows?.length) {
      setActiveRowId(null);
      return;
    }

    setActiveRowId((current) =>
      current && rows.some((row) => row.id === current) ? current : rows[0].id,
    );
  }, [rows]);

  const resolvedMode = useMemo(
    () => (isMobile ? "toggle" : layout ?? mode),
    [isMobile, layout, mode],
  );
  const leftTone = accentMap[left.color ?? "gray"];
  const rightTone = accentMap[right.color ?? "gray"];
  const rowLeftLabel = leftLabel ?? left.label;
  const rowRightLabel = rightLabel ?? right.label;
  const rowLeftColor = leftColor ?? left.color ?? "violet";
  const rowRightColor = rightColor ?? right.color ?? "teal";

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

        {rows && rows.length > 0 ? (
          <div className="space-y-3">
            {rows.map((row, index) => {
              const isOpen = activeRowId === row.id;

              return (
                <div
                  key={row.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white dark:bg-gray-900/60",
                    isOpen
                      ? "border-gray-300 shadow-sm dark:border-gray-600"
                      : "border-gray-200 dark:border-gray-700",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveRowId(row.id)}
                    aria-expanded={isOpen}
                    className="w-full px-4 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 md:px-5"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                          isOpen
                            ? accentMap[rowLeftColor].badge
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
                        )}
                      >
                        {index + 1}
                      </span>

                      <div className="grid flex-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <p
                            className={cn(
                              "text-[11px] font-semibold uppercase tracking-[0.14em]",
                              accentMap[rowLeftColor].text,
                            )}
                          >
                            {rowLeftLabel}
                          </p>
                          <p className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                            {row.leftTitle}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p
                            className={cn(
                              "text-[11px] font-semibold uppercase tracking-[0.14em]",
                              accentMap[rowRightColor].text,
                            )}
                          >
                            {rowRightLabel}
                          </p>
                          <p className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                            {row.rightTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: reducedMotion ? 0.1 : 0.24, ease: "easeOut" }}
                        className="overflow-hidden px-4 pb-4 md:px-5 md:pb-5"
                      >
                        {resolvedMode === "side-by-side" ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <StagePanelCard
                              label={rowLeftLabel}
                              title={row.leftTitle}
                              body={row.leftBody}
                              detail={row.leftDetail}
                              color={rowLeftColor}
                            />
                            <StagePanelCard
                              label={rowRightLabel}
                              title={row.rightTitle}
                              body={row.rightBody}
                              detail={row.rightDetail}
                              color={rowRightColor}
                            />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <SideToggle
                              activeSide={activeSide}
                              onChange={setActiveSide}
                              leftLabel={rowLeftLabel}
                              rightLabel={rowRightLabel}
                              leftColor={rowLeftColor}
                              rightColor={rowRightColor}
                            />

                            <AnimatePresence mode="wait" initial={false}>
                              <motion.div
                                key={`${row.id}-${activeSide}`}
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
                                transition={{
                                  duration: reducedMotion ? 0.1 : 0.28,
                                  ease: "easeOut",
                                }}
                              >
                                <StagePanelCard
                                  label={activeSide === "left" ? rowLeftLabel : rowRightLabel}
                                  title={activeSide === "left" ? row.leftTitle : row.rightTitle}
                                  body={activeSide === "left" ? row.leftBody : row.rightBody}
                                  detail={
                                    activeSide === "left" ? row.leftDetail : row.rightDetail
                                  }
                                  color={activeSide === "left" ? rowLeftColor : rowRightColor}
                                />
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : resolvedMode === "side-by-side" ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
            <PanelCard panel={left} isActive alwaysVisible />

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
          <div className="space-y-4">
            <SideToggle
              activeSide={activeSide}
              onChange={setActiveSide}
              leftLabel={left.label}
              rightLabel={right.label}
              leftColor={left.color ?? "gray"}
              rightColor={right.color ?? "gray"}
            />

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
                <PanelCard panel={activeSide === "left" ? left : right} isActive />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
