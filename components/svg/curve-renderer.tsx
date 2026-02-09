"use client";

import { useMemo, useId } from "react";
import type { CurveParams } from "@/types/ecc";
import { generateCurvePaths, type ViewBox, DEFAULT_VIEWBOX } from "@/lib/curve-utils";
import { Axes } from "./axes";

interface CurveRendererProps {
  params: CurveParams;
  viewBox?: ViewBox;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  className?: string;
}

export function CurveRenderer({
  params,
  viewBox = DEFAULT_VIEWBOX,
  children,
  onClick,
  className,
}: CurveRendererProps) {
  const paths = useMemo(() => generateCurvePaths(params, viewBox), [params, viewBox]);
  const clipId = useId();

  const vb = `${viewBox.xMin} ${viewBox.yMin} ${viewBox.xMax - viewBox.xMin} ${viewBox.yMax - viewBox.yMin}`;

  // Inset the clip rect slightly so strokes at the viewBox boundary get clipped
  const inset = 0.06;

  return (
    <svg
      viewBox={vb}
      className={className}
      onClick={onClick}
      style={{ width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={viewBox.xMin + inset}
            y={viewBox.yMin + inset}
            width={viewBox.xMax - viewBox.xMin - inset * 2}
            height={viewBox.yMax - viewBox.yMin - inset * 2}
          />
        </clipPath>
      </defs>
      <Axes viewBox={viewBox} />
      <g clipPath={`url(#${clipId})`}>
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="oklch(0.62 0.10 290)"
            strokeWidth={0.04}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
      {children}
    </svg>
  );
}
