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
  color = "oklch(0.87 0.12 207)",
  label,
  radius = 0.1,
  animate = true,
}: PointMarkerProps) {
  // SVG y is flipped
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
          animate={{ r: radius, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ) : (
        <circle {...circleProps} />
      )}
      {label && (
        <text
          x={point.x + 0.2}
          y={svgY - 0.2}
          fill={color}
          fontSize={0.28}
          fontWeight="500"
        >
          {label}
        </text>
      )}
    </g>
  );
}
