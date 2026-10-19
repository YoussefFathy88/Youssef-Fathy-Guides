"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DualLanePipelineColor = "violet" | "teal" | "amber" | "blue" | "rose" | "gray";

export interface DualLanePipelineBlock {
  id: string;
  label: string;
  emoji?: string;
  shape?: "rect" | "hex" | "circle";
  /** Overrides lane palette for this block (e.g. LLM uses blue). */
  accent?: DualLanePipelineColor;
}

export interface DualLanePipelineLaneSpec {
  id: string;
  label: string;
  color: DualLanePipelineColor;
  blocks: DualLanePipelineBlock[];
}

export interface DualLanePipelineEdge {
  from: string;
  to: string;
  dashed?: boolean;
  animated?: boolean;
  color?: DualLanePipelineColor;
  /** Short caption drawn near the connector (e.g. explain a dashed bypass). */
  label?: string;
}

export interface DualLanePipelineStep {
  id: string;
  label: string;
  description: string;
  highlightNodes: string[];
  highlightEdges: string[];
}

export interface DualLanePipelineDiagramProps {
  title?: string;
  /** Minimum height of the measured diagram region (flex layout grows with content). */
  minHeight?: number;
  /** Larger blocks, spacing, and edges — better on slides / projectors. */
  presentation?: boolean;
  hideStepNarrative?: boolean;
  lanes: [DualLanePipelineLaneSpec, DualLanePipelineLaneSpec];
  edges: DualLanePipelineEdge[];
  steps?: DualLanePipelineStep[];
  className?: string;
}

// ─── Palette (aligned with NodeFlowDiagram teaching colors) ───────────────────

const PALETTE = {
  violet: {
    stroke: "rgba(139,92,246,0.65)",
    fill: "rgba(139,92,246,0.14)",
    text: "#ddd6fe",
    ring: "rgba(139,92,246,0.35)",
    label: "#c4b5fd",
    bgMuted: "rgba(139,92,246,0.07)",
    edge: "#a78bfa",
  },
  teal: {
    stroke: "rgba(20,184,166,0.65)",
    fill: "rgba(20,184,166,0.14)",
    text: "#99f6e4",
    ring: "rgba(20,184,166,0.35)",
    label: "#5eead4",
    bgMuted: "rgba(20,184,166,0.07)",
    edge: "#2dd4bf",
  },
  amber: {
    stroke: "rgba(245,158,11,0.65)",
    fill: "rgba(245,158,11,0.14)",
    text: "#fde68a",
    ring: "rgba(245,158,11,0.35)",
    label: "#fcd34d",
    bgMuted: "rgba(245,158,11,0.07)",
    edge: "#fbbf24",
  },
  blue: {
    stroke: "rgba(96,165,250,0.65)",
    fill: "rgba(96,165,250,0.14)",
    text: "#bfdbfe",
    ring: "rgba(96,165,250,0.35)",
    label: "#93c5fd",
    bgMuted: "rgba(96,165,250,0.07)",
    edge: "#60a5fa",
  },
  rose: {
    stroke: "rgba(244,63,94,0.65)",
    fill: "rgba(244,63,94,0.14)",
    text: "#fecdd3",
    ring: "rgba(244,63,94,0.35)",
    label: "#fda4af",
    bgMuted: "rgba(244,63,94,0.07)",
    edge: "#fb7185",
  },
  gray: {
    stroke: "rgba(148,163,184,0.55)",
    fill: "rgba(148,163,184,0.12)",
    text: "#f8fafc",
    ring: "rgba(148,163,184,0.28)",
    label: "#cbd5e1",
    bgMuted: "rgba(148,163,184,0.06)",
    edge: "#cbd5e1",
  },
} as const satisfies Record<DualLanePipelineColor, Record<string, string>>;

type Measured = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
};

type BlockMeta = { lane: number; index: number };

type Point = { x: number; y: number };

function edgeKey(from: string, to: string) {
  return `${from}→${to}`;
}

