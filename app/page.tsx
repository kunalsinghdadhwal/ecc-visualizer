"use client";

import { BentoGrid } from "@/components/bento-grid";
import { CurvePlotTile } from "@/components/tiles/curve-plot-tile";
import { CurveParamsTile } from "@/components/tiles/curve-params-tile";
import { MessageInputTile } from "@/components/tiles/message-input-tile";
import { PointAdditionTile } from "@/components/tiles/point-addition-tile";
import { ScalarMultTile } from "@/components/tiles/scalar-mult-tile";
import { KeyGenerationTile } from "@/components/tiles/key-generation-tile";
import { EncryptionTile } from "@/components/tiles/encryption-tile";
import { DecryptionTile } from "@/components/tiles/decryption-tile";

export default function Page() {
  return (
    <main className="min-h-screen bg-background py-6">
      <div className="max-w-[1600px] mx-auto px-4 mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          ECC Visualizer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Elliptic Curve Cryptography -- from curve math to ElGamal encryption
        </p>
      </div>
      <BentoGrid>
        {/* Row 1-2 */}
        <CurvePlotTile />
        <CurveParamsTile />
        <MessageInputTile />
        <PointAdditionTile />

        {/* Row 3 */}
        <ScalarMultTile />
        <KeyGenerationTile />

        {/* Row 4-5 */}
        <EncryptionTile />
        <DecryptionTile />
      </BentoGrid>
    </main>
  );
}
