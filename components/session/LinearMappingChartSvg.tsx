"use client";

import type { ReactNode } from "react";

import {
  CHART_PB,
  CHART_PH,
  CHART_PL,
  CHART_PT,
  CHART_PW,
  CHART_VH,
  CHART_VW,
  type ChartBounds,
  chartSx,
  chartSy,
  getXTicks,
  getYTicks,
} from "./linear-mapping-chart";

export interface LinearMappingChartSvgProps {
  bounds: ChartBounds;
  ariaLabel: string;
  children?: ReactNode;
}

export function LinearMappingChartSvg({
  bounds,
  ariaLabel,
  children,
}: LinearMappingChartSvgProps) {
  const { xMin, xMax, yMin, yMax } = bounds;
  const ox = chartSx(0, bounds);
  const oy = chartSy(0, bounds);
  const xTicks = getXTicks(bounds);
  const yTicks = getYTicks(bounds);

  return (
    <svg
      viewBox={`0 0 ${CHART_VW} ${CHART_VH}`}
      className="w-full"
      style={{ height: "auto", maxHeight: 540 }}
      aria-label={ariaLabel}
    >
      {xTicks.map((v) => (
        <line
          key={`gx${v}`}
          x1={chartSx(v, bounds)}
          y1={CHART_PT}
          x2={chartSx(v, bounds)}
          y2={CHART_PT + CHART_PH}
          stroke="#1f2937"
          strokeWidth="1"
        />
      ))}
      {yTicks.map((v) => (
        <line
          key={`gy${v}`}
          x1={CHART_PL}
          y1={chartSy(v, bounds)}
          x2={CHART_PL + CHART_PW}
          y2={chartSy(v, bounds)}
          stroke="#1f2937"
          strokeWidth="1"
        />
      ))}
      <line x1={CHART_PL} y1={oy} x2={CHART_PL + CHART_PW} y2={oy} stroke="#4b5563" strokeWidth="2" />
      <line x1={ox} y1={CHART_PT} x2={ox} y2={CHART_PT + CHART_PH} stroke="#4b5563" strokeWidth="2" />
      <polygon
        points={`${CHART_PL + CHART_PW},${oy} ${CHART_PL + CHART_PW - 10},${oy - 6} ${CHART_PL + CHART_PW - 10},${oy + 6}`}
        fill="#4b5563"
      />
      <polygon
        points={`${ox},${CHART_PT} ${ox - 6},${CHART_PT + 10} ${ox + 6},${CHART_PT + 10}`}
        fill="#4b5563"
      />
      <text
        x={CHART_PL + CHART_PW + 10}
        y={oy + 6}
        fill="#6b7280"
        fontSize="20"
        fontFamily="ui-monospace,monospace"
      >
        x
      </text>
      <text x={ox + 10} y={CHART_PT - 6} fill="#6b7280" fontSize="20" fontFamily="ui-monospace,monospace">
        y
      </text>
      {xTicks
        .filter((v) => v !== 0)
        .map((v) => (
          <text
            key={`xl${v}`}
            x={chartSx(v, bounds)}
            y={oy + 22}
            fill="#4b5563"
            fontSize="14"
            textAnchor="middle"
            fontFamily="ui-monospace,monospace"
          >
            {v}
          </text>
        ))}
      {yTicks
        .filter((v) => v !== 0 && v % 2 === 0)
        .map((v) => (
          <text
            key={`yl${v}`}
            x={ox - 12}
            y={chartSy(v, bounds) + 5}
            fill="#4b5563"
            fontSize="14"
            textAnchor="end"
            fontFamily="ui-monospace,monospace"
          >
            {v}
          </text>
        ))}
      <text
        x={ox - 14}
        y={oy + 20}
        fill="#4b5563"
        fontSize="14"
        textAnchor="end"
        fontFamily="ui-monospace,monospace"
      >
        0
      </text>
      {children}
    </svg>
  );
}
