"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoTile } from "@/components/bento-tile";
import { Button } from "@/components/ui/button";
import { useECCStore } from "@/hooks/use-ecc-store";
import { pointAdd, getIntersectionPoint } from "@/lib/ecc-math";
import { formatPoint } from "@/lib/message-mapping";

type AddStep = "idle" | "draw-line" | "intersection" | "reflect" | "done";

export function PointAdditionTile() {
  const {
    curveParams,
    pointP,
    pointQ,
    additionResult,
    setAdditionResult,
  } = useECCStore();

  const [step, setStep] = useState<AddStep>("idle");
  const [intersection, setIntersection] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const canCompute = pointP !== null && pointQ !== null;

  const reset = useCallback(() => {
    setStep("idle");
    setIntersection(null);
    setAdditionResult(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [setAdditionResult]);

  const runAnimation = useCallback(() => {
    if (!pointP || !pointQ) return;
    reset();

    setStep("draw-line");
    timerRef.current = setTimeout(() => {
      const inter = getIntersectionPoint(pointP, pointQ, curveParams);
      setIntersection(inter);
      setStep("intersection");

      timerRef.current = setTimeout(() => {
        const result = pointAdd(pointP, pointQ, curveParams);
        setAdditionResult(result);
        setStep("done");
      }, 500);
    }, 500);
  }, [pointP, pointQ, curveParams, setAdditionResult, reset]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const steps: { label: string; active: boolean; done: boolean }[] = [
    {
      label: `P = ${formatPoint(pointP)}`,
      active: step === "idle",
      done: step !== "idle",
    },
    {
      label: `Q = ${formatPoint(pointQ)}`,
      active: step === "idle",
      done: step !== "idle",
    },
    {
      label: "Draw line through P and Q",
      active: step === "draw-line",
      done: step === "intersection" || step === "done",
    },
    {
      label: `R' = ${formatPoint(intersection)}`,
      active: step === "intersection",
      done: step === "done",
    },
    {
      label: `P + Q = ${formatPoint(additionResult)}`,
      active: step === "done",
      done: step === "done",
    },
  ];

  return (
    <BentoTile title="Point Addition" subtitle="P + Q" className="self-start">
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {steps.map((s, i) => {
              if (!s.done && !s.active && step !== "idle") return null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs px-2 py-1 rounded font-mono ${
                    s.active && step !== "idle"
                      ? "bg-primary/10 text-foreground"
                      : s.done
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  }`}
                >
                  <span className="text-primary/60 mr-1.5">
                    {i === 0 ? "P" : i === 1 ? "Q" : i === 2 ? "LINE" : i === 3 ? "R'" : "SUM"}
                  </span>
                  {s.label}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={runAnimation} disabled={!canCompute} className="text-xs">
            Compute P + Q
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="text-xs">
            Reset
          </Button>
        </div>

        {!canCompute && (
          <p className="text-xs text-muted-foreground/60">
            Place P and Q on the curve above
          </p>
        )}
      </div>
    </BentoTile>
  );
}
