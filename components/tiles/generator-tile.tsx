"use client";

import { BentoTile } from "@/components/bento-tile";
import { useECCStore } from "@/hooks/use-ecc-store";
import { isOnCurve, discriminant } from "@/lib/ecc-math";
import { formatPoint } from "@/lib/message-mapping";

export function GeneratorTile() {
  const { generator, curveParams, keyPair, privateKey } = useECCStore();

  const onCurve = generator ? isOnCurve(generator, curveParams) : false;
  const disc = discriminant(curveParams);

  return (
    <BentoTile title="Generator" subtitle="Base point" className="self-start">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <p className="font-mono text-foreground text-sm">
              G = {generator ? formatPoint(generator) : "none"}
            </p>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  onCurve ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {onCurve ? "On curve" : "Not on curve"}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  disc !== 0 ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {disc !== 0 ? "Non-singular" : "Singular"}
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-2 space-y-1.5 text-xs text-muted-foreground">
          <p>
            Private key d ={" "}
            <span className="font-mono text-foreground">{privateKey}</span>
          </p>
          <p>
            Binary:{" "}
            <span className="font-mono text-foreground">
              {privateKey.toString(2)}
            </span>
          </p>
          <p>
            Operations:{" "}
            <span className="font-mono text-foreground">
              {privateKey.toString(2).length - 1} double
              {privateKey.toString(2).slice(1).split("").filter((b) => b === "1").length > 0
                ? `, ${privateKey.toString(2).slice(1).split("").filter((b) => b === "1").length} add`
                : ""}
            </span>
          </p>
        </div>

        {keyPair ? (
          <div className="border-t border-border/40 pt-2 text-xs text-muted-foreground">
            <p>
              Public key Q ={" "}
              <span className="font-mono text-foreground">
                {formatPoint(keyPair.publicKey)}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            Generate keys to see Q
          </p>
        )}
      </div>
    </BentoTile>
  );
}
