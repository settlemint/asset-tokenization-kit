import { Badge } from "@/components/ui/badge";
import { safeToString } from "./safe-to-string";
import type { FormatValueProps } from "./types";

export function FormatBadge({ value, options }: FormatValueProps) {
  const { displayName } = options;

  // Determine variant based on column type or name
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";

  // For symbol columns, use secondary variant
  if (displayName?.toLowerCase().includes("symbol")) {
    variant = "secondary";
  }

  // For status columns, determine based on value
  if (displayName?.toLowerCase().includes("status")) {
    const statusValue = safeToString(value).toLowerCase();
    if (
      ["active", "success", "completed", "approved", "enabled"].includes(
        statusValue
      )
    ) {
      variant = "default";
    } else if (
      ["inactive", "disabled", "archived", "paused"].includes(statusValue)
    ) {
      variant = "secondary";
    } else if (
      ["error", "failed", "rejected", "cancelled", "expired"].includes(
        statusValue
      )
    ) {
      variant = "destructive";
    } else if (
      ["pending", "draft", "processing", "review", "waiting"].includes(
        statusValue
      )
    ) {
      variant = "outline";
    }
  }

  // Apply for symbol-like badges
  const isSymbol = displayName?.toLowerCase().includes("symbol");

  return (
    <Badge variant={variant} className={isSymbol ? "font-mono" : undefined}>
      {safeToString(value)}
    </Badge>
  );
}
