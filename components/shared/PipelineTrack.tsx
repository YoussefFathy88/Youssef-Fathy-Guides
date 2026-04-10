"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface TrackNode {
  id: string;
  label: string;
  /** Short hint shown under the label (always visible at small type). */
  sublabel?: string;
  /** Optional pill above the station (e.g. "External KB" at Retrieve). */
  badge?: string;
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

const TRAVEL_MS = 1500;
const DWELL_MS = 420;
const LOOP_GAP_MS = 700;

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Token moves forward one segment at a time, pausing at each station (clear forward path). */
function ForwardPathToken({
  xs,
  y,
  accentColor,
  filterId,
}: {
  xs: number[];
  y: number;
  accentColor: string;
  filterId: string;
}) {
  const reducedMotion = useReducedMotion();
  const cx = useMotionValue(xs[0] ?? 0);

  useAnimationFrame((time) => {
    if (reducedMotion || xs.length < 2) return;
    const segments = xs.length - 1;
    const segmentSpan = TRAVEL_MS + DWELL_MS;
    const cycle = segments * segmentSpan + LOOP_GAP_MS;
    const t = time % cycle;
    if (t >= segments * segmentSpan) {
      cx.set(xs[segments]);
      return;
    }
    const seg = Math.min(segments - 1, Math.floor(t / segmentSpan));
    const local = t - seg * segmentSpan;
    const x0 = xs[seg];
    const x1 = xs[seg + 1];
    if (local < TRAVEL_MS) {
      const u = easeInOutQuad(local / TRAVEL_MS);
      cx.set(x0 + (x1 - x0) * u);
    } else {
      cx.set(x1);
    }
  });

  if (reducedMotion) {
    return (
      <g>
        <circle cx={xs[0]} cy={y} r={12} fill={accentColor} opacity={0.35} />
        <circle cx={xs[0]} cy={y} r={7} fill={accentColor} />
      </g>
    );
  }

  return (
    <g>
      <motion.circle
        r={15}
        cx={cx}
        cy={y}
        fill={accentColor}
        opacity={0.22}
        filter={`url(#${filterId})`}
      />
      <motion.circle r={10} cx={cx} cy={y} fill={accentColor} opacity={0.95} />
      <motion.circle r={4} cx={cx} cy={y} fill="white" opacity={0.95} />
    </g>
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
  const reactId = useId().replace(/:/g, "");
  const svgUid = `pt-${reactId}`;
  const glowFilterId = `${svgUid}-glow`;

  const TRACK_HEIGHT = 142;
  const PADDING_X = 72;
  const PADDING_Y = 58;
  const STATION_R = 15;
  const TRACK_LABEL_HEIGHT = 26;
  const TRACK_LABEL_MIN_WIDTH = 96;

  const totalHeight = lines.length * TRACK_HEIGHT + PADDING_Y * 2;

  // Compute station pixel positions per line
  const lineLayouts = lines.map((line, lineIdx) => {
    const y = PADDING_Y + lineIdx * TRACK_HEIGHT + TRACK_HEIGHT / 2;
    const stationNodes = line.nodes.map((id) => nodeMap.get(id)).filter(Boolean) as TrackNode[];
    const count = stationNodes.length;
    return {
      line,
      lineIdx,
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
        <div className="mb-5 space-y-1.5">
          {title && <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-sm text-gray-500 dark:text-gray-400">{caption}</p>}
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
          <defs>
            <filter id={glowFilterId} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {lines.map((line, i) => (
              <linearGradient
                key={`grad-${i}`}
                id={`${svgUid}-rail-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={line.color} stopOpacity={0.35} />
                <stop offset="35%" stopColor={line.color} stopOpacity={1} />
                <stop offset="100%" stopColor={line.color} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>

          {lineLayouts.map(({ line, lineIdx, y, stations }) => {
            if (stations.length < 2) return null;
            const x1 = stations[0].x;
            const x2 = stations[stations.length - 1].x;
            const midX = (x1 + x2) / 2;
            const labelW = line.label
              ? Math.max(TRACK_LABEL_MIN_WIDTH, line.label.length * 7.8 + 32)
              : 0;

            return (
              <g key={`track-${line.label ?? lineIdx}`}>
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-300 dark:text-gray-700"
                  strokeWidth={12}
                  strokeLinecap="round"
                  opacity={0.55}
                />
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={line.dashed ? line.color : `url(#${svgUid}-rail-${lineIdx})`}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={line.dashed ? "14 11" : undefined}
                  opacity={line.dashed ? 0.65 : 0.92}
                />

                {!line.dashed && (
                  <ForwardPathToken
                    xs={stations.map((s) => s.x)}
                    y={y}
                    accentColor={line.color}
                    filterId={glowFilterId}
                  />
                )}

                {line.label && (
                  <>
                    <rect
                      x={midX - labelW / 2}
                      y={y - STATION_R - 52}
                      width={labelW}
                      height={TRACK_LABEL_HEIGHT}
                      rx={TRACK_LABEL_HEIGHT / 2}
                      fill={line.color}
                      opacity={0.14}
                    />
                    <text
                      x={midX}
                      y={y - STATION_R - 39}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight={700}
                      letterSpacing={0.02}
                      fill={line.color}
                      opacity={0.98}
                    >
                      {line.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {lineLayouts.map(({ lineIdx, y, stations }) =>
            stations.map(({ node, x }) => {
              const tone = nodeColorMap[node.color ?? "gray"];
              const compact = stations.length >= 6;
              const labelFs = compact ? 12 : 14;
              const subFs = compact ? 9 : 10.5;
              const tipKey = `${lineIdx}:${node.id}`;
              const isHovered = tooltip === tipKey;
              const badge = node.badge;
              const badgeW = badge
                ? Math.min(220, Math.max(64, badge.length * 7.2 + 24))
                : 0;
              const showTip = !!(node.sublabel || node.badge);
              return (
                <g
                  key={`station-${lineIdx}-${node.id}`}
                  style={{ cursor: showTip ? "pointer" : "default" }}
                  onMouseEnter={() => showTip && setTooltip(tipKey)}
                  onMouseLeave={() => setTooltip(null)}
                  onFocus={() => showTip && setTooltip(tipKey)}
                  onBlur={() => setTooltip(null)}
                  tabIndex={showTip ? 0 : -1}
                  role={showTip ? "button" : "presentation"}
                  aria-label={node.label}
                >
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r={STATION_R + 8}
                      fill={tone.dot}
                      opacity={0.12}
                    />
                  )}
                  {badge && (
                    <>
                      <rect
                        x={x - badgeW / 2}
                        y={y - STATION_R - 36}
                        width={badgeW}
                        height={22}
                        rx={11}
                        fill={tone.dot}
                        opacity={0.16}
                      />
                      <rect
                        x={x - badgeW / 2}
                        y={y - STATION_R - 36}
                        width={badgeW}
                        height={22}
                        rx={11}
                        fill="none"
                        stroke={tone.dot}
                        strokeWidth={1}
                        opacity={0.45}
                      />
                      <text
                        x={x}
                        y={y - STATION_R - 25}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={10.5}
                        fontWeight={600}
                        fill={tone.dot}
                        opacity={0.95}
                      >
                        {badge}
                      </text>
                    </>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={STATION_R + 2}
                    fill="none"
                    stroke={tone.dot}
                    strokeWidth={1}
                    opacity={0.25}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={STATION_R}
                    fill="white"
                    stroke={tone.dot}
                    strokeWidth={3.25}
                    className="dark:fill-gray-950"
                  />
                  <circle cx={x} cy={y} r={4.5} fill={tone.dot} opacity={0.92} />
                  <text
                    x={x}
                    y={y + STATION_R + 18}
                    textAnchor="middle"
                    fontSize={labelFs}
                    fontWeight={700}
                    className="fill-gray-800 dark:fill-gray-100"
                    fill="currentColor"
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={x}
                      y={y + STATION_R + (compact ? 32 : 36)}
                      textAnchor="middle"
                      fontSize={subFs}
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
          const sep = tooltip.indexOf(":");
          const nodeId = sep >= 0 ? tooltip.slice(sep + 1) : tooltip;
          const lineIdxParsed = sep >= 0 ? Number(tooltip.slice(0, sep)) : 0;
          const node = nodeMap.get(nodeId);
          if (!node?.sublabel && !node?.badge) return null;
          const layout = lineLayouts[lineIdxParsed];
          if (!layout) return null;
          const st = layout.stations.find((s) => s.node.id === nodeId);
          if (!st) return null;
          const { y } = layout;
          const pctX = (st.x / 800) * 100;
          const showBelow = y < 95;
          const tone = nodeColorMap[node.color ?? "gray"];
          return (
            <div
              key="tooltip"
              className={cn(
                "pointer-events-none absolute z-10 max-w-[260px] -translate-x-1/2 rounded-xl border px-3.5 py-2.5 shadow-lg",
                showBelow ? "translate-y-0" : "-translate-y-full",
                tone.bg,
                tone.ring.replace("ring-", "border-").split(" ")[0],
              )}
              style={{
                left: `${pctX}%`,
                top: showBelow ? y + STATION_R + 42 : y - STATION_R - 14,
              }}
            >
              <p className={cn("text-sm font-semibold", tone.text)}>{node.label}</p>
              {node.badge && (
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {node.badge}
                </p>
              )}
              {node.sublabel && (
                <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-400">{node.sublabel}</p>
              )}
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}
