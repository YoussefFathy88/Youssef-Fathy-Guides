/** Shared SVG layout and math for linear-mapping session visuals. */

export const CHART_VW = 840;
export const CHART_VH = 510;
export const CHART_PL = 80;
export const CHART_PR = 40;
export const CHART_PT = 40;
export const CHART_PB = 60;
export const CHART_PW = CHART_VW - CHART_PL - CHART_PR;
export const CHART_PH = CHART_VH - CHART_PT - CHART_PB;

export const LINE_PURPLE = "#8b5cf6";
export const LINE_PURPLE_LIGHT = "#a78bfa";
export const LINE_GHOST = "#6d28d9";
export const POINT_AMBER = "#f59e0b";
export const POINT_AMBER_STROKE = "#fde68a";
export const POINT_LABEL = "#fbbf24";
export const GUIDE_AMBER = "#92400e";

export interface ChartBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function chartSx(mathX: number, bounds: ChartBounds) {
  const { xMin, xMax } = bounds;
  return CHART_PL + ((mathX - xMin) / (xMax - xMin)) * CHART_PW;
}

export function chartSy(mathY: number, bounds: ChartBounds) {
  const { yMin, yMax } = bounds;
  return CHART_PT + ((yMax - mathY) / (yMax - yMin)) * CHART_PH;
}

export function fmtEq(m: number, c: number) {
  const mRounded = Math.round(m * 100) / 100;
  const cRounded = Math.round(c * 100) / 100;
  const mPart =
    Math.abs(mRounded - 1) < 0.01
      ? "x"
      : Math.abs(mRounded + 1) < 0.01
        ? "-x"
        : `${mRounded}x`;
  const cPart =
    Math.abs(cRounded) < 0.01
      ? ""
      : cRounded > 0
        ? ` + ${cRounded}`
        : ` − ${Math.abs(cRounded)}`;
  return `y = ${mPart}${cPart}`;
}

export function getXTicks(bounds: ChartBounds) {
  const { xMin, xMax } = bounds;
  return Array.from(
    { length: Math.floor(xMax) - Math.ceil(xMin) + 1 },
    (_, i) => Math.ceil(xMin) + i,
  );
}

export function getYTicks(bounds: ChartBounds) {
  const { yMin, yMax } = bounds;
  return Array.from(
    { length: Math.floor(yMax) - Math.ceil(yMin) + 1 },
    (_, i) => Math.ceil(yMin) + i,
  );
}

export function lineEndpoints(m: number, c: number, bounds: ChartBounds) {
  const { xMin, xMax, yMin, yMax } = bounds;
  return {
    x1: chartSx(xMin, bounds),
    y1: chartSy(m * xMin + c, bounds),
    x2: chartSx(xMax, bounds),
    y2: chartSy(m * xMax + c, bounds),
    yMin,
    yMax,
  };
}

export function predict(m: number, c: number, x: number) {
  return m * x + c;
}

/** Squared-error gradients for a single point (teaching). */
export function pointGradients(
  m: number,
  c: number,
  x: number,
  yTrue: number,
) {
  const pred = predict(m, c, x);
  const residual = yTrue - pred;
  const squaredError = residual * residual;
  return {
    pred,
    residual,
    squaredError,
    dM: -2 * residual * x,
    dC: -2 * residual,
  };
}

export const DEFAULT_TRAIN_BOUNDS: ChartBounds = {
  xMin: -0.5,
  xMax: 5,
  yMin: -0.5,
  yMax: 16,
};

export type TrainingStepKind =
  | "true_data"
  | "init_guess"
  | "forward"
  | "backward"
  | "update"
  | "converged";

export interface TrainingStep {
  kind: TrainingStepKind;
  tabLabel: string;
  m: number;
  c: number;
  highlightX?: number;
  x?: number;
  yTrue?: number;
  yPred?: number;
  /** Signed residual (y − ŷ). */
  residual?: number;
  /** Squared loss E = (y − ŷ)². */
  squaredError?: number;
  dM?: number;
  dC?: number;
  newM?: number;
  newC?: number;
  learningRate: number;
  targetM: number;
  targetC: number;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Precomputed training steps: forward → backward → update per point, then converge. */
export function buildTrainingSteps(
  targetM: number,
  targetC: number,
  learningRate: number,
  dataPoints: { x: number; y: number }[],
  startM = 0,
  startC = 0,
): TrainingStep[] {
  const steps: TrainingStep[] = [
    {
      kind: "true_data",
      tabLabel: "True data",
      m: startM,
      c: startC,
      learningRate,
      targetM,
      targetC,
    },
    {
      kind: "init_guess",
      tabLabel: "Random guess",
      m: startM,
      c: startC,
      learningRate,
      targetM,
      targetC,
    },
  ];

  let m = startM;
  let c = startC;
  const points = dataPoints.length > 0 ? dataPoints : [{ x: 1, y: 5 }];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i]!;
    const { pred, residual, squaredError, dM, dC } = pointGradients(m, c, pt.x, pt.y);
    const suffix = points.length > 1 ? ` (${i + 1})` : "";

    steps.push({
      kind: "forward",
      tabLabel: `Forward${suffix}`,
      m,
      c,
      highlightX: pt.x,
      x: pt.x,
      yTrue: pt.y,
      yPred: round2(pred),
      residual: round2(residual),
      squaredError: round2(squaredError),
      learningRate,
      targetM,
      targetC,
    });

    steps.push({
      kind: "backward",
      tabLabel: `Backward${suffix}`,
      m,
      c,
      highlightX: pt.x,
      x: pt.x,
      yTrue: pt.y,
      yPred: round2(pred),
      residual: round2(residual),
      squaredError: round2(squaredError),
      dM: round2(dM),
      dC: round2(dC),
      learningRate,
      targetM,
      targetC,
    });

    const prevM = m;
    const prevC = c;
    const newM = round2(m - dM * learningRate);
    const newC = round2(c - dC * learningRate);

    steps.push({
      kind: "update",
      tabLabel: `Update${suffix}`,
      m: prevM,
      c: prevC,
      highlightX: pt.x,
      x: pt.x,
      dM: round2(dM),
      dC: round2(dC),
      newM,
      newC,
      learningRate,
      targetM,
      targetC,
    });

    m = newM;
    c = newC;
  }

  for (let i = 0; i < 8; i++) {
    const pt = points[i % points.length]!;
    const { dM, dC } = pointGradients(m, c, pt.x, pt.y);
    m = round2(m - dM * learningRate);
    c = round2(c - dC * learningRate);
    if (Math.abs(m - targetM) < 0.12 && Math.abs(c - targetC) < 0.12) break;
  }

  steps.push({
    kind: "converged",
    tabLabel: "Learned",
    m: targetM,
    c: targetC,
    learningRate,
    targetM,
    targetC,
  });

  return steps;
}
