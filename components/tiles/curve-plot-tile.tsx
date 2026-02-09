"use client";

import { useCallback } from "react";
import { BentoTile } from "@/components/bento-tile";
import { CurveRenderer } from "@/components/svg/curve-renderer";
import { PointMarker } from "@/components/svg/point-marker";
import { LineOverlay } from "@/components/svg/line-overlay";
import { useECCStore } from "@/hooks/use-ecc-store";
import { DEFAULT_VIEWBOX } from "@/lib/curve-utils";
import { snapToCurve } from "@/lib/curve-utils";

export function CurvePlotTile() {
  const {
    curveParams,
    pointP,
    pointQ,
    additionResult,
    setPointP,
    setPointQ,
    generator,
  } = useECCStore();

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const vb = DEFAULT_VIEWBOX;
      const xRange = vb.xMax - vb.xMin;
      const yRange = vb.yMax - vb.yMin;

      const svgX = ((e.clientX - rect.left) / rect.width) * xRange + vb.xMin;
      const svgY = ((e.clientY - rect.top) / rect.height) * yRange + vb.yMin;
      const mathY = -svgY;

      const snapped = snapToCurve(svgX, curveParams, mathY >= 0);
      if (!snapped) return;

      if (!pointP) {
        setPointP(snapped);
      } else if (!pointQ) {
        setPointQ(snapped);
      } else {
        // Reset and start over
        setPointP(snapped);
        setPointQ(null);
      }
    },
    [curveParams, pointP, pointQ, setPointP, setPointQ]
  );

  return (
    <BentoTile
      title="Elliptic Curve"
      subtitle={`y\u00B2 = x\u00B3 + (${curveParams.a})x + (${curveParams.b})`}
      colSpan={2}
      rowSpan={2}
      className="lg:col-span-2 lg:row-span-2"
    >
      <div className="w-full h-full min-h-[300px] relative">
        <CurveRenderer
          params={curveParams}
          onClick={handleClick}
          className="cursor-crosshair"
        >
          {generator && (
            <PointMarker
              point={generator}
              color="oklch(0.71 0.13 215)"
              label="G"
              radius={0.09}
            />
          )}
          {pointP && (
            <PointMarker
              point={pointP}
              color="oklch(0.87 0.12 207)"
              label="P"
            />
          )}
          {pointQ && (
            <PointMarker
              point={pointQ}
              color="oklch(0.80 0.13 212)"
              label="Q"
            />
          )}
          {pointP && pointQ && (
            <LineOverlay from={pointP} to={pointQ} />
          )}
          {additionResult && (
            <>
              <PointMarker
                point={additionResult}
                color="oklch(0.61 0.11 222)"
                label="P+Q"
                radius={0.12}
              />
              <LineOverlay
                from={{ x: additionResult.x, y: -additionResult.y }}
                to={additionResult}
                dashed
                color="oklch(0.52 0.09 223)"
              />
            </>
          )}
        </CurveRenderer>
        <p className="absolute bottom-1 left-2 text-[10px] text-muted-foreground">
          Click on curve to place points
        </p>
      </div>
    </BentoTile>
  );
}
