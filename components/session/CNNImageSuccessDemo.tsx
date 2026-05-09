"use client";
import { useState, useEffect } from "react";

/* ── grid constants ──────────────────────────────────────────────────────── */
const COLS = 6, ROWS = 5, CS = 28;   // cell size
const GX = 38, GY = 48;              // grid origin

/* ── pattern: two vertical lines at col 1 and col 4 (rows 1–3) ─────────── */
function isPat(c: number, r: number) {
  return (c === 1 || c === 4) && r >= 1 && r <= 3;
}

/* ── 3×3 vertical-edge kernel ────────────────────────────────────────────── */
const KERNEL = [
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
] as const;

/* ── animation steps: [filterCol, filterRow] ────────────────────────────── */
const STEPS: [number, number][] = [
  [0, 0],  // scanning — no match
  [0, 1],  // MATCH: covers col 1, rows 1–3 ✓
  [1, 0],  // scanning
  [1, 1],  // MATCH: covers col 1, rows 1–3 ✓
  [2, 0],  // scanning
  [2, 1],  // MATCH: covers col 4, rows 1–3 ✓
  [3, 0],  // scanning
  [3, 1],  // MATCH: covers col 4, rows 1–3 ✓
];

/* ── output feature map is (COLS-2) × (ROWS-2) = 4×3 ───────────────────── */
const OC = COLS - 2, OR = ROWS - 2; // 4 × 3
const OCS = 34;                       // output cell size
const OX = 354, OY = 44;             // output origin

/** Returns true when the 3×3 filter at (fc, fr) fully covers a pattern line */
function isMatch(fc: number, fr: number): boolean {
  if (fr !== 1) return false; // pattern rows 1–3 require fr=1
  const cols = [fc, fc + 1, fc + 2];
  return cols.includes(1) || cols.includes(4);
}

/* ── colors ──────────────────────────────────────────────────────────────── */
const TEAL_BG = "#E1F5EE", TEAL_BD = "#5DCAA5", TEAL_TX = "#085041";
const AMBER = "#EF9F27", GREEN = "#1D9E75";
const GRAY_BG = "#F4F4F3", GRAY_BD = "#D1D5DB";
const MUTED = "#6B7280";

