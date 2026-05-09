"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeColor = "violet" | "teal" | "amber" | "blue" | "rose" | "gray";
export type NodeShape = "circle" | "rect" | "hex" | "none";
export type NodeSize = "sm" | "md" | "lg";
export type NodeFlowLayout =
  | "horizontal-flow"
  | "vertical-stack"
  | "split-lanes"
  | "hub-spoke"
  | "freeform";
export type NodeFlowViewport = "presentation" | "page" | "responsive";
export type NodeFlowDensity = "comfortable" | "compact";

export interface FlowNode {
  id: string;
  label: string;
  /** Optional detail for authors; not drawn on the diagram or step chips (title + emoji only). */
  sublabel?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  shape?: NodeShape; // default: "rect"
  size?: NodeSize; // default: "md"
  color?: NodeColor; // default: "gray"
  icon?: string; // e.g. "/icons/llm.svg"
  emoji?: string; // fallback if no icon
  anchor?: "top" | "right" | "bottom" | "left" | "center";
  priority?: number;
  lane?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  /** @deprecated Ignored at render time; kept so existing MDX props still type-check. */
  stepNumber?: number;
  animated?: boolean; // default: true
  dashed?: boolean;
  bidirectional?: boolean;
  noArrow?: boolean; // suppress arrowhead (routing / waypoint segments)
  color?: NodeColor;
}

export interface NodeGroup {
  id: string;
  label: string;
  nodeIds: string[];
  color?: NodeColor;
}

export interface DiagramStep {
  id: string;
  label: string;
  description: string;
  highlightNodes: string[];
  highlightEdges: string[]; // "from→to" format
}

export interface NodeFlowDiagramProps {
  diagramId?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  groups?: NodeGroup[];
  steps?: DiagramStep[];
  title?: string;
  height?: number;
  layout?: NodeFlowLayout;
  viewport?: NodeFlowViewport;
  density?: NodeFlowDensity;
  /** When true, hides the step label/description panel under the controls (diagram + playback only). */
  hideStepNarrative?: boolean;
}

// ─── Color tokens ─────────────────────────────────────────────────────────────

const COLOR = {
  violet: {
    dot: "#a78bfa",
    fill: "rgba(139,92,246,0.2)",
    stroke: "rgba(139,92,246,0.6)",
    text: "#ddd6fe",
    groupBg: "rgba(139,92,246,0.1)",
    groupStroke: "rgba(139,92,246,0.3)",
    groupText: "#c4b5fd",
    glow: "rgba(139,92,246,0.8)",
  },
  teal: {
    dot: "#2dd4bf",
    fill: "rgba(20,184,166,0.2)",
    stroke: "rgba(20,184,166,0.6)",
    text: "#99f6e4",
    groupBg: "rgba(20,184,166,0.1)",
    groupStroke: "rgba(20,184,166,0.3)",
    groupText: "#5eead4",
    glow: "rgba(20,184,166,0.8)",
  },
  amber: {
    dot: "#fbbf24",
    fill: "rgba(245,158,11,0.2)",
    stroke: "rgba(245,158,11,0.6)",
    text: "#fde68a",
    groupBg: "rgba(245,158,11,0.1)",
    groupStroke: "rgba(245,158,11,0.3)",
    groupText: "#fcd34d",
    glow: "rgba(245,158,11,0.8)",
  },
  blue: {
    dot: "#60a5fa",
    fill: "rgba(96,165,250,0.2)",
    stroke: "rgba(96,165,250,0.6)",
    text: "#bfdbfe",
    groupBg: "rgba(96,165,250,0.1)",
    groupStroke: "rgba(96,165,250,0.3)",
    groupText: "#93c5fd",
    glow: "rgba(96,165,250,0.8)",
  },
  rose: {
    dot: "#fb7185",
    fill: "rgba(244,63,94,0.2)",
    stroke: "rgba(244,63,94,0.6)",
    text: "#fecdd3",
    groupBg: "rgba(244,63,94,0.1)",
    groupStroke: "rgba(244,63,94,0.3)",
    groupText: "#fda4af",
    glow: "rgba(244,63,94,0.8)",
  },
  gray: {
    dot: "#cbd5e1",
    fill: "rgba(148,163,184,0.15)",
    stroke: "rgba(148,163,184,0.5)",
    text: "#f8fafc",
    groupBg: "rgba(148,163,184,0.1)",
    groupStroke: "rgba(148,163,184,0.3)",
    groupText: "#cbd5e1",
    glow: "rgba(148,163,184,0.6)",
  },
} as const satisfies Record<NodeColor, object>;

