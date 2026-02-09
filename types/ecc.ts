export interface Point {
  x: number;
  y: number;
}

export const POINT_AT_INFINITY: Point | null = null;

export interface CurveParams {
  a: number;
  b: number;
}

export interface KeyPair {
  privateKey: number;
  publicKey: Point;
}

export interface CipherText {
  c1: Point;
  c2: Point;
}

export type AnimationStepType =
  | "double"
  | "add"
  | "draw-line"
  | "intersection"
  | "reflect"
  | "result"
  | "skip"
  | "key-gen"
  | "encrypt-c1"
  | "encrypt-c2"
  | "decrypt-shared"
  | "decrypt-result";

export interface AnimationStep {
  type: AnimationStepType;
  label: string;
  points: (Point | null)[];
  line?: { from: Point; to: Point };
  bitValue?: number;
  intermediateResult?: Point | null;
}

export interface ScalarMultStep {
  bitIndex: number;
  bitValue: number;
  operation: "double" | "add" | "init";
  before: Point | null;
  after: Point | null;
  label: string;
}
