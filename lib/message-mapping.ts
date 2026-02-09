import type { Point, CurveParams } from "@/types/ecc";

/**
 * Map a message (number) to a point on the curve.
 * Uses the message value as an x-coordinate offset,
 * then finds the nearest valid point on the curve.
 */
export function messageToPoint(
  message: number,
  params: CurveParams
): Point | null {
  // Try the message value directly as x
  const x = message * 0.3; // Scale to keep within viewbox
  const rhs = x * x * x + params.a * x + params.b;

  if (rhs >= 0) {
    return { x, y: Math.sqrt(rhs) };
  }

  // Search nearby x values
  for (let dx = 0.01; dx < 5; dx += 0.01) {
    const xPlus = x + dx;
    const rhsPlus = xPlus * xPlus * xPlus + params.a * xPlus + params.b;
    if (rhsPlus >= 0) {
      return { x: xPlus, y: Math.sqrt(rhsPlus) };
    }

    const xMinus = x - dx;
    const rhsMinus = xMinus * xMinus * xMinus + params.a * xMinus + params.b;
    if (rhsMinus >= 0) {
      return { x: xMinus, y: Math.sqrt(rhsMinus) };
    }
  }

  return null;
}

/**
 * Recover the original message number from a point.
 * Reverse of messageToPoint -- divides x by the scaling factor and rounds.
 */
export function pointToMessage(point: Point): number {
  return Math.round(point.x / 0.3);
}

/**
 * Convert a string to a numeric value for ECC mapping.
 * Simple sum of char codes.
 */
export function stringToNumber(str: string): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
}

/**
 * For display: format a point nicely.
 */
export function formatPoint(p: Point | null): string {
  if (p === null) return "O (infinity)";
  return `(${p.x.toFixed(3)}, ${p.y.toFixed(3)})`;
}
