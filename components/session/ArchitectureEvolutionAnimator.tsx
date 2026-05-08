"use client";
import { useState } from "react";

/* ─── data ─────────────────────────────────────────────────────────────────
   8-token condensed form of:
   "Egypt is a country in North Africa. It has a rich history.
    Its capital is Cairo. What is its capital?"
   Reading left-to-right: "Egypt is a country … What is its capital"
   Key challenge: "its" (index 6) must resolve to "Egypt" (index 0).
──────────────────────────────────────────────────────────────────────────── */
const TOKENS = ["Egypt", "is", "a", "country", "What", "is", "its", "capital"] as const;
const TX = [42, 117, 192, 267, 342, 417, 492, 567] as const; // token center-x
const TW = 62, TH = 28, TR = 14;

/* ─── color palette ─── */
const TEAL_BG = "#E1F5EE", TEAL_BD = "#5DCAA5", TEAL_TX = "#085041";
const GRAY_BG = "#F4F4F3", GRAY_BD = "#C4C2BC", GRAY_TX = "#6B6967";
const AMBER = "#EF9F27", RED = "#E24B4A", GREEN = "#1D9E75", GRAY = "#B4B2A9";

/* ─── panel metadata ─── */
const PANELS = [
  { title: "The problem: predict Egypt's capital",           caption: "The model must resolve 'its' back to 'Egypt'" },
  { title: "CNN: a window slides over the text",             caption: "CNN sees only 3 consecutive tokens at a time" },
  { title: "CNN cannot reach back to 'Egypt'",               caption: "'Egypt' is 6 tokens back — outside any short window" },
  { title: "RNN: hidden state carries all history",           caption: "Every new token updates the same state h, left to right" },
  { title: "RNN: Egypt's signal fades before 'its'",         caption: "6 overwrites later — Egypt's memory is ~10%" },
  { title: "Transformer: 'its' attends directly to 'Egypt'", caption: "One parallel pass — full strength, no distance penalty" },
] as const;

/* ─── CSS (aae- scoped to avoid collisions) ─────────────────────────────── */
const STYLES = `
.aae-tok  { transform-box:fill-box; transform-origin:center; animation:aae-tokApp 0.4s ease-out both; }
.aae-fade { animation:aae-fadeIn  0.5s ease-out both; }
.aae-up   { animation:aae-slideUp 0.5s ease-out both; }
.aae-cnn  { animation:aae-cnn    4.2s linear infinite; }
.aae-h    { animation:aae-h      4.0s linear forwards; }

@keyframes aae-tokApp  { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
@keyframes aae-fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes aae-slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

@keyframes aae-cnn {
  0%,14.2%    { transform:translateX(0px);   }
  14.3%,28.5% { transform:translateX(75px);  }
  28.6%,42.8% { transform:translateX(150px); }
  42.9%,57.1% { transform:translateX(225px); }
  57.2%,71.4% { transform:translateX(300px); }
  71.5%,100%  { transform:translateX(375px); }
}

@keyframes aae-h {
  0%         { transform:translateX(0px);   }
  12.5%      { transform:translateX(75px);  }
  25%        { transform:translateX(150px); }
  37.5%      { transform:translateX(225px); }
  50%        { transform:translateX(300px); }
  62.5%      { transform:translateX(375px); }
  75%        { transform:translateX(450px); }
  87.5%,100% { transform:translateX(525px); }
}

@keyframes aae-arcIn {
  from { stroke-dashoffset:600; opacity:0; }
  to   { stroke-dashoffset:0;   opacity:1; }
}
`;

/* ─── reusable token pill ─── */
interface PillProps {
  i: number; ty: number;
  gray?: boolean; dim?: boolean; hl?: boolean;
  animated?: boolean; delay?: number;
}
function Pill({ i, ty, gray, dim, hl, animated, delay = 0 }: PillProps) {
  const fill   = gray ? GRAY_BG : TEAL_BG;
  const stroke = hl   ? AMBER   : gray ? GRAY_BD : TEAL_BD;
  const txt    = gray ? GRAY_TX : TEAL_TX;
  const op     = dim  ? 0.27    : 1;
  return (
    <g
      opacity={animated ? undefined : op}
      className={animated ? "aae-tok" : undefined}
      style={animated ? { animationDelay: `${delay}s` } : undefined}
    >
      <rect
        x={TX[i] - TW / 2} y={ty - TH / 2}
        width={TW} height={TH} rx={TR}
        fill={fill} stroke={stroke} strokeWidth={hl ? 2.5 : 1.5}
      />
      <text
        x={TX[i]} y={ty}
        textAnchor="middle" dominantBaseline="middle"
        fill={txt} fontSize={11} fontFamily="ui-sans-serif,sans-serif" fontWeight={500}
        opacity={animated ? undefined : op}
      >
        {TOKENS[i]}
      </text>
    </g>
  );
}

