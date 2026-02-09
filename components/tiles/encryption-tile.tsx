"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoTile } from "@/components/bento-tile";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CurveRenderer } from "@/components/svg/curve-renderer";
import { PointMarker } from "@/components/svg/point-marker";
import { useECCStore } from "@/hooks/use-ecc-store";
import { encrypt } from "@/lib/ecc-elgamal";
import { formatPoint } from "@/lib/message-mapping";
import type { AnimationStep } from "@/types/ecc";

export function EncryptionTile() {
  const {
    curveParams,
    generator,
    keyPair,
    messagePoint,
    randomK,
    setRandomK,
    cipherText,
    setCipherText,
    encryptSteps,
    setEncryptSteps,
  } = useECCStore();

  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const canEncrypt = messagePoint !== null && keyPair !== null && generator !== null;

  const runEncrypt = useCallback(() => {
    if (!messagePoint || !keyPair || !generator) return;
    try {
      const { cipherText: ct, steps } = encrypt(
        messagePoint,
        keyPair.publicKey,
        generator,
        randomK,
        curveParams
      );
      setCipherText(ct);
      setEncryptSteps(steps);
      setCurrentStep(-1);
      setIsPlaying(true);
    } catch (err) {
      console.error("Encryption failed:", err);
    }
  }, [messagePoint, keyPair, generator, randomK, curveParams, setCipherText, setEncryptSteps]);

  useEffect(() => {
    if (!isPlaying || encryptSteps.length === 0) return;

    if (currentStep < encryptSteps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, encryptSteps.length]);

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setCipherText(null);
    setEncryptSteps([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <BentoTile
      title="Encryption"
      subtitle="ElGamal"
      colSpan={2}
      rowSpan={2}
      className="lg:col-span-2 lg:row-span-2"
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="flex-1 min-h-[180px]">
          <CurveRenderer params={curveParams}>
            {messagePoint && (
              <PointMarker point={messagePoint} color="oklch(0.87 0.12 207)" label="M" />
            )}
            {cipherText && (
              <>
                <PointMarker
                  point={cipherText.c1}
                  color="oklch(0.80 0.13 212)"
                  label="C1"
                />
                <PointMarker
                  point={cipherText.c2}
                  color="oklch(0.61 0.11 222)"
                  label="C2"
                />
              </>
            )}
          </CurveRenderer>
        </div>

        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Random k = {randomK}</Label>
          </div>
          <Slider
            value={[randomK]}
            onValueChange={([v]) => {
              setRandomK(v);
              reset();
            }}
            min={2}
            max={15}
            step={1}
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={runEncrypt} disabled={!canEncrypt} className="text-xs">
            Encrypt
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="text-xs">
            Reset
          </Button>
        </div>

        <div className="space-y-1 shrink-0">
          <AnimatePresence mode="popLayout">
            {encryptSteps.slice(0, currentStep + 1).map((step: AnimationStep, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs px-2 py-1 rounded font-mono ${
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

        {cipherText && !isPlaying && currentStep >= encryptSteps.length - 1 && (
          <div className="text-xs shrink-0 space-y-0.5">
            <p className="text-muted-foreground">
              C1: <span className="text-foreground font-mono">{formatPoint(cipherText.c1)}</span>
            </p>
            <p className="text-muted-foreground">
              C2: <span className="text-foreground font-mono">{formatPoint(cipherText.c2)}</span>
            </p>
          </div>
        )}

        {!canEncrypt && (
          <p className="text-xs text-muted-foreground">
            {!messagePoint
              ? "Enter a message first"
              : !keyPair
                ? "Generate keys first"
                : "Set generator point"}
          </p>
        )}
      </div>
    </BentoTile>
  );
}
