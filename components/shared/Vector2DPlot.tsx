"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@/lib/utils";

export interface PlotPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  cluster?: string;
  isQuery?: boolean;
}

export interface Vector2DPlotProps {
  points?: PlotPoint[];
  showDistances?: boolean;
  showClusters?: boolean;
  title?: string;
  caption?: string;
  height?: number;
}

const defaultPoints: PlotPoint[] = [
  { id: "query", label: "Query", x: 50, y: 50, cluster: "query", isQuery: true },
  { id: "a", label: "Alpha", x: 28, y: 30, cluster: "group-a" },
  { id: "b", label: "Beta", x: 72, y: 38, cluster: "group-b" },
  { id: "c", label: "Gamma", x: 64, y: 72, cluster: "group-c" },
];

const clusterColors = [
  { fill: "#8b5cf6", badge: "bg-violet-500 dark:bg-violet-400" },
  { fill: "#14b8a6", badge: "bg-teal-500 dark:bg-teal-400" },
  { fill: "#f59e0b", badge: "bg-amber-500 dark:bg-amber-400" },
  { fill: "#f97316", badge: "bg-orange-500 dark:bg-orange-400" },
] as const;

const DOT_R = 9;
const QUERY_R = 11;
const FONT_SIZE = 13;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distPx(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

type LabelBox = { left: number; top: number; right: number; bottom: number };

function approxLabelWidth(label: string, charPx = 7.2) {
  return Math.min(300, Math.max(40, label.length * charPx));
}

function boxesOverlap(a: LabelBox, b: LabelBox) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

type ResolvedPoint = PlotPoint & { px: number; py: number };

type LabelLayout = {
  lx: number;
  ly: number;
  textAnchor: "start" | "end";
};

/** Avoid stacked labels when many points share a neighborhood (same fixed offset). */
function computeLabelLayouts(
  points: ResolvedPoint[],
  plotW: number,
  plotH: number,
  dotR: number,
  queryR: number,
  pad = 8,
): Map<string, LabelLayout> {
  const lineH = 16;
  const margin = 5;
  const placed: LabelBox[] = [];

  const sorted = [...points].sort((a, b) => {
    if (a.isQuery !== b.isQuery) return a.isQuery ? -1 : 1;
    return a.py - b.py || a.px - b.px;
  });

  const result = new Map<string, LabelLayout>();

  const pushBox = (left: number, top: number, right: number, bottom: number): LabelBox => ({
    left: left - margin,
    top: top - margin,
    right: right + margin,
    bottom: bottom + margin,
  });

  for (const p of sorted) {
    const r = p.isQuery ? queryR : dotR;
    const w = approxLabelWidth(p.label);

    const candidates: LabelLayout[] = [];
    const ySteps = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6];
    const xCols = [0, 36, 72, 108];

    for (const col of xCols) {
      for (const ys of ySteps) {
        const dy = ys * 17;
        candidates.push({
          lx: p.px + r + 5 + col,
          ly: p.py + 4 + dy,
          textAnchor: "start",
        });
        candidates.push({
          lx: p.px - r - 5 - col,
          ly: p.py + 4 + dy,
          textAnchor: "end",
        });
      }
    }

    let chosen: LabelLayout | null = null;

    for (const c of candidates) {
      const left = c.textAnchor === "start" ? c.lx : c.lx - w;
      const right = c.textAnchor === "start" ? c.lx + w : c.lx;
      const top = c.ly - lineH + 3;
      const bottom = c.ly + 5;
      const box = pushBox(left, top, right, bottom);

      if (box.left < pad || box.right > plotW - pad || box.top < pad || box.bottom > plotH - pad) {
        continue;
      }

      const overlapsLabel = placed.some((pb) => boxesOverlap(box, pb));
      const overlapsDot = points.some((op) => {
        if (op.id === p.id) return false;
        const or = op.isQuery ? queryR : dotR;
        const closestX = clamp(op.px, box.left, box.right);
        const closestY = clamp(op.py, box.top, box.bottom);
        return distPx(op.px, op.py, closestX, closestY) < or + 8;
      });

      if (!overlapsLabel && !overlapsDot) {
        chosen = c;
        placed.push(box);
        break;
      }
    }

    if (!chosen) {
      const lx = clamp(p.px + r + 5, pad, plotW - pad - w);
      const ly = clamp(p.py + 4, pad + lineH, plotH - pad);
      chosen = { lx, ly, textAnchor: "start" };
      const box = pushBox(lx, ly - lineH + 3, lx + w, ly + 5);
      placed.push(box);
    }

    result.set(p.id, chosen);
  }

  return result;
}

