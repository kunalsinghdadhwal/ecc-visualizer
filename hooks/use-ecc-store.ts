import { create } from "zustand";
import type {
  Point,
  CurveParams,
  KeyPair,
  CipherText,
  AnimationStep,
  ScalarMultStep,
} from "@/types/ecc";

interface ECCState {
  // Curve parameters
  curveParams: CurveParams;
  setCurveParams: (params: CurveParams) => void;

  // Points on curve (for point addition demo)
  pointP: Point | null;
  pointQ: Point | null;
  setPointP: (p: Point | null) => void;
  setPointQ: (q: Point | null) => void;

  // Point addition result
  additionResult: Point | null;
  setAdditionResult: (p: Point | null) => void;
  additionSteps: AnimationStep[];
  setAdditionSteps: (steps: AnimationStep[]) => void;

  // Scalar multiplication
  scalar: number;
  setScalar: (k: number) => void;
  scalarBasePoint: Point | null;
  setScalarBasePoint: (p: Point | null) => void;
  scalarResult: Point | null;
  setScalarResult: (p: Point | null) => void;
  scalarSteps: ScalarMultStep[];
  setScalarSteps: (steps: ScalarMultStep[]) => void;

  // Generator point
  generator: Point | null;
  setGenerator: (p: Point | null) => void;

  // Key generation
  privateKey: number;
  setPrivateKey: (k: number) => void;
  keyPair: KeyPair | null;
  setKeyPair: (kp: KeyPair | null) => void;
  keyGenSteps: AnimationStep[];
  setKeyGenSteps: (steps: AnimationStep[]) => void;

  // Message
  messageText: string;
  setMessageText: (msg: string) => void;
  messagePoint: Point | null;
  setMessagePoint: (p: Point | null) => void;

  // Encryption
  randomK: number;
  setRandomK: (k: number) => void;
  cipherText: CipherText | null;
  setCipherText: (ct: CipherText | null) => void;
  encryptSteps: AnimationStep[];
  setEncryptSteps: (steps: AnimationStep[]) => void;

  // Decryption
  decryptedPoint: Point | null;
  setDecryptedPoint: (p: Point | null) => void;
  decryptedMessage: number | null;
  setDecryptedMessage: (m: number | null) => void;
  decryptSteps: AnimationStep[];
  setDecryptSteps: (steps: AnimationStep[]) => void;

  // Animation
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  // Reset
  resetAll: () => void;
}

const DEFAULT_CURVE: CurveParams = { a: -1, b: 1 };
const DEFAULT_GENERATOR: Point = { x: 0, y: 1 };

export const useECCStore = create<ECCState>((set) => ({
  curveParams: DEFAULT_CURVE,
  setCurveParams: (params) => set({ curveParams: params }),

  pointP: null,
  pointQ: null,
  setPointP: (p) => set({ pointP: p }),
  setPointQ: (q) => set({ pointQ: q }),

  additionResult: null,
  setAdditionResult: (p) => set({ additionResult: p }),
  additionSteps: [],
  setAdditionSteps: (steps) => set({ additionSteps: steps }),

  scalar: 3,
  setScalar: (k) => set({ scalar: k }),
  scalarBasePoint: null,
  setScalarBasePoint: (p) => set({ scalarBasePoint: p }),
  scalarResult: null,
  setScalarResult: (p) => set({ scalarResult: p }),
  scalarSteps: [],
  setScalarSteps: (steps) => set({ scalarSteps: steps }),

  generator: DEFAULT_GENERATOR,
  setGenerator: (p) => set({ generator: p }),

  privateKey: 5,
  setPrivateKey: (k) => set({ privateKey: k }),
  keyPair: null,
  setKeyPair: (kp) => set({ keyPair: kp }),
  keyGenSteps: [],
  setKeyGenSteps: (steps) => set({ keyGenSteps: steps }),

  messageText: "",
  setMessageText: (msg) => set({ messageText: msg }),
  messagePoint: null,
  setMessagePoint: (p) => set({ messagePoint: p }),

  randomK: 3,
  setRandomK: (k) => set({ randomK: k }),
  cipherText: null,
  setCipherText: (ct) => set({ cipherText: ct }),
  encryptSteps: [],
  setEncryptSteps: (steps) => set({ encryptSteps: steps }),

  decryptedPoint: null,
  setDecryptedPoint: (p) => set({ decryptedPoint: p }),
  decryptedMessage: null,
  setDecryptedMessage: (m) => set({ decryptedMessage: m }),
  decryptSteps: [],
  setDecryptSteps: (steps) => set({ decryptSteps: steps }),

  currentStepIndex: -1,
  setCurrentStepIndex: (i) => set({ currentStepIndex: i }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  resetAll: () =>
    set({
      pointP: null,
      pointQ: null,
      additionResult: null,
      additionSteps: [],
      scalarResult: null,
      scalarSteps: [],
      keyPair: null,
      keyGenSteps: [],
      messageText: "",
      messagePoint: null,
      cipherText: null,
      encryptSteps: [],
      decryptedPoint: null,
      decryptedMessage: null,
      decryptSteps: [],
      currentStepIndex: -1,
      isPlaying: false,
    }),
}));
