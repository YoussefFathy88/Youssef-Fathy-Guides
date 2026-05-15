"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface LinearMappingGraphPoint {
  x: number;
  y: number;
  label?: string;
}

export interface LinearMappingGraphProps {
  title?: string;
  caption?: string;
  /** Slope — the first weight */
  m: number;
  /** Y-intercept — the second weight */
  c: number;
  /** Labelled points to show as known training examples */
  knownPoints: LinearMappingGraphPoint[];
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
}

// ── SVG layout ────────────────────────────────────────────────────────────────
const VW = 840;
const VH = 510;
const PL = 80; // padding left  (y-axis labels)
const PR = 40; // padding right
const PT = 40; // padding top
const PB = 60; // padding bottom (x-axis labels)
const PW = VW - PL - PR; // plot width
const PH = VH - PT - PB; // plot height

function sx(mathX: number, xMin: number, xMax: number) {
  return PL + ((mathX - xMin) / (xMax - xMin)) * PW;
}

function sy(mathY: number, yMin: number, yMax: number) {
  return PT + ((yMax - mathY) / (yMax - yMin)) * PH;
}

// ── Phase definitions ─────────────────────────────────────────────────────────
const PHASES = [
  {
    label: "The equation",
    hint: "A mapping function takes any input x and produces an output y. y = mx + c is the simplest one.",
  },
  {
    label: "Known examples",
    hint: "We have two known input→output pairs. Plot them as points on the graph.",
  },
  {
    label: "Find the weights",
    hint: "From those two points we can solve for m and c — these numbers are called weights.",
  },
  {
    label: "The mapping",
    hint: "With the weights locked in, we can predict y for ANY x — the line is the mapping function.",
  },
];

