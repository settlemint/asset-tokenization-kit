import { Badge } from "@/components/ui/badge";
import { FormatValueProps } from "@/lib/utils/format-value/types";
import { safeToString } from "./safe-to-string";

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  // Success states
  active: "default",
  success: "default",
  completed: "default",
  approved: "default",
  enabled: "default",
  online: "default",
  available: "default",

  // Neutral/Inactive states
  inactive: "secondary",
  disabled: "secondary",
  archived: "secondary",
  offline: "secondary",
  unavailable: "secondary",
  paused: "secondary",

  // Error states
  error: "destructive",
  failed: "destructive",
  rejected: "destructive",
  cancelled: "destructive",
  expired: "destructive",
  blocked: "destructive",

  // Pending states
  pending: "outline",
  draft: "outline",
  processing: "outline",
  review: "outline",
  waiting: "outline",
  scheduled: "outline",
};

export function FormatStatus({ value }: FormatValueProps) {
  const statusValue = safeToString(value).toLowerCase();

  return (
    <Badge variant={statusVariants[statusValue] ?? "default"}>
      {safeToString(value)}
    </Badge>
  );
}