export default function CNNImageSuccessDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % STEPS.length), 860);
    return () => clearInterval(id);
  }, []);

  const [fc, fr] = STEPS[step];
  const match = isMatch(fc, fr);
  const fColor = match ? GREEN : AMBER;

  /* filter top-left in SVG coords */
  const fx = GX + fc * CS;
  const fy = GY + fr * CS;

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      style={{ aspectRatio: "780 / 256" }}
    >
      <svg viewBox="0 0 780 256" width="100%" height="100%">
        <defs>
          <marker id="cd-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={MUTED} />
          </marker>
        </defs>

        {/* ════════════════════════════════════════
            INPUT IMAGE GRID
        ════════════════════════════════════════ */}
        <text
          x={GX + (COLS * CS) / 2} y={GY - 14}
          textAnchor="middle" fill={MUTED}
          fontSize={10.5} fontFamily="ui-sans-serif,sans-serif" fontWeight={500}
        >
          Input image (pixels)
        </text>

        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const pat = isPat(c, r);
            const inF = c >= fc && c < fc + 3 && r >= fr && r < fr + 3;
            return (
              <rect
                key={`g${c}-${r}`}
                x={GX + c * CS + 1} y={GY + r * CS + 1}
                width={CS - 2} height={CS - 2} rx={3}
                fill={
                  pat
                    ? (inF ? "#A7F3D0" : TEAL_BG)
                    : (inF ? "#FFFBEB" : GRAY_BG)
                }
                stroke={pat ? TEAL_BD : GRAY_BD}
                strokeWidth={1}
              />
            );
          })
        )}

        {/* Sliding amber / green filter border */}
        <rect
          width={CS * 3 - 2} height={CS * 3 - 2} rx={5}
          fill="none"
          style={{
            stroke: fColor,
            strokeWidth: 2.8,
            transform: `translate(${fx + 1}px, ${fy + 1}px)`,
            transition: "transform 0.32s ease, stroke 0.22s ease",
          }}
        />

        {/* "✓ match!" label above the filter */}
        <text
          textAnchor="middle"
          style={{
            fill: fColor,
            fontSize: 10.5,
            fontWeight: 700,
            fontFamily: "ui-sans-serif,sans-serif",
            transform: `translate(${fx + CS * 1.5}px, ${fy - 7}px)`,
            transition: "transform 0.32s ease, fill 0.22s ease, opacity 0.18s ease",
            opacity: match ? 1 : 0,
          }}
        >
          ✓ match!
        </text>

        {/* ════════════════════════════════════════
            DIVIDER
        ════════════════════════════════════════ */}
        <line
          x1={216} y1={12} x2={216} y2={244}
          stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4 3"
        />

        {/* ════════════════════════════════════════
            FILTER KERNEL (3×3)
        ════════════════════════════════════════ */}
        <text
          x={263} y={26}
          textAnchor="middle" fill={MUTED}
          fontSize={10.5} fontFamily="ui-sans-serif,sans-serif" fontWeight={500}
        >
          Filter kernel
        </text>

        {KERNEL.map((row, r) =>
          row.map((val, c) => (
            <g key={`k${c}-${r}`}>
              <rect
                x={224 + c * 29} y={32 + r * 29}
                width={27} height={27} rx={4}
                fill={val > 0 ? TEAL_BG : GRAY_BG}
                stroke={val > 0 ? TEAL_BD : GRAY_BD}
                strokeWidth={1.2}
              />
              <text
                x={224 + c * 29 + 13.5} y={32 + r * 29 + 13.5}
                textAnchor="middle" dominantBaseline="middle"
                fill={val > 0 ? TEAL_TX : "#9CA3AF"}
                fontSize={12} fontWeight={700}
                fontFamily="ui-monospace,monospace"
              >
                {val}
              </text>
            </g>
          ))
        )}

        <text
          x={263} y={128}
          textAnchor="middle" fill={MUTED}
          fontSize={9.5} fontFamily="ui-sans-serif,sans-serif"
        >
          detects vertical edges
        </text>

        {/* Arrow: kernel → feature map */}
        <line
          x1={310} y1={80} x2={342} y2={80}
          stroke={MUTED} strokeWidth={1.5} markerEnd="url(#cd-arr)"
        />

        {/* ════════════════════════════════════════
            OUTPUT FEATURE MAP
        ════════════════════════════════════════ */}
        <text
          x={OX + (OC * OCS) / 2} y={OY - 14}
          textAnchor="middle" fill={MUTED}
          fontSize={10.5} fontFamily="ui-sans-serif,sans-serif" fontWeight={500}
        >
          Output feature map
        </text>

        {Array.from({ length: OR }, (_, r) =>
          Array.from({ length: OC }, (_, c) => {
            const active = isMatch(c, r);
            const isCur = c === fc && r === fr;
            return (
              <g key={`o${c}-${r}`}>
                <rect
                  x={OX + c * OCS + 1} y={OY + r * OCS + 1}
                  width={OCS - 2} height={OCS - 2} rx={5}
                  fill={active ? TEAL_BG : GRAY_BG}
                  stroke={isCur ? fColor : (active ? TEAL_BD : GRAY_BD)}
                  strokeWidth={isCur ? 2.5 : 1.2}
                  style={{ transition: "stroke 0.22s ease" }}
                />
                {active && (
                  <text
                    x={OX + c * OCS + OCS / 2} y={OY + r * OCS + OCS / 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={TEAL_TX} fontSize={15} fontWeight={700}
                  >
                    +
                  </text>
                )}
              </g>
            );
          })
        )}

        <text
          x={OX + (OC * OCS) / 2} y={OY + OR * OCS + 16}
          textAnchor="middle" fill={MUTED}
          fontSize={9.5} fontFamily="ui-sans-serif,sans-serif"
        >
          bright cells = detected edges
        </text>

        {/* ════════════════════════════════════════
            STATUS BOX
        ════════════════════════════════════════ */}
        <rect
          x={504} y={54} width={252} height={76} rx={9}
          fill={match ? "#D1FAE5" : "#F9FAFB"}
          stroke={match ? GREEN : GRAY_BD}
          strokeWidth={1.5}
          style={{ transition: "fill 0.22s ease, stroke 0.22s ease" }}
        />
        <text
          x={630} y={84}
          textAnchor="middle" dominantBaseline="middle"
          fill={match ? GREEN : "#9CA3AF"}
          fontSize={13} fontWeight={700} fontFamily="ui-sans-serif,sans-serif"
          style={{ transition: "fill 0.22s ease" }}
        >
          {match ? "Vertical edge found! ✓" : "Scanning…"}
        </text>
        <text
          x={630} y={108}
          textAnchor="middle"
          fill={match ? GREEN : "#9CA3AF"}
          fontSize={10} fontFamily="ui-sans-serif,sans-serif"
          style={{ transition: "fill 0.22s ease" }}
        >
          {match
            ? `filter at col ${fc}, row ${fr} → activated`
            : `filter at col ${fc}, row ${fr} → silent`}
        </text>

        {/* ════════════════════════════════════════
            BOTTOM CAPTION
        ════════════════════════════════════════ */}
        <text
          x={390} y={246}
          textAnchor="middle"
          fill={MUTED} fontSize={11} fontFamily="ui-sans-serif,sans-serif"
        >
          Same filter finds the same pattern at any position → translation invariance
        </text>
      </svg>
    </div>
  );
}
