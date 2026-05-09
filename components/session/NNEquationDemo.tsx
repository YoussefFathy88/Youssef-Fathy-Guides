"use client";

/* ── colors ── */
const TEAL_BG = "#E1F5EE", TEAL_BD = "#5DCAA5", TEAL_TX = "#085041";
const AMBER_BG = "#FFF7E8", AMBER_BD = "#EF9F27", AMBER_TX = "#7C4A00";
const GRAY_BD = "#D1D5DB", GRAY_BG = "#F4F4F3";
const TEXT = "#6B7280", DARK = "#374151";

function Circle({
  cx, cy, r = 20, label, sub, amber = false, gray = false,
}: {
  cx: number; cy: number; r?: number;
  label: string; sub?: string;
  amber?: boolean; gray?: boolean;
}) {
  const bg = gray ? GRAY_BG : amber ? AMBER_BG : TEAL_BG;
  const bd = gray ? GRAY_BD : amber ? AMBER_BD : TEAL_BD;
  const tx = gray ? "#6B7280" : amber ? AMBER_TX : TEAL_TX;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={bg} stroke={bd} strokeWidth={2} />
      <text
        x={cx} y={sub ? cy - 3 : cy}
        textAnchor="middle" dominantBaseline="middle"
        fill={tx} fontSize={11} fontWeight={700}
        fontFamily="ui-monospace,monospace"
      >
        {label}
      </text>
      {sub && (
        <text
          x={cx} y={cy + 8}
          textAnchor="middle"
          fill={tx} fontSize={8}
          fontFamily="ui-sans-serif,sans-serif"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

/** Left: one neuron y = w·x+b. Right: 2 → (3 → 3) → 1 — same rule at every node. */
export default function NNEquationDemo() {
  const NR = 20;

  /* Inputs */
  const IN = [
    { cx: 354, cy: 82 },
    { cx: 354, cy: 172 },
  ];

  /* Hidden layer 1 — 3 nodes */
  const H1 = [
    { cx: 468, cy: 52 },
    { cx: 468, cy: 127 },
    { cx: 468, cy: 202 },
  ];

  /* Hidden layer 2 — 3 nodes */
  const H2 = [
    { cx: 582, cy: 52 },
    { cx: 582, cy: 127 },
    { cx: 582, cy: 202 },
  ];

  const OUT = { cx: 696, cy: 127 };

  function edges(
    from: { cx: number; cy: number }[],
    to: { cx: number; cy: number }[],
    key: string,
  ) {
    return from.flatMap((a, i) =>
      to.map((b, j) => (
        <line
          key={`${key}-${i}-${j}`}
          x1={a.cx + NR}
          y1={a.cy}
          x2={b.cx - NR}
          y2={b.cy}
          stroke={TEAL_BD}
          strokeWidth={1}
          opacity={0.38}
        />
      )),
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      style={{ aspectRatio: "780 / 252" }}
    >
      <svg viewBox="0 0 780 252" width="100%" height="100%">
        <defs>
          <marker id="neq-teal" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={TEAL_BD} />
          </marker>
        </defs>

        {/* LEFT — single neuron */}
        <text x={148} y={14} textAnchor="middle"
          fill={DARK} fontSize={12} fontWeight={700}
          fontFamily="ui-sans-serif,sans-serif">
          One neuron
        </text>

        <Circle cx={52} cy={118} r={18} label="4" sub="x" />

        <line x1={72} y1={118} x2={102} y2={118}
          stroke={TEAL_BD} strokeWidth={1.8} markerEnd="url(#neq-teal)" />
        <text x={87} y={107} textAnchor="middle"
          fill={AMBER_BD} fontSize={9} fontWeight={600}
          fontFamily="ui-sans-serif,sans-serif">
          w=2
        </text>

        <Circle cx={124} cy={118} r={18} label="⊕" />

        <rect x={101} y={143} width={46} height={17} rx={5}
          fill={AMBER_BG} stroke={AMBER_BD} strokeWidth={1} />
        <text x={124} y={153} textAnchor="middle" dominantBaseline="middle"
          fill={AMBER_TX} fontSize={9} fontWeight={600}
          fontFamily="ui-sans-serif,sans-serif">
          + b = 1
        </text>

        <line x1={147} y1={118} x2={176} y2={118}
          stroke={TEAL_BD} strokeWidth={1.8} markerEnd="url(#neq-teal)" />

        <Circle cx={198} cy={118} r={18} label="9" sub="y" amber />

        <rect x={48} y={182} width={174} height={38} rx={7}
          fill={GRAY_BG} stroke={GRAY_BD} strokeWidth={1} />
        <text x={135} y={196} textAnchor="middle" dominantBaseline="middle"
          fill={DARK} fontSize={11} fontWeight={700}
          fontFamily="ui-monospace,monospace">
          y = 2 × 4 + 1 = 9
        </text>
        <text x={135} y={212} textAnchor="middle"
          fill={TEXT} fontSize={9.5}
          fontFamily="ui-sans-serif,sans-serif">
          w · x + b
        </text>

        <text x={272} y={108} textAnchor="middle"
          fill={TEXT} fontSize={9}
          fontFamily="ui-sans-serif,sans-serif">
          stack layers →
        </text>

        <line x1={302} y1={8} x2={302} y2={244}
          stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4 3" />

        {/* RIGHT — 2 → 3 → 3 → 1 */}
        <text x={542} y={14} textAnchor="middle"
          fill={DARK} fontSize={12} fontWeight={700}
          fontFamily="ui-sans-serif,sans-serif">
          Two hidden layers (3 nodes each)
        </text>

        <text x={354} y={30} textAnchor="middle" fill={TEXT} fontSize={8.5}
          fontFamily="ui-sans-serif,sans-serif">Input</text>
        <text x={468} y={30} textAnchor="middle" fill={TEXT} fontSize={8.5}
          fontFamily="ui-sans-serif,sans-serif">Hidden 1</text>
        <text x={582} y={30} textAnchor="middle" fill={TEXT} fontSize={8.5}
          fontFamily="ui-sans-serif,sans-serif">Hidden 2</text>
        <text x={696} y={30} textAnchor="middle" fill={TEXT} fontSize={8.5}
          fontFamily="ui-sans-serif,sans-serif">Output</text>

        {edges(IN, H1, "i-h1")}
        {edges(H1, H2, "h1-h2")}
        {edges(H2, [OUT], "h2-o")}

        <Circle cx={IN[0].cx} cy={IN[0].cy} r={NR} label="4" sub="x₁" />
        <Circle cx={IN[1].cx} cy={IN[1].cy} r={NR} label="2" sub="x₂" />

        <Circle cx={H1[0].cx} cy={H1[0].cy} r={NR} label="0.7" />
        <Circle cx={H1[1].cx} cy={H1[1].cy} r={NR} label="0.4" />
        <Circle cx={H1[2].cx} cy={H1[2].cy} r={NR} label="0.9" />

        <Circle cx={H2[0].cx} cy={H2[0].cy} r={NR} label="0.3" />
        <Circle cx={H2[1].cx} cy={H2[1].cy} r={NR} label="0.6" />
        <Circle cx={H2[2].cx} cy={H2[2].cy} r={NR} label="0.5" />

        <Circle cx={OUT.cx} cy={OUT.cy} r={22} label="0.82" sub="ŷ" amber />
      </svg>
    </div>
  );
}
