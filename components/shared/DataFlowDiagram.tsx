"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  color?: "violet" | "teal" | "amber" | "gray";
  active?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  color?: string;
}

export interface DataFlowDiagramProps {
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  height?: number;
  title?: string;
  caption?: string;
  highlightPath?: string[];
}

const defaultNodes: DiagramNode[] = [
  { id: "input", label: "Input", x: 12, y: 50, color: "violet", active: true },
  { id: "process", label: "Process", x: 50, y: 28, color: "teal" },
  { id: "output", label: "Output", x: 84, y: 50, color: "amber" },
];

const defaultEdges: DiagramEdge[] = [
  { from: "input", to: "process", label: "transform" },
  { from: "process", to: "output", label: "emit" },
];

const nodeColorMap = {
  violet: {
    surface:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200",
    glow: "shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_18px_45px_-24px_rgba(139,92,246,0.65)]",
    dot: "#8b5cf6",
  },
  teal: {
    surface:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200",
    glow: "shadow-[0_0_0_1px_rgba(20,184,166,0.2),0_18px_45px_-24px_rgba(20,184,166,0.65)]",
    dot: "#14b8a6",
  },
  amber: {
    surface:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
    glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_18px_45px_-24px_rgba(245,158,11,0.65)]",
    dot: "#f59e0b",
  },
  gray: {
    surface:
      "border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900/70 dark:text-gray-100",
    glow: "shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)]",
    dot: "#94a3b8",
  },
} as const;

type Point = { x: number; y: number };

function getBezierPoints(from: Point, to: Point) {
  const midX = (from.x + to.x) / 2;
  const bend = Math.max(Math.abs(to.x - from.x) * 0.25, 20);
  const c1 = { x: from.x < to.x ? midX - bend : midX + bend, y: from.y };
  const c2 = { x: from.x < to.x ? midX + bend : midX - bend, y: to.y };
  return { p0: from, p1: c1, p2: c2, p3: to };
}

function getBezierPath(points: ReturnType<typeof getBezierPoints>) {
  return `M ${points.p0.x} ${points.p0.y} C ${points.p1.x} ${points.p1.y}, ${points.p2.x} ${points.p2.y}, ${points.p3.x} ${points.p3.y}`;
}

function getPointOnBezier(t: number, { p0, p1, p2, p3 }: ReturnType<typeof getBezierPoints>) {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function EdgeParticle({
  points,
  color,
  delay = 0,
}: {
  points: ReturnType<typeof getBezierPoints>;
  color: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  const cx = useMotionValue(points.p0.x);
  const cy = useMotionValue(points.p0.y);

  useAnimationFrame((time) => {
    if (reducedMotion) return;
    const progress = ((time / 2400) + delay) % 1;
    const pt = getPointOnBezier(progress, points);
    cx.set(pt.x);
    cy.set(pt.y);
  });

  if (reducedMotion) return null;

  return (
    <motion.circle
      r={4}
      cx={cx}
      cy={cy}
      fill={color}
      opacity={0.85}
    />
  );
}

export default function DataFlowDiagram({
  nodes = defaultNodes,
  edges = defaultEdges,
  height = 340,
  title = "Data flow",
  caption = "Follow the arrows — highlighted paths pulse brighter.",
  highlightPath = [],
}: DataFlowDiagramProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height });

  // Measure the container in pixels for accurate coordinate mapping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDims({ width: rect.width, height: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const safeNodes = nodes.length > 0 ? nodes : defaultNodes;
  const safeEdges = edges.length > 0 ? edges : defaultEdges;

  // Clamp node percentages so cards never touch the edges
  const nodeMap = useMemo(
    () =>
      new Map(
        safeNodes.map((node) => [
          node.id,
          {
            ...node,
            xPct: Math.min(Math.max(node.x, 10), 90),
            yPct: Math.min(Math.max(node.y, 14), 86),
          },
        ]),
      ),
    [safeNodes],
  );

  // Convert % → px using measured container dimensions
  const toPx = (xPct: number, yPct: number) => ({
    x: (xPct / 100) * dims.width,
    y: (yPct / 100) * dims.height,
  });

  const highlightedEdges = useMemo(() => {
    const pairs = new Set<string>();
    highlightPath.forEach((id, i) => {
      const next = highlightPath[i + 1];
      if (next) pairs.add(`${id}::${next}`);
    });
    return pairs;
  }, [highlightPath]);

  const resolvedEdges = useMemo(
    () =>
      safeEdges
        .map((edge, index) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;
          const from = toPx(fromNode.xPct, fromNode.yPct);
          const to = toPx(toNode.xPct, toNode.yPct);
          const points = getBezierPoints(from, to);
          const midpoint = getPointOnBezier(0.5, points);
          const isHighlighted = highlightedEdges.has(`${edge.from}::${edge.to}`);
          const dotColor = nodeColorMap[fromNode.color ?? "gray"].dot;
          return {
            ...edge,
            index,
            points,
            midpoint,
            isHighlighted,
            dotColor,
            stroke: isHighlighted ? dotColor : "rgba(148, 163, 184, 0.45)",
          };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightedEdges, nodeMap, dims],
  );

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

        {/* Outer wrapper with padding so node cards have room outside the visual bounds */}
        <div className="px-4 py-2">
          <div
            ref={containerRef}
            className="relative rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60"
            style={{
              height,
              backgroundImage:
                "radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* SVG for edges — pixel viewBox matches container exactly */}
            <svg
              viewBox={`0 0 ${dims.width} ${dims.height}`}
              width={dims.width}
              height={dims.height}
              className="absolute inset-0 overflow-visible"
              aria-hidden="true"
            >
              {resolvedEdges.map((edge) => (
                <g key={`${edge.from}-${edge.to}`}>
                  <motion.path
                    d={getBezierPath(edge.points)}
                    fill="none"
                    stroke={edge.stroke}
                    strokeWidth={edge.isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={edge.isHighlighted ? undefined : "6 4"}
                    animate={
                      edge.isHighlighted && !reducedMotion
                        ? { opacity: [0.6, 1, 0.6] }
                        : undefined
                    }
                    transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />
                  {edge.animated !== false && (
                    <EdgeParticle
                      points={edge.points}
                      color={edge.dotColor}
                      delay={edge.index * 0.17}
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* Edge labels — rendered as HTML divs for crisp text at any scale */}
            {resolvedEdges.map((edge) =>
              edge.label ? (
                <div
                  key={`label-${edge.from}-${edge.to}`}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-500 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/90 dark:text-gray-400 dark:ring-gray-700"
                  style={{ left: edge.midpoint.x, top: edge.midpoint.y - 4 }}
                >
                  {edge.label}
                </div>
              ) : null,
            )}

            {/* Node cards — positioned by same pixel coordinates */}
            {safeNodes.map((node) => {
              const mapped = nodeMap.get(node.id);
              if (!mapped) return null;
              const tone = nodeColorMap[node.color ?? "gray"];
              const isPathNode = highlightPath.includes(node.id);
              const px = toPx(mapped.xPct, mapped.yPct);

              return (
                <motion.div
                  key={node.id}
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn(
                    "absolute min-w-[120px] max-w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2.5",
                    tone.surface,
                    tone.glow,
                    isPathNode && "ring-2 ring-offset-1 ring-offset-transparent",
                    isPathNode && tone.glow,
                  )}
                  style={{ left: px.x, top: px.y }}
                >
                  <p className="text-xs font-semibold leading-tight">{node.label}</p>
                  {node.sublabel && (
                    <p className="mt-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                      {node.sublabel}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
