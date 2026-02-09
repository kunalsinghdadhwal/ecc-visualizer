"use client";

import { BentoTile } from "@/components/bento-tile";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useECCStore } from "@/hooks/use-ecc-store";
import { isSingular, discriminant } from "@/lib/ecc-math";

export function CurveParamsTile() {
  const { curveParams, setCurveParams } = useECCStore();
  const singular = isSingular(curveParams);
  const disc = discriminant(curveParams);

  return (
    <BentoTile title="Curve Parameters">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">a = {curveParams.a.toFixed(1)}</Label>
          </div>
          <Slider
            value={[curveParams.a]}
            onValueChange={([v]) => setCurveParams({ ...curveParams, a: v })}
            min={-5}
            max={5}
            step={0.1}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">b = {curveParams.b.toFixed(1)}</Label>
          </div>
          <Slider
            value={[curveParams.b]}
            onValueChange={([v]) => setCurveParams({ ...curveParams, b: v })}
            min={-5}
            max={5}
            step={0.1}
          />
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>4a&sup3; + 27b&sup2; = {disc.toFixed(2)}</p>
          {singular && (
            <Badge variant="destructive" className="text-[10px]">
              Singular curve
            </Badge>
          )}
        </div>
      </div>
    </BentoTile>
  );
}
