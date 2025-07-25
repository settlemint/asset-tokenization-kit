import { CheckboxCard } from "@/components/form/checkbox-card";
import type { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface AddonTypeCardProps {
  addonType: SystemAddonType;
  icon: LucideIcon;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (checked: boolean) => void;
}

export const AddonTypeCard = memo(
  ({
    addonType,
    icon,
    isChecked,
    isDisabled,
    onToggle,
  }: AddonTypeCardProps) => {
    const { t } = useTranslation(["onboarding"]);

    return (
      <CheckboxCard
        title={t(
          `system-addons.addon-selection.addon-types.${addonType}.title`
        )}
        description={t(
          `system-addons.addon-selection.addon-types.${addonType}.description`
        )}
        icon={icon}
        isChecked={isChecked}
        isDisabled={isDisabled}
        disabledLabel={isDisabled ? t("assets.deployed-label") : undefined}
        onToggle={onToggle}
      />
    );
  }
);

AddonTypeCard.displayName = "AddonTypeCard";