// ─── Node size constants ───────────────────────────────────────────────────────

const SIZE = {
  sm: { r: 42, w: 164, h: 78, fontSize: 20, subSize: 15 },
  md: { r: 58, w: 216, h: 96, fontSize: 23, subSize: 17 },
  lg: { r: 78, w: 272, h: 118, fontSize: 26, subSize: 19 },
} as const;

// ─── Geometry helpers ─────────────────────────────────────────────────────────

type Point = { x: number; y: number };

const PADDING_X = 80;
const PADDING_Y = 56;
const GEOMETRY_EPSILON = 1e-6;

function toPxX(pct: number, width: number): number {
  return PADDING_X + (pct / 100) * (width - PADDING_X * 2);
}

function toPxY(pct: number, height: number): number {
  return PADDING_Y + (pct / 100) * (height - PADDING_Y * 2);
}

function getHexVertices(cx: number, cy: number, r: number): Point[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
}

function hexPath(cx: number, cy: number, r: number): string {
  const pts = getHexVertices(cx, cy, r).map(
    (point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`,
  );
  return `M ${pts.join(" L ")} Z`;
}

function normalizeDirection(dx: number, dy: number): Point {
  const length = Math.hypot(dx, dy);
  if (length < GEOMETRY_EPSILON) {
    return { x: 1, y: 0 };
  }

  return { x: dx / length, y: dy / length };
}

function intersectRayWithSegment(origin: Point, direction: Point, start: Point, end: Point) {
  const edge = {
    x: end.x - start.x,
    y: end.y - start.y,
  };
  const denominator = direction.x * edge.y - direction.y * edge.x;

  if (Math.abs(denominator) < GEOMETRY_EPSILON) {
    return null;
  }

  const startDelta = {
    x: start.x - origin.x,
    y: start.y - origin.y,
  };
  const t = (startDelta.x * edge.y - startDelta.y * edge.x) / denominator;
  const u = (startDelta.x * direction.y - startDelta.y * direction.x) / denominator;

  if (t <= GEOMETRY_EPSILON || u < -GEOMETRY_EPSILON || u > 1 + GEOMETRY_EPSILON) {
    return null;
  }

  return {
    point: {
      x: origin.x + direction.x * t,
      y: origin.y + direction.y * t,
    },
    distance: t,
  };
}

function getHexDockPoint(center: Point, r: number, toward: Point) {
  const direction = normalizeDirection(toward.x - center.x, toward.y - center.y);
  const vertices = getHexVertices(center.x, center.y, r);
  let best:
    | {
        point: Point;
        normal: Point;
        distance: number;
      }
    | null = null;

  vertices.forEach((start, index) => {
    const end = vertices[(index + 1) % vertices.length];
    const hit = intersectRayWithSegment(center, direction, start, end);
    if (!hit || (best && hit.distance >= best.distance)) return;

    const midpoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };

    best = {
      point: hit.point,
      normal: normalizeDirection(midpoint.x - center.x, midpoint.y - center.y),
      distance: hit.distance,
    };
  });

  return (
    best ?? {
      point: {
        x: center.x + direction.x * r,
        y: center.y + direction.y * r,
      },
      normal: direction,
    }
  );
}

function getRectDockPoint(center: Point, width: number, height: number, toward: Point) {
  const direction = normalizeDirection(toward.x - center.x, toward.y - center.y);
  const halfW = width / 2;
  const halfH = height / 2;
  const tx = Math.abs(direction.x) < GEOMETRY_EPSILON ? Number.POSITIVE_INFINITY : halfW / Math.abs(direction.x);
  const ty = Math.abs(direction.y) < GEOMETRY_EPSILON ? Number.POSITIVE_INFINITY : halfH / Math.abs(direction.y);
  const distance = Math.min(tx, ty);

  if (tx < ty) {
    return {
      point: {
        x: center.x + direction.x * distance,
        y: center.y + direction.y * distance,
      },
      normal: { x: Math.sign(direction.x) || 1, y: 0 },
    };
  }

  return {
    point: {
      x: center.x + direction.x * distance,
      y: center.y + direction.y * distance,
    },
    normal: { x: 0, y: Math.sign(direction.y) || 1 },
  };
}

function getNodeDockPoint(node: FlowNode & { px: number; py: number }, toward: Point) {
  const s = SIZE[node.size ?? "md"];
  const center = { x: node.px, y: node.py };

  if (node.shape === "none") {
    const direction = normalizeDirection(toward.x - center.x, toward.y - center.y);
    return { point: center, normal: direction };
  }

  if (node.shape === "circle") {
    const direction = normalizeDirection(toward.x - center.x, toward.y - center.y);
    return {
      point: {
        x: center.x + direction.x * s.r,
        y: center.y + direction.y * s.r,
      },
      normal: direction,
    };
  }

  if (node.shape === "hex") {
    return getHexDockPoint(center, s.r, toward);
  }

  return getRectDockPoint(center, s.w, s.h, toward);
}

function getBezierPoints(from: Point, to: Point, fromNormal?: Point, toNormal?: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (fromNormal && toNormal) {
    const handleLength = Math.min(160, Math.max(48, Math.hypot(dx, dy) * 0.45));
    const travelDirection = normalizeDirection(dx, dy);
    return {
      p0: from,
      p1: {
        x: from.x + fromNormal.x * handleLength,
        y: from.y + fromNormal.y * handleLength,
      },
      p2: {
        x: to.x - travelDirection.x * handleLength,
        y: to.y - travelDirection.y * handleLength,
      },
      p3: to,
    };
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    const midX = (from.x + to.x) / 2;
    return { p0: from, p1: { x: midX, y: from.y }, p2: { x: midX, y: to.y }, p3: to };
  } else {
    const midY = (from.y + to.y) / 2;
    return { p0: from, p1: { x: from.x, y: midY }, p2: { x: to.x, y: midY }, p3: to };
  }
}

type BezierPoints = ReturnType<typeof getBezierPoints>;

function getBezierPath({ p0, p1, p2, p3 }: BezierPoints): string {
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
}

function getPointOnBezier(t: number, { p0, p1, p2, p3 }: BezierPoints): Point {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

// ─── Edge particle ────────────────────────────────────────────────────────────

function EdgeParticle({
  points,
  color,
  delay = 0,
  dimmed,
}: {
  points: BezierPoints;
  color: string;
  delay?: number;
  dimmed: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const cx = useMotionValue(points.p0.x);
  const cy = useMotionValue(points.p0.y);

  useAnimationFrame((time) => {
    if (reducedMotion) return;
    const progress = ((time / 2400) + delay) % 1;
    const pt = getPointOnBezier(progress, points);
    cx.set(pt.x);
    cy.set(pt.y);
  });

  if (reducedMotion) return null;

  return (
    <motion.circle
      r={5}
      cx={cx}
      cy={cy}
      fill={color}
      initial={{ opacity: 0.85 }}
      animate={{ opacity: dimmed ? 0.1 : 0.85 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    />
  );
}

// ─── Node shape components ────────────────────────────────────────────────────

interface NodeProps {
  node: FlowNode;
  cx: number;
  cy: number;
  dimmed: boolean;
  highlighted: boolean;
}

function CircleNode({ node, cx, cy, dimmed, highlighted }: NodeProps) {
  const c = COLOR[node.color ?? "gray"];
  const s = SIZE[node.size ?? "md"];
  const r = s.r;
  const glowId = `glow-${node.id}`;

  return (
    <motion.g
      initial={{ opacity: 1 }}
      animate={{ opacity: dimmed ? 0.2 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <clipPath id={`clip-${node.id}`}>
          <circle cx={cx} cy={cy - 6} r={r * 0.5} />
        </clipPath>
      </defs>
      <motion.circle
        cx={cx}
        cy={node.icon || node.emoji ? cy + r * 0.35 : cy}
        r={r}
        fill={c.fill}
        stroke={highlighted ? c.dot : c.stroke}
        strokeWidth={highlighted ? 3 : 2}
        animate={highlighted ? { filter: `drop-shadow(0 0 8px ${c.glow})` } : { filter: "none" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
      {node.icon ? (
        <image
          href={node.icon}
          x={cx - r * 0.5}
          y={cy - r * 0.8}
          width={r}
          height={r}
          clipPath={`url(#clip-${node.id})`}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : node.emoji ? (
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={r * 0.65}
        >
          {node.emoji}
        </text>
      ) : null}
      <text
        x={cx}
        y={node.icon || node.emoji ? cy + r * 0.35 : cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={s.fontSize}
        fontWeight="600"
        fill={c.text}
      >
        {node.label}
      </text>
      
    </motion.g>
  );
}

function RectNode({ node, cx, cy, dimmed, highlighted }: NodeProps) {
  const c = COLOR[node.color ?? "gray"];
  const s = SIZE[node.size ?? "md"];
  const w = s.w;
  const h = s.h;
  const rx = 10;
  const hasEmoji = !!node.emoji;

  /** Emoji above title only — no sublabel on canvas (avoids cramped IO-style blocks). */
  const emojiY = cy - h * 0.26;
  const emojiSize = Math.min(s.fontSize + 12, Math.max(22, h * 0.28));
  const labelY = hasEmoji ? cy + h * 0.1 : cy;

  return (
    <motion.g
      initial={{ opacity: 1 }}
      animate={{ opacity: dimmed ? 0.2 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={rx}
        fill={c.fill}
        stroke={highlighted ? c.dot : c.stroke}
        strokeWidth={highlighted ? 3 : 2}
        animate={highlighted ? { filter: `drop-shadow(0 0 8px ${c.glow})` } : { filter: "none" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
      {node.emoji ? (
        <text
          x={cx}
          y={emojiY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={emojiSize}
        >
          {node.emoji}
        </text>
      ) : null}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={s.fontSize}
        fontWeight="600"
        fill={c.text}
      >
        {node.label}
      </text>
    </motion.g>
  );
}

function HexNode({ node, cx, cy, dimmed, highlighted }: NodeProps) {
  const c = COLOR[node.color ?? "gray"];
  const s = SIZE[node.size ?? "md"];
  const r = s.r;
  const d = hexPath(cx, cy, r);

  return (
    <motion.g
      initial={{ opacity: 1 }}
      animate={{ opacity: dimmed ? 0.2 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.path
        d={d}
        fill={c.fill}
        stroke={highlighted ? c.dot : c.stroke}
        strokeWidth={highlighted ? 3.5 : 2.5}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit={8}
        shapeRendering="geometricPrecision"
        animate={highlighted ? { filter: `drop-shadow(0 0 10px ${c.glow})` } : { filter: "none" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={0.75}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit={8}
        shapeRendering="geometricPrecision"
      />
      {node.emoji ? (
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={r * 0.6}
        >
          {node.emoji}
        </text>
      ) : null}
      <text
        x={cx}
        y={node.emoji ? cy + r * 0.35 : cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={s.fontSize}
        fontWeight="600"
        fill={c.text}
      >
        {node.label}
      </text>
      
    </motion.g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NodeFlowDiagram({
  nodes = [],
  edges = [],
  groups = [],
  steps = [],
  title,
  height = 500,
  hideStepNarrative = false,
}: NodeFlowDiagramProps) {
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeEdges = Array.isArray(edges) ? edges : [];
  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeSteps = Array.isArray(steps) ? steps : [];
  const hasDiagramData = safeNodes.length > 0;
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 700, height });

  // Step playback state
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1 = no active step
  const [playing, setPlaying] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDims({ width: rect.width, height: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!safeSteps.length) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSteps, currentStep, playing]);

  // Auto-play timer
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentStep((s) => {
        const next = s + 1;
        if (next >= safeSteps.length) {
          setPlaying(false);
          return s;
        }
        setDirection(1);
        return next;
      });
    }, 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, currentStep, safeSteps.length]);

  const goNext = useCallback(() => {
    setPlaying(false);
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, safeSteps.length - 1));
  }, [safeSteps.length]);

  const goPrev = useCallback(() => {
    setPlaying(false);
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
    } else {
      if (currentStep >= safeSteps.length - 1) {
        setCurrentStep(0);
        setDirection(1);
      } else if (currentStep === -1) {
        setCurrentStep(0);
      }
      setPlaying(true);
    }
  }, [playing, currentStep, safeSteps.length]);

  // Active step data
  const activeStep = currentStep >= 0 && currentStep < safeSteps.length ? safeSteps[currentStep] : null;
  const highlightNodes = useMemo(() => new Set(activeStep?.highlightNodes ?? []), [activeStep]);
  const highlightEdges = useMemo(() => new Set(activeStep?.highlightEdges ?? []), [activeStep]);
  const hasActiveStep = activeStep !== null;

  // Build node pixel map
  const nodeMap = useMemo(() => {
    const map = new Map<string, FlowNode & { px: number; py: number }>();
    for (const node of safeNodes) {
      map.set(node.id, {
        ...node,
        px: toPxX(node.x, dims.width),
        py: toPxY(node.y, dims.height),
      });
    }
    return map;
  }, [safeNodes, dims]);

  // Compute group bounding boxes
  const groupBBoxes = useMemo(() => {
    const GROUP_PAD = 40;
    return safeGroups.map((group) => {
      const members = group.nodeIds
        .map((id) => nodeMap.get(id))
        .filter((n): n is NonNullable<typeof n> => !!n);
      if (!members.length) return null;

      const topH = (n: FlowNode & { px: number; py: number }) => {
        const s = SIZE[n.size ?? "md"];
        return n.shape === "circle" || n.shape === "hex" ? s.r : s.h / 2;
      };
      
      const bottomH = (n: FlowNode & { px: number; py: number }) => {
        const s = SIZE[n.size ?? "md"];
        return n.shape === "circle" || n.shape === "hex" ? s.r : s.h / 2;
      };

      const halfW = (n: FlowNode & { px: number; py: number }) => {
        const s = SIZE[n.size ?? "md"];
        return n.shape === "circle" || n.shape === "hex" ? s.r : s.w / 2;
      };

      const minX = Math.min(...members.map((m) => m.px - halfW(m))) - GROUP_PAD;
      const minY = Math.min(...members.map((m) => m.py - topH(m))) - GROUP_PAD;
      const maxX = Math.max(...members.map((m) => m.px + halfW(m))) + GROUP_PAD;
      const maxY = Math.max(...members.map((m) => m.py + bottomH(m))) + GROUP_PAD + 6;

      return { group, x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }).filter((b): b is NonNullable<typeof b> => b !== null);
  }, [safeGroups, nodeMap]);

  // Resolve edges with pixel coords
  const resolvedEdges = useMemo(() => {
    return safeEdges.map((edge, index) => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode) return null;

      const fromDock = getNodeDockPoint(fromNode, { x: toNode.px, y: toNode.py });
      const toDock = getNodeDockPoint(toNode, { x: fromNode.px, y: fromNode.py });
      const points = getBezierPoints(
        fromDock.point,
        toDock.point,
        fromDock.normal,
        toDock.normal,
      );
      const mid = getPointOnBezier(0.5, points);
      const edgeKey = `${edge.from}→${edge.to}`;

      const resolvedColor = edge.color ?? (fromNode.color as NodeColor | undefined) ?? "gray";
      const c = COLOR[resolvedColor];

      return {
        ...edge,
        edgeKey,
        index,
        points,
        mid,
        c,
        isHighlighted: hasActiveStep ? highlightEdges.has(edgeKey) : false,
        isDimmed: hasActiveStep && !highlightEdges.has(edgeKey),
      };
    }).filter((e): e is NonNullable<typeof e> => e !== null);
  }, [safeEdges, nodeMap, highlightEdges, hasActiveStep]);

  // Arrow markers (one per color)
  const usedColors = useMemo(() => {
    const s = new Set<NodeColor>();
    for (const edge of resolvedEdges) s.add((edge.color ?? (nodeMap.get(edge.from)?.color as NodeColor | undefined) ?? "gray"));
    return [...s];
  }, [resolvedEdges, nodeMap]);

  const isLast = currentStep === safeSteps.length - 1;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-white/10 bg-[#0f1728]/80 p-7 md:p-8"
    >
      {title && (
        <p className="mb-5 text-lg font-semibold text-slate-200 md:text-xl">{title}</p>
      )}

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl"
        style={{
          height,
          background: "rgba(8,13,24,0.6)",
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.1) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {!hasDiagramData && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="max-w-md text-base font-medium leading-relaxed text-slate-300 md:text-lg">
              Diagram data is unavailable for this block. The page is still loaded, but the
              nodes/edges payload did not arrive from the MDX content.
            </p>
          </div>
        )}

        <svg
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          width={dims.width}
          height={dims.height}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <defs>
            {usedColors.map((col) => (
              <marker
                key={`arrow-${col}`}
                id={`arrow-${col}`}
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L0,8 L10,4 Z" fill={COLOR[col].dot} opacity="0.9" />
              </marker>
            ))}
            {usedColors.map((col) => (
              <marker
                key={`arrow-start-${col}`}
                id={`arrow-start-${col}`}
                markerWidth="10"
                markerHeight="10"
                refX="2"
                refY="4"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L0,8 L10,4 Z" fill={COLOR[col].dot} opacity="0.9" />
              </marker>
            ))}
          </defs>

          {/* Group backgrounds */}
          {groupBBoxes.map(({ group, x, y, w, h }) => {
            const c = COLOR[group.color ?? "gray"];
            return (
              <g key={group.id}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={14}
                  fill={c.groupBg}
                  stroke={c.groupStroke}
                  strokeWidth={1}
                  strokeDasharray="5 4"
                />
                <text
                  x={x + 18}
                  y={y + 26}
                  fontSize={17}
                  fontWeight="700"
                  fill={c.groupText}
                  letterSpacing="0.08em"
                >
                  {group.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Edges */}
          {resolvedEdges.map((edge) => {
            const edgeColor = edge.color ?? (nodeMap.get(edge.from)?.color as NodeColor | undefined) ?? "gray";
            const c = COLOR[edgeColor];
            const strokeColor = edge.isDimmed
              ? "rgba(148,163,184,0.12)"
              : edge.isHighlighted
              ? c.dot
              : c.stroke;
            const strokeWidth = edge.isHighlighted ? 2.5 : 1.5;
            const markerId = `arrow-${edgeColor}`;

            return (
              <g key={edge.edgeKey}>
                <motion.path
                  d={getBezierPath(edge.points)}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.dashed ? "6 4" : undefined}
                  strokeLinecap="round"
                  markerEnd={edge.noArrow ? undefined : `url(#${markerId})`}
                  markerStart={edge.bidirectional ? `url(#arrow-start-${edgeColor})` : undefined}
                  initial={{ opacity: 1 }}
                  animate={
                    edge.isHighlighted && !reducedMotion
                      ? { opacity: [0.7, 1, 0.7] }
                      : { opacity: 1 }
                  }
                  transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />

                {/* Animated particle */}
                {edge.animated !== false && (
                  <EdgeParticle
                    points={edge.points}
                    color={c.dot}
                    delay={edge.index * 0.19}
                    dimmed={edge.isDimmed}
                  />
                )}

                {/* Edge label */}
                {edge.label && !edge.isDimmed && (
                  <text
                    x={edge.mid.x}
                    y={edge.mid.y - 16}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={16}
                    fill="rgba(148,163,184,0.9)"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {safeNodes.map((node) => {
            const mapped = nodeMap.get(node.id);
            if (!mapped) return null;
            const isHighlighted = hasActiveStep ? highlightNodes.has(node.id) : false;
            const isDimmed = hasActiveStep && !highlightNodes.has(node.id);
            const shape = node.shape ?? "rect";
            const props: NodeProps = {
              node,
              cx: mapped.px,
              cy: mapped.py,
              dimmed: isDimmed,
              highlighted: isHighlighted,
            };

            if (shape === "none") return null;
            return shape === "circle" ? (
              <CircleNode key={node.id} {...props} />
            ) : shape === "hex" ? (
              <HexNode key={node.id} {...props} />
            ) : (
              <RectNode key={node.id} {...props} />
            );
          })}
        </svg>
      </div>

      {/* Step controller */}
      {safeSteps.length > 0 && (
        <div className="mt-4 space-y-3">
          {/* Progress dots + counter */}
          <div className="flex items-center gap-2">
            {safeSteps.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                aria-label={`Go to step ${i + 1}: ${s.label}`}
                onClick={() => {
                  setPlaying(false);
                  setDirection(i > currentStep ? 1 : -1);
                  setCurrentStep(i);
                }}
                animate={{ scale: i === currentStep ? 1.35 : 1 }}
                className={cn(
                  "h-2 rounded-full transition-all duration-200 focus-visible:outline-none",
                  i === currentStep
                    ? "w-6 bg-blue-400"
                    : "w-2 bg-slate-600 opacity-60 hover:opacity-90",
                )}
              />
            ))}
            <span className="ml-auto text-base font-bold tabular-nums text-slate-300 md:text-lg">
              {currentStep >= 0 ? `${currentStep + 1} / ${safeSteps.length}` : `${safeSteps.length} steps`}
            </span>
          </div>

          {/* Prev / Play / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStep <= 0}
              onClick={goPrev}
              className="flex h-11 min-h-[2.75rem] items-center gap-2 rounded-xl border-2 border-white/10 bg-white/5 px-4 text-base font-bold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 md:h-12 md:px-5 md:text-lg"
            >
              ← Prev
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className={cn(
                "flex h-11 min-h-[2.75rem] items-center gap-2 rounded-xl px-5 text-base font-bold transition md:h-12 md:px-6 md:text-lg",
                playing
                  ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                  : "bg-blue-600 text-white hover:bg-blue-500",
              )}
            >
              {playing ? "⏸ Pause" : isLast && currentStep >= 0 ? "↩ Replay" : "▶ Play"}
            </button>

            <button
              type="button"
              disabled={isLast}
              onClick={goNext}
              className="flex h-11 min-h-[2.75rem] items-center gap-2 rounded-xl border-2 border-white/10 bg-white/5 px-4 text-base font-bold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 md:h-12 md:px-5 md:text-lg"
            >
              Next →
            </button>

            <span className="ml-auto text-base font-medium text-slate-300 md:text-lg">
              ← → or Space to navigate
            </span>
          </div>

          {/* Step description */}
          {!hideStepNarrative && (
            <div className="min-h-[72px] rounded-xl border border-white/8 bg-white/4 px-5 py-4 md:px-6 md:py-5">
              <AnimatePresence mode="wait" custom={direction}>
                {activeStep ? (
                  <motion.div
                    key={activeStep.id}
                    custom={direction}
                    initial={{ x: direction * 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -20, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <p className="mb-2 text-lg font-bold text-slate-100 md:text-xl">{activeStep.label}</p>
                    <p className="text-base font-medium leading-relaxed text-slate-200 md:text-lg">
                      {activeStep.description}
                    </p>
                    {activeStep.highlightNodes && activeStep.highlightNodes.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {activeStep.highlightNodes.map((id) => {
                          const n = nodeMap.get(id);
                          if (!n || n.shape === "none") return null;
                          return (
                            <div
                              key={id}
                              className="flex flex-wrap items-center gap-2 rounded-md border border-white/5 bg-slate-800/60 px-3 py-2 shadow-sm"
                            >
                              {n.emoji ? <span className="text-base leading-none">{n.emoji}</span> : null}
                              <span className="text-base font-bold text-slate-100 md:text-lg">{n.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-base font-medium text-slate-400 md:text-lg"
                  >
                    Press <span className="font-mono font-bold">Play</span> or click a step dot to walk through the
                    diagram.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
