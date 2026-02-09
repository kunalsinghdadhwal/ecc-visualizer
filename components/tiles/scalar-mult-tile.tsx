"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoTile } from "@/components/bento-tile";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useECCStore } from "@/hooks/use-ecc-store";
import { scalarMultiply } from "@/lib/ecc-math";
import { formatPoint } from "@/lib/message-mapping";
import type { ScalarMultStep } from "@/types/ecc";

export function ScalarMultTile() {
  const {
    curveParams,
    scalar,
    setScalar,
    generator,
    scalarSteps,
    setScalarSteps,
    scalarResult,
    setScalarResult,
  } = useECCStore();

  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const compute = useCallback(() => {
    if (!generator) return;
    const { result, steps } = scalarMultiply(scalar, generator, curveParams);
    setScalarSteps(steps);
    setScalarResult(result);
    setCurrentStep(-1);
    setIsPlaying(true);
  }, [generator, scalar, curveParams, setScalarSteps, setScalarResult]);

  useEffect(() => {
    if (!isPlaying || scalarSteps.length === 0) return;

    if (currentStep < scalarSteps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, scalarSteps.length]);

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setScalarSteps([]);
    setScalarResult(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const binaryStr = scalar.toString(2);

  return (
    <BentoTile
      title="Scalar Multiplication"
      subtitle={`${scalar}G (binary: ${binaryStr})`}
      colSpan={2}
      className="md:col-span-2"
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <Label className="text-sm">k = {scalar}</Label>
          </div>
          <Slider
            value={[scalar]}
            onValueChange={([v]) => {
              setScalar(v);
              reset();
            }}
            min={2}
            max={20}
            step={1}
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={compute} disabled={!generator} className="text-xs">
            Compute {scalar}G
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="text-xs">
            Reset
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
          <AnimatePresence mode="popLayout">
            {scalarSteps.slice(0, currentStep + 1).map((step: ScalarMultStep, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs px-2 py-1.5 rounded font-mono ${
                  i === currentStep
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span className="text-primary/70">
                  {step.operation === "init" ? "INIT" : step.operation === "double" ? "DBL " : "ADD "}
                </span>
                {step.label}
                {step.after && (
                  <span className="block text-[11px] text-muted-foreground mt-0.5">
                    = {formatPoint(step.after)}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {scalarResult && !isPlaying && currentStep >= scalarSteps.length - 1 && (
          <div className="text-xs shrink-0 text-foreground">
            Result: {scalar}G = {formatPoint(scalarResult)}
          </div>
        )}
      </div>
    </BentoTile>
  );
}
