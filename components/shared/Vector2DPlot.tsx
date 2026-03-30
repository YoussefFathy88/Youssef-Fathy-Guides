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
  {
    id: "violet",
    fill: "#8b5cf6",
    badge: "bg-violet-500 dark:bg-violet-400",
    text: "text-violet-500 dark:text-violet-300",
  },
  {
    id: "teal",
    fill: "#14b8a6",
    badge: "bg-teal-500 dark:bg-teal-400",
    text: "text-teal-500 dark:text-teal-300",
  },
  {
    id: "amber",
    fill: "#f59e0b",
    badge: "bg-amber-500 dark:bg-amber-400",
    text: "text-amber-500 dark:text-amber-300",
  },
  {
    id: "coral",
    fill: "#f97316",
    badge: "bg-orange-500 dark:bg-orange-400",
    text: "text-orange-500 dark:text-orange-300",
  },
] as const;

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getDistance(from: PlotPoint, to: PlotPoint) {
  return Math.hypot(from.x - to.x, from.y - to.y);
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const safePoints = points.length > 0 ? points : defaultPoints;
  const initialQuery = safePoints.find((point) => point.isQuery) ?? safePoints[0];

  const [queryPosition, setQueryPosition] = useState({ x: initialQuery.x, y: initialQuery.y });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lockedId, setLockedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setQueryPosition({ x: initialQuery.x, y: initialQuery.y });
  }, [initialQuery.x, initialQuery.y]);

  const clusterMap = useMemo(() => {
    const map = new Map<string, (typeof clusterColors)[number]>();
    let colorIndex = 0;

    safePoints.forEach((point) => {
      if (!point.cluster || map.has(point.cluster)) {
        return;
      }

      map.set(point.cluster, clusterColors[colorIndex % clusterColors.length]);
      colorIndex += 1;
    });

    return map;
  }, [safePoints]);

  const resolvedPoints = useMemo(
    () =>
      safePoints.map((point) =>
        point.isQuery ? { ...point, x: queryPosition.x, y: queryPosition.y } : point,
      ),
    [queryPosition.x, queryPosition.y, safePoints],
  );

  const queryPoint = resolvedPoints.find((point) => point.isQuery) ?? resolvedPoints[0];
  const activeId = lockedId ?? hoveredId;
  const activePoint = resolvedPoints.find((point) => point.id === activeId) ?? null;
  const nearestPoints = useMemo(
    () =>
      resolvedPoints
        .filter((point) => point.id !== queryPoint.id)
        .map((point) => ({ point, distance: getDistance(queryPoint, point) }))
        .sort((left, right) => left.distance - right.distance)
        .slice(0, 3),
    [queryPoint, resolvedPoints],
  );

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) {
      return;
    }

    const bounds = svgRef.current.getBoundingClientRect();
    const x = clampPercent(((event.clientX - bounds.left) / bounds.width) * 100);
    const y = clampPercent(((event.clientY - bounds.top) / bounds.height) * 100);
    setQueryPosition({ x, y });
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
          <div
            className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
            style={{ height }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-full w-full"
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDragging(false)}
              onPointerLeave={() => setDragging(false)}
              aria-label="2D vector similarity plot"
            >
              <line x1="10" y1="90" x2="90" y2="90" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="0.5" />
              <line x1="10" y1="10" x2="10" y2="90" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="0.5" />

              {showDistances && activePoint ? (
                <>
                  <line
                    x1={queryPoint.x}
                    y1={queryPoint.y}
                    x2={activePoint.x}
                    y2={activePoint.y}
                    stroke="rgba(139, 92, 246, 0.65)"
                    strokeWidth="0.75"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={(queryPoint.x + activePoint.x) / 2}
                    y={(queryPoint.y + activePoint.y) / 2 - 2}
                    textAnchor="middle"
                    className="fill-gray-500 text-[3px] dark:fill-gray-400"
                  >
                    {getDistance(queryPoint, activePoint).toFixed(1)}
                  </text>
                </>
              ) : null}

              {resolvedPoints.map((point) => {
                const color = point.isQuery
                  ? clusterColors[0]
                  : clusterMap.get(point.cluster ?? "") ?? clusterColors[0];

                return (
                  <g key={point.id}>
                    {point.isQuery ? (
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="4.4"
                        fill="none"
                        stroke="rgba(139, 92, 246, 0.28)"
                        strokeWidth="1"
                        animate={
                          reducedMotion
                            ? undefined
                            : { scale: [1, 1.35, 1], opacity: [0.8, 0.2, 0.8] }
                        }
                        transition={{
                          duration: 1.8,
                          ease: "easeInOut",
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                      />
                    ) : null}

                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={point.isQuery ? 3.2 : 2.3}
                      fill={point.isQuery ? "#8b5cf6" : color.fill}
                      stroke="white"
                      strokeWidth="1"
                      onPointerEnter={() => !lockedId && setHoveredId(point.isQuery ? null : point.id)}
                      onPointerLeave={() => !lockedId && setHoveredId(null)}
                      onClick={() =>
                        !point.isQuery &&
                        setLockedId((current) => (current === point.id ? null : point.id))
                      }
                      onPointerDown={(event) => {
                        if (!point.isQuery) {
                          return;
                        }

                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging(true);
                      }}
                      className={cn(
                        "dark:stroke-gray-900",
                        point.isQuery ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                      )}
                    />

                    <text
                      x={point.x + (point.isQuery ? 4 : 3)}
                      y={point.y - 2.5}
                      className="fill-gray-700 text-[3px] font-medium dark:fill-gray-200"
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            {nearestPoints.map(({ point, distance }) => (
              <span
                key={point.id}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {point.label}: {distance.toFixed(1)}
              </span>
            ))}
          </div>

          {showClusters ? (
            <div className="flex flex-wrap gap-3">
              {Array.from(clusterMap.entries()).map(([cluster, color]) => (
                <div
                  key={cluster}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  <span className={cn("h-2.5 w-2.5 rounded-full", color.badge)} aria-hidden="true" />
                  <span>{cluster}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
