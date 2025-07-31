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
  isRequired?: boolean;
  onToggle: (checked: boolean) => void;
  disabledLabel?: string;
}

export const AddonTypeCard = memo(
  ({
    addonType,
    icon,
    isChecked,
    isDisabled,
    isRequired,
    onToggle,
    disabledLabel,
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
        isRequired={isRequired}
        disabledLabel={disabledLabel}
        onToggle={onToggle}
      />
    );
  }
);

AddonTypeCard.displayName = "AddonTypeCard";
