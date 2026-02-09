"use client";

import { useMemo } from "react";
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

  const vb = `${viewBox.xMin} ${viewBox.yMin} ${viewBox.xMax - viewBox.xMin} ${viewBox.yMax - viewBox.yMin}`;

  return (
    <svg
      viewBox={vb}
      className={className}
      onClick={onClick}
      style={{ width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <Axes viewBox={viewBox} />
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="oklch(0.71 0.13 215)"
          strokeWidth={0.05}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {children}
    </svg>
  );
}
