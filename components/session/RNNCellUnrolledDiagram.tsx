"use client";

import { useId } from "react";

/**
 * Unrolled RNN: same cell A each step; inside each cell — 2 layers × 3 nodes;
 * x_t below, y_t above; amber arrows = hidden state between steps + h₀.
 */

const TEAL_BG = "#E1F5EE";
const TEAL_BD = "#5DCAA5";
const TEAL_TX = "#085041";
const AMBER = "#EF9F27";
const BOX_BG = "#F8FAFC";
const BOX_BD = "#CBD5E1";
const MUTED = "#64748B";

const STYLES = `
@keyframes rnn-flow {
  0%, 100% { stroke-opacity: 0.38; }
  50% { stroke-opacity: 1; }
}
.rnn-a0 { animation: rnn-flow 2.4s ease-in-out infinite; }
.rnn-a1 { animation: rnn-flow 2.4s ease-in-out infinite; animation-delay: 0.75s; }
.rnn-a2 { animation: rnn-flow 2.4s ease-in-out infinite; animation-delay: 1.5s; }
`;

function MiniNode({ cx, cy }: { cx: number; cy: number }) {
  return (
    <circle cx={cx} cy={cy} r={10} fill={TEAL_BG} stroke={TEAL_BD} strokeWidth={1.5} />
  );
}

function CellColumn({
  cx,
  idx,
  arrowMarkerId,
}: {
  cx: number;
  idx: number;
  arrowMarkerId: string;
}) {
  const topY = 40;
  const l2Y = 76;
  const l1Y = 116;
  const midX = cx;
  const xs = [cx - 34, cx, cx + 34];
  const cellTop = 50;
  const cellBottom = 136;
  const cellLeft = cx - 92;
  const cellRight = cx + 92;
  const sub = ["₀", "₁", "₂"][idx] ?? "";

  return (
    <g>
      <rect
        x={cellLeft}
        y={cellTop}
        width={cellRight - cellLeft}
        height={cellBottom - cellTop}
        rx={12}
        fill={BOX_BG}
        stroke={BOX_BD}
        strokeWidth={1.2}
        className="dark:fill-gray-900/80 dark:stroke-gray-600"
      />
      <text
        x={midX}
        y={cellTop + 15}
        textAnchor="middle"
        fill={MUTED}
        fontSize={10}
        fontWeight={700}
        fontFamily="ui-sans-serif,system-ui,sans-serif"
      >
        A — same weights
      </text>

      <text x={midX} y={l2Y - 17} textAnchor="middle" fill={MUTED} fontSize={8} fontFamily="ui-sans-serif,sans-serif">
        layer 2 (3 units)
      </text>
      {xs.map((x, i) => (
        <MiniNode key={`l2-${i}`} cx={x} cy={l2Y} />
      ))}

      <text x={midX} y={l1Y + 23} textAnchor="middle" fill={MUTED} fontSize={8} fontFamily="ui-sans-serif,sans-serif">
        layer 1 (3 units)
      </text>
      {xs.map((x, i) => (
        <MiniNode key={`l1-${i}`} cx={x} cy={l1Y} />
      ))}

      {xs.flatMap((x1) =>
        xs.map((x2, j) => (
          <line
            key={`${x1}-${x2}-${j}`}
            x1={x1}
            y1={l1Y - 10}
            x2={x2}
            y2={l2Y + 10}
            stroke={TEAL_BD}
            strokeWidth={0.55}
            opacity={0.35}
          />
        )),
      )}

      <line x1={midX} y1={l2Y - 10} x2={midX} y2={topY + 12} stroke={TEAL_BD} strokeWidth={1.5} />
      <circle cx={midX} cy={topY} r={11} fill={TEAL_BG} stroke={TEAL_BD} strokeWidth={1.5} />
      <text
        x={midX}
        y={topY + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={TEAL_TX}
        fontSize={11}
        fontWeight={700}
        fontFamily="ui-sans-serif,sans-serif"
      >
        {`y${sub}`}
      </text>

      <line
        x1={midX}
        y1={l1Y + 10}
        x2={midX}
        y2={170}
        stroke={TEAL_BD}
        strokeWidth={1.5}
        markerEnd={`url(#${arrowMarkerId})`}
      />
      <circle cx={midX} cy={186} r={11} fill={TEAL_BG} stroke={TEAL_BD} strokeWidth={1.5} />
      <text
        x={midX}
        y={187}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={TEAL_TX}
        fontSize={11}
        fontWeight={700}
        fontFamily="ui-sans-serif,sans-serif"
      >
        {`x${sub}`}
      </text>
    </g>
  );
}

export default function RNNCellUnrolledDiagram() {
  const uid = useId().replace(/:/g, "");
  const mArr = `rcud-arr-${uid}`;
  const mH = `rcud-h-${uid}`;
  const centers = [220, 460, 700];
  const laneY = 116;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <style>{STYLES}</style>
      <div className="px-2 pb-3 pt-5 sm:px-4 sm:pb-4 sm:pt-6" style={{ aspectRatio: "860 / 228" }}>
        <svg viewBox="0 0 860 228" width="100%" height="100%" className="block">
          <defs>
            <marker id={mArr} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill={TEAL_BD} />
            </marker>
            <marker id={mH} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <polygon points="0 0,7 3.5,0 7" fill={AMBER} />
            </marker>
          </defs>

          <circle cx={56} cy={laneY} r={13} fill="#FFF7E8" stroke={AMBER} strokeWidth={2} />
          <text
            x={56}
            y={laneY + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#7C4A00"
            fontSize={12}
            fontWeight={700}
            fontFamily="ui-sans-serif,sans-serif"
          >
            h₀
          </text>

          <line
            x1={70}
            y1={laneY}
            x2={128}
            y2={laneY}
            stroke={AMBER}
            strokeWidth={2.5}
            strokeLinecap="round"
            className="rnn-a0"
            markerEnd={`url(#${mH})`}
          />

          {centers.map((cx, i) => (
            <CellColumn key={cx} cx={cx} idx={i} arrowMarkerId={mArr} />
          ))}

          {centers.slice(0, -1).map((cx, i) => {
            const next = centers[i + 1]!;
            const x1 = cx + 92 + 2;
            const x2 = next - 92 - 2;
            const cls = i === 0 ? "rnn-a1" : "rnn-a2";
            return (
              <g key={`between-${i}`}>
                <line
                  x1={x1}
                  y1={laneY}
                  x2={x2}
                  y2={laneY}
                  stroke={AMBER}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className={cls}
                  markerEnd={`url(#${mH})`}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={laneY - 14}
                  textAnchor="middle"
                  fill={AMBER}
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="ui-sans-serif,sans-serif"
                >
                  {`h${["₁", "₂", "₃"][i]}`}
                </text>
              </g>
            );
          })}

          <text x={812} y={laneY + 6} textAnchor="middle" fill={MUTED} fontSize={24} fontFamily="ui-sans-serif,sans-serif">
            …
          </text>

          <text x={430} y={218} textAnchor="middle" fill={MUTED} fontSize={10} fontFamily="ui-sans-serif,sans-serif">
            LLMs: each xₜ is a token embedding — same recurrence, many more steps.
          </text>
        </svg>
      </div>
    </div>
  );
}
