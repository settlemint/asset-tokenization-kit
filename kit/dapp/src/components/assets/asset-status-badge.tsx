import { Badge } from "@/components/ui/badge";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AssetStatusBadgeProps {
  /** Whether the asset is paused */
  paused: boolean;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Custom className for the badge */
  className?: string;
}

/**
 * AssetStatusBadge component displays the current status of an asset (Active/Paused)
 *
 * This component provides a consistent way to display asset status across the application,
 * with optional icon display and customizable styling.
 *
 * @param props - Component props
 * @param props.paused - Whether the asset is paused
 * @param props.showIcon - Whether to show the status icon (default: true)
 * @param props.className - Additional CSS classes for the badge
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AssetStatusBadge paused={asset.pausable.paused} />
 *
 * // Without icon
 * <AssetStatusBadge paused={false} showIcon={false} />
 *
 * // With custom styling
 * <AssetStatusBadge paused={true} className="text-sm" />
 * ```
 */
export function AssetStatusBadge({
  paused,
  showIcon = true,
  className,
}: AssetStatusBadgeProps) {
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
