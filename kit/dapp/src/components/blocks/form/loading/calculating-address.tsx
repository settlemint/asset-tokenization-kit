import { AlertCircle, Loader2 } from "lucide-react";

interface CalculatingAddressIndicatorProps {
  error?: string | null;
}

export function CalculatingAddressIndicator({
  error,
}: CalculatingAddressIndicatorProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="size-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      <span>Verifying asset uniqueness...</span>
    </div>
  );
}
