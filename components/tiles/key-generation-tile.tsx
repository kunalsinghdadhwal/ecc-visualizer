"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoTile } from "@/components/bento-tile";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CurveRenderer } from "@/components/svg/curve-renderer";
import { PointMarker } from "@/components/svg/point-marker";
import { LineOverlay } from "@/components/svg/line-overlay";
import { useECCStore } from "@/hooks/use-ecc-store";
import { generateKeys } from "@/lib/ecc-elgamal";
import { formatPoint, pointToKeyString } from "@/lib/message-mapping";
import type { ScalarMultStep } from "@/types/ecc";

interface GeomStep {
  label: string;
  operation: "init" | "double" | "add";
  pointBefore: { x: number; y: number } | null;
  pointAfter: { x: number; y: number } | null;
  lineFrom?: { x: number; y: number };
  lineTo?: { x: number; y: number };
  intersection?: { x: number; y: number };
}

export function KeyGenerationTile() {
  const {
    curveParams,
    generator,
    privateKey,
    setPrivateKey,
    keyPair,
    setKeyPair,
    setKeyGenSteps,
  } = useECCStore();

  const [geomSteps, setGeomSteps] = useState<GeomStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const compute = useCallback(() => {
    if (!generator) return;
    try {
      const { keyPair: kp, steps: animSteps, multSteps } = generateKeys(privateKey, generator, curveParams);
      setKeyPair(kp);
      setKeyGenSteps(animSteps);

      const gSteps: GeomStep[] = multSteps.map((s: ScalarMultStep) => ({
        label: s.label,
        operation: s.operation,
        pointBefore: s.before,
        pointAfter: s.after,
        lineFrom: s.lineFrom,
        lineTo: s.lineTo,
        intersection: s.intersection,
      }));

      setGeomSteps(gSteps);
      setCurrentStep(-1);
      setIsPlaying(true);
    } catch (err) {
      console.error("Key generation failed:", err);
    }
  }, [generator, privateKey, curveParams, setKeyPair, setKeyGenSteps]);

  useEffect(() => {
    if (!isPlaying || geomSteps.length === 0) return;

    if (currentStep < geomSteps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, geomSteps.length]);

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setGeomSteps([]);
    setKeyPair(null);
    setKeyGenSteps([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const activeStep = currentStep >= 0 && currentStep < geomSteps.length ? geomSteps[currentStep] : null;
  const allVisibleSteps = geomSteps.slice(0, currentStep + 1);
  const trailPoints = allVisibleSteps
    .filter((s) => s.pointAfter !== null)
    .map((s) => s.pointAfter!);

  const binaryStr = privateKey.toString(2);
  const isDone = keyPair && !isPlaying && currentStep >= geomSteps.length - 1;

  return (
    <BentoTile
      title="Key Generation"
      subtitle={`Q = ${privateKey}G`}
      colSpan={2}
      rowSpan={2}
      className="md:col-span-2 lg:row-span-2"
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="flex-1 min-h-[220px]">
          <CurveRenderer params={curveParams}>
            {generator && (
              <PointMarker
                point={generator}
                color="oklch(0.73 0.12 290)"
                label="G"
                radius={0.09}
              />
            )}

            {trailPoints.slice(0, -1).map((pt, i) => (
              <PointMarker
                key={`trail-${i}`}
                point={pt}
                color="oklch(0.55 0.06 290)"
                radius={0.06}
                animate={false}
              />
            ))}

            {activeStep?.lineFrom && activeStep?.lineTo && (
              <LineOverlay
                from={activeStep.lineFrom}
                to={activeStep.lineTo}
                color={
                  activeStep.operation === "double"
                    ? "oklch(0.65 0.10 290)"
                    : "oklch(0.60 0.08 330)"
                }
              />
            )}

            {activeStep?.intersection && (
              <PointMarker
                point={activeStep.intersection}
                color="oklch(0.50 0.06 290)"
                label="R'"
                radius={0.07}
              />
            )}

            {activeStep?.intersection && activeStep?.pointAfter && (
              <LineOverlay
                from={activeStep.intersection}
                to={activeStep.pointAfter}
                dashed
                color="oklch(0.50 0.06 290)"
              />
            )}

            {activeStep?.pointAfter && (
              <PointMarker
                point={activeStep.pointAfter}
                color="oklch(0.75 0.10 85)"
                label={currentStep === geomSteps.length - 1 ? "Q" : `${currentStep + 1}`}
                radius={0.11}
              />
            )}

            {isDone && (
              <PointMarker
                point={keyPair.publicKey}
                color="oklch(0.75 0.10 85)"
                label="Q"
                radius={0.13}
              />
            )}
          </CurveRenderer>
        </div>

        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              d = {privateKey}
              <span className="text-muted-foreground ml-2 font-mono text-[11px]">
                ({binaryStr})
              </span>
            </Label>
          </div>
          <Slider
            value={[privateKey]}
            onValueChange={([v]) => {
              setPrivateKey(v);
              reset();
            }}
            min={2}
            max={20}
            step={1}
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={compute} disabled={!generator} className="text-xs">
            Generate Keys
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="text-xs">
            Reset
          </Button>
        </div>

        <div className="min-h-0 overflow-y-auto space-y-0.5 max-h-[100px]">
          <AnimatePresence mode="popLayout">
            {allVisibleSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs px-2 py-1 rounded font-mono ${
                  i === currentStep
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span className="text-primary/60 mr-1.5">
                  {step.operation === "init"
                    ? "INIT"
                    : step.operation === "double"
                      ? "DBL"
                      : "ADD"}
                </span>
                {step.label}
                {step.pointAfter && (
                  <span className="text-muted-foreground/60 ml-1">
                    = {formatPoint(step.pointAfter)}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 space-y-2 border-t border-border/40 pt-3"
          >
            <div>
              <p className="text-[11px] text-muted-foreground/70 mb-1">Public key</p>
              <div className="bg-background/60 rounded px-2.5 py-1.5 font-mono text-[11px] text-foreground/80 break-all leading-relaxed select-all">
                {pointToKeyString(keyPair.publicKey, keyPair.privateKey, "public")}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground/70 mb-1">Private key</p>
              <div className="bg-background/60 rounded px-2.5 py-1.5 font-mono text-[11px] text-foreground/80 break-all leading-relaxed whitespace-pre select-all">
                {pointToKeyString(keyPair.publicKey, keyPair.privateKey, "private")}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </BentoTile>
  );
}
