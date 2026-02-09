"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoTile } from "@/components/bento-tile";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useECCStore } from "@/hooks/use-ecc-store";
import { generateKeys } from "@/lib/ecc-elgamal";
import { formatPoint } from "@/lib/message-mapping";
import type { AnimationStep } from "@/types/ecc";

export function KeyGenerationTile() {
  const {
    curveParams,
    generator,
    privateKey,
    setPrivateKey,
    keyPair,
    setKeyPair,
    keyGenSteps,
    setKeyGenSteps,
  } = useECCStore();

  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const compute = useCallback(() => {
    if (!generator) return;
    try {
      const { keyPair: kp, steps } = generateKeys(privateKey, generator, curveParams);
      setKeyPair(kp);
      setKeyGenSteps(steps);
      setCurrentStep(-1);
      setIsPlaying(true);
    } catch (err) {
      console.error("Key generation failed:", err);
    }
  }, [generator, privateKey, curveParams, setKeyPair, setKeyGenSteps]);

  useEffect(() => {
    if (!isPlaying || keyGenSteps.length === 0) return;

    if (currentStep < keyGenSteps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, keyGenSteps.length]);

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setKeyPair(null);
    setKeyGenSteps([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <BentoTile title="Key Generation" subtitle="Q = dG" colSpan={2} className="md:col-span-2">
      <div className="flex flex-col gap-3 h-full">
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Private key d = {privateKey}</Label>
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

        <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
          <AnimatePresence mode="popLayout">
            {keyGenSteps.slice(0, currentStep + 1).map((step: AnimationStep, i: number) => (
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
                {step.label}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {keyPair && !isPlaying && currentStep >= keyGenSteps.length - 1 && (
          <div className="text-xs shrink-0 space-y-0.5">
            <p className="text-muted-foreground">
              Private: <span className="text-foreground font-mono">{keyPair.privateKey}</span>
            </p>
            <p className="text-muted-foreground">
              Public:{" "}
              <span className="text-foreground font-mono">
                {formatPoint(keyPair.publicKey)}
              </span>
            </p>
          </div>
        )}
      </div>
    </BentoTile>
  );
}
