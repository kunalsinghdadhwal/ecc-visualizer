"use client";

import { memo } from "react";
import type { ViewBox } from "@/lib/curve-utils";

interface AxesProps {
  viewBox: ViewBox;
}

export const Axes = memo(function Axes({ viewBox }: AxesProps) {
  const { xMin, xMax, yMin, yMax } = viewBox;

  const gridLines: React.ReactNode[] = [];

  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={yMin}
        x2={x}
        y2={yMax}
        stroke="currentColor"
        strokeWidth={x === 0 ? 0.025 : 0.01}
        opacity={x === 0 ? 0.3 : 0.08}
      />
    );
    if (x !== 0) {
      gridLines.push(
        <text
          key={`vl-${x}`}
          x={x}
          y={0.32}
          textAnchor="middle"
          fill="currentColor"
          opacity={0.25}
          fontSize={0.26}
          fontFamily="var(--font-geist-mono), monospace"
        >
          {x}
        </text>
      );
    }
  }

  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1={xMin}
        y1={-y}
        x2={xMax}
        y2={-y}
        stroke="currentColor"
        strokeWidth={y === 0 ? 0.025 : 0.01}
        opacity={y === 0 ? 0.3 : 0.08}
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
          opacity={0.25}
          fontSize={0.26}
          fontFamily="var(--font-geist-mono), monospace"
        >
          {y}
        </text>
      );
    }
  }

  return <g className="text-muted-foreground">{gridLines}</g>;
});
