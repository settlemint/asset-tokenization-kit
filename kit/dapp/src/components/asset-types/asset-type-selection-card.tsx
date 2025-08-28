import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { AssetTypeCardBase } from "./asset-type-card-base";
import type { AssetTypeSelectionProps } from "./types";

export const AssetTypeSelectionCard = memo(function AssetTypeSelectionCard({
  assetType,
  isSelected,
  onSelect,
  isDisabled = false,
  disabledLabel,
  variant,
  className,
}: AssetTypeSelectionProps) {
  const { t } = useTranslation(["onboarding", "tokens"]);

  const handleInteraction = () => {
    if (isDisabled) return;

    if (variant === "checkbox") {
      onSelect(!isSelected);
    } else {
      onSelect(true);
    }
  };

  const selectionControl =
    variant === "checkbox" ? (
      <Checkbox
        id={`asset-type-${assetType}`}
        checked={isSelected}
        onCheckedChange={(checked) => {
          onSelect(!!checked);
        }}
        disabled={isDisabled}
      />
    ) : (
      <RadioGroupItem
        value={assetType}
        id={`asset-type-${assetType}`}
        disabled={isDisabled}
      />
    );

  return (
    <div
      className={cn(
        "group cursor-pointer",
        isDisabled && "cursor-not-allowed opacity-60",
        className
      )}
      onClick={handleInteraction}
    >
      <AssetTypeCardBase
        assetType={assetType}
        variant="compact"
        className={cn(
          "transition-all duration-200",
          isSelected && !isDisabled && "ring-2 ring-primary bg-primary/5",
          !isDisabled && "hover:shadow-md group-hover:border-primary/50",
          isDisabled && "border-muted bg-muted/20"
        )}
        headerActions={selectionControl}
      >
        <div className="space-y-2">
          {isDisabled && disabledLabel && (
            <div className="text-xs text-muted-foreground font-medium">
              {disabledLabel}
            </div>
          )}

          {variant === "radio" && (
            <Label
              htmlFor={`asset-type-${assetType}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {t(`assets.descriptions.${assetType}`, {
                defaultValue: `Select ${assetType} for your asset`,
              })}
            </Label>
          )}
        </div>
      </AssetTypeCardBase>
    </div>
  );
});
