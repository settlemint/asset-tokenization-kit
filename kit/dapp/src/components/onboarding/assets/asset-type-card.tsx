import { Checkbox } from "@/components/ui/checkbox";
import type { AssetType } from "@/lib/zod/validators/asset-types";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface AssetTypeCardProps {
  assetType: AssetType;
  icon: LucideIcon;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (checked: boolean) => void;
}

const CheckboxWrapper = memo(
  ({
    onClick,
    children,
  }: {
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
  }) => <div onClick={onClick}>{children}</div>
);
CheckboxWrapper.displayName = "CheckboxWrapper";

export const AssetTypeCard = memo(
  ({
    assetType,
    icon: Icon,
    isChecked,
    isDisabled,
    onToggle,
  }: AssetTypeCardProps) => {
    const { t } = useTranslation(["onboarding", "tokens"]);

    // Event handlers are automatically optimized by React Compiler - no manual memoization needed
    const handleItemClick = () => {
      if (isDisabled) return;
      onToggle(!isChecked);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const handleCheckboxChange = (checked: boolean) => {
      if (isDisabled) return;
      onToggle(checked);
    };

    return (
      <div
        className={`flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 transition-colors ${
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-muted/50"
            : "hover:bg-accent/50 cursor-pointer"
        }`}
        onClick={handleItemClick}
      >
        <CheckboxWrapper onClick={handleCheckboxClick}>
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheckboxChange}
            disabled={isDisabled}
          />
        </CheckboxWrapper>
        <div className="flex-1 space-y-1 leading-none">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"}`}
            />
            <label
              className={`text-sm font-medium ${isDisabled ? "" : "cursor-pointer"}`}
            >
              {t(`asset-types.${assetType}`, { ns: "tokens" })}
            </label>
            {isDisabled && (
              <span className="text-xs text-muted-foreground">
                {t("assets.deployed-label")}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t(`assets.descriptions.${assetType}`)}
          </p>
        </div>
      </div>
    );
  }
);

AssetTypeCard.displayName = "AssetTypeCard";
