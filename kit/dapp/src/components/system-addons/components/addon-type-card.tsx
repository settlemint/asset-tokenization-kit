import type { useAppForm } from "@/hooks/use-app-form";
import type { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import type { LucideIcon } from "lucide-react";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

type AppFormInstance = ReturnType<typeof useAppForm>;

interface AddonTypeCardProps {
  addonType: SystemAddonType;
  icon: LucideIcon;
  isChecked: boolean;
  isDisabled: boolean;
  isRequired?: boolean;
  onToggle: (checked: boolean) => void;
  disabledLabel?: string;
  form: AppFormInstance;
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
    form,
  }: AddonTypeCardProps) => {
    const { t } = useTranslation(["onboarding"]);
    // Mirror checkbox behaviour by storing UI selection state under a dedicated field namespace.
    const fieldName = useMemo(() => `ui.addon-type.${addonType}`, [addonType]);

    const options = useMemo(
      () => [
        {
          value: "selected",
          label: t(
            `system-addons.addon-selection.addon-types.${addonType}.title`
          ),
          description: t(
            `system-addons.addon-selection.addon-types.${addonType}.description`
          ),
          icon,
          isSelected: isChecked,
          disabled: isDisabled,
          isRequired,
          disabledLabel,
          onToggle: (selected: boolean) => {
            onToggle(selected);
          },
        },
      ],
      [
        addonType,
        disabledLabel,
        icon,
        isChecked,
        isDisabled,
        isRequired,
        onToggle,
        t,
      ]
    );

    return (
      <form.AppField
        name={fieldName}
        defaultValue={isChecked ? "selected" : ""}
      >
        {(field) => <field.RadioField options={options} variant="card" />}
      </form.AppField>
    );
  }
);

AddonTypeCard.displayName = "AddonTypeCard";