// ── Format equation string ────────────────────────────────────────────────────
function fmtEq(m: number, c: number) {
  const mPart = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  const cPart = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
  return `y = ${mPart}${cPart}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LinearMappingGraph({
  title = "y = mx + c — the simplest mapping function",
  caption,
  m,
  c,
  knownPoints,
  xMin = -0.5,
  xMax = 5,
  yMin = -0.5,
  yMax = 10,
}: LinearMappingGraphProps) {
  const [phase, setPhase] = useState(0);
  const reduced = useReducedMotion();

  // Origin coords in SVG space
  const ox = sx(0, xMin, xMax);
  const oy = sy(0, yMin, yMax);

  // Line endpoints
  const lx1 = sx(xMin, xMin, xMax);
  const ly1 = sy(m * xMin + c, yMin, yMax);
  const lx2 = sx(xMax, xMin, xMax);
  const ly2 = sy(m * xMax + c, yMin, yMax);

  // Grid integers in range
  const xTicks = Array.from(
    { length: Math.floor(xMax) - Math.ceil(xMin) + 1 },
    (_, i) => Math.ceil(xMin) + i,
  );
  const yTicks = Array.from(
    { length: Math.floor(yMax) - Math.ceil(yMin) + 1 },
    (_, i) => Math.ceil(yMin) + i,
  );

  // Weights box (phase 2) – show derivation from first two points
  const p1 = knownPoints[0];
  const p2 = knownPoints[1];

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/80 shadow-xl">
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800/60 px-6 py-4">
        <p className="text-balance text-base font-semibold text-white">{title}</p>
      </div>

      {/* ── Phase tabs ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        {PHASES.map((ph, i) => (
          <button
            key={ph.label}
            type="button"
            onClick={() => setPhase(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
              i === phase
                ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                : i < phase
                  ? "border-gray-700/50 bg-gray-800/60 text-gray-300 hover:bg-gray-700/60"
                  : "border-gray-800/50 bg-gray-900/40 text-gray-500 hover:bg-gray-800/40",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                i === phase
                  ? "bg-violet-500 text-white"
                  : i < phase
                    ? "bg-gray-600 text-gray-300"
                    : "bg-gray-800 text-gray-600",
              )}
            >
              {i + 1}
            </span>
            <span className="hidden sm:inline">{ph.label}</span>
          </button>
        ))}
      </div>

      {/* ── Phase hint ────────────────────────────────────────────────────── */}
      <div className="min-h-[2.4rem] px-5 pt-2 pb-1">
        <p className="text-sm leading-relaxed text-gray-400">{PHASES[phase]?.hint}</p>
      </div>

      {/* ── SVG chart ─────────────────────────────────────────────────────── */}
      <div className="px-3 pb-2 pt-2">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full"
          style={{ height: "auto", maxHeight: 540 }}
          aria-label="Coordinate plane showing the mapping function y = mx + c"
        >
          {/* Grid lines */}
          {xTicks.map((v) => (
            <line
              key={`gx${v}`}
              x1={sx(v, xMin, xMax)}
              y1={PT}
              x2={sx(v, xMin, xMax)}
              y2={PT + PH}
              stroke="#1f2937"
              strokeWidth="1"
            />
          ))}
          {yTicks.map((v) => (
            <line
              key={`gy${v}`}
              x1={PL}
              y1={sy(v, yMin, yMax)}
              x2={PL + PW}
              y2={sy(v, yMin, yMax)}
              stroke="#1f2937"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          <line x1={PL} y1={oy} x2={PL + PW} y2={oy} stroke="#4b5563" strokeWidth="2" />
          <line x1={ox} y1={PT} x2={ox} y2={PT + PH} stroke="#4b5563" strokeWidth="2" />

          {/* Axis arrows */}
          <polygon
            points={`${PL + PW},${oy} ${PL + PW - 10},${oy - 6} ${PL + PW - 10},${oy + 6}`}
            fill="#4b5563"
          />
          <polygon
            points={`${ox},${PT} ${ox - 6},${PT + 10} ${ox + 6},${PT + 10}`}
            fill="#4b5563"
          />

          {/* Axis labels */}
          <text x={PL + PW + 10} y={oy + 6} fill="#6b7280" fontSize="20" fontFamily="ui-monospace,monospace">
            x
          </text>
          <text x={ox + 10} y={PT - 6} fill="#6b7280" fontSize="20" fontFamily="ui-monospace,monospace">
            y
          </text>

          {/* X-axis tick labels */}
          {xTicks
            .filter((v) => v !== 0)
            .map((v) => (
              <text
                key={`xl${v}`}
                x={sx(v, xMin, xMax)}
                y={oy + 22}
                fill="#4b5563"
                fontSize="14"
                textAnchor="middle"
                fontFamily="ui-monospace,monospace"
              >
                {v}
              </text>
            ))}

          {/* Y-axis tick labels (even only to reduce clutter) */}
          {yTicks
            .filter((v) => v !== 0 && v % 2 === 0)
            .map((v) => (
              <text
                key={`yl${v}`}
                x={ox - 12}
                y={sy(v, yMin, yMax) + 5}
                fill="#4b5563"
                fontSize="14"
                textAnchor="end"
                fontFamily="ui-monospace,monospace"
              >
                {v}
              </text>
            ))}

          {/* Origin label */}
          <text x={ox - 14} y={oy + 20} fill="#4b5563" fontSize="14" textAnchor="end" fontFamily="ui-monospace,monospace">
            0
          </text>

          {/* ── Phase 0+: Equation label ─────────────────────────────────── */}
          <text
            x={PL + PW - 10}
            y={PT + 30}
            fill="#7c3aed"
            fontSize="26"
            fontFamily="ui-monospace,monospace"
            textAnchor="end"
            fontWeight="700"
          >
            y = mx + c
          </text>

          {/* ── Phase 3: Animated line ────────────────────────────────────── */}
          {phase >= 3 && (
            <motion.path
              d={`M ${lx1},${ly1} L ${lx2},${ly2}`}
              stroke="#8b5cf6"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: reduced ? 0.15 : 0.9, ease: "easeOut" },
                opacity: { duration: 0.2 },
              }}
            />
          )}

          {/* ── Phase 3: Equation with real values ───────────────────────── */}
          {phase >= 3 && (
            <motion.text
              x={sx(3.2, xMin, xMax)}
              y={sy(m * 3.2 + c, yMin, yMax) - 22}
              fill="#a78bfa"
              fontSize="22"
              fontFamily="ui-monospace,monospace"
              fontWeight="600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.7, duration: 0.35 }}
            >
              {fmtEq(m, c)}
            </motion.text>
          )}

          {/* ── Phase 1+: Known example points ───────────────────────────── */}
          {phase >= 1 &&
            knownPoints.map((pt, i) => (
              <motion.g
                key={`pt${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : i * 0.18, duration: 0.3 }}
              >
                {/* Dashed guide lines */}
                <line
                  x1={sx(pt.x, xMin, xMax)}
                  y1={oy}
                  x2={sx(pt.x, xMin, xMax)}
                  y2={sy(pt.y, yMin, yMax)}
                  stroke="#92400e"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.55"
                />
                <line
                  x1={ox}
                  y1={sy(pt.y, yMin, yMax)}
                  x2={sx(pt.x, xMin, xMax)}
                  y2={sy(pt.y, yMin, yMax)}
                  stroke="#92400e"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.55"
                />
                {/* Point dot */}
                <circle
                  cx={sx(pt.x, xMin, xMax)}
                  cy={sy(pt.y, yMin, yMax)}
                  r="9"
                  fill="#f59e0b"
                  stroke="#fde68a"
                  strokeWidth="2"
                />
                {/* Label */}
                {pt.label && (
                  <text
                    x={sx(pt.x, xMin, xMax) + 14}
                    y={sy(pt.y, yMin, yMax) - 12}
                    fill="#fbbf24"
                    fontSize="16"
                    fontFamily="ui-monospace,monospace"
                  >
                    {pt.label}
                  </text>
                )}
              </motion.g>
            ))}

          {/* ── Phase 2: Weights annotation box ──────────────────────────── */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.15 : 0.45 }}
            >
              <rect
                x={PL + 15}
                y={PT + 15}
                width={280}
                height={p1 && p2 ? 140 : 100}
                rx="12"
                fill="#0f0a1e"
                stroke="#6d28d9"
                strokeWidth="2"
                opacity="0.96"
              />
              <text
                x={PL + 32}
                y={PT + 40}
                fill="#7c3aed"
                fontSize="14"
                fontFamily="ui-monospace,monospace"
                fontWeight="700"
                letterSpacing="0.1em"
              >
                WEIGHTS
              </text>
              <line
                x1={PL + 15}
                y1={PT + 50}
                x2={PL + 295}
                y2={PT + 50}
                stroke="#6d28d9"
                strokeWidth="1"
                opacity="0.5"
              />
              {p1 && p2 && (
                <>
                  <text
                    x={PL + 32}
                    y={PT + 76}
                    fill="#94a3b8"
                    fontSize="16"
                    fontFamily="ui-monospace,monospace"
                  >
                    ({p1.x},{p1.y}) and ({p2.x},{p2.y})
                  </text>
                  <text
                    x={PL + 32}
                    y={PT + 100}
                    fill="#e2e8f0"
                    fontSize="18"
                    fontFamily="ui-monospace,monospace"
                    fontWeight="600"
                  >
                    m = {m}
                    {"  "}
                    <tspan fill="#94a3b8" fontWeight="400">
                      (slope)
                    </tspan>
                  </text>
                  <text
                    x={PL + 32}
                    y={PT + 126}
                    fill="#e2e8f0"
                    fontSize="18"
                    fontFamily="ui-monospace,monospace"
                    fontWeight="600"
                  >
                    c = {c}
                    {"  "}
                    <tspan fill="#94a3b8" fontWeight="400">
                      (intercept)
                    </tspan>
                  </text>
                </>
              )}
              {/* Brace / arrow pointing to the box label */}
              <text
                x={PL + 32}
                y={PT + (p1 && p2 ? 155 : 120)}
                fill="#6d28d9"
                fontSize="14"
                fontFamily="ui-monospace,monospace"
                fontWeight="600"
              >
                ← these are the weights
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-gray-800/60 px-5 py-3">
        <button
          type="button"
          onClick={() => setPhase((p) => Math.max(0, p - 1))}
          disabled={phase === 0}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition",
            phase === 0
              ? "cursor-not-allowed border-gray-800 text-gray-700"
              : "border-gray-700 text-gray-300 hover:border-violet-500 hover:text-white",
          )}
        >
          ← Prev
        </button>

        {/* Centre callout when done */}
        {phase === PHASES.length - 1 ? (
          <div className="flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/15 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span className="text-xs font-medium text-violet-200">
              m &amp; c are the weights — they define the mapping
            </span>
          </div>
        ) : (
          <div className="flex gap-1.5">
            {PHASES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPhase(i)}
                aria-label={`Go to step ${i + 1}`}
                className={cn(
                  "h-2 w-2 rounded-full transition",
                  i === phase ? "bg-violet-400" : "bg-gray-700 hover:bg-gray-500",
                )}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setPhase((p) => Math.min(PHASES.length - 1, p + 1))}
          disabled={phase === PHASES.length - 1}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition",
            phase === PHASES.length - 1
              ? "cursor-not-allowed border-gray-800 text-gray-700"
              : "border-gray-700 text-gray-300 hover:border-violet-500 hover:text-white",
          )}
        >
          Next →
        </button>
      </div>

      {/* ── Caption ─────────────────────────────────────────────────────────── */}
      {caption && <p className="px-6 pb-4 text-sm text-gray-500">{caption}</p>}
    </div>
  );
}