function cubicPointAt(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

/**
 * Arrow markers use refX/refY at the tip so path endpoints sit on block borders
 * (`strokeLinecap="butt"` avoids round-cap bleed past those points).
 */

function buildEdgePath(
  from: Measured,
  to: Measured,
  metaFrom: BlockMeta,
  metaTo: BlockMeta,
  presentation: boolean,
): { d: string; mid: Point } {
  const bumpMag = presentation ? 48 : 38;

  if (metaFrom.lane === metaTo.lane && metaTo.index === metaFrom.index + 1) {
    const x1 = from.cx;
    const y1 = from.bottom;
    const x2 = to.cx;
    const y2 = to.top;
    return {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
    };
  }

  if (metaFrom.lane === metaTo.lane && Math.abs(metaTo.index - metaFrom.index) > 1) {
    const outward = metaFrom.lane === 0 ? -1 : 1;
    const x0 = outward === 1 ? from.right : from.left;
    const x3 = outward === 1 ? to.right : to.left;
    const y0 = from.cy;
    const y3 = to.cy;
    const bump = outward * bumpMag;
    const p0: Point = { x: x0, y: y0 };
    const p1: Point = { x: x0 + bump, y: y0 };
    const p2: Point = { x: x3 + bump, y: y3 };
    const p3: Point = { x: x3, y: y3 };
    return {
      d: `M ${x0} ${y0} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${x3} ${y3}`,
      mid: cubicPointAt(0.48, p0, p1, p2, p3),
    };
  }

  if (metaFrom.lane !== metaTo.lane) {
    const leftFirst = metaFrom.lane < metaTo.lane;
    const x1 = leftFirst ? from.right : from.left;
    const y1 = from.cy;
    const x2 = leftFirst ? to.left : to.right;
    const y2 = to.cy;
    const midX = (x1 + x2) / 2;
    const p0: Point = { x: x1, y: y1 };
    const p1: Point = { x: midX, y: y1 };
    const p2: Point = { x: midX, y: y2 };
    const p3: Point = { x: x2, y: y2 };
    return {
      d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
      mid: cubicPointAt(0.5, p0, p1, p2, p3),
    };
  }

  const x1 = from.cx;
  const y1 = from.bottom;
  const x2 = to.cx;
  const y2 = to.top;
  return {
    d: `M ${x1} ${y1} L ${x2} ${y2}`,
    mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
  };
}

function LaneBlock({
  block,
  laneColor,
  dimmed,
  highlighted,
  presentation,
  pillRef,
}: {
  block: DualLanePipelineBlock;
  laneColor: DualLanePipelineColor;
  dimmed: boolean;
  highlighted: boolean;
  presentation: boolean;
  pillRef: (el: HTMLDivElement | null) => void;
}) {
  const accent = block.accent ?? laneColor;
  const p = PALETTE[accent];
  /**
   * One consistent “pill” shape for every step so the diagram reads as one system.
   * `shape` is kept for authoring compatibility but renders the same chrome (stack vs hex vs circle).
   */
  const chrome = cn(
    "relative z-[1] flex w-full justify-center transition-opacity duration-200",
    presentation ? "max-w-[300px]" : "max-w-[220px]",
    dimmed ? "opacity-[0.22]" : "opacity-100",
  );

  return (
    <div className={chrome}>
      <div
        ref={pillRef}
        className={cn(
          "flex w-full items-center border-2 shadow-sm",
          presentation
            ? "max-w-[300px] gap-3 rounded-2xl px-4 py-3.5"
            : "max-w-[220px] gap-2 rounded-xl px-3 py-2",
          highlighted && "ring-1 ring-offset-1 ring-offset-[rgba(8,13,24,0.55)]",
        )}
        style={{
          borderColor: highlighted ? p.edge : p.stroke,
          backgroundColor: p.fill,
          boxShadow: highlighted ? `0 0 12px ${p.edge}38` : undefined,
        }}
      >
        {block.emoji ? (
          <span
            className={cn("leading-none", presentation ? "text-[30px]" : "text-[22px]")}
            aria-hidden
          >
            {block.emoji}
          </span>
        ) : null}
        <span
          className={cn(
            "font-semibold leading-snug tracking-tight",
            presentation ? "text-[17px]" : "text-[14px]",
          )}
          style={{ color: p.text }}
        >
          {block.label}
        </span>
      </div>
    </div>
  );
}

export default function DualLanePipelineDiagram({
  title,
  minHeight = 420,
  presentation = false,
  hideStepNarrative = false,
  lanes,
  edges,
  steps = [],
  className,
}: DualLanePipelineDiagramProps) {
  const effectiveMinHeight = presentation ? Math.max(minHeight, 540) : minHeight;
  const markerSuffix = presentation ? "-ppt" : "";
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [canvas, setCanvas] = useState({ w: 0, h: 0 });
  const [geom, setGeom] = useState<Map<string, Measured>>(new Map());

  const safeEdges = Array.isArray(edges) ? edges : [];
  const safeSteps = Array.isArray(steps) ? steps : [];

  const blockMeta = useMemo(() => {
    const m = new Map<string, BlockMeta>();
    lanes.forEach((lane, laneIdx) => {
      lane.blocks.forEach((b, index) => {
        m.set(b.id, { lane: laneIdx, index });
      });
    });
    return m;
  }, [lanes]);

  const setBlockRef = useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      if (el) blockRefs.current.set(id, el);
      else blockRefs.current.delete(id);
    };
  }, []);

  const measure = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const cr = root.getBoundingClientRect();
    const next = new Map<string, Measured>();
    for (const lane of lanes) {
      for (const b of lane.blocks) {
        const el = blockRefs.current.get(b.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        next.set(b.id, {
          left: r.left - cr.left,
          top: r.top - cr.top,
          right: r.right - cr.left,
          bottom: r.bottom - cr.top,
          cx: (r.left + r.right) / 2 - cr.left,
          cy: (r.top + r.bottom) / 2 - cr.top,
          w: r.width,
          h: r.height,
        });
      }
    }
    setGeom(next);
    setCanvas({ w: cr.width, h: cr.height });
  }, [lanes, presentation]);

  useLayoutEffect(() => {
    measure();
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [measure]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    return () => ro.disconnect();
  }, [measure]);

  const [currentStep, setCurrentStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!safeSteps.length) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSteps, currentStep, playing]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentStep((s) => {
        const next = s + 1;
        if (next >= safeSteps.length) {
          setPlaying(false);
          return s;
        }
        setDirection(1);
        return next;
      });
    }, 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, currentStep, safeSteps.length]);

  const goNext = useCallback(() => {
    setPlaying(false);
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, safeSteps.length - 1));
  }, [safeSteps.length]);

  const goPrev = useCallback(() => {
    setPlaying(false);
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
    } else {
      if (currentStep >= safeSteps.length - 1) {
        setCurrentStep(0);
        setDirection(1);
      } else if (currentStep === -1) {
        setCurrentStep(0);
      }
      setPlaying(true);
    }
  }, [playing, currentStep, safeSteps.length]);

  const activeStep =
    currentStep >= 0 && currentStep < safeSteps.length ? safeSteps[currentStep] : null;
  const highlightBlocks = useMemo(
    () => new Set(activeStep?.highlightNodes ?? []),
    [activeStep],
  );
  const highlightEdges = useMemo(
    () => new Set(activeStep?.highlightEdges ?? []),
    [activeStep],
  );
  const hasActiveStep = activeStep !== null;
  const isLast = currentStep === safeSteps.length - 1;

  const edgeColors = useMemo(() => {
    const s = new Set<DualLanePipelineColor>();
    for (const e of safeEdges) {
      const fromLane = blockMeta.get(e.from)?.lane;
      const fallback =
        fromLane !== undefined ? lanes[fromLane].color : ("gray" as const);
      s.add(e.color ?? fallback);
    }
    return [...s];
  }, [safeEdges, blockMeta, lanes]);

  const resolvedEdgePaths = useMemo(() => {
    return safeEdges
      .map((edge, index) => {
        const a = geom.get(edge.from);
        const b = geom.get(edge.to);
        const ma = blockMeta.get(edge.from);
        const mb = blockMeta.get(edge.to);
        if (!a || !b || ma === undefined || mb === undefined) return null;

        const { d, mid } = buildEdgePath(a, b, ma, mb, presentation);
        const key = edgeKey(edge.from, edge.to);
        const fromLane = lanes[ma.lane].color;
        const strokeCol = PALETTE[edge.color ?? fromLane].edge;
        const highlighted = hasActiveStep ? highlightEdges.has(key) : false;
        const dimmed = hasActiveStep && !highlighted;

        return {
          ...edge,
          d,
          mid,
          key,
          index,
          strokeCol,
          highlighted,
          dimmed,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [safeEdges, geom, blockMeta, lanes, highlightEdges, hasActiveStep, presentation]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1728]/80",
        presentation ? "p-6 sm:p-7" : "p-5",
        className,
      )}
    >
      {title ? (
        <p
          className={cn(
            "mb-4 font-medium text-slate-700 dark:text-slate-300",
            presentation ? "text-base sm:text-[17px]" : "text-sm",
          )}
        >
          {title}
        </p>
      ) : null}

      <div
        ref={containerRef}
        /* Neon lanes are drawn for a dark canvas: keep it dark in both themes. */
        className="dark relative isolate overflow-visible rounded-xl"
        style={{
          minHeight: effectiveMinHeight,
          background: "#0b111e",
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.09) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div
          className={cn(
            "relative z-[1] grid grid-cols-1 md:grid-cols-2",
            presentation
              ? "gap-10 p-7 md:gap-14 lg:gap-16 lg:p-9"
              : "gap-8 p-6 md:gap-10 lg:gap-12",
          )}
        >
          {lanes.map((lane) => {
            const lp = PALETTE[lane.color];
            return (
              <div
                key={lane.id}
                className={cn(
                  "rounded-2xl border border-dashed",
                  presentation ? "px-5 pb-7 pt-4 md:px-7" : "px-4 pb-5 pt-3 md:px-5",
                )}
                style={{
                  borderColor: lp.ring,
                  background: lp.bgMuted,
                }}
              >
                <p
                  className={cn(
                    "font-bold uppercase tracking-[0.14em]",
                    presentation ? "text-[12px] tracking-[0.16em]" : "text-[11px]",
                  )}
                  style={{ color: lp.label }}
                >
                  {lane.label}
                </p>
                <div
                  className={cn(
                    "mt-5 flex flex-col items-center",
                    presentation ? "gap-y-14" : "gap-y-10",
                  )}
                >
                  {lane.blocks.map((b) => {
                    const hl = hasActiveStep ? highlightBlocks.has(b.id) : false;
                    const dim = hasActiveStep && !hl;
                    return (
                      <LaneBlock
                        key={b.id}
                        block={b}
                        laneColor={lane.color}
                        dimmed={dim}
                        highlighted={hl}
                        presentation={presentation}
                        pillRef={setBlockRef(b.id)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {canvas.w > 0 && canvas.h > 0 ? (
          <svg
            className="pointer-events-none absolute inset-0 z-[40] overflow-visible"
            width={canvas.w}
            height={canvas.h}
            aria-hidden
          >
            <defs>
              {edgeColors.map((col) => (
                <marker
                  key={`arr-${col}${markerSuffix}`}
                  id={`dlp-arrow-${col}${markerSuffix}`}
                  markerUnits="userSpaceOnUse"
                  markerWidth={presentation ? 13 : 9}
                  markerHeight={presentation ? 11 : 7}
                  refX={presentation ? 12 : 8}
                  refY={presentation ? 5.5 : 3.5}
                  orient="auto"
                >
                  {/* Tip at (refX, refY); bulk extends backward (−x) along the path */}
                  <path
                    d={
                      presentation
                        ? "M0,0 L0,11 L12,5.5 Z"
                        : "M0,0 L0,7 L8,3.5 Z"
                    }
                    fill={PALETTE[col].edge}
                    opacity="0.92"
                  />
                </marker>
              ))}
            </defs>
            {resolvedEdgePaths.map((edge) => {
              const colKey = edge.color ?? lanes[blockMeta.get(edge.from)!.lane].color;
              const strokeHi = presentation ? 2.85 : 1.85;
              const strokeLo = presentation ? 2.15 : 1.35;
              const strokeW = edge.highlighted ? strokeHi : strokeLo;
              const haloW = strokeW + (presentation ? 4 : 2.5);
              /** Dimmed edges stay readable during step-through (was ~0.12). */
              const opacity = edge.dimmed ? (presentation ? 0.52 : 0.42) : edge.highlighted ? 1 : presentation ? 0.92 : 0.84;
              const dash = edge.dashed ? (presentation ? "6 7" : "4 5") : undefined;

              return (
                <g key={edge.key}>
                  <motion.path
                    d={edge.d}
                    fill="none"
                    stroke="rgba(15,23,42,0.94)"
                    strokeWidth={haloW}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeDasharray={dash}
                    animate={{ opacity }}
                    transition={{ duration: 0.22 }}
                  />
                  <motion.path
                    d={edge.d}
                    fill="none"
                    stroke={edge.strokeCol}
                    strokeWidth={strokeW}
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeDasharray={dash}
                    markerEnd={`url(#dlp-arrow-${colKey}${markerSuffix})`}
                    animate={{ opacity }}
                    transition={{ duration: 0.22 }}
                  />
                  {edge.label ? (
                    <text
                      x={edge.mid.x}
                      y={edge.mid.y - (edge.dashed ? (presentation ? 14 : 10) : presentation ? 11 : 8)}
                      textAnchor="middle"
                      fill="rgba(226,232,240,0.96)"
                      fontSize={presentation ? 12 : 10}
                      fontWeight={600}
                      stroke="rgba(15,23,42,0.9)"
                      strokeWidth={presentation ? 4 : 3}
                      paintOrder="stroke fill"
                      opacity={edge.dimmed ? (presentation ? 0.45 : 0.35) : 1}
                    >
                      {edge.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        ) : null}
      </div>

      {safeSteps.length > 0 ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            {safeSteps.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                aria-label={`Go to step ${i + 1}: ${s.label}`}
                onClick={() => {
                  setPlaying(false);
                  setDirection(i > currentStep ? 1 : -1);
                  setCurrentStep(i);
                }}
                animate={{ scale: i === currentStep ? 1.35 : 1 }}
                className={cn(
                  "h-2 rounded-full transition-all duration-200 focus-visible:outline-none",
                  i === currentStep
                    ? "w-6 bg-blue-400"
                    : "w-2 bg-slate-600 opacity-60 hover:opacity-90",
                )}
              />
            ))}
            <span className="ml-auto text-[12px] font-medium text-slate-600 dark:text-slate-500">
              {currentStep >= 0
                ? `${currentStep + 1} / ${safeSteps.length}`
                : `${safeSteps.length} steps`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStep <= 0}
              onClick={goPrev}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-gray-900/[0.07] dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Prev
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold transition",
                playing
                  ? "bg-gray-200 dark:bg-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-600"
                  : "bg-blue-600 text-white hover:bg-blue-500",
              )}
            >
              {playing ? "⏸ Pause" : isLast && currentStep >= 0 ? "↩ Replay" : "▶ Play"}
            </button>

            <button
              type="button"
              disabled={isLast}
              onClick={goNext}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-gray-900/[0.07] dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next →
            </button>

            <span className="ml-auto text-[10px] text-slate-600">
              ← → or Space to navigate
            </span>
          </div>

          {!hideStepNarrative ? (
            <div className="min-h-[64px] rounded-xl border border-gray-200 dark:border-white/8 bg-gray-900/[0.04] dark:bg-white/4 px-4 py-3">
              <AnimatePresence mode="wait" custom={direction}>
                {activeStep ? (
                  <motion.div
                    key={activeStep.id}
                    custom={direction}
                    initial={{ x: direction * 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -20, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <p className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">{activeStep.label}</p>
                    <p className="text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {activeStep.description}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-slate-600 dark:text-slate-500"
                  >
                    Press <span className="font-mono">Play</span> or click a step dot to walk through
                    the diagram.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
