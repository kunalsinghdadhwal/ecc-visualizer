"use client";

import { motion } from "framer-motion";
import type { Point } from "@/types/ecc";
import type { ViewBox } from "@/lib/curve-utils";
import { DEFAULT_VIEWBOX } from "@/lib/curve-utils";

interface LineOverlayProps {
  from: Point;
  to: Point;
  color?: string;
  dashed?: boolean;
  viewBox?: ViewBox;
  animate?: boolean;
}

export function LineOverlay({
  from,
  to,
  color = "oklch(0.80 0.13 212)",
  dashed = false,
  viewBox = DEFAULT_VIEWBOX,
  animate = true,
}: LineOverlayProps) {
  // Extend line to edges of viewbox for the construction line effect
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  let x1 = from.x;
  let y1 = from.y;
  let x2 = to.x;
  let y2 = to.y;

  if (Math.abs(dx) > 1e-10) {
    const slope = dy / dx;
    x1 = viewBox.xMin;
    y1 = from.y + slope * (x1 - from.x);
    x2 = viewBox.xMax;
    y2 = from.y + slope * (x2 - from.x);
  } else {
    // Vertical line
    y1 = viewBox.yMin;
    y2 = viewBox.yMax;
  }

  const lineProps = {
    x1,
    y1: -y1,
    x2,
    y2: -y2,
    stroke: color,
    strokeWidth: 0.03,
    strokeDasharray: dashed ? "0.1 0.08" : undefined,
    opacity: 0.6,
  };

  if (animate) {
    return (
      <motion.line
        {...lineProps}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.4 }}
      />
    );
  }

  return <line {...lineProps} />;
}
