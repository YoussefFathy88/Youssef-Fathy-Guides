"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmbeddingPoint {
  id: string;
  label: string;
  angle: number;
  magnitude: number;
  cluster: string;
  mockVector?: number[];
}

export interface EmbeddingVectorExplorerProps {
  title?: string;
  caption?: string;
  points?: EmbeddingPoint[];
  showClusters?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VW = 560;
const VH = 480;
const CX = VW / 2;
const CY = VH / 2;
const SCALE = 180; // px per unit magnitude
const STAGGER_MS = 80;

const CLUSTER_COLORS: Record<
  string,
  { arrow: string; fill: string; legend: string; hull: string; dark: string }
> = {
  royalty: {
    arrow: "#8b5cf6", // violet-500
    fill: "#8b5cf6",
    legend: "bg-violet-500",
    hull: "rgba(139,92,246,0.12)",
    dark: "#a78bfa",
  },
  animals: {
    arrow: "#14b8a6", // teal-500
    fill: "#14b8a6",
    legend: "bg-teal-500",
    hull: "rgba(20,184,166,0.12)",
    dark: "#2dd4bf",
  },
  vehicles: {
    arrow: "#f59e0b", // amber-500
    fill: "#f59e0b",
    legend: "bg-amber-500",
    hull: "rgba(245,158,11,0.12)",
    dark: "#fbbf24",
  },
};

const FALLBACK_COLORS = {
  arrow: "#6b7280",
  fill: "#6b7280",
  legend: "bg-gray-500",
  hull: "rgba(107,114,128,0.12)",
  dark: "#9ca3af",
};

function getClusterColor(cluster: string) {
  return CLUSTER_COLORS[cluster] ?? FALLBACK_COLORS;
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function tipXY(angle: number, magnitude: number) {
  const rad = toRad(angle);
  return {
    x: CX + Math.cos(rad) * magnitude * SCALE,
    y: CY - Math.sin(rad) * magnitude * SCALE,
  };
}

// Convex hull (Graham scan) for cluster polygons
function convexHull(pts: Array<{ x: number; y: number }>) {
  if (pts.length < 3) return pts;
  const sorted = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (
    o: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Array<{ x: number; y: number }> = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Array<{ x: number; y: number }> = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function hullPath(pts: Array<{ x: number; y: number }>) {
  if (!pts.length) return "";
  const padded = pts.map((p) => ({ x: p.x, y: p.y }));
  // inflate hull outward by 24px for nicer visuals
  const cx = padded.reduce((s, p) => s + p.x, 0) / padded.length;
  const cy = padded.reduce((s, p) => s + p.y, 0) / padded.length;
  const inflated = padded.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: p.x + (dx / len) * 24, y: p.y + (dy / len) * 24 };
  });
  return (
    inflated
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + " Z"
  );
}

// ── Arrow component ───────────────────────────────────────────────────────────

interface ArrowProps {
  point: EmbeddingPoint;
  visible: boolean;
  selected: boolean;
  isDark: boolean;
  onClick: () => void;
}

function Arrow({ point, visible, selected, isDark, onClick }: ArrowProps) {
  const colors = getClusterColor(point.cluster);
  const { x: tx, y: ty } = tipXY(point.angle, point.magnitude);
  const dx = tx - CX;
  const dy = ty - CY;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;

  // arrowhead (equilateral triangle at tip)
  const headLen = 11;
  const headW = 6;
  const px = -ny;
  const py = nx;
  const ax = tx - nx * headLen;
  const ay = ty - ny * headLen;
  const arrowPts = `${tx.toFixed(1)},${ty.toFixed(1)} ${(ax + px * headW).toFixed(1)},${(ay + py * headW).toFixed(1)} ${(ax - px * headW).toFixed(1)},${(ay - py * headW).toFixed(1)}`;

  // dash animation: total length of shaft
  const shaft = len - headLen;
  const color = isDark ? colors.dark : colors.arrow;
  const opacity = visible ? 1 : 0;

  return (
    <g
      onClick={onClick}
      className="cursor-pointer"
      style={{ opacity, transition: `opacity 200ms ease` }}
    >
      {/* hit target */}
      <line
        x1={CX}
        y1={CY}
        x2={tx}
        y2={ty}
        stroke="transparent"
        strokeWidth={18}
      />
      {/* shaft */}
      <line
        x1={CX}
        y1={CY}
        x2={ax}
        y2={ay}
        stroke={color}
        strokeWidth={selected ? 2.8 : 2}
        strokeLinecap="round"
        style={{
          strokeDasharray: shaft,
          strokeDashoffset: visible ? 0 : shaft,
          transition: visible
            ? `stroke-dashoffset 420ms cubic-bezier(0.4,0,0.2,1)`
            : "none",
        }}
      />
      {/* arrowhead */}
      <polygon
        points={arrowPts}
        fill={color}
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity 200ms ease 380ms`,
        }}
      />
      {/* label */}
      <text
        x={tx + nx * 14}
        y={ty + ny * 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={selected ? 700 : 500}
        fill={color}
        style={{ userSelect: "none", transition: "opacity 200ms ease 380ms", opacity: visible ? 1 : 0 }}
      >
        {point.label}
      </text>
    </g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const DEFAULT_POINTS: EmbeddingPoint[] = [
  { id: "king", label: "king", angle: 25, magnitude: 0.88, cluster: "royalty", mockVector: [0.21, -0.87, 0.54, 0.03, -0.66, 0.91] },
  { id: "queen", label: "queen", angle: 32, magnitude: 0.85, cluster: "royalty", mockVector: [0.19, -0.83, 0.51, 0.06, -0.61, 0.88] },
  { id: "dog", label: "dog", angle: 140, magnitude: 0.82, cluster: "animals", mockVector: [0.67, 0.44, -0.21, 0.88, 0.33, -0.12] },
  { id: "car", label: "car", angle: 255, magnitude: 0.80, cluster: "vehicles", mockVector: [-0.12, 0.22, 0.78, -0.44, 0.65, 0.31] },
];

export default function EmbeddingVectorExplorer({
  title,
  caption,
  points = DEFAULT_POINTS,
  showClusters: showClustersDefault = false,
}: EmbeddingVectorExplorerProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showClusters, setShowClusters] = useState(showClustersDefault);
  const [isDark, setIsDark] = useState(false);
  const rafRef = useRef<number>(0);

  // Detect dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Staggered reveal on mount
  useEffect(() => {
    let i = 0;
    function step() {
      setVisibleCount((c) => c + 1);
      i++;
      if (i < points.length) {
        rafRef.current = window.setTimeout(step, STAGGER_MS);
      }
    }
    const timer = window.setTimeout(step, 200);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(rafRef.current);
    };
  }, [points.length]);

  const selectedPoint = points.find((p) => p.id === selected) ?? null;

  // Cluster → unique clusters
  const clusters = Array.from(new Set(points.map((p) => p.cluster)));

  // Hull polygons per cluster
  const hullsByCluster = clusters.reduce<Record<string, string>>((acc, cl) => {
    const clPoints = points.map((p) => tipXY(p.angle, p.magnitude));
    const clusterTips = points
      .filter((p) => p.cluster === cl)
      .map((p) => tipXY(p.angle, p.magnitude));
    // include origin in hull for a fan shape
    const hull = convexHull([{ x: CX, y: CY }, ...clusterTips]);
    acc[cl] = hullPath(hull);
    return acc;
  }, {});

  const handleArrowClick = useCallback(
    (id: string) => setSelected((prev) => (prev === id ? null : id)),
    [],
  );

  // axis color adapts to dark
  const axisColor = isDark ? "#374151" : "#e5e7eb";
  const labelColor = isDark ? "#6b7280" : "#9ca3af";

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      {(title || caption) && (
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          {title && (
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
          )}
          {caption && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{caption}</p>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Canvas */}
        <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            width={VW}
            height={VH}
            className="mx-auto block max-w-full"
            style={{ height: "auto" }}
            aria-label="Embedding vector diagram"
          >
            {/* Cluster hulls */}
            {showClusters &&
              clusters.map((cl) => {
                const colors = getClusterColor(cl);
                return (
                  <path
                    key={cl}
                    d={hullsByCluster[cl]}
                    fill={colors.hull}
                    stroke={isDark ? colors.dark : colors.arrow}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5}
                    style={{ transition: "opacity 300ms ease" }}
                  />
                );
              })}

            {/* Axes */}
            <line x1={CX} y1={24} x2={CX} y2={VH - 24} stroke={axisColor} strokeWidth={1} />
            <line x1={24} y1={CY} x2={VW - 24} y2={CY} stroke={axisColor} strokeWidth={1} />
            <text x={CX + 6} y={20} fontSize={10} fill={labelColor}>y</text>
            <text x={VW - 18} y={CY - 6} fontSize={10} fill={labelColor}>x</text>

            {/* Origin dot */}
            <circle cx={CX} cy={CY} r={3} fill={labelColor} />

            {/* Arrows */}
            {points.map((point, i) => (
              <Arrow
                key={point.id}
                point={point}
                visible={i < visibleCount}
                selected={selected === point.id}
                isDark={isDark}
                onClick={() => handleArrowClick(point.id)}
              />
            ))}
          </svg>
        </div>

        {/* Selected detail panel */}
        {selectedPoint && (
          <div
            className={cn(
              "mt-4 rounded-xl border p-4 transition-all",
              "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  &ldquo;{selectedPoint.label}&rdquo;
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Cluster:{" "}
                  <span
                    style={{ color: isDark ? getClusterColor(selectedPoint.cluster).dark : getClusterColor(selectedPoint.cluster).arrow }}
                    className="font-medium"
                  >
                    {selectedPoint.cluster}
                  </span>
                  {" · "}angle {selectedPoint.angle}° · magnitude {selectedPoint.magnitude}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md px-2 py-0.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                close
              </button>
            </div>
            {selectedPoint.mockVector && (
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Mock vector (first 6 of many dimensions):
                </p>
                <code className="block rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-violet-700 dark:bg-gray-800 dark:text-violet-300">
                  [{selectedPoint.mockVector.map((n) => n.toFixed(2)).join(", ")}, …]
                </code>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  Real models use 768–3072 dimensions. Each number encodes one learned
                  &ldquo;feature&rdquo; of meaning.
                </p>
              </div>
            )}
          </div>
        )}
        {!selectedPoint && (
          <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
            Click any arrow to inspect its raw numbers
          </p>
        )}

        {/* Cluster legend + toggle */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {clusters.map((cl) => {
              const colors = getClusterColor(cl);
              return (
                <span key={cl} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: isDark ? colors.dark : colors.arrow }}
                  />
                  {cl}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => setShowClusters((v) => !v)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              showClusters
                ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
            )}
          >
            {showClusters ? "Hide clusters" : "Show clusters"}
          </button>
        </div>
      </div>
    </div>
  );
}
