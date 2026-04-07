"use client";

export interface AgentFigureProps {
  activeModule: string | null;
  onPartClick: (moduleId: string) => void;
}

const REGIONS = [
  { id: "brain",   color: "#00E5FF", delay: "0s"   },
  { id: "senses",  color: "#FFB300", delay: "0.4s" },
  { id: "voice",   color: "#38BDF8", delay: "0.8s" },
  { id: "heart",   color: "#F43F5E", delay: "1.2s" },
  { id: "memory",  color: "#7C3AED", delay: "1.6s" },
  { id: "hands",   color: "#10B981", delay: "2.0s" },
  { id: "nervous", color: "#F97316", delay: "2.4s" },
] as const;

function regionColor(id: string): string {
  return REGIONS.find((r) => r.id === id)?.color ?? "#ffffff";
}

function regionDelay(id: string): string {
  return REGIONS.find((r) => r.id === id)?.delay ?? "0s";
}

interface RegionGroupProps {
  id: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function RegionGroup({ id, isActive, onClick, children }: RegionGroupProps) {
  const color = regionColor(id);
  const delay = regionDelay(id);

  return (
    <g
      onClick={onClick}
      style={{
        cursor: "pointer",
        animation: `anatomy-pulse 2.4s ease-in-out ${delay} infinite`,
        filter: isActive
          ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px ${color}80)`
          : `drop-shadow(0 0 3px ${color}80)`,
      }}
      role="button"
      aria-label={id}
    >
      {children}
    </g>
  );
}

export function AgentFigure({ activeModule, onPartClick }: AgentFigureProps) {
  function handleClick(id: string) {
    return () => onPartClick(id);
  }

  function fillStyle(id: string, base?: string): React.CSSProperties {
    const color = regionColor(id);
    const active = activeModule === id;
    return {
      fill: active ? `${color}40` : base ?? `${color}14`,
      stroke: color,
      strokeWidth: active ? 1.8 : 1.2,
      transition: "fill 0.2s ease, stroke-width 0.2s ease",
    };
  }

  function passiveStyle(): React.CSSProperties {
    return {
      fill: "rgba(15,27,50,0.6)",
      stroke: "rgba(148,163,184,0.15)",
      strokeWidth: 1,
    };
  }

  // Fix 3: legs use a faint cyan stroke to tie them to the glowing body
  function legStyle(): React.CSSProperties {
    return {
      fill: "rgba(15,27,50,0.6)",
      stroke: "#00E5FF4D",
      strokeWidth: 1,
    };
  }

  return (
    <svg
      viewBox="0 0 200 500"
      width="100%"
      style={{ maxWidth: 420, display: "block" }}
      aria-label="Agent anatomy figure"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="rgba(148,163,184,0.18)" />
        </pattern>
        <pattern id="scanlines" x="0" y="0" width="2" height="4" patternUnits="userSpaceOnUse">
          <rect width="2" height="1" fill="rgba(0,0,0,0.1)" />
        </pattern>
        {REGIONS.map(({ id, color }) => (
          <filter key={id} id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={color} floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {/* Static background */}
      <rect width="200" height="500" fill="#050B18" rx="12" />
      <rect width="200" height="500" fill="url(#dot-grid)" rx="12" opacity="0.7" />
      <rect width="200" height="500" fill="url(#scanlines)" rx="12" opacity="0.25" />

      {/* ── BOBBING FIGURE WRAPPER ── */}
      <g style={{ animation: "gentleBob 3.5s ease-in-out infinite" }}>

        {/* ── STRUCTURAL: Neck ── */}
        <rect x="89" y="90" width="22" height="20" rx="4" style={passiveStyle()} />

        {/* ── STRUCTURAL: Torso base ── */}
        <rect x="66" y="108" width="68" height="180" rx="12" style={passiveStyle()} />

        {/* ── STRUCTURAL: Hip ── */}
        <path d="M 66 280 Q 66 302 75 302 L 125 302 Q 134 302 134 280 Z" style={passiveStyle()} />

        {/* ── STRUCTURAL: Legs — Fix 3: faint cyan stroke ── */}
        <rect x="74"  y="300" width="23" height="154" rx="8" style={legStyle()} />
        <rect x="103" y="300" width="23" height="154" rx="8" style={legStyle()} />
        {/* Knee details */}
        <rect x="74"  y="372" width="23" height="7" rx="3" style={{ ...legStyle(), fill: "rgba(148,163,184,0.06)" }} />
        <rect x="103" y="372" width="23" height="7" rx="3" style={{ ...legStyle(), fill: "rgba(148,163,184,0.06)" }} />
        {/* Feet */}
        <ellipse cx="85"  cy="458" rx="14" ry="8" style={legStyle()} />
        <ellipse cx="116" cy="458" rx="14" ry="8" style={legStyle()} />
        {/* Leg circuit traces */}
        <line x1="85"  y1="308" x2="85"  y2="362" stroke="rgba(148,163,184,0.1)" strokeWidth="0.5" strokeDasharray="3,3" />
        <line x1="115" y1="308" x2="115" y2="362" stroke="rgba(148,163,184,0.1)" strokeWidth="0.5" strokeDasharray="3,3" />

        {/* ── HANDS (both arms — clickable) ── */}
        <RegionGroup id="hands" isActive={activeModule === "hands"} onClick={handleClick("hands")}>
          {/* Left arm — rotated outward 12° from left shoulder (65, 112) */}
          <g transform="rotate(12 65 112)">
            <rect x="53" y="109" width="24" height="156" rx="10" style={fillStyle("hands")} />
            <ellipse cx="65" cy="273" rx="13" ry="9" style={fillStyle("hands")} />
            <line x1="57" y1="279" x2="55" y2="289" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="63" y1="281" x2="62" y2="291" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="68" y1="281" x2="68" y2="291" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="73" y1="279" x2="75" y2="288" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="65" y1="120" x2="65" y2="262" stroke={regionColor("hands")} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.35" />
            <circle cx="65" cy="175" r="2" fill={regionColor("hands")} opacity="0.5" />
            <circle cx="65" cy="220" r="2" fill={regionColor("hands")} opacity="0.5" />
          </g>

          {/* Right arm — rotated outward 12° from right shoulder (135, 112) */}
          <g transform="rotate(-12 135 112)">
            <rect x="123" y="109" width="24" height="156" rx="10" style={fillStyle("hands")} />
            <ellipse cx="135" cy="273" rx="13" ry="9" style={fillStyle("hands")} />
            <line x1="127" y1="279" x2="125" y2="289" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="133" y1="281" x2="132" y2="291" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="138" y1="281" x2="138" y2="291" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="143" y1="279" x2="145" y2="288" stroke={regionColor("hands")} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="135" y1="120" x2="135" y2="262" stroke={regionColor("hands")} strokeWidth="0.5" strokeDasharray="4,3" opacity="0.35" />
            <circle cx="135" cy="175" r="2" fill={regionColor("hands")} opacity="0.5" />
            <circle cx="135" cy="220" r="2" fill={regionColor("hands")} opacity="0.5" />
          </g>
        </RegionGroup>

        {/* ── STRUCTURAL: Shoulder joints ── */}
        <circle cx="65"  cy="112" r="9" style={{ ...passiveStyle(), fill: "rgba(148,163,184,0.07)" }} />
        <circle cx="135" cy="112" r="9" style={{ ...passiveStyle(), fill: "rgba(148,163,184,0.07)" }} />

        {/* ── Fix 7: MEMORY with chest breathing ── */}
        <g className="chest-breathe-memory">
          <RegionGroup id="memory" isActive={activeModule === "memory"} onClick={handleClick("memory")}>
            <rect x="70" y="116" width="28" height="56" rx="8" style={fillStyle("memory")} />
            <rect x="75" y="122" width="18" height="13" rx="2" style={{ fill: `${regionColor("memory")}28`, stroke: regionColor("memory"), strokeWidth: 0.8 }} />
            <line x1="75" y1="129" x2="70" y2="129" stroke={regionColor("memory")} strokeWidth="0.8" opacity="0.55" />
            <line x1="93" y1="129" x2="98" y2="129" stroke={regionColor("memory")} strokeWidth="0.8" opacity="0.55" />
            <circle cx="76" cy="142" r="1.5" fill={regionColor("memory")} opacity="0.7" />
            <circle cx="82" cy="142" r="1.5" fill={regionColor("memory")} opacity="0.7" />
            <circle cx="88" cy="142" r="1.5" fill={regionColor("memory")} opacity="0.7" />
            <circle cx="76" cy="148" r="1.5" fill={regionColor("memory")} opacity="0.45" />
            <circle cx="82" cy="148" r="1.5" fill={regionColor("memory")} opacity="0.45" />
            <circle cx="88" cy="148" r="1.5" fill={regionColor("memory")} opacity="0.28" />
          </RegionGroup>
        </g>

        {/* ── Fix 7: HEART with chest breathing ── */}
        <g className="chest-breathe-heart">
          <RegionGroup id="heart" isActive={activeModule === "heart"} onClick={handleClick("heart")}>
            <rect x="102" y="116" width="28" height="56" rx="8" style={fillStyle("heart")} />
            <circle cx="116" cy="132" r="9"   style={{ fill: `${regionColor("heart")}18`, stroke: regionColor("heart"), strokeWidth: 1 }} />
            <circle cx="116" cy="132" r="4.5" style={{ fill: `${regionColor("heart")}38`, stroke: regionColor("heart"), strokeWidth: 0.8 }} />
            <polyline
              points="104,144 108,144 110,138 112,150 114,133 116,148 118,140 120,144 128,144"
              fill="none"
              stroke={regionColor("heart")}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </RegionGroup>
        </g>

        {/* ── NERVOUS SYSTEM (spine) ── */}
        <RegionGroup id="nervous" isActive={activeModule === "nervous"} onClick={handleClick("nervous")}>
          <rect x="93" y="176" width="14" height="100" rx="4" style={fillStyle("nervous")} />
          {[186, 202, 218, 234, 250, 262].map((y) => (
            <g key={y}>
              <rect x="90" y={y} width="20" height="6" rx="2" style={{ fill: `${regionColor("nervous")}28`, stroke: regionColor("nervous"), strokeWidth: 0.6 }} />
              <line x1="83" y1={y + 3} x2="90" y2={y + 3} stroke={regionColor("nervous")} strokeWidth="0.6" opacity="0.45" />
              <line x1="110" y1={y + 3} x2="117" y2={y + 3} stroke={regionColor("nervous")} strokeWidth="0.6" opacity="0.45" />
            </g>
          ))}
          {/* Sequential spine glow — top-to-bottom electric pulse, no moving elements */}
          {(
            [
              { y1: 180, y2: 185, d: 0    },
              { y1: 193, y2: 201, d: 0.33 },
              { y1: 209, y2: 217, d: 0.67 },
              { y1: 225, y2: 233, d: 1.0  },
              { y1: 241, y2: 249, d: 1.33 },
              { y1: 268, y2: 272, d: 1.67 },
            ] as const
          ).map(({ y1, y2, d }) => (
            <line
              key={y1}
              x1="100" y1={y1} x2="100" y2={y2}
              stroke={regionColor("nervous")}
              strokeWidth="1.4"
              strokeLinecap="round"
              style={{ animation: `spineGlow 2s ease-in-out ${d}s infinite` }}
            />
          ))}
        </RegionGroup>


        {/* ── BRAIN (head shell) ── */}
        <RegionGroup id="brain" isActive={activeModule === "brain"} onClick={handleClick("brain")}>
          <ellipse cx="100" cy="50" rx="30" ry="42" style={fillStyle("brain")} />
          <line x1="82" y1="22" x2="118" y2="22" stroke={regionColor("brain")} strokeWidth="0.5" opacity="0.35" />
          <line x1="78" y1="33" x2="122" y2="33" stroke={regionColor("brain")} strokeWidth="0.5" opacity="0.35" />
          <line x1="100" y1="10" x2="100" y2="44" stroke={regionColor("brain")} strokeWidth="0.5" opacity="0.35" />
          <line x1="84" y1="12" x2="84" y2="42" stroke={regionColor("brain")} strokeWidth="0.35" opacity="0.22" />
          <line x1="116" y1="12" x2="116" y2="42" stroke={regionColor("brain")} strokeWidth="0.35" opacity="0.22" />
          <circle cx="84"  cy="22" r="1.6" fill={regionColor("brain")} opacity="0.65" />
          <circle cx="100" cy="22" r="1.6" fill={regionColor("brain")} opacity="0.65" />
          <circle cx="116" cy="22" r="1.6" fill={regionColor("brain")} opacity="0.65" />
          <circle cx="100" cy="38" r="3.5" style={{ fill: `${regionColor("brain")}45`, stroke: regionColor("brain"), strokeWidth: 0.9 }} />
          {/* Fix 3: faint neural pathway curves — texture, not decoration */}
          <path d="M 82,26 C 86,36 90,46 87,58"  fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeLinecap="round" opacity="0.2" />
          <path d="M 118,26 C 114,36 110,46 113,58" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeLinecap="round" opacity="0.2" />
          <path d="M 91,18 C 100,30 107,42 104,56"  fill="none" stroke="#00E5FF" strokeWidth="0.5" strokeLinecap="round" opacity="0.18" />
        </RegionGroup>

        {/* Fix 4: Soft amber sensory-zone ring — hints that eyes are a separate system from the brain */}
        <ellipse
          cx="100" cy="55" rx="20" ry="11"
          fill="none"
          stroke="#FFB300"
          strokeWidth="0.8"
          strokeDasharray="2,4"
          opacity="0.25"
          style={{ pointerEvents: "none" }}
        />

        {/* ── SENSES (ears + eyes — both clickable, both open Senses panel) ── */}
        <RegionGroup id="senses" isActive={activeModule === "senses"} onClick={handleClick("senses")}>
          {/* Left ear */}
          <path
            d="M 70 49 Q 67 49 67 54 Q 67 59 70 59 L 71 57 Q 68 54 70 51 Z"
            style={{
              fill: activeModule === "senses" ? `${regionColor("senses")}40` : `${regionColor("senses")}14`,
              stroke: regionColor("senses"),
              strokeWidth: 0.8,
              opacity: 0.5,
            }}
          />
          {/* Right ear */}
          <path
            d="M 130 49 Q 133 49 133 54 Q 133 59 130 59 L 129 57 Q 132 54 130 51 Z"
            style={{
              fill: activeModule === "senses" ? `${regionColor("senses")}40` : `${regionColor("senses")}14`,
              stroke: regionColor("senses"),
              strokeWidth: 0.8,
              opacity: 0.5,
            }}
          />
          {/* Left eye — outer ring with blink */}
          <circle
            cx="87" cy="55" r="6"
            className="eye-blink"
            style={{ fill: `${regionColor("senses")}28`, stroke: regionColor("senses"), strokeWidth: 1.2 }}
          />
          {/* Left eye inner — Fix 6: eyeGlow */}
          <circle
            cx="87" cy="55" r="3.2"
            style={{
              fill: `${regionColor("senses")}60`,
              stroke: regionColor("senses"),
              strokeWidth: 0.6,
              animation: "eyeGlow 3s ease-in-out 0s infinite",
            }}
          />
          {/* Left eye sparkle */}
          <circle cx="89" cy="53" r="1.2" fill="white" opacity="0.85" />

          {/* Right eye — outer ring with blink (offset) */}
          <circle
            cx="113" cy="55" r="6"
            className="eye-blink-delayed"
            style={{ fill: `${regionColor("senses")}28`, stroke: regionColor("senses"), strokeWidth: 1.2 }}
          />
          {/* Right eye inner — Fix 6: eyeGlow, delay 0.8s */}
          <circle
            cx="113" cy="55" r="3.2"
            style={{
              fill: `${regionColor("senses")}60`,
              stroke: regionColor("senses"),
              strokeWidth: 0.6,
              animation: "eyeGlow 3s ease-in-out 0.8s infinite",
            }}
          />
          {/* Right eye sparkle */}
          <circle cx="115" cy="53" r="1.2" fill="white" opacity="0.85" />
        </RegionGroup>

        {/* ── CHEEKS (structural — pulse with heart color) ── */}
        <circle
          cx="79" cy="68" r="7"
          fill="#F43F5E26"
          style={{ animation: "anatomy-pulse 3.2s ease-in-out 0.6s infinite" }}
        />
        <circle
          cx="121" cy="68" r="7"
          fill="#F43F5E26"
          style={{ animation: "anatomy-pulse 3.2s ease-in-out 1.4s infinite" }}
        />

        {/* ── VOICE (mouth — smile arc) ── */}
        <RegionGroup id="voice" isActive={activeModule === "voice"} onClick={handleClick("voice")}>
          <path
            d="M 87,72 Q 100,84 113,72"
            fill="none"
            stroke={regionColor("voice")}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="79"  cy="72" r="2"   fill={regionColor("voice")} opacity="0.55" />
          <circle cx="75"  cy="72" r="1.2" fill={regionColor("voice")} opacity="0.3"  />
          <circle cx="121" cy="72" r="2"   fill={regionColor("voice")} opacity="0.55" />
          <circle cx="125" cy="72" r="1.2" fill={regionColor("voice")} opacity="0.3"  />
        </RegionGroup>

        {/* Fix 2: all text labels removed */}

        {/* ── Fix 9: BRAIN SCAN LINE — sweeps head every 9.2s ── */}
        <rect
          x="70" y="8" width="60" height="2" rx="1"
          fill="#00E5FF"
          opacity="0"
          style={{ animation: "brainScan 9.2s ease-in-out 0s infinite", pointerEvents: "none" }}
        />

      </g>{/* end gentleBob wrapper */}
    </svg>
  );
}
