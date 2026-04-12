"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface SequenceStep {
  number: number;
  phase: string;
  title: string;
  detail: string;
  icon?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
}

/** Serializable narrative steps (e.g. embeddings inside vs outside). No JSX in props. */
export interface NarrativeSequenceStep {
  id: string;
  label: string;
  description: string;
  highlight?: "shared" | "inside" | "outside" | "contrast";
  detail: string;
  /** Shown below animated detail after all floats finish revealing (only when `animateDetail` is true). */
  detailNote?: string;
  /**
   * When true, expanding the step reveals float literals in `detail` left-to-right (60ms apart);
   * unrevealed floats show as "···". Defaults to false when omitted.
   */
  animateDetail?: boolean;
}

export interface StepSequenceProps {
  steps?: SequenceStep[] | NarrativeSequenceStep[];
  title?: string;
  caption?: string;
  orientation?: "horizontal" | "vertical";
  /** When true, narrative steps auto-advance on a timer. Phased steps (`SequenceStep`) ignore this. */
  autoPlay?: boolean;
}

function isNarrativeSequenceSteps(
  steps: (SequenceStep | NarrativeSequenceStep)[],
): steps is NarrativeSequenceStep[] {
  const first = steps[0];
  return (
    steps.length > 0 &&
    typeof first === "object" &&
    first !== null &&
    "description" in first &&
    "label" in first &&
    !("number" in first)
  );
}

const colorMap = {
  violet: {
    bg: "bg-violet-500",
    light: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-300 dark:border-violet-500/50",
    text: "text-violet-700 dark:text-violet-300",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    arrow: "#8b5cf6",
    ring: "ring-violet-400 dark:ring-violet-500",
    glow: "shadow-[0_0_0_2px_rgba(139,92,246,0.25),0_4px_24px_rgba(139,92,246,0.18)]",
    line: "bg-violet-400",
  },
  teal: {
    bg: "bg-teal-500",
    light: "bg-teal-50 dark:bg-teal-500/10",
    border: "border-teal-300 dark:border-teal-500/50",
    text: "text-teal-700 dark:text-teal-300",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    arrow: "#14b8a6",
    ring: "ring-teal-400 dark:ring-teal-500",
    glow: "shadow-[0_0_0_2px_rgba(20,184,166,0.25),0_4px_24px_rgba(20,184,166,0.18)]",
    line: "bg-teal-400",
  },
  amber: {
    bg: "bg-amber-500",
    light: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-300 dark:border-amber-500/50",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    arrow: "#f59e0b",
    ring: "ring-amber-400 dark:ring-amber-500",
    glow: "shadow-[0_0_0_2px_rgba(245,158,11,0.25),0_4px_24px_rgba(245,158,11,0.18)]",
    line: "bg-amber-400",
  },
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-300 dark:border-blue-500/50",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    arrow: "#3b82f6",
    ring: "ring-blue-400 dark:ring-blue-500",
    glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.25),0_4px_24px_rgba(59,130,246,0.18)]",
    line: "bg-blue-400",
  },
  rose: {
    bg: "bg-rose-500",
    light: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-300 dark:border-rose-500/50",
    text: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    arrow: "#f43f5e",
    ring: "ring-rose-400 dark:ring-rose-500",
    glow: "shadow-[0_0_0_2px_rgba(244,63,94,0.25),0_4px_24px_rgba(244,63,94,0.18)]",
    line: "bg-rose-400",
  },
  gray: {
    bg: "bg-gray-400",
    light: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    arrow: "#94a3b8",
    ring: "ring-gray-300 dark:ring-gray-600",
    glow: "shadow-[0_0_0_2px_rgba(148,163,184,0.2)]",
    line: "bg-gray-300",
  },
} as const;

const highlightToColor: Record<
  NonNullable<NarrativeSequenceStep["highlight"]>,
  keyof typeof colorMap
> = {
  shared: "blue",
  inside: "violet",
  outside: "teal",
  contrast: "amber",
};

/** Matches float literals in narrative `detail` strings for `animateDetail` reveal. */
const DETAIL_FLOAT_PATTERN = /-?[0-9]+\.[0-9]+/g;

type NarrativeDetailSegment =
  | { type: "text"; value: string }
  | { type: "num"; value: string; index: number };

function splitNarrativeDetailSegments(detail: string): NarrativeDetailSegment[] {
  const re = new RegExp(DETAIL_FLOAT_PATTERN.source, "g");
  const out: NarrativeDetailSegment[] = [];
  let last = 0;
  let numIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(detail)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", value: detail.slice(last, m.index) });
    }
    out.push({ type: "num", value: m[0], index: numIndex++ });
    last = m.index + m[0].length;
  }
  if (last < detail.length) {
    out.push({ type: "text", value: detail.slice(last) });
  }
  return out;
}

