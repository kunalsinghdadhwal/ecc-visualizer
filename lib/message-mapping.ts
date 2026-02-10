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

/**
 * Simple deterministic PRNG (xorshift32) seeded from a number.
 * Used to expand a few floats into many realistic-looking key bytes.
 */
function seededRng(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Generate a deterministic base64 key string from point coordinates.
 * Produces output resembling real SSH/ECDSA key formats in length and structure.
 */
export function pointToKeyString(
  p: Point,
  privateKey: number,
  type: "public" | "private" = "public"
): string {
  // Seed the PRNG from the actual key material so output is deterministic
  const seedVal = Math.abs(p.x * 100003 + p.y * 99991 + privateKey * 100019);
  const rng = seededRng(Math.floor(seedVal));

  if (type === "private") {
    // Real ECDSA PEM private keys are ~176 bytes -> ~7 lines of base64
    const buf = new ArrayBuffer(176);
    const view = new DataView(buf);
    // Embed actual key data in the first 32 bytes
    view.setFloat64(0, p.x);
    view.setFloat64(8, p.y);
    view.setFloat64(16, p.x * privateKey);
    view.setFloat64(24, p.y * privateKey + Math.PI);
    // Fill remaining bytes deterministically
    const bytes = new Uint8Array(buf);
    for (let i = 32; i < 176; i++) {
      bytes[i] = Math.floor(rng() * 256);
    }
    const b64 = btoa(String.fromCharCode(...bytes));
    // Wrap at 64 characters per line like real PEM
    const lines = b64.match(/.{1,64}/g)!.join("\n");
    return `-----BEGIN EC PRIVATE KEY-----\n${lines}\n-----END EC PRIVATE KEY-----`;
  }

  // Real ECDSA public key blobs are ~140 bytes
  const buf = new ArrayBuffer(140);
  const view = new DataView(buf);
  // Header bytes mimicking the SSH wire format:
  // 4-byte length + "ecdsa-sha2-nistp256" tag bytes
  const tag = [0x00, 0x00, 0x00, 0x13, 0x65, 0x63, 0x64, 0x73, 0x61, 0x2d,
    0x73, 0x68, 0x61, 0x32, 0x2d, 0x6e, 0x69, 0x73, 0x74, 0x70, 0x32, 0x35, 0x36];
  const bytes = new Uint8Array(buf);
  bytes.set(tag, 0);
  // Embed the actual point data
  view.setFloat64(23, p.x);
  view.setFloat64(31, p.y);
  // Fill the rest deterministically
  for (let i = 39; i < 140; i++) {
    bytes[i] = Math.floor(rng() * 256);
  }
  const b64 = btoa(String.fromCharCode(...bytes));
  return `ecdsa-sha2-nistp256 ${b64}`;
}
