"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface TrackNode {
  id: string;
  label: string;
  sublabel?: string;
  color?: "violet" | "teal" | "amber" | "gray" | "blue" | "rose";
}

export interface TrackLine {
  nodes: string[];
  color: string;
  label?: string;
  dashed?: boolean;
}

export interface PipelineTrackProps {
  nodes: TrackNode[];
  lines: TrackLine[];
  title?: string;
  caption?: string;
}

const nodeColorMap: Record<string, { ring: string; bg: string; text: string; dot: string }> = {
  violet: {
    ring: "ring-violet-400 dark:ring-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-300",
    dot: "#8b5cf6",
  },
  teal: {
    ring: "ring-teal-400 dark:ring-teal-500",
    bg: "bg-teal-50 dark:bg-teal-500/10",
    text: "text-teal-700 dark:text-teal-300",
    dot: "#14b8a6",
  },
  amber: {
    ring: "ring-amber-400 dark:ring-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    dot: "#f59e0b",
  },
  blue: {
    ring: "ring-blue-400 dark:ring-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    dot: "#3b82f6",
  },
  rose: {
    ring: "ring-rose-400 dark:ring-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    dot: "#f43f5e",
  },
  gray: {
    ring: "ring-gray-300 dark:ring-gray-600",
    bg: "bg-gray-50 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    dot: "#94a3b8",
  },
};

function TrackDot({
  lineColor,
  startX,
  endX,
  y,
  delay,
}: {
  lineColor: string;
  startX: number;
  endX: number;
  y: number;
  delay: number;
}) {
  const reducedMotion = useReducedMotion();
  const cx = useMotionValue(startX);

  useAnimationFrame((time) => {
    if (reducedMotion) return;
    const progress = ((time / 2800) + delay) % 1;
    cx.set(startX + (endX - startX) * progress);
  });

  if (reducedMotion) return null;

  return (
    <motion.circle
      r={5}
      cx={cx}
      cy={y}
      fill={lineColor}
      opacity={0.9}
    />
  );
}

export default function PipelineTrack({
  nodes,
  lines,
  title,
  caption,
}: PipelineTrackProps) {
  const reducedMotion = useReducedMotion();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const [tooltip, setTooltip] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const TRACK_HEIGHT = 80;
  const PADDING_X = 80;
  const PADDING_Y = 36;
  const STATION_R = 10;

  const totalHeight = lines.length * TRACK_HEIGHT + PADDING_Y * 2;

  // Compute station pixel positions per line
  const lineLayouts = lines.map((line, lineIdx) => {
    const y = PADDING_Y + lineIdx * TRACK_HEIGHT + TRACK_HEIGHT / 2;
    const stationNodes = line.nodes.map((id) => nodeMap.get(id)).filter(Boolean) as TrackNode[];
    const count = stationNodes.length;
    return {
      line,
      y,
      stations: stationNodes.map((node, i) => ({
        node,
        x: count === 1
          ? PADDING_X + (800 - PADDING_X * 2) / 2
          : PADDING_X + (i / (count - 1)) * (800 - PADDING_X * 2),
      })),
    };
  });

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <svg
          viewBox={`0 0 800 ${totalHeight}`}
          className="w-full"
          style={{ height: totalHeight }}
          aria-label={title}
        >
          {lineLayouts.map(({ line, y, stations }) => {
            if (stations.length < 2) return null;
            const x1 = stations[0].x;
            const x2 = stations[stations.length - 1].x;

            return (
              <g key={`track-${line.label ?? y}`}>
                {/* Track rail */}
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={line.color}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={line.dashed ? "14 8" : undefined}
                  opacity={0.85}
                />

                {/* Animated dot */}
                {!line.dashed && (
                  <TrackDot
                    lineColor={line.color}
                    startX={x1}
                    endX={x2}
                    y={y}
                    delay={lineLayouts.findIndex((l) => l.y === y) * 0.33}
                  />
                )}

                {/* Track label on the left */}
                {line.label && (
                  <text
                    x={x1 - 12}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={600}
                    fill={line.color}
                    opacity={0.9}
                  >
                    {line.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Station circles — rendered above all lines */}
          {lineLayouts.map(({ line, y, stations }) =>
            stations.map(({ node, x }) => {
              const tone = nodeColorMap[node.color ?? "gray"];
              const isHovered = tooltip === node.id;
              return (
                <g
                  key={`station-${node.id}`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setTooltip(node.id)}
                  onMouseLeave={() => setTooltip(null)}
                  onFocus={() => setTooltip(node.id)}
                  onBlur={() => setTooltip(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={node.label}
                >
                  {/* Outer glow ring when hovered */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r={STATION_R + 5}
                      fill={tone.dot}
                      opacity={0.18}
                    />
                  )}
                  {/* Station circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={STATION_R}
                    fill="white"
                    stroke={line.color}
                    strokeWidth={3}
                    className="dark:fill-gray-900"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={STATION_R - 4}
                    fill={line.color}
                    opacity={0.85}
                  />
                  {/* Node label below station */}
                  <text
                    x={x}
                    y={y + STATION_R + 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    className="fill-gray-800 dark:fill-gray-200"
                    fill="currentColor"
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={x}
                      y={y + STATION_R + 26}
                      textAnchor="middle"
                      fontSize={9.5}
                      className="fill-gray-500 dark:fill-gray-400"
                      fill="currentColor"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            }),
          )}
        </svg>

        {/* Tooltip — rendered as HTML over the SVG for crisp text */}
        {tooltip && (() => {
          const node = nodeMap.get(tooltip);
          if (!node?.sublabel) return null;
          // Find station position
          for (const { stations } of lineLayouts) {
            const st = stations.find((s) => s.node.id === tooltip);
            if (st) {
              const pctX = (st.x / 800) * 100;
              const tone = nodeColorMap[node.color ?? "gray"];
              return (
                <div
                  key="tooltip"
                  className={cn(
                    "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border px-3 py-2 shadow-lg",
                    tone.bg,
                    tone.ring.replace("ring-", "border-").split(" ")[0],
                  )}
                  style={{ left: `${pctX}%`, top: "10%" }}
                >
                  <p className={cn("text-xs font-semibold", tone.text)}>{node.label}</p>
                  <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">{node.sublabel}</p>
                </div>
              );
            }
          }
          return null;
        })()}
      </div>
    </motion.div>
  );
}
