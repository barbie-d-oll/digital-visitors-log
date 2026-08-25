import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NdaAgreementPanelProps = {
  ndaText: string;
  signature: string;
  onSign: () => void;
  onSignatureChange: (signature: string) => void;
};

export function NdaAgreementPanel({
  ndaText,
  signature,
  onSign,
  onSignatureChange,
}: NdaAgreementPanelProps) {
  return (
    <div className="flex min-h-[30rem] flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold tracking-normal">
          Visitor Agreement
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Please read and sign the agreement before proceeding.
        </p>

        <div className="mt-5 max-h-48 overflow-y-auto rounded-xl border border-border bg-background p-4 text-xs leading-5 text-muted-foreground">
          {ndaText || "No agreement text configured."}
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-bold text-foreground/80">
            Type your full name to sign
          </span>
          <Input
            className="h-12 rounded-xl bg-background font-mono"
            placeholder="Your full name as signature"
            value={signature}
            onChange={(event) => onSignatureChange(event.target.value)}
          />
        </label>

        <Button
          type="button"
          onClick={onSign}
          disabled={!signature.trim()}
          className="mt-5 h-12 w-full rounded-xl font-bold"
        >
          I agree &amp; sign
        </Button>
      </div>
    </div>
  );
}
