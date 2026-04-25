"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CosinePair {
  label: string;
  angleA: number;
  angleB: number;
  description: string;
}

export interface CosineSimilarityExplorerProps {
  title?: string;
  caption?: string;
  presets?: CosinePair[];
}

// ── Canvas constants ──────────────────────────────────────────────────────────

const VW = 560;
const VH = 340;
const CX = VW / 2;
const CY = VH / 2;
const VLEN = 130; // vector length in px

// ── Math ──────────────────────────────────────────────────────────────────────

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function cosine(a: number, b: number) {
  return Math.cos(toRad(a - b));
}

function vecXY(angleDeg: number, len = VLEN) {
  const r = toRad(angleDeg);
  return { x: CX + Math.cos(r) * len, y: CY - Math.sin(r) * len };
}

// Project B onto A, return projected tip xy
function projectionTip(angleA: number, angleB: number) {
  const dot = cosine(angleA, angleB); // cos(θ) = A·B / (|A||B|) for unit vectors
  const projLen = dot * VLEN;
  const r = toRad(angleA);
  return { x: CX + Math.cos(r) * projLen, y: CY - Math.sin(r) * projLen };
}

// ── Score color ───────────────────────────────────────────────────────────────

function scoreColor(v: number) {
  if (v > 0.7) return { text: "text-green-600 dark:text-green-400", bg: "#22c55e" };
  if (v >= 0.3) return { text: "text-amber-600 dark:text-amber-400", bg: "#f59e0b" };
  return { text: "text-gray-500 dark:text-gray-400", bg: "#6b7280" };
}

// ── Arc path ─────────────────────────────────────────────────────────────────