export default function Vector2DPlot({
  points = defaultPoints,
  showDistances = true,
  showClusters = true,
  title = "Embedding map",
  caption = "Drag the query point to explore nearest neighbours.",
  height = 340,
}: Vector2DPlotProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ width: 600, height });

  // Measure the container in real pixels — eliminates preserveAspectRatio distortion
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDims({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const safePoints = points.length > 0 ? points : defaultPoints;
  const initialQuery = safePoints.find((p) => p.isQuery) ?? safePoints[0];

  const [queryPct, setQueryPct] = useState({ x: initialQuery.x, y: initialQuery.y });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lockedId, setLockedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setQueryPct({ x: initialQuery.x, y: initialQuery.y });
  }, [initialQuery.x, initialQuery.y]);

  const clusterMap = useMemo(() => {
    const map = new Map<string, (typeof clusterColors)[number]>();
    let i = 0;
    safePoints.forEach((p) => {
      if (!p.cluster || map.has(p.cluster)) return;
      map.set(p.cluster, clusterColors[i % clusterColors.length]);
      i++;
    });
    return map;
  }, [safePoints]);

  // Convert % → px using measured container size
  const toX = (pct: number) => (pct / 100) * dims.width;
  const toY = (pct: number) => (pct / 100) * dims.height;

  const resolvedPoints = useMemo(
    () =>
      safePoints.map((p) =>
        p.isQuery
          ? { ...p, px: toX(queryPct.x), py: toY(queryPct.y) }
          : { ...p, px: toX(p.x), py: toY(p.y) },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryPct, safePoints, dims],
  );

  const queryPoint = resolvedPoints.find((p) => p.isQuery) ?? resolvedPoints[0];
  const activeId = lockedId ?? hoveredId;
  const activePoint = resolvedPoints.find((p) => p.id === activeId) ?? null;

  const labelLayouts = useMemo(
    () => computeLabelLayouts(resolvedPoints, dims.width, dims.height, DOT_R, QUERY_R),
    [resolvedPoints, dims.width, dims.height],
  );

  const nearestPoints = useMemo(
    () =>
      resolvedPoints
        .filter((p) => !p.isQuery)
        .map((p) => ({ point: p, dist: distPx(queryPoint.px, queryPoint.py, p.px, p.py) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3),
    [queryPoint, resolvedPoints],
  );

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const bounds = svgRef.current.getBoundingClientRect();
    const xPct = clamp(((e.clientX - bounds.left) / bounds.width) * 100, 5, 95);
    const yPct = clamp(((e.clientY - bounds.top) / bounds.height) * 100, 5, 95);
    setQueryPct({ x: xPct, y: yPct });
  };

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

        <div className="space-y-4">
          {/* Plot area */}
          <div
            ref={containerRef}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 dark:border-gray-700"
            style={{ height }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${dims.width} ${dims.height}`}
              width={dims.width}
              height={dims.height}
              className="h-full w-full overflow-visible"
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDragging(false)}
              onPointerLeave={() => setDragging(false)}
              aria-label="2D vector similarity plot"
            >
              {/* Axis lines */}
              <line
                x1={dims.width * 0.08} y1={dims.height * 0.92}
                x2={dims.width * 0.92} y2={dims.height * 0.92}
                stroke="rgba(148,163,184,0.2)" strokeWidth="1"
              />
              <line
                x1={dims.width * 0.08} y1={dims.height * 0.08}
                x2={dims.width * 0.08} y2={dims.height * 0.92}
                stroke="rgba(148,163,184,0.2)" strokeWidth="1"
              />

              {/* Distance line to hovered/locked point */}
              {showDistances && activePoint && (
                <>
                  <line
                    x1={queryPoint.px} y1={queryPoint.py}
                    x2={activePoint.px} y2={activePoint.py}
                    stroke="rgba(139,92,246,0.6)"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                  />
                  <text
                    x={(queryPoint.px + activePoint.px) / 2}
                    y={(queryPoint.py + activePoint.py) / 2 - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="rgba(139,92,246,0.9)"
                  >
                    {distPx(queryPoint.px, queryPoint.py, activePoint.px, activePoint.py).toFixed(1)}
                  </text>
                </>
              )}

              {/* Points */}
              {resolvedPoints.map((point) => {
                const color = point.isQuery
                  ? clusterColors[0]
                  : (clusterMap.get(point.cluster ?? "") ?? clusterColors[0]);
                const r = point.isQuery ? QUERY_R : DOT_R;
                const layout = labelLayouts.get(point.id) ?? {
                  lx: point.px + r + 5,
                  ly: point.py + 4,
                  textAnchor: "start" as const,
                };

                const lw = approxLabelWidth(point.label);
                const attachX =
                  layout.textAnchor === "start"
                    ? layout.lx - 2
                    : layout.lx - lw + 4;
                const attachY = layout.ly - 2;
                const legDx = attachX - point.px;
                const legDy = attachY - point.py;
                const legLen = Math.hypot(legDx, legDy) || 1;
                const rimX = point.px + (legDx / legLen) * (r + 2);
                const rimY = point.py + (legDy / legLen) * (r + 2);
                const showLeader = Math.hypot(attachX - rimX, attachY - rimY) > 16;

                return (
                  <g key={point.id}>
                    {/* Pulsing ring for query point */}
                    {point.isQuery && !reducedMotion && (
                      <motion.circle
                        cx={point.px}
                        cy={point.py}
                        r={QUERY_R}
                        fill="none"
                        stroke="rgba(139,92,246,0.35)"
                        strokeWidth="2"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                        style={{ transformOrigin: `${point.px}px ${point.py}px` }}
                      />
                    )}

                    {/* Main circle — crisp because viewBox matches container px */}
                    <circle
                      cx={point.px}
                      cy={point.py}
                      r={r}
                      fill={color.fill}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1.5"
                      onPointerEnter={() => !lockedId && !point.isQuery && setHoveredId(point.id)}
                      onPointerLeave={() => !lockedId && setHoveredId(null)}
                      onClick={() =>
                        !point.isQuery &&
                        setLockedId((cur) => (cur === point.id ? null : point.id))
                      }
                      onPointerDown={(e) => {
                        if (!point.isQuery) return;
                        e.currentTarget.setPointerCapture(e.pointerId);
                        setDragging(true);
                      }}
                      className={point.isQuery ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                    />

                    {/* Highlight ring on hover/lock */}
                    {activeId === point.id && (
                      <circle
                        cx={point.px}
                        cy={point.py}
                        r={r + 4}
                        fill="none"
                        stroke={color.fill}
                        strokeWidth="2"
                        opacity={0.5}
                      />
                    )}

                    {showLeader && (
                      <line
                        x1={rimX}
                        y1={rimY}
                        x2={attachX}
                        y2={attachY}
                        stroke="rgba(148,163,184,0.35)"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Label — position computed to reduce overlap in tight clusters */}
                    <text
                      x={layout.lx}
                      y={layout.ly}
                      textAnchor={layout.textAnchor}
                      fontSize={FONT_SIZE}
                      fontWeight={500}
                      fill="rgba(226,232,240,0.9)"
                      style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Nearest neighbours */}
          <div className="flex flex-wrap gap-2">
            {nearestPoints.map(({ point, dist }) => (
              <span
                key={point.id}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {point.label}: {dist.toFixed(1)}
              </span>
            ))}
          </div>

          {/* Cluster legend */}
          {showClusters && (
            <div className="flex flex-wrap gap-3">
              {Array.from(clusterMap.entries()).map(([cluster, color]) => (
                <div
                  key={cluster}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  <span
                    className={cn("h-2.5 w-2.5 rounded-full", color.badge)}
                    aria-hidden="true"
                  />
                  <span>{cluster}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
