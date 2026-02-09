"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoTile } from "@/components/bento-tile";
import { Button } from "@/components/ui/button";
import { useECCStore } from "@/hooks/use-ecc-store";
import { decrypt } from "@/lib/ecc-elgamal";
import { formatPoint, pointToMessage } from "@/lib/message-mapping";
import type { AnimationStep } from "@/types/ecc";

export function DecryptionTile() {
  const {
    curveParams,
    privateKey,
    cipherText,
    decryptedPoint,
    setDecryptedPoint,
    decryptedMessage,
    setDecryptedMessage,
    decryptSteps,
    setDecryptSteps,
    messageText,
  } = useECCStore();

  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const canDecrypt = cipherText !== null;

  const runDecrypt = useCallback(() => {
    if (!cipherText) return;
    try {
      const { message, steps } = decrypt(cipherText, privateKey, curveParams);
      setDecryptedPoint(message);
      setDecryptedMessage(pointToMessage(message));
      setDecryptSteps(steps);
      setCurrentStep(-1);
      setIsPlaying(true);
    } catch (err) {
      console.error("Decryption failed:", err);
    }
  }, [cipherText, privateKey, curveParams, setDecryptedPoint, setDecryptedMessage, setDecryptSteps]);

  useEffect(() => {
    if (!isPlaying || decryptSteps.length === 0) return;

    if (currentStep < decryptSteps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, decryptSteps.length]);

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setDecryptedPoint(null);
    setDecryptedMessage(null);
    setDecryptSteps([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const isDone = decryptedPoint && !isPlaying && currentStep >= decryptSteps.length - 1;

  return (
    <BentoTile title="Decryption" subtitle="ElGamal">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button size="sm" onClick={runDecrypt} disabled={!canDecrypt} className="text-xs">
            Decrypt
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="text-xs">
            Reset
          </Button>
        </div>

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {decryptSteps.slice(0, currentStep + 1).map((step: AnimationStep, i: number) => (
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

        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-border/40 pt-2 text-xs space-y-0.5"
          >
            <p className="text-muted-foreground">
              Decrypted point:{" "}
              <span className="text-foreground font-mono">{formatPoint(decryptedPoint)}</span>
            </p>
            <p className="text-muted-foreground">
              Recovered value:{" "}
              <span className="text-foreground font-mono">{decryptedMessage}</span>
            </p>
            {messageText && (
              <p className="text-muted-foreground">
                Original: &quot;{messageText}&quot;
              </p>
            )}
          </motion.div>
        )}

        {!canDecrypt && (
          <p className="text-xs text-muted-foreground/60">Encrypt a message first</p>
        )}
      </div>
    </BentoTile>
  );
}
