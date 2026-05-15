"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { LinearMappingChartSvg } from "./LinearMappingChartSvg";
import { LinearMappingShell } from "./linear-mapping-shell";
import {
  CHART_PL,
  CHART_PT,
  CHART_PW,
  DEFAULT_TRAIN_BOUNDS,
  GUIDE_AMBER,
  LINE_GHOST,
  LINE_PURPLE,
  LINE_PURPLE_LIGHT,
  POINT_AMBER,
  POINT_AMBER_STROKE,
  POINT_LABEL,
  buildTrainingSteps,
  chartSx,
  chartSy,
  fmtEq,
  lineEndpoints,
  type TrainingStep,
} from "./linear-mapping-chart";

export interface LinearRegressionTrainingExplorerProps {
  title?: string;
  caption?: string;
  targetM?: number;
  targetC?: number;
  learningRate?: number;
}

const DATA_POINTS = [
  { x: 0, y: 2, label: "x=0, y=2" },
  { x: 1, y: 5, label: "x=1, y=5" },
  { x: 2, y: 8, label: "x=2, y=8" },
];

const CELL =
  "px-4 py-4 text-left align-middle md:px-6 md:py-5";
const HEAD =
  "px-4 py-3 text-sm font-bold uppercase tracking-wide text-violet-300 md:px-6 md:py-4 md:text-base";
const MONO = "font-mono text-lg font-bold tabular-nums text-gray-100 md:text-2xl";
const EQ = "font-mono text-base font-medium text-gray-300 md:text-xl";

export default function LinearRegressionTrainingExplorer({
  title,
  caption,
  targetM = 3,
  targetC = 2,
  learningRate = 0.08,
}: LinearRegressionTrainingExplorerProps) {
  const reduced = useReducedMotion();
  const bounds = DEFAULT_TRAIN_BOUNDS;

  const steps = useMemo(
    () =>
      buildTrainingSteps(
        targetM,
        targetC,
        learningRate,
        DATA_POINTS.map((p) => ({ x: p.x, y: p.y })),
      ),
    [targetM, targetC, learningRate],
  );

  const phases = useMemo(
    () => steps.map((s) => ({ label: s.tabLabel })),
    [steps],
  );

  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[phase] ?? steps[0]!;
  const { m, c, highlightX, kind } = step;

  const ghostLine = lineEndpoints(targetM, targetC, bounds);
  const modelLine = lineEndpoints(m, c, bounds);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing || reduced) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      setPhase((p) => (p + 1) % steps.length);
    }, 4000);
    return clearTimer;
  }, [playing, reduced, steps.length, clearTimer]);

  const showGhost = kind === "true_data";
  const showModelLine = kind !== "true_data";
  const isFinal = kind === "converged";
  const highlightActive =
    highlightX !== undefined && (kind === "forward" || kind === "backward" || kind === "update");

  return (
    <LinearMappingShell
      title={title}
      caption={caption}
      phases={phases}
      phase={phase}
      onPhaseChange={setPhase}
      playing={playing}
      onTogglePlay={() => setPlaying((p) => !p)}
      footerCallout="m & c are the weights — learned by reducing prediction error"
    >
      <div className="flex flex-col">
        <div className="border-b border-gray-800/60 px-3 pb-2 pt-2">
          <LinearMappingChartSvg bounds={bounds} ariaLabel="Training linear regression with gradient descent">
            <text
              x={CHART_PL + CHART_PW - 10}
              y={CHART_PT + 30}
              fill="#7c3aed"
              fontSize="26"
              fontFamily="ui-monospace,monospace"
              textAnchor="end"
              fontWeight="700"
            >
              y = mx + c
            </text>

            {showGhost ? (
              <motion.path
                d={`M ${ghostLine.x1},${ghostLine.y1} L ${ghostLine.x2},${ghostLine.y2}`}
                stroke={LINE_GHOST}
                strokeWidth="3"
                strokeDasharray="10 8"
                fill="none"
                strokeLinecap="round"
                opacity={0.7}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduced ? 0.1 : 0.6 }}
              />
            ) : null}

            {showGhost ? (
              <text
                x={chartSx(3.5, bounds)}
                y={chartSy(targetM * 3.5 + targetC, bounds) - 16}
                fill={LINE_PURPLE_LIGHT}
                fontSize="20"
                fontFamily="ui-monospace,monospace"
                opacity={0.75}
              >
                true: {fmtEq(targetM, targetC)}
              </text>
            ) : null}

            {DATA_POINTS.map((pt) => (
              <g key={pt.label}>
                <line
                  x1={chartSx(pt.x, bounds)}
                  y1={chartSy(0, bounds)}
                  x2={chartSx(pt.x, bounds)}
                  y2={chartSy(pt.y, bounds)}
                  stroke={GUIDE_AMBER}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.55"
                />
                <line
                  x1={chartSx(0, bounds)}
                  y1={chartSy(pt.y, bounds)}
                  x2={chartSx(pt.x, bounds)}
                  y2={chartSy(pt.y, bounds)}
                  stroke={GUIDE_AMBER}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.55"
                />
                <circle
                  cx={chartSx(pt.x, bounds)}
                  cy={chartSy(pt.y, bounds)}
                  r={highlightX === pt.x && highlightActive ? 12 : 9}
                  fill={POINT_AMBER}
                  stroke={POINT_AMBER_STROKE}
                  strokeWidth="2"
                />
                <text
                  x={chartSx(pt.x, bounds) + 14}
                  y={chartSy(pt.y, bounds) - 12}
                  fill={POINT_LABEL}
                  fontSize="16"
                  fontFamily="ui-monospace,monospace"
                >
                  {pt.label}
                </text>
              </g>
            ))}

            {showModelLine ? (
              <motion.path
                d={`M ${modelLine.x1},${modelLine.y1} L ${modelLine.x2},${modelLine.y2}`}
                stroke={LINE_PURPLE}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                animate={{
                  d: `M ${modelLine.x1},${modelLine.y1} L ${modelLine.x2},${modelLine.y2}`,
                }}
                transition={{ duration: reduced ? 0.1 : 0.5 }}
              />
            ) : null}

            {showModelLine ? (
              <text
                x={chartSx(4, bounds)}
                y={chartSy(m * 4 + c, bounds) - 20}
                fill={LINE_PURPLE_LIGHT}
                fontSize="22"
                fontFamily="ui-monospace,monospace"
                fontWeight="600"
              >
                model: {fmtEq(m, c)}
              </text>
            ) : null}

            <WeightsBox m={m} c={c} showTarget={isFinal} targetM={targetM} targetC={targetC} />
          </LinearMappingChartSvg>
        </div>

        <div className="min-h-[300px] flex-1 p-6 md:min-h-[340px] md:p-10">
          <TrainingStepTable step={step} />
        </div>
      </div>
    </LinearMappingShell>
  );
}

