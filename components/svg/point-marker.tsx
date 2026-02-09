"use client";

import { motion } from "framer-motion";
import type { Point } from "@/types/ecc";

interface PointMarkerProps {
  point: Point;
  color?: string;
  label?: string;
  radius?: number;
  animate?: boolean;
}

export function PointMarker({
  point,
  color = "oklch(0.73 0.12 290)",
  label,
  radius = 0.1,
  animate = true,
}: PointMarkerProps) {
  const svgY = -point.y;

  const circleProps = {
    cx: point.x,
    cy: svgY,
    r: radius,
    fill: color,
  };

  return (
    <g>
      {animate ? (
        <motion.circle
          {...circleProps}
          initial={{ r: 0, opacity: 0 }}
          animate={{ r: radius, opacity: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ) : (
        <circle {...circleProps} opacity={0.9} />
      )}
      {label && (
        <text
          x={point.x + 0.2}
          y={svgY - 0.2}
          fill={color}
          fontSize={0.26}
          fontWeight="500"
          fontFamily="var(--font-geist-mono), monospace"
          opacity={0.85}
        >
          {label}
        </text>
      )}
    </g>
  );
}
