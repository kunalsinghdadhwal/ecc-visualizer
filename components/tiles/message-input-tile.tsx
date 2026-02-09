"use client";

import { BentoTile } from "@/components/bento-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useECCStore } from "@/hooks/use-ecc-store";
import { messageToPoint, stringToNumber, formatPoint } from "@/lib/message-mapping";

export function MessageInputTile() {
  const { messageText, setMessageText, setMessagePoint, curveParams, messagePoint } =
    useECCStore();

  const handleChange = (value: string) => {
    setMessageText(value);
    if (value.length > 0) {
      const num = stringToNumber(value);
      const point = messageToPoint(num, curveParams);
      setMessagePoint(point);
    } else {
      setMessagePoint(null);
    }
  };

  return (
    <BentoTile title="Message">
      <div className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Plaintext message</Label>
          <Input
            value={messageText}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type a message..."
            className="text-sm"
          />
        </div>
        {messageText && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Numeric value: {stringToNumber(messageText)}</p>
            <p>
              Point M:{" "}
              <span className="text-foreground font-mono text-xs">
                {formatPoint(messagePoint)}
              </span>
            </p>
          </div>
        )}
      </div>
    </BentoTile>
  );
}