function arcPath(angleA: number, angleB: number, radius = 38) {
  const startRad = toRad(angleA);
  const endRad = toRad(angleB);
  const x1 = CX + Math.cos(startRad) * radius;
  const y1 = CY - Math.sin(startRad) * radius;
  const x2 = CX + Math.cos(endRad) * radius;
  const y2 = CY - Math.sin(endRad) * radius;
  // Determine sweep: always draw the shorter arc
  let diff = ((angleB - angleA + 360) % 360);
  const largeArc = diff > 180 ? 1 : 0;
  const sweep = diff <= 180 ? 0 : 1; // going counter-clockwise matches -sin convention
  // Simplification: always sweep CCW (flag=0) for the short arc
  const sweep2 = diff <= 180 ? 0 : 1;
  return `M ${x1.toFixed(1)},${y1.toFixed(1)} A ${radius},${radius} 0 ${largeArc},${diff > 180 ? 0 : 1} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

// Arc midpoint for label
function arcMid(angleA: number, angleB: number, radius = 52) {
  let diff = ((angleB - angleA + 360) % 360);
  const midAngle = diff <= 180 ? angleA + diff / 2 : angleA - (360 - diff) / 2;
  const r = toRad(midAngle);
  return { x: CX + Math.cos(r) * radius, y: CY - Math.sin(r) * radius };
}

// ── Arrow helper ─────────────────────────────────────────────────────────────

interface VectorArrowProps {
  angle: number;
  color: string;
  label: string;
  isDark: boolean;
}

function VectorArrow({ angle, color, label }: VectorArrowProps) {
  const { x: tx, y: ty } = vecXY(angle);
  const dx = tx - CX;
  const dy = ty - CY;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;
  const headLen = 10;
  const headW = 5;
  const px = -ny;
  const py = nx;
  const ax = tx - nx * headLen;
  const ay = ty - ny * headLen;
  const arrowPts = `${tx.toFixed(1)},${ty.toFixed(1)} ${(ax + px * headW).toFixed(1)},${(ay + py * headW).toFixed(1)} ${(ax - px * headW).toFixed(1)},${(ay - py * headW).toFixed(1)}`;

  return (
    <g style={{ transition: "all 350ms cubic-bezier(0.4,0,0.2,1)" }}>
      <line
        x1={CX}
        y1={CY}
        x2={ax}
        y2={ay}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <polygon points={arrowPts} fill={color} />
      <text
        x={tx + nx * 14}
        y={ty + ny * 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
        fill={color}
        style={{ userSelect: "none" }}
      >
        {label}
      </text>
    </g>
  );
}

// ── Slider ────────────────────────────────────────────────────────────────────

interface AngleSliderProps {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}

function AngleSlider({ label, value, color, onChange }: AngleSliderProps) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{value}°</span>
      </div>
      <input
        type="range"
        min={0}
        max={359}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current cursor-pointer"
        style={{ accentColor: color }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const DEFAULT_PRESETS: CosinePair[] = [
  { label: "same direction", angleA: 30, angleB: 35, description: "Nearly identical direction — cosine approaches 1.0." },
  { label: "90° apart", angleA: 0, angleB: 90, description: "Perpendicular — cosine is exactly 0.0. Unrelated." },
  { label: "opposite", angleA: 30, angleB: 210, description: "Opposite directions — cosine is −1.0." },
];

export default function CosineSimilarityExplorer({
  title,
  caption,
  presets = DEFAULT_PRESETS,
}: CosineSimilarityExplorerProps) {
  const [angleA, setAngleA] = useState(30);
  const [angleB, setAngleB] = useState(140);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handlePreset = useCallback(
    (i: number) => {
      const p = presets[i];
      setAngleA(p.angleA);
      setAngleB(p.angleB);
      setActivePreset(i);
    },
    [presets],
  );

  const score = cosine(angleA, angleB);
  const { text: scoreTextClass, bg: scoreBg } = scoreColor(score);

  const axisColor = isDark ? "#374151" : "#e5e7eb";
  const labelColor = isDark ? "#4b5563" : "#d1d5db";

  // Projection tip
  const { x: px, y: py } = projectionTip(angleA, angleB);
  const { x: bx, y: by } = vecXY(angleB);

  // Colors
  const colorA = "#3b82f6"; // blue-500
  const colorB = isDark ? "#2dd4bf" : "#14b8a6"; // teal-500/400
  const arcColor = isDark ? "#fbbf24" : "#f59e0b"; // amber

  const { x: arcMidX, y: arcMidY } = arcMid(angleA, angleB, 56);

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {(title || caption) && (
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          {title && <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>}
          {caption && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* SVG canvas */}
        <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            width={VW}
            height={VH}
            className="mx-auto block max-w-full"
            style={{ height: "auto" }}
            aria-label="Cosine similarity diagram"
          >
            {/* Axes */}
            <line x1={CX} y1={20} x2={CX} y2={VH - 20} stroke={axisColor} strokeWidth={1} />
            <line x1={20} y1={CY} x2={VW - 20} y2={CY} stroke={axisColor} strokeWidth={1} />

            {/* Origin */}
            <circle cx={CX} cy={CY} r={3} fill={labelColor} />

            {/* Arc θ */}
            <path
              d={arcPath(angleA, angleB, 38)}
              fill="none"
              stroke={arcColor}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <text
              x={arcMidX}
              y={arcMidY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill={arcColor}
              style={{ userSelect: "none" }}
            >
              θ
            </text>

            {/* Projection dashed line (B tip → projection on A) */}
            <line
              x1={bx}
              y1={by}
              x2={px}
              y2={py}
              stroke={colorB}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              opacity={0.6}
              style={{ transition: "all 350ms ease" }}
            />
            {/* Projection foot dot */}
            <circle
              cx={px}
              cy={py}
              r={3.5}
              fill={colorB}
              opacity={0.5}
              style={{ transition: "all 350ms ease" }}
            />

            {/* Vector arrows */}
            <VectorArrow angle={angleA} color={colorA} label="A" isDark={isDark} />
            <VectorArrow angle={angleB} color={colorB} label="B" isDark={isDark} />
          </svg>
        </div>

        {/* Score */}
        <div className="mt-5 flex flex-col items-center gap-1">
          <span className={cn("font-mono text-5xl font-bold tabular-nums", scoreTextClass)}>
            {score >= 0 ? "" : ""}
            {score.toFixed(3)}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            cos(θ) = A·B / (|A||B|) ={" "}
            <span className={cn("font-mono font-semibold", scoreTextClass)}>
              {score.toFixed(3)}
            </span>
          </p>
          {activePreset !== null && presets[activePreset]?.description && (
            <p className="mt-1 max-w-sm text-center text-xs text-gray-500 dark:text-gray-400">
              {presets[activePreset].description}
            </p>
          )}
        </div>

        {/* Sliders */}
        <div className="mt-5 flex gap-4">
          <AngleSlider
            label="Vector A"
            value={angleA}
            color={colorA}
            onChange={(v) => { setAngleA(v); setActivePreset(null); }}
          />
          <AngleSlider
            label="Vector B"
            value={angleB}
            color={colorB}
            onChange={(v) => { setAngleB(v); setActivePreset(null); }}
          />
        </div>

        {/* Preset buttons */}
        {presets.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePreset(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  activePreset === i
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
