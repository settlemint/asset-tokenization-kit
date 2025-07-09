import { Badge } from "@/components/ui/badge";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TokenStatusBadgeProps {
  /** Whether the token is paused */
  paused: boolean;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Custom className for the badge */
  className?: string;
}

/**
 * TokenStatusBadge component displays the current status of a token (Active/Paused)
 *
 * This component provides a consistent way to display token status across the application,
 * with optional icon display and customizable styling.
 *
 * @param props - Component props
 * @param props.paused - Whether the token is paused
 * @param props.showIcon - Whether to show the status icon (default: true)
 * @param props.className - Additional CSS classes for the badge
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TokenStatusBadge paused={token.pausable.paused} />
 *
 * // Without icon
 * <TokenStatusBadge paused={false} showIcon={false} />
 *
 * // With custom styling
 * <TokenStatusBadge paused={true} className="text-sm" />
 * ```
 */
export function TokenStatusBadge({
  paused,
  showIcon = true,
  className,
}: TokenStatusBadgeProps) {
  const { t } = useTranslation("tokens");

  return (
    <Badge variant={paused ? "destructive" : "default"} className={className}>
      {showIcon &&
        (paused ? (
          <PauseCircle className="h-4 w-4" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        ))}
      {paused ? t("status.paused") : t("status.active")}
    </Badge>
  );
}