function NarrativeAnimatedDetailLine({
  detail,
  detailNote,
  isActive,
  reducedMotion,
  monoClassName,
}: {
  detail: string;
  detailNote?: string;
  isActive: boolean;
  reducedMotion: boolean | null;
  monoClassName: string;
}) {
  const segments = useMemo(() => splitNarrativeDetailSegments(detail), [detail]);
  const floatCount = useMemo(
    () => segments.filter((s) => s.type === "num").length,
    [segments],
  );

  const [revealedFloats, setRevealedFloats] = useState(0);
  const [noteVisible, setNoteVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setRevealedFloats(0);
      setNoteVisible(false);
      return;
    }
    if (reducedMotion) {
      setRevealedFloats(floatCount);
      setNoteVisible(Boolean(detailNote));
      return;
    }
    setRevealedFloats(0);
    setNoteVisible(false);
    if (floatCount === 0) {
      if (detailNote) setNoteVisible(true);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= floatCount; i++) {
      timers.push(setTimeout(() => setRevealedFloats(i), 60 * i));
    }
    if (detailNote) {
      timers.push(setTimeout(() => setNoteVisible(true), 60 * floatCount + 80));
    }
    return () => timers.forEach(clearTimeout);
  }, [isActive, reducedMotion, floatCount, detailNote, detail]);

  return (
    <>
      <p className={monoClassName}>
        {segments.map((seg, i) =>
          seg.type === "text" ? (
            <span key={i}>{seg.value}</span>
          ) : (
            <span
              key={i}
              className="inline-block transition-opacity duration-200 ease-out tabular-nums"
            >
              {seg.index < revealedFloats ? seg.value : "···"}
            </span>
          ),
        )}
      </p>
      {detailNote ? (
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-gray-600 transition-opacity duration-300 ease-out dark:text-gray-400",
            noteVisible ? "opacity-100" : "opacity-0",
          )}
        >
          {detailNote}
        </p>
      ) : null}
    </>
  );
}

