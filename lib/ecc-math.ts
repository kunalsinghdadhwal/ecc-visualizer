import type { Point, CurveParams, ScalarMultStep } from "@/types/ecc";

const EPSILON = 1e-10;

export function isPointAtInfinity(p: Point | null): p is null {
  return p === null;
}

export function pointsEqual(p: Point | null, q: Point | null): boolean {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;
  return Math.abs(p.x - q.x) < EPSILON && Math.abs(p.y - q.y) < EPSILON;
}

export function negatePoint(p: Point | null): Point | null {
  if (isPointAtInfinity(p)) return null;
  return { x: p.x, y: -p.y };
}

export function isOnCurve(p: Point, params: CurveParams): boolean {
  const lhs = p.y * p.y;
  const rhs = p.x * p.x * p.x + params.a * p.x + params.b;
  return Math.abs(lhs - rhs) < 0.01;
}

export function discriminant(params: CurveParams): number {
  return 4 * params.a * params.a * params.a + 27 * params.b * params.b;
}

export function isSingular(params: CurveParams): boolean {
  return Math.abs(discriminant(params)) < EPSILON;
}

export function pointAdd(
  p: Point | null,
  q: Point | null,
  params: CurveParams
): Point | null {
  if (isPointAtInfinity(p)) return q;
  if (isPointAtInfinity(q)) return p;

  // P + (-P) = O
  if (Math.abs(p.x - q.x) < EPSILON && Math.abs(p.y + q.y) < EPSILON) {
    return null;
  }

  let slope: number;

  if (Math.abs(p.x - q.x) < EPSILON && Math.abs(p.y - q.y) < EPSILON) {
    // Point doubling
    if (Math.abs(p.y) < EPSILON) return null;
    slope = (3 * p.x * p.x + params.a) / (2 * p.y);
  } else {
    // Point addition
    slope = (q.y - p.y) / (q.x - p.x);
  }

  const xr = slope * slope - p.x - q.x;
  const yr = slope * (p.x - xr) - p.y;

  return { x: xr, y: yr };
}

export function pointDouble(
  p: Point | null,
  params: CurveParams
): Point | null {
  return pointAdd(p, p, params);
}

export function getAdditionSlope(
  p: Point,
  q: Point,
  params: CurveParams
): number {
  if (Math.abs(p.x - q.x) < EPSILON && Math.abs(p.y - q.y) < EPSILON) {
    return (3 * p.x * p.x + params.a) / (2 * p.y);
  }
  return (q.y - p.y) / (q.x - p.x);
}

export function getIntersectionPoint(
  p: Point,
  q: Point,
  params: CurveParams
): Point {
  const slope = getAdditionSlope(p, q, params);
  const xr = slope * slope - p.x - q.x;
  const yr = slope * (p.x - xr) - p.y;
  // The intersection (before reflection) has -yr
  return { x: xr, y: -yr };
}

export interface ScalarMultResult {
  result: Point | null;
  steps: ScalarMultStep[];
}

export function scalarMultiply(
  k: number,
  p: Point | null,
  params: CurveParams
): ScalarMultResult {
  if (isPointAtInfinity(p) || k === 0) {
    return { result: null, steps: [] };
  }

  const steps: ScalarMultStep[] = [];
  const bits = k.toString(2);

  let result: Point | null = null;

  for (let i = 0; i < bits.length; i++) {
    const bitValue = parseInt(bits[i]);

    if (i === 0) {
      result = p;
      steps.push({
        bitIndex: i,
        bitValue: 1,
        operation: "init",
        before: null,
        after: result,
        label: `Start with G`,
      });
    } else {
      // Double
      const beforeDouble = result;
      // Record geometric data for the doubling (tangent line)
      let lineFrom: Point | undefined;
      let lineTo: Point | undefined;
      let intersection: Point | undefined;
      if (beforeDouble) {
        lineFrom = beforeDouble;
        lineTo = beforeDouble; // same point = tangent
        intersection = getIntersectionPoint(beforeDouble, beforeDouble, params);
      }
      result = pointDouble(result, params);
      steps.push({
        bitIndex: i,
        bitValue,
        operation: "double",
        before: beforeDouble,
        after: result,
        label: `Double`,
        lineFrom,
        lineTo,
        intersection,
      });

      if (bitValue === 1) {
        const beforeAdd = result;
        let addLineFrom: Point | undefined;
        let addLineTo: Point | undefined;
        let addIntersection: Point | undefined;
        if (beforeAdd && p) {
          addLineFrom = beforeAdd;
          addLineTo = p;
          addIntersection = getIntersectionPoint(beforeAdd, p, params);
        }
        result = pointAdd(result, p, params);
        steps.push({
          bitIndex: i,
          bitValue,
          operation: "add",
          before: beforeAdd,
          after: result,
          label: `Add G`,
          lineFrom: addLineFrom,
          lineTo: addLineTo,
          intersection: addIntersection,
        });
      }
    }
  }

  return { result, steps };
}
