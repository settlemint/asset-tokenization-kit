import type { AssetType } from "@atk/zod/asset-types";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface AssetTypeCardProps {
  assetType: AssetType;
  icon: LucideIcon;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (checked: boolean) => void;
  disabledLabel?: string;
}

export const AssetTypeCard = memo(
  ({
    assetType,
    icon: Icon,
    isChecked,
    isDisabled,
    onToggle,
    disabledLabel,
  }: AssetTypeCardProps) => {
    const { t } = useTranslation(["onboarding", "tokens"]);
    const label = t(`asset-types.${assetType}`, { ns: "tokens" });
    const description = t(`assets.descriptions.${assetType}`);
    const resolvedDisabledLabel =
      disabledLabel ?? (isDisabled ? t("assets.deployed-label") : undefined);

    const handleClick = () => {
      if (isDisabled) {
        return;
      }
      onToggle(!isChecked);
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-pressed={isChecked}
        className={cn(
          "flex h-full select-none rounded-lg border border-input bg-background p-4 text-left transition-all",
          isDisabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-accent/50 hover:text-accent-foreground",
          isChecked && "border-primary bg-primary/5 text-primary"
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div className="mb-2 flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <div className="text-base font-semibold capitalize">{label}</div>
            {resolvedDisabledLabel && (
              <span className="text-xs text-muted-foreground">
                {resolvedDisabledLabel}
              </span>
            )}
          </div>
          <div className="mb-4 flex-1 text-sm text-muted-foreground">
            {description}
          </div>
        </div>
      </button>
    );
  }
);

AssetTypeCard.displayName = "AssetTypeCard";