function TrainingStepTable({ step }: { step: TrainingStep }) {
  const badge = passBadge(step.kind);

  return (
    <motion.div
      key={`${step.kind}-${step.tabLabel}-${step.m}-${step.c}`}
      className="flex h-full flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className={cn(
          "rounded-2xl px-5 py-4 text-center md:px-8 md:py-5",
          badge.className,
        )}
      >
        <p className="text-xl font-bold tracking-wide md:text-3xl">{badge.title}</p>
        {badge.subtitle ? (
          <p className="mt-2 text-base font-medium text-gray-200 md:text-lg">{badge.subtitle}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0f0a1e]/90">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-violet-500/25 bg-violet-500/10">
              <th className={HEAD}>What</th>
              <th className={HEAD}>Value</th>
              <th className={cn(HEAD, "hidden sm:table-cell")}>Equation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/80">
            {tableRows(step).map((row) => (
              <tr key={row.label} className={row.highlight ? "bg-violet-500/10" : undefined}>
                <td className={cn(CELL, "text-base font-semibold text-gray-200 md:text-lg")}>
                  {row.label}
                </td>
                <td className={cn(CELL, MONO, row.valueTone)}>{row.value}</td>
                <td className={cn(CELL, EQ, "hidden sm:table-cell")}>{row.equation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {step.kind === "forward" || step.kind === "backward" || step.kind === "update" ? (
        <p className={cn(EQ, "sm:hidden")}>
          {tableRows(step)
            .filter((r) => r.equation)
            .map((r) => `${r.label}: ${r.equation}`)
            .join(" · ")}
        </p>
      ) : null}
    </motion.div>
  );
}

function passBadge(kind: TrainingStep["kind"]) {
  switch (kind) {
    case "forward":
      return {
        title: "FORWARD PASS",
        subtitle: "Feed x in → model predicts ŷ → compare to true y",
        className: "border border-sky-500/40 bg-sky-500/15 text-sky-100",
      };
    case "backward":
      return {
        title: "BACKWARD PASS",
        subtitle: "E = (y − ŷ)² — the factor 2 in ∂E comes from squaring",
        className: "border border-amber-500/40 bg-amber-500/15 text-amber-100",
      };
    case "update":
      return {
        title: "WEIGHT UPDATE",
        subtitle: "Nudge m and c in the direction that reduces error",
        className: "border border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
      };
    case "true_data":
      return {
        title: "TRUE DATA",
        subtitle: "Hidden relationship the model must learn",
        className: "border border-violet-500/40 bg-violet-500/15 text-violet-100",
      };
    case "init_guess":
      return {
        title: "STARTING GUESS",
        subtitle: "Weights start random — flat line at first",
        className: "border border-gray-500/40 bg-gray-500/15 text-gray-100",
      };
    case "converged":
      return {
        title: "LEARNED",
        subtitle: "After many forward → backward → update cycles",
        className: "border border-violet-400/50 bg-violet-500/20 text-violet-100",
      };
    default:
      return { title: "", subtitle: "", className: "" };
  }
}

type TableRow = {
  label: string;
  value: string;
  equation: string;
  highlight?: boolean;
  valueTone?: string;
};

function tableRows(step: TrainingStep): TableRow[] {
  const {
    m,
    c,
    x,
    yTrue,
    yPred,
    residual,
    squaredError,
    dM,
    dC,
    newM,
    newC,
    learningRate,
    targetM,
    targetC,
  } = step;

  switch (step.kind) {
    case "true_data":
      return [
        {
          label: "True line",
          value: fmtEq(targetM, targetC),
          equation: "y = m·x + c (unknown to model)",
        },
        { label: "Weights m", value: "?", equation: "slope — to be learned" },
        { label: "Weights c", value: "?", equation: "intercept — to be learned" },
      ];
    case "init_guess":
      return [
        { label: "Model line", value: fmtEq(m, c), equation: "ŷ = m·x + c" },
        { label: "Weight m", value: String(m), equation: "slope (random start)" },
        { label: "Weight c", value: String(c), equation: "intercept (random start)" },
      ];
    case "forward":
      return [
        {
          label: "Input x",
          value: String(x ?? "—"),
          equation: "one training example",
        },
        {
          label: "Model ŷ",
          value: String(yPred ?? "—"),
          equation: `ŷ = m·x + c = ${m}·${x} + ${c}`,
          highlight: true,
        },
        {
          label: "True y",
          value: String(yTrue ?? "—"),
          equation: "from the dataset",
          valueTone: "text-amber-300",
        },
        {
          label: "Residual (y − ŷ)",
          value: String(residual ?? "—"),
          equation: `${yTrue} − ${yPred} = ${residual ?? "?"}`,
          valueTone: "text-slate-200",
        },
        {
          label: "Loss E",
          value: String(squaredError ?? "—"),
          equation: "E = (y − ŷ)²",
          highlight: true,
          valueTone: "text-rose-300",
        },
      ];
    case "backward":
      return [
        {
          label: "Loss E",
          value: String(squaredError ?? "—"),
          equation: "E = (y − ŷ)²",
          highlight: true,
        },
        {
          label: "Residual (y − ŷ)",
          value: String(residual ?? "—"),
          equation: "inner term — squared to get E",
        },
        {
          label: "∂E/∂m",
          value: String(dM ?? "—"),
          equation: `∂E/∂m = 2·(y − ŷ)·(−x) = −2·(y − ŷ)·x`,
          highlight: true,
        },
        {
          label: "∂E/∂c",
          value: String(dC ?? "—"),
          equation: `∂E/∂c = 2·(y − ŷ)·(−1) = −2·(y − ŷ)`,
          highlight: true,
        },
        {
          label: "Meaning",
          value: "← direction",
          equation: "nudge m, c opposite to gradient × lr",
        },
      ];
    case "update":
      return [
        {
          label: "Learning rate",
          value: String(learningRate),
          equation: "lr (step size)",
        },
        {
          label: "m (before)",
          value: String(m),
          equation: `m − (∂E/∂m × lr)`,
        },
        {
          label: "m (after)",
          value: String(newM ?? "—"),
          equation: `${m} − (${dM} × ${learningRate})`,
          highlight: true,
        },
        {
          label: "c (before)",
          value: String(c),
          equation: `c − (∂E/∂c × lr)`,
        },
        {
          label: "c (after)",
          value: String(newC ?? "—"),
          equation: `${c} − (${dC} × ${learningRate})`,
          highlight: true,
        },
      ];
    case "converged":
      return [
        {
          label: "Learned line",
          value: fmtEq(m, c),
          equation: "matches true data",
          highlight: true,
        },
        { label: "Weight m", value: String(m), equation: `target ${targetM}` },
        { label: "Weight c", value: String(c), equation: `target ${targetC}` },
      ];
    default:
      return [];
  }
}

function WeightsBox({
  m,
  c,
  showTarget,
  targetM,
  targetC,
}: {
  m: number;
  c: number;
  showTarget: boolean;
  targetM: number;
  targetC: number;
}) {
  return (
    <g>
      <rect
        x={CHART_PL + 15}
        y={CHART_PT + 15}
        width={260}
        height={showTarget ? 130 : 100}
        rx="12"
        fill="#0f0a1e"
        stroke="#6d28d9"
        strokeWidth="2"
        opacity="0.96"
      />
      <text
        x={CHART_PL + 32}
        y={CHART_PT + 40}
        fill="#7c3aed"
        fontSize="16"
        fontFamily="ui-monospace,monospace"
        fontWeight="700"
        letterSpacing="0.1em"
      >
        WEIGHTS
      </text>
      <text
        x={CHART_PL + 32}
        y={CHART_PT + 72}
        fill="#e2e8f0"
        fontSize="20"
        fontFamily="ui-monospace,monospace"
        fontWeight="600"
      >
        m = {m.toFixed(2)}
      </text>
      <text
        x={CHART_PL + 32}
        y={CHART_PT + 98}
        fill="#e2e8f0"
        fontSize="20"
        fontFamily="ui-monospace,monospace"
        fontWeight="600"
      >
        c = {c.toFixed(2)}
      </text>
      {showTarget ? (
        <text
          x={CHART_PL + 32}
          y={CHART_PT + 128}
          fill="#a78bfa"
          fontSize="18"
          fontFamily="ui-monospace,monospace"
        >
          target: m={targetM}, c={targetC}
        </text>
      ) : null}
    </g>
  );
}
