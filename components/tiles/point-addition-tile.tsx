"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { BentoTile } from "@/components/bento-tile";
import { Button } from "@/components/ui/button";
import { CurveRenderer } from "@/components/svg/curve-renderer";
import { PointMarker } from "@/components/svg/point-marker";
import { LineOverlay } from "@/components/svg/line-overlay";
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
      }, 1500);
    }, 1500);
  }, [pointP, pointQ, curveParams, setAdditionResult, reset]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <BentoTile title="Point Addition" subtitle="P + Q" colSpan={2} className="md:col-span-2">
      <div className="flex flex-col gap-2 h-full">
        <div className="flex-1 min-h-[180px]">
          <CurveRenderer params={curveParams}>
            {pointP && (
              <PointMarker point={pointP} color="oklch(0.87 0.12 207)" label="P" />
            )}
            {pointQ && (
              <PointMarker point={pointQ} color="oklch(0.80 0.13 212)" label="Q" />
            )}
            {(step === "draw-line" || step === "intersection" || step === "done") &&
              pointP &&
              pointQ && (
                <LineOverlay from={pointP} to={pointQ} />
              )}
            {(step === "intersection" || step === "done") && intersection && (
              <PointMarker
                point={intersection}
                color="oklch(0.52 0.09 223)"
                label="R'"
                radius={0.08}
              />
            )}
            {step === "done" && additionResult && (
              <>
                <LineOverlay
                  from={{ x: additionResult.x, y: -additionResult.y }}
                  to={additionResult}
                  dashed
                  color="oklch(0.52 0.09 223)"
                />
                <PointMarker
                  point={additionResult}
                  color="oklch(0.61 0.11 222)"
                  label="P+Q"
                  radius={0.12}
                />
              </>
            )}
          </CurveRenderer>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={runAnimation} disabled={!canCompute} className="text-xs">
            Compute P + Q
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="text-xs">
            Reset
          </Button>
        </div>
        <div className="text-xs text-muted-foreground shrink-0">
          {step === "idle" && (canCompute ? "Ready to compute" : "Place P and Q on the curve above")}
          {step === "draw-line" && "Drawing line through P and Q..."}
          {step === "intersection" && `Third intersection R' = ${formatPoint(intersection)}`}
          {step === "done" && `Result: P + Q = ${formatPoint(additionResult)}`}
        </div>
      </div>
    </BentoTile>
  );
}
