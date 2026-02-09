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
 * for both the upper and lower branches.
 */
export function generateCurvePaths(
  params: CurveParams,
  viewBox: ViewBox = DEFAULT_VIEWBOX,
  numSamples: number = 500
): { upper: string; lower: string } {
  const { a, b } = params;
  const { xMin, xMax } = viewBox;
  const step = (xMax - xMin) / numSamples;

  const upperPoints: Point[] = [];
  const lowerPoints: Point[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const x = xMin + i * step;
    const rhs = x * x * x + a * x + b;
    if (rhs >= 0) {
      const y = Math.sqrt(rhs);
      upperPoints.push({ x, y });
      lowerPoints.push({ x, y: -y });
    }
  }

  return {
    upper: pointsToSvgPath(upperPoints),
    lower: pointsToSvgPath(lowerPoints),
  };
}

function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return "";

  // Split into contiguous segments (handle gaps)
  const segments: Point[][] = [];
  let currentSegment: Point[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    // If gap is larger than 2 steps, start a new segment
    if (dx > 0.05) {
      segments.push(currentSegment);
      currentSegment = [];
    }
    currentSegment.push(points[i]);
  }
  segments.push(currentSegment);

  return segments
    .filter((seg) => seg.length > 1)
    .map((seg) => {
      const first = seg[0];
      const rest = seg.slice(1);
      return `M ${first.x} ${-first.y} ` + rest.map((p) => `L ${p.x} ${-p.y}`).join(" ");
    })
    .join(" ");
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
