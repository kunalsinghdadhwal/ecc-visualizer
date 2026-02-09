import type { Point, CurveParams, KeyPair, CipherText, AnimationStep, ScalarMultStep } from "@/types/ecc";
import { scalarMultiply, pointAdd, negatePoint, isPointAtInfinity } from "./ecc-math";

export interface KeyGenResult {
  keyPair: KeyPair;
  steps: AnimationStep[];
  multSteps: ScalarMultStep[];
}

export function generateKeys(
  privateKey: number,
  generator: Point,
  params: CurveParams
): KeyGenResult {
  const { result, steps: multSteps } = scalarMultiply(privateKey, generator, params);

  if (isPointAtInfinity(result)) {
    throw new Error("Public key is point at infinity, choose a different private key");
  }

  const steps: AnimationStep[] = [
    {
      type: "key-gen",
      label: `Computing Q = ${privateKey} * G`,
      points: [generator],
    },
    ...multSteps.map((s) => ({
      type: s.operation === "double" ? "double" as const : "add" as const,
      label: s.label,
      points: [s.before, s.after],
    })),
    {
      type: "result" as const,
      label: `Public key Q = (${result!.x.toFixed(3)}, ${result!.y.toFixed(3)})`,
      points: [result],
    },
  ];

  return {
    keyPair: { privateKey, publicKey: result! },
    steps,
    multSteps,
  };
}

export interface EncryptResult {
  cipherText: CipherText;
  steps: AnimationStep[];
}

export function encrypt(
  message: Point,
  publicKey: Point,
  generator: Point,
  k: number,
  params: CurveParams
): EncryptResult {
  const { result: c1 } = scalarMultiply(k, generator, params);
  const { result: kQ } = scalarMultiply(k, publicKey, params);

  if (isPointAtInfinity(c1) || isPointAtInfinity(kQ)) {
    throw new Error("Encryption resulted in point at infinity");
  }

  const c2 = pointAdd(message, kQ, params);

  if (isPointAtInfinity(c2)) {
    throw new Error("C2 is point at infinity");
  }

  const steps: AnimationStep[] = [
    {
      type: "encrypt-c1",
      label: `C1 = ${k} * G`,
      points: [generator, c1],
    },
    {
      type: "encrypt-c2",
      label: `kQ = ${k} * PublicKey`,
      points: [publicKey, kQ],
    },
    {
      type: "result",
      label: `C2 = M + kQ = (${c2!.x.toFixed(3)}, ${c2!.y.toFixed(3)})`,
      points: [message, kQ, c2],
    },
  ];

  return {
    cipherText: { c1: c1!, c2: c2! },
    steps,
  };
}

export interface DecryptResult {
  message: Point;
  steps: AnimationStep[];
}

export function decrypt(
  cipherText: CipherText,
  privateKey: number,
  params: CurveParams
): DecryptResult {
  const { result: dC1 } = scalarMultiply(privateKey, cipherText.c1, params);

  if (isPointAtInfinity(dC1)) {
    throw new Error("Shared secret is point at infinity");
  }

  const negDC1 = negatePoint(dC1);
  const message = pointAdd(cipherText.c2, negDC1, params);

  if (isPointAtInfinity(message)) {
    throw new Error("Decrypted message is point at infinity");
  }

  const steps: AnimationStep[] = [
    {
      type: "decrypt-shared",
      label: `d * C1 = ${privateKey} * C1`,
      points: [cipherText.c1, dC1],
    },
    {
      type: "decrypt-result",
      label: `M = C2 - d*C1 = (${message!.x.toFixed(3)}, ${message!.y.toFixed(3)})`,
      points: [cipherText.c2, negDC1, message],
    },
  ];

  return { message: message!, steps };
}
