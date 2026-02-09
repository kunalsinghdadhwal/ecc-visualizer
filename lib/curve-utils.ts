import type { CurveParams, Point } from "@/types/ecc";

export interface ViewBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export const DEFAULT_VIEWBOX: ViewBox = {
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
};

/**
 * Given curve y^2 = x^3 + ax + b, generate SVG path data
 * as closed loops per connected component.
 * Each component traces upper branch left-to-right, then
 * lower branch right-to-left, closing the loop so there
 * is no gap where the branches meet at y=0.
 */
export function generateCurvePaths(
  params: CurveParams,
  viewBox: ViewBox = DEFAULT_VIEWBOX,
  numSamples: number = 500
): string[] {
  const { a, b } = params;
  const { xMin, xMax } = viewBox;
  const step = (xMax - xMin) / numSamples;

  // Collect contiguous x-regions where rhs >= 0
  type Region = { upper: Point[]; lower: Point[] };
  const regions: Region[] = [];
  let current: Region | null = null;

  for (let i = 0; i <= numSamples; i++) {
    const x = xMin + i * step;
    const rhs = x * x * x + a * x + b;
    if (rhs >= 0) {
      const y = Math.sqrt(rhs);
      if (!current) {
        current = { upper: [], lower: [] };
      }
      current.upper.push({ x, y });
      current.lower.push({ x, y: -y });
    } else {
      if (current) {
        regions.push(current);
        current = null;
      }
    }
  }
  if (current) {
    regions.push(current);
  }

  // For each region, build a single closed SVG path:
  // upper left-to-right, then lower right-to-left
  return regions
    .filter((r) => r.upper.length > 1)
    .map((r) => {
      const upper = r.upper;
      const lower = [...r.lower].reverse();

      // Start at the first upper point
      let d = `M ${upper[0].x} ${-upper[0].y}`;

      // Trace upper branch left to right
      for (let i = 1; i < upper.length; i++) {
        d += ` L ${upper[i].x} ${-upper[i].y}`;
      }

      // Trace lower branch right to left (connects seamlessly at the rightmost x)
      for (let i = 0; i < lower.length; i++) {
        d += ` L ${lower[i].x} ${-lower[i].y}`;
      }

      d += " Z";
      return d;
    });
}

/**
 * Convert math coordinates to SVG pixel coordinates
 */
export function mathToSvg(
  point: Point,
  viewBox: ViewBox,
  svgWidth: number,
  svgHeight: number
): { cx: number; cy: number } {
  const xRange = viewBox.xMax - viewBox.xMin;
  const yRange = viewBox.yMax - viewBox.yMin;
  return {
    cx: ((point.x - viewBox.xMin) / xRange) * svgWidth,
    cy: ((-point.y - viewBox.yMin) / yRange) * svgHeight,
  };
}

/**
 * Convert SVG pixel coordinates to math coordinates
 */
export function svgToMath(
  cx: number,
  cy: number,
  viewBox: ViewBox,
  svgWidth: number,
  svgHeight: number
): Point {
  const xRange = viewBox.xMax - viewBox.xMin;
  const yRange = viewBox.yMax - viewBox.yMin;
  return {
    x: (cx / svgWidth) * xRange + viewBox.xMin,
    y: -((cy / svgHeight) * yRange + viewBox.yMin),
  };
}

/**
 * Find the closest point on the curve to a given x coordinate.
 * Returns both the upper (+y) and lower (-y) solutions.
 */
export function snapToCurve(
  x: number,
  params: CurveParams,
  preferPositiveY: boolean = true
): Point | null {
  const rhs = x * x * x + params.a * x + params.b;
  if (rhs < 0) {
    // Search nearby for a valid x
    for (let dx = 0.01; dx < 1; dx += 0.01) {
      const rhs1 = (x + dx) ** 3 + params.a * (x + dx) + params.b;
      if (rhs1 >= 0) {
        const y = Math.sqrt(rhs1);
        return { x: x + dx, y: preferPositiveY ? y : -y };
      }
      const rhs2 = (x - dx) ** 3 + params.a * (x - dx) + params.b;
      if (rhs2 >= 0) {
        const y = Math.sqrt(rhs2);
        return { x: x - dx, y: preferPositiveY ? y : -y };
      }
    }
    return null;
  }
  const y = Math.sqrt(rhs);
  return { x, y: preferPositiveY ? y : -y };
}