function NarrativeVerticalSequence({
  steps = [],
  reducedMotion,
  autoPlay = false,
}: {
  steps: NarrativeSequenceStep[];
  reducedMotion: boolean | null;
  autoPlay?: boolean;
}) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    if (!autoPlay || safeSteps.length === 0) return;
    let i = 0;
    setActiveStep(0);
    const tick = () => {
      i = (i + 1) % safeSteps.length;
      setActiveStep(i);
    };
    const id = setInterval(tick, 5200);
    return () => clearInterval(id);
  }, [autoPlay, safeSteps.length]);

  return (
    <div className="space-y-0">
      {safeSteps.map((step, i) => {
        const colorKey = step.highlight ? highlightToColor[step.highlight] : "violet";
        const tone = colorMap[colorKey];
        const isActive = activeStep === i;
        const isLast = i === safeSteps.length - 1;

        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-sm",
                  tone.bg,
                  isActive && "shadow-md",
                )}
              >
                {i + 1}
              </motion.div>
              {!isLast && (
                <motion.div
                  initial={reducedMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.07 + 0.15, ease: "easeOut" }}
                  style={{ transformOrigin: "top" }}
                  className={cn("my-1 w-0.5 flex-1 opacity-30", tone.line)}
                />
              )}
            </div>

            <motion.button
              type="button"
              initial={reducedMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
              onClick={() => setActiveStep(isActive ? null : i)}
              className={cn(
                "mb-4 min-w-0 flex-1 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                tone.light,
                tone.border,
                isActive ? `ring-2 ${tone.ring} ${tone.glow}` : "hover:shadow-md",
              )}
              aria-expanded={isActive}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 flex-1 text-lg font-semibold leading-snug text-gray-900 dark:text-gray-100">
                  {step.label}
                </span>
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 14 14"
                  fill="none"
                  animate={{ rotate: isActive ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="shrink-0 text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 5L7 9.5L11.5 5"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>

              {!isActive && (
                <p className="mt-2 line-clamp-2 text-base text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              )}

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                    {step.animateDetail ? (
                      <NarrativeAnimatedDetailLine
                        detail={step.detail}
                        detailNote={step.detailNote}
                        isActive={isActive}
                        reducedMotion={reducedMotion}
                        monoClassName="mt-3 border-t border-gray-200 pt-3 font-mono text-[13px] leading-relaxed text-gray-700 dark:border-gray-600 dark:text-gray-300"
                      />
                    ) : (
                      <p className="mt-3 border-t border-gray-200 pt-3 font-mono text-[13px] leading-relaxed text-gray-700 dark:border-gray-600 dark:text-gray-300">
                        {step.detail}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalSequence({
  steps = [],
  reducedMotion,
}: {
  steps?: SequenceStep[];
  reducedMotion: boolean | null;
}) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="flex items-start gap-0">
      {safeSteps.map((step, i) => {
        const tone = colorMap[step.color ?? "violet"];
        const isActive = activeStep === i;
        const isHovered = hoveredStep === i;

        return (
          <div key={step.number} className="flex min-w-0 flex-1 items-start">
            <motion.button
              type="button"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
              onClick={() => setActiveStep(isActive ? null : i)}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
              className={cn(
                "group w-full rounded-xl border p-3 text-left transition-all duration-200",
                tone.light,
                tone.border,
                isActive && `ring-2 ${tone.ring} ${tone.glow}`,
                !isActive && "hover:shadow-md",
              )}
              aria-expanded={isActive}
            >
              {/* Number badge */}
              <div className="mb-2 flex items-center gap-2">
                <motion.span
                  animate={
                    !reducedMotion && !isActive && isHovered
                      ? { scale: [1, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white",
                    tone.bg,
                  )}
                >
                  {step.number}
                </motion.span>
                <span className={cn("text-sm font-semibold uppercase tracking-wide", tone.text)}>
                  {step.phase}
                </span>
                {step.icon && <span className="ml-auto text-xl">{step.icon}</span>}
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{step.title}</p>

              {/* Detail — expands when active */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {step.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover preview — shows first 60 chars when collapsed + hovered */}
              {!isActive && isHovered && !reducedMotion && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 line-clamp-2 text-xs text-gray-400 dark:text-gray-500"
                >
                  {step.detail.slice(0, 80)}…
                </motion.p>
              )}

              {/* "Click to expand" hint when idle */}
              {!isActive && !isHovered && (
                <p className="mt-2 text-xs text-gray-400 opacity-60 dark:text-gray-600">
                  Click to expand ↓
                </p>
              )}
            </motion.button>

            {/* Arrow between steps */}
            {i < safeSteps.length - 1 && (
              <div className="mt-5 flex shrink-0 items-center px-1">
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                  <motion.path
                    d="M0 7 H16 M10 1 L16 7 L10 13"
                    stroke={tone.arrow}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.08 + 0.25, ease: "easeOut" }}
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VerticalSequence({
  steps = [],
  reducedMotion,
}: {
  steps?: SequenceStep[];
  reducedMotion: boolean | null;
}) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {safeSteps.map((step, i) => {
        const tone = colorMap[step.color ?? "violet"];
        const isActive = activeStep === i;
        const isLast = i === safeSteps.length - 1;

        return (
          <div key={step.number} className="flex gap-4">
            {/* Left column: number circle + connecting line */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-sm",
                  tone.bg,
                  isActive && "shadow-md",
                )}
              >
                {step.icon ?? step.number}
              </motion.div>
              {!isLast && (
                <motion.div
                  initial={reducedMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.07 + 0.15, ease: "easeOut" }}
                  style={{ transformOrigin: "top" }}
                  className={cn("my-1 w-0.5 flex-1 opacity-30", tone.line)}
                />
              )}
            </div>

            {/* Right column: expandable card */}
            <motion.button
              type="button"
              initial={reducedMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
              onClick={() => setActiveStep(isActive ? null : i)}
              className={cn(
                "mb-4 min-w-0 flex-1 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                tone.light,
                tone.border,
                isActive ? `ring-2 ${tone.ring} ${tone.glow}` : "hover:shadow-md",
              )}
              aria-expanded={isActive}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2 sm:items-center">
                  <span className={cn("shrink-0 text-sm font-semibold uppercase tracking-wide", tone.text)}>
                    {step.phase}
                  </span>
                  <span className="min-w-0 flex-1 text-lg font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {step.title}
                  </span>
                </div>
                {/* Chevron */}
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 14 14"
                  fill="none"
                  animate={{ rotate: isActive ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="shrink-0 text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 5L7 9.5L11.5 5"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>

              {/* Preview line when collapsed */}
              {!isActive && (
                <p className="mt-2 line-clamp-1 text-sm text-gray-400 dark:text-gray-500">
                  {step.detail}
                </p>
              )}

              {/* Full detail on expand */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                      {step.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

export default function StepSequence({
  steps = [],
  title,
  caption,
  orientation = "vertical",
  autoPlay = false,
}: StepSequenceProps) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const reducedMotion = useReducedMotion();
  const narrative = isNarrativeSequenceSteps(safeSteps as (SequenceStep | NarrativeSequenceStep)[]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-6 space-y-2">
          {title && <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-base text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {narrative ? (
        <NarrativeVerticalSequence
          steps={safeSteps as NarrativeSequenceStep[]}
          reducedMotion={reducedMotion}
          autoPlay={autoPlay}
        />
      ) : orientation === "horizontal" ? (
        <HorizontalSequence steps={safeSteps as SequenceStep[]} reducedMotion={reducedMotion} />
      ) : (
        <VerticalSequence steps={safeSteps as SequenceStep[]} reducedMotion={reducedMotion} />
      )}
    </motion.div>
  );
}
