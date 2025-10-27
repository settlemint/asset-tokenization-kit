import type { useAppForm } from "@/hooks/use-app-form";
import type { AssetType } from "@atk/zod/asset-types";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

type AppFormInstance = ReturnType<typeof useAppForm>;

interface AssetTypeCardProps {
  assetType: AssetType;
  icon: LucideIcon;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (checked: boolean) => void;
  form: AppFormInstance;
}

export const AssetTypeCard = memo(
  ({
    assetType,
    icon,
    isChecked,
    isDisabled,
    onToggle,
    form,
  }: AssetTypeCardProps) => {
    const { t } = useTranslation(["onboarding", "tokens"]);
    const fieldName = `ui.asset-type.${assetType}`;
    const label = t(`asset-types.${assetType}`, { ns: "tokens" });
    const description = t(`assets.descriptions.${assetType}`);
    const disabledLabel = isDisabled ? t("assets.deployed-label") : undefined;

    return (
      <form.AppField
        name={fieldName}
        defaultValue={isChecked ? "selected" : ""}
      >
        {(field) => (
          <field.RadioField
            options={[
              {
                value: "selected",
                label,
                description,
                icon,
                isSelected: isChecked,
                disabled: isDisabled,
                disabledLabel,
                onToggle: (selected: boolean) => {
                  onToggle(selected);
                },
              },
            ]}
            variant="card"
          />
        )}
      </form.AppField>
    );
  }
);

AssetTypeCard.displayName = "AssetTypeCard";
