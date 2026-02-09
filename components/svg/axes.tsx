"use client";

import type { ViewBox } from "@/lib/curve-utils";

interface AxesProps {
  viewBox: ViewBox;
}

export function Axes({ viewBox }: AxesProps) {
  const { xMin, xMax, yMin, yMax } = viewBox;

  const gridLines: React.ReactNode[] = [];

  // Vertical grid lines
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={yMin}
        x2={x}
        y2={yMax}
        stroke="currentColor"
        strokeWidth={x === 0 ? 0.03 : 0.015}
        opacity={x === 0 ? 0.4 : 0.12}
      />
    );
    if (x !== 0) {
      gridLines.push(
        <text
          key={`vl-${x}`}
          x={x}
          y={0.35}
          textAnchor="middle"
          fill="currentColor"
          opacity={0.35}
          fontSize={0.28}
        >
          {x}
        </text>
      );
    }
  }

  // Horizontal grid lines (y is flipped in SVG)
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1={xMin}
        y1={-y}
        x2={xMax}
        y2={-y}
        stroke="currentColor"
        strokeWidth={y === 0 ? 0.03 : 0.015}
        opacity={y === 0 ? 0.4 : 0.12}
      />
    );
    if (y !== 0) {
      gridLines.push(
        <text
          key={`hl-${y}`}
          x={0.15}
          y={-y + 0.1}
          textAnchor="start"
          dominantBaseline="middle"
          fill="currentColor"
          opacity={0.35}
          fontSize={0.28}
        >
          {y}
        </text>
      );
    }
  }

  return <g className="text-muted-foreground">{gridLines}</g>;
}