/* ══════════════════════════════════════════════
   PANEL 0 — The Problem
   Tokens appear → Egypt & "its" glow amber →
   arc "its"→"Egypt" draws in → model outputs
   "The capital of Egypt is Cairo"
══════════════════════════════════════════════ */
function P1() {
  const ty     = 95;                    // token center-y
  const arcY   = ty - TH / 2 - 10;     // = 67, start/end y of the arc
  const ctrlY  = 28;                    // bezier control-point y (peak ~48)
  const midX   = (TX[0] + TX[6]) / 2;  // = 267

  return (
    <svg viewBox="0 0 780 260" width="100%" height="100%">
      <defs>
        {/* Down-pointing chevron (orient="auto" rotates a right arrow 90°) */}
        <marker id="aae-dwn" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <polygon points="0 0,8 3.5,0 7" fill={TEAL_BD} />
        </marker>
      </defs>

      {/* ① Tokens appear one-by-one; Egypt (0) and "its" (6) amber-bordered */}
      {TOKENS.map((_, i) => (
        <Pill key={i} i={i} ty={ty} animated delay={i * 0.45}
          hl={i === 0 || i === 6}
        />
      ))}

      {/* ② Arc: "its" draws back to "Egypt" */}
      <path
        d={`M ${TX[6]} ${arcY} Q ${midX} ${ctrlY} ${TX[0]} ${arcY}`}
        fill="none" stroke={AMBER} strokeWidth={2} strokeDasharray="500"
        style={{ strokeDashoffset: 500, animation: `aae-arcIn 0.9s ease-out 4.8s both` }}
      />
      {/* Arc label */}
      <text
        x={midX} y={ctrlY - 8}
        textAnchor="middle" fill={AMBER}
        fontSize={10.5} fontFamily="ui-sans-serif,sans-serif" fontWeight={600}
        className="aae-fade" style={{ animationDelay: "5.8s" }}
      >
        "its" refers to "Egypt"
      </text>

      {/* ③ Arrow downward → prediction */}
      <line
        x1={360} y1={ty + TH / 2 + 8}
        x2={360} y2={142}
        stroke={TEAL_BD} strokeWidth={2} markerEnd="url(#aae-dwn)"
        className="aae-fade" style={{ animationDelay: "6.2s" }}
      />

      {/* ④ Prediction: "The capital of Egypt is Cairo" */}
      <g className="aae-up" style={{ animationDelay: "6.5s" }}>
        <rect x={200} y={146} width={320} height={36} rx={9}
          fill={TEAL_BG} stroke={TEAL_BD} strokeWidth={1.5} />
        <text x={360} y={164} textAnchor="middle" dominantBaseline="middle"
          fill={TEAL_TX} fontSize={13} fontWeight={600}
          fontFamily="ui-sans-serif,sans-serif">
          The capital of Egypt is Cairo
        </text>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   PANEL 1 — CNN: The Idea
   Gray pills + amber window loops left→right
══════════════════════════════════════════════ */
function P2() {
  const ty = 155;
  const wy = ty - TH / 2 - 8;  // window top-y = 133
  const wh = TH + 16;           // 44
  const ww = 228;               // 3 tokens wide

  return (
    <svg viewBox="0 0 780 260" width="100%" height="100%">
      {/* Gray token row */}
      {TOKENS.map((_, i) => <Pill key={i} i={i} ty={ty} gray />)}

      {/* Sliding amber window */}
      <g className="aae-cnn">
        <rect x={3} y={wy} width={ww} height={wh} rx={6}
          fill="rgba(239,159,39,0.07)" stroke={AMBER} strokeWidth={2.5} />
        <text
          x={3 + ww / 2} y={wy - 10}
          textAnchor="middle" fill={AMBER}
          fontSize={10.5} fontFamily="ui-sans-serif,sans-serif" fontWeight={600}
        >
          3-token window
        </text>
      </g>

      {/* Explainer labels */}
      <text x={TX[0]} y={ty + TH / 2 + 22}
        textAnchor="middle" fill="#6B7280"
        fontSize={10} fontFamily="ui-sans-serif,sans-serif">
        token
      </text>
      <text x={TX[7]} y={ty + TH / 2 + 22}
        textAnchor="middle" fill="#6B7280"
        fontSize={10} fontFamily="ui-sans-serif,sans-serif">
        token
      </text>

      {/* "Window sees only 3 at a time" annotation */}
      <text x={390} y={ty + TH / 2 + 44}
        textAnchor="middle" fill={GRAY}
        fontSize={11} fontFamily="ui-sans-serif,sans-serif">
        Each pass: only 3 tokens visible — window slides one step at a time
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   PANEL 2 — CNN: The Failure
   Window stuck on "What is its" — can't see "Egypt"
══════════════════════════════════════════════ */
function P3() {
  const ty    = 175;
  const wy    = ty - TH / 2 - 8;  // 153
  const wh    = TH + 16;           // 44
  const ww    = 228;
  const wx    = 3 + 300;           // fixed at position 4, x=303 ("What","is","its")
  const lineY = wy - 14;           // 139 — dotted line above window

  return (
    <svg viewBox="0 0 780 260" width="100%" height="100%">
      {/* Tokens: only "What","is","its" visible; rest dimmed */}
      {TOKENS.map((_, i) => (
        <Pill key={i} i={i} ty={ty} gray
          dim={i < 4 || i > 6}
          hl={i >= 4 && i <= 6}
        />
      ))}

      {/* Fixed window on "What is its" */}
      <rect x={wx} y={wy} width={ww} height={wh} rx={6}
        fill="rgba(239,159,39,0.07)" stroke={AMBER} strokeWidth={2.5} />

      {/* Egypt label (dimmed, far left) */}
      <text x={TX[0]} y={ty + TH / 2 + 18}
        textAnchor="middle" fill={GRAY}
        fontSize={10} fontFamily="ui-sans-serif,sans-serif">
        (far back)
      </text>

      {/* Dotted red line: "its" → window left edge */}
      <line
        x1={TX[6]} y1={lineY} x2={wx} y2={lineY}
        className="aae-fade" style={{ animationDelay: "0.4s" }}
        stroke={RED} strokeWidth={2} strokeDasharray="6 4"
      />

      {/* ✗ at window left edge */}
      <g className="aae-fade" style={{ animationDelay: "1.0s" }}>
        <circle cx={wx} cy={lineY} r={13} fill="#FEE2E2" stroke={RED} strokeWidth={1.5} />
        <text x={wx} y={lineY} textAnchor="middle" dominantBaseline="middle"
          fill={RED} fontSize={14} fontWeight={700}>✗</text>
      </g>

      <text x={wx} y={lineY - 20}
        textAnchor="middle" fill={RED}
        fontSize={10.5} fontFamily="ui-sans-serif,sans-serif"
        className="aae-fade" style={{ animationDelay: "1.2s" }}
      >
        out of window reach
      </text>

      {/* Wrong answer */}
      <g className="aae-up" style={{ animationDelay: "1.9s" }}>
        <rect x={258} y={228} width={264} height={26} rx={6}
          fill="#FEE2E2" stroke={RED} strokeWidth={1.5} />
        <text x={390} y={241} textAnchor="middle" dominantBaseline="middle"
          fill={RED} fontSize={12} fontFamily="ui-sans-serif,sans-serif" fontWeight={600}>
          Prediction: Africa ✗ (wrong referent)
        </text>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   PANEL 3 — RNN: The Idea
   h box travels left → right, absorbing each token;
   gradient trail shows fading influence of earlier tokens
══════════════════════════════════════════════ */
function P4() {
  const ty = 200;
  const hy = 112; // h-box center-y
  const hw = 52, hh = 32;

  return (
    <svg viewBox="0 0 780 260" width="100%" height="100%">
      <defs>
        <linearGradient id="aae-trail"
          x1={TX[0]} y1="0" x2={TX[7]} y2="0" gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor={AMBER} stopOpacity={0.06} />
          <stop offset="100%" stopColor={AMBER} stopOpacity={0.90} />
        </linearGradient>
        <marker id="aae-hArr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill={AMBER} />
        </marker>
      </defs>

      {/* Token row */}
      {TOKENS.map((_, i) => <Pill key={i} i={i} ty={ty} />)}

      {/* Gradient trail: Egypt end is very faint, "capital" end is vivid */}
      <line
        x1={TX[0]} y1={hy} x2={TX[7]} y2={hy}
        stroke="url(#aae-trail)" strokeWidth={2} strokeDasharray="6 4"
      />
      <text x={TX[0] + 2} y={hy - 14}
        fill={AMBER} fontSize={10.5} fontFamily="ui-sans-serif,sans-serif" fontWeight={600}>
        memory fades ←
      </text>

      {/* Upward arrows, staggered; opacity fades for earlier tokens */}
      {TOKENS.map((_, i) => (
        <line key={i}
          x1={TX[i]} y1={ty - TH / 2}
          x2={TX[i]} y2={hy + hh / 2}
          stroke={AMBER} strokeWidth={1.5}
          opacity={0.14 + (i / 7) * 0.86}
          markerEnd="url(#aae-hArr)"
          className="aae-fade"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}

      {/* Moving h box */}
      <g className="aae-h">
        <rect x={TX[0] - hw / 2} y={hy - hh / 2} width={hw} height={hh} rx={8}
          fill="#FFF7E8" stroke={AMBER} strokeWidth={2} />
        <text x={TX[0]} y={hy} textAnchor="middle" dominantBaseline="middle"
          fill={AMBER} fontSize={17} fontWeight={700} fontFamily="ui-sans-serif,sans-serif">
          h
        </text>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   PANEL 4 — RNN: The Failure
   h has arrived at "its" (index 6) but Egypt's
   signal in h is nearly gone (~10%)
══════════════════════════════════════════════ */
function P5() {
  const ty  = 185;
  const hy  = 106;
  const hw  = 52, hh = 32;
  const bx  = 50, by = 42, bH = 16, bW = 200;
  const filled = 20; // ~10% of 200px

  return (
    <svg viewBox="0 0 780 260" width="100%" height="100%">
      <defs>
        <marker id="aae-dArr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill={AMBER} />
        </marker>
      </defs>

      {/* Memory bar */}
      <text x={bx} y={by - 7} fill="#6B7280"
        fontSize={11} fontFamily="ui-sans-serif,sans-serif"
        className="aae-fade" style={{ animationDelay: "0.1s" }}
      >
        'Egypt' memory in h
      </text>
      <rect x={bx} y={by} width={bW} height={bH} rx={bH / 2}
        fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={1}
        className="aae-fade" style={{ animationDelay: "0.1s" }}
      />
      {/* Small teal filled portion (10%) */}
      <rect x={bx} y={by} width={filled} height={bH} rx={bH / 2}
        fill={TEAL_BD}
        className="aae-fade" style={{ animationDelay: "0.3s" }}
      />
      <text x={bx + bW + 10} y={by + bH / 2}
        dominantBaseline="middle" fill={RED}
        fontSize={12} fontWeight={700} fontFamily="ui-sans-serif,sans-serif"
        className="aae-fade" style={{ animationDelay: "0.4s" }}
      >
        ~10%
      </text>

      {/* Token row */}
      {TOKENS.map((_, i) => <Pill key={i} i={i} ty={ty} />)}

      {/* h box at "its" (index 6) */}
      <g className="aae-fade" style={{ animationDelay: "0.6s" }}>
        <rect x={TX[6] - hw / 2} y={hy - hh / 2} width={hw} height={hh} rx={8}
          fill="#FFF7E8" stroke={AMBER} strokeWidth={2} />
        <text x={TX[6]} y={hy} textAnchor="middle" dominantBaseline="middle"
          fill={AMBER} fontSize={17} fontWeight={700} fontFamily="ui-sans-serif,sans-serif">
          h
        </text>
      </g>

      {/* Arrow: h → "its" */}
      <line
        x1={TX[6]} y1={hy + hh / 2}
        x2={TX[6]} y2={ty - TH / 2}
        stroke={AMBER} strokeWidth={1.5} markerEnd="url(#aae-dArr)"
        className="aae-fade" style={{ animationDelay: "0.8s" }}
      />

      {/* Wrong answer */}
      <g className="aae-up" style={{ animationDelay: "2.2s" }}>
        <rect x={258} y={228} width={264} height={26} rx={6}
          fill="#FEE2E2" stroke={RED} strokeWidth={1.5} />
        <text x={390} y={241} textAnchor="middle" dominantBaseline="middle"
          fill={RED} fontSize={12} fontFamily="ui-sans-serif,sans-serif" fontWeight={600}>
          Prediction: Africa ✗ (Egypt nearly forgotten)
        </text>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   PANEL 5 — Transformer: Success
   "its" (index 6) fires attention arcs to all
   tokens; thick amber → "Egypt" (index 0)
══════════════════════════════════════════════ */
function P6() {
  const ty    = 205;
  const itI   = 6;          // "its" is the query token
  const HIGH  = new Set([0]); // "Egypt" gets high attention
  const nonIt = [0, 1, 2, 3, 4, 5, 7];

  return (
    <svg viewBox="0 0 780 260" width="100%" height="100%">
      {/* Attention arcs from "its" to every other token */}
      {nonIt.map((i, j) => {
        const high  = HIGH.has(i);
        const mx    = (TX[itI] + TX[i]) / 2;
        const cy    = 58;
        const d     = `M ${TX[itI]} ${ty} Q ${mx} ${cy} ${TX[i]} ${ty}`;
        return (
          <path key={i} d={d} fill="none"
            stroke={high ? AMBER : GRAY}
            strokeWidth={high ? 3.5 : 1.2}
            opacity={high ? 1 : 0.35}
            strokeDasharray={600}
            style={{
              strokeDashoffset: 600,
              animation: `aae-arcIn 0.6s ease-out ${j * 0.3}s both`,
            }}
          />
        );
      })}

      {/* "high attention" label over the Egypt arc */}
      <text
        x={(TX[itI] + TX[0]) / 2} y={82}
        textAnchor="middle" fill={AMBER}
        fontSize={11} fontFamily="ui-sans-serif,sans-serif" fontWeight={600}
        className="aae-fade" style={{ animationDelay: "1.8s" }}
      >
        high attention
      </text>

      {/* Token row — "its" amber-bordered as the query */}
      {TOKENS.map((_, i) => (
        <Pill key={i} i={i} ty={ty} hl={i === itI} />
      ))}

      {/* Correct answer */}
      <g className="aae-up" style={{ animationDelay: "2.5s" }}>
        <rect x={248} y={228} width={284} height={26} rx={6}
          fill="#D1FAE5" stroke={GREEN} strokeWidth={1.5} />
        <text x={390} y={241} textAnchor="middle" dominantBaseline="middle"
          fill={GREEN} fontSize={12} fontFamily="ui-sans-serif,sans-serif" fontWeight={600}>
          The capital of Egypt is Cairo ✓
        </text>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   Props
══════════════════════════════════════════════ */
interface ArchitectureEvolutionAnimatorProps {
  /**
   * 0–5: show only that panel with no navigation (for per-slide MDX use).
   * Omit to show all six panels with Prev / Next controls.
   */
  panel?: number;
}

const PANEL_COMPS = [P1, P2, P3, P4, P5, P6] as const;

/* ══════════════════════════════════════════════
   Main component
══════════════════════════════════════════════ */
export default function ArchitectureEvolutionAnimator({ panel }: ArchitectureEvolutionAnimatorProps = {}) {
  const singleMode = panel !== undefined && panel >= 0 && panel <= 5;
  const [idx, setIdx] = useState(0);
  const [ak, setAk]   = useState(0);

  const activeIdx = singleMode ? (panel as number) : idx;
  const Comp      = PANEL_COMPS[activeIdx];

  const goTo = (n: number) => {
    setIdx(n);
    setAk((k) => k + 1);
  };

  return (
    <div className="relative flex w-full flex-col min-h-[480px] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <style>{STYLES}</style>

      {/* Title */}
      <div className="px-6 pt-5 pb-1 text-center">
        <h3 className="text-xl font-semibold leading-snug text-gray-800 dark:text-gray-100">
          {PANELS[activeIdx].title}
        </h3>
      </div>

      {/* Diagram */}
      <div className="flex flex-1 items-center justify-center px-2 py-2">
        <div className="w-full" style={{ aspectRatio: "780 / 260" }}>
          {/* key={ak} forces CSS animation restart on navigation */}
          <Comp key={singleMode ? "s" : ak} />
        </div>
      </div>

      {/* Caption */}
      <div className="px-6 pb-2 text-center">
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          {PANELS[activeIdx].caption}
        </p>
      </div>

      {/* Navigation — hidden in single-panel mode */}
      {!singleMode && (
        <div className="flex items-center justify-center gap-5 pb-5">
          <button
            onClick={() => goTo(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Back
          </button>
          <span className="w-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {idx + 1} / 6
          </span>
          <button
            onClick={() => goTo(Math.min(5, idx + 1))}
            disabled={idx === 5}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
