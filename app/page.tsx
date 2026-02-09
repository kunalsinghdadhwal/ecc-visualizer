import { BentoGrid } from "@/components/bento-grid";
import { CurvePlotTile } from "@/components/tiles/curve-plot-tile";
import { CurveParamsTile } from "@/components/tiles/curve-params-tile";
import { MessageInputTile } from "@/components/tiles/message-input-tile";
import { PointAdditionTile } from "@/components/tiles/point-addition-tile";
import { ScalarMultTile } from "@/components/tiles/scalar-mult-tile";
import { KeyGenerationTile } from "@/components/tiles/key-generation-tile";
import { GeneratorTile } from "@/components/tiles/generator-tile";
import { EncryptionTile } from "@/components/tiles/encryption-tile";
import { DecryptionTile } from "@/components/tiles/decryption-tile";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ECC Visualizer",
  url: "https://ecc.kxnl.in",
  description:
    "Explore elliptic curve cryptography visually. Step through point addition, scalar multiplication, key generation, and ElGamal encryption/decryption on interactive SVG curves.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-background py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1600px] mx-auto px-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          ECC Visualizer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Elliptic Curve Cryptography -- from curve math to ElGamal encryption
        </p>
      </div>
      <BentoGrid>
        {/* Row 1-2: Curve 2x2, Params + Message + Point Addition + Scalar Mult */}
        <CurvePlotTile />
        <CurveParamsTile />
        <MessageInputTile />
        <PointAdditionTile />
        <ScalarMultTile />

        {/* Bottom: Key Gen 2 cols + stacked right column */}
        <KeyGenerationTile />
        <div className="md:col-span-2 flex flex-col gap-3">
          <GeneratorTile />
          <EncryptionTile />
          <DecryptionTile />
        </div>
      </BentoGrid>
    </main>
  );
}
