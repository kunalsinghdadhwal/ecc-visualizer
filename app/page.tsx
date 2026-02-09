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
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-[1600px] mx-auto px-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          ECC Visualizer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Elliptic Curve Cryptography -- from curve math to ElGamal encryption
        </p>
      </div>
      <BentoGrid>
        {/* Row 1-2: Curve 2x2, Params 1x1, Message 1x1, Point Addition 2x1 */}
        <CurvePlotTile />
        <CurveParamsTile />
        <MessageInputTile />
        <PointAdditionTile />

        {/* Row 3-4: Scalar Mult 2x1, Key Gen 2x2 */}
        <ScalarMultTile />
        <KeyGenerationTile />

        {/* Row 5-6: Encryption 2x2, Decryption 2x2 */}
        <EncryptionTile />
        <DecryptionTile />
      </BentoGrid>
    </main>
  );
}
