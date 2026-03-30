"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getBezierPoints(from: Point, to: Point) {
  const midX = (from.x + to.x) / 2;
  const bend = Math.max(Math.abs(to.x - from.x) * 0.25, 10);
  const c1 = { x: from.x < to.x ? midX - bend : midX + bend, y: from.y };
  const c2 = { x: from.x < to.x ? midX + bend : midX - bend, y: to.y };

  return { p0: from, p1: c1, p2: c2, p3: to };
}

function getBezierPath(points: ReturnType<typeof getBezierPoints>) {
  return `M ${points.p0.x} ${points.p0.y} C ${points.p1.x} ${points.p1.y}, ${points.p2.x} ${points.p2.y}, ${points.p3.x} ${points.p3.y}`;
}

function getPointOnBezier(
  t: number,
  { p0, p1, p2, p3 }: ReturnType<typeof getBezierPoints>,
) {
  const u = 1 - t;
  const x =
    (u ** 3) * p0.x +
    3 * (u ** 2) * t * p1.x +
    3 * u * (t ** 2) * p2.x +
    (t ** 3) * p3.x;
  const y =
    (u ** 3) * p0.y +
    3 * (u ** 2) * t * p1.y +
    3 * u * (t ** 2) * p2.y +
    (t ** 3) * p3.y;

  return { x, y };
}

function EdgeParticle({
  points,
  className,
  delay = 0,
}: {
  points: ReturnType<typeof getBezierPoints>;
  className: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  const cx = useMotionValue(points.p0.x);
  const cy = useMotionValue(points.p0.y);

  useAnimationFrame((time) => {
    if (reducedMotion) {
      return;
    }

    const progress = ((time / 2400) + delay) % 1;
    const current = getPointOnBezier(progress, points);
    cx.set(current.x);
    cy.set(current.y);
  });

  if (reducedMotion) {
    return null;
  }

  return <motion.circle r="1.2" cx={cx} cy={cy} className={className} />;
}

export default function DataFlowDiagram({
  nodes = defaultNodes,
  edges = defaultEdges,
  height = 340,
  title = "Data flow",
  caption = "Click nodes to toggle focus. Highlighted paths pulse brighter.",
  highlightPath = [],
}: DataFlowDiagramProps) {
  const reducedMotion = useReducedMotion();
  const safeNodes = nodes.length > 0 ? nodes : defaultNodes;
  const safeEdges = edges.length > 0 ? edges : defaultEdges;
  const [activeIds, setActiveIds] = useState<string[]>(() =>
    safeNodes.filter((node) => node.active).map((node) => node.id),
  );

  useEffect(() => {
    setActiveIds(safeNodes.filter((node) => node.active).map((node) => node.id));
  }, [safeNodes]);

  const nodeMap = useMemo(
    () =>
      new Map(
        safeNodes.map((node) => [
          node.id,
          { ...node, x: clampPercent(node.x), y: clampPercent(node.y) },
        ]),
      ),
    [safeNodes],
  );

  const highlightedEdges = useMemo(() => {
    const pairs = new Set<string>();
    highlightPath.forEach((nodeId, index) => {
      const next = highlightPath[index + 1];
      if (next) {
        pairs.add(`${nodeId}::${next}`);
      }
    });
    return pairs;
  }, [highlightPath]);

  const resolvedEdges = useMemo(
    () =>
      safeEdges
        .map((edge, index) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) {
            return null;
          }

          const points = getBezierPoints(
            { x: fromNode.x, y: fromNode.y },
            { x: toNode.x, y: toNode.y },
          );
          const midpoint = getPointOnBezier(0.5, points);
          const isHighlighted = highlightedEdges.has(`${edge.from}::${edge.to}`);

          return {
            ...edge,
            index,
            points,
            midpoint,
            isHighlighted,
            stroke:
              isHighlighted
                ? nodeColorMap[fromNode.color ?? "gray"].dot
                : "rgba(148, 163, 184, 0.45)",
          };
        })
        .filter((edge): edge is NonNullable<typeof edge> => edge !== null),
    [highlightedEdges, nodeMap, safeEdges],
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

        <div
          className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60"
          style={{
            height,
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {resolvedEdges.map((edge) => (
              <g key={`${edge.from}-${edge.to}`}>
                <motion.path
                  d={getBezierPath(edge.points)}
                  fill="none"
                  stroke={edge.stroke}
                  strokeWidth={edge.isHighlighted ? 1.8 : 1.15}
                  strokeDasharray={edge.isHighlighted ? undefined : "4 3"}
                  animate={
                    edge.isHighlighted && !reducedMotion
                      ? { opacity: [0.7, 1, 0.7] }
                      : undefined
                  }
                  transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                {edge.animated !== false ? (
                  <EdgeParticle
                    points={edge.points}
                    delay={edge.index * 0.17}
                    className={edge.color ?? "fill-violet-500 dark:fill-violet-400"}
                  />
                ) : null}
                {edge.label ? (
                  <text
                    x={edge.midpoint.x}
                    y={edge.midpoint.y - 2}
                    textAnchor="middle"
                    className="fill-gray-500 text-[3px] dark:fill-gray-400"
                  >
                    {edge.label}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>

          {safeNodes.map((node) => {
            const tone = nodeColorMap[node.color ?? "gray"];
            const isPathNode = highlightPath.includes(node.id);
            const isActive = activeIds.includes(node.id) || isPathNode;

            return (
              <motion.button
                key={node.id}
                type="button"
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={
                  isPathNode && !reducedMotion
                    ? { scale: [1, 1.02, 1] }
                    : { scale: 1, opacity: 1 }
                }
                transition={{
                  duration: isPathNode ? 1.4 : 0.3,
                  ease: "easeOut",
                  repeat: isPathNode ? Number.POSITIVE_INFINITY : 0,
                }}
                onClick={() =>
                  setActiveIds((current) =>
                    current.includes(node.id)
                      ? current.filter((entry) => entry !== node.id)
                      : [...current, node.id],
                  )
                }
                className={cn(
                  "absolute min-w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-[calc(50%+2px)] hover:shadow-md",
                  tone.surface,
                  isActive && tone.glow,
                )}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                aria-label={`Toggle ${node.label} node`}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{node.label}</p>
                  {node.sublabel ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{node.sublabel}</p>
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
