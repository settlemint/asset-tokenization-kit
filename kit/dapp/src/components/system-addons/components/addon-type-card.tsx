import type { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface AddonTypeCardProps {
  addonType: SystemAddonType;
  icon: LucideIcon;
  isChecked: boolean;
  isDisabled: boolean;
  isRequired?: boolean;
  disabledLabel?: string;
  onToggle: (checked: boolean) => void;
}

export const AddonTypeCard = memo(
  ({
    addonType,
    icon: Icon,
    isChecked,
    isDisabled,
    isRequired,
    disabledLabel,
    onToggle,
  }: AddonTypeCardProps) => {
    const { t } = useTranslation(["onboarding"]);
    const label = t(
      `system-addons.addon-selection.addon-types.${addonType}.title`
    );
    const description = t(
      `system-addons.addon-selection.addon-types.${addonType}.description`
    );
    const resolvedDisabledLabel = disabledLabel;

    const handleClick = () => {
      if (isDisabled) {
        return;
      }

      if (isRequired && isChecked) {
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
        aria-required={isRequired || undefined}
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

AddonTypeCard.displayName = "AddonTypeCard";
