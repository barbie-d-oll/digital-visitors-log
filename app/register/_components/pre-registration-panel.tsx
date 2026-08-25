import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PreRegistrationPanelProps = {
  code: string;
  expanded: boolean;
  loading: boolean;
  onCheckIn: () => void;
  onCodeChange: (code: string) => void;
  onToggle: () => void;
};

export function PreRegistrationPanel({
  code,
  expanded,
  loading,
  onCheckIn,
  onCodeChange,
  onToggle,
}: PreRegistrationPanelProps) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-secondary/60 p-4">
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-full justify-start p-0 text-left hover:bg-transparent"
        onClick={onToggle}
      >
        <span>
          <span className="block text-sm font-semibold text-foreground">
            Have a pre-registration code?
          </span>
          <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
            If your host pre-registered you, enter your code for instant
            check-in.
          </span>
        </span>
      </Button>

      {expanded && (
        <div className="mt-3 flex gap-2">
          <Input
            className="h-12 flex-1 rounded-xl bg-background font-mono text-sm font-bold tracking-wider uppercase"
            placeholder="PR-XXXXXX"
            value={code}
            onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
          />
          <Button
            type="button"
            onClick={onCheckIn}
            disabled={loading || !code.trim()}
            className="h-12 rounded-xl px-5 font-bold"
          >
            {loading ? "Checking..." : "Check In"}
          </Button>
        </div>
      )}
    </div>
  );
}
