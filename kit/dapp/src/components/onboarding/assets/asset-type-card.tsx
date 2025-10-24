import type { useAppForm } from "@/hooks/use-app-form";
import type { AssetType } from "@atk/zod/asset-types";
import type { LucideIcon } from "lucide-react";
import { memo, useMemo } from "react";
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
    // Track UI-only toggle state per asset type so we can reuse the shared radio card renderer.
    const fieldName = useMemo(() => `ui.asset-type.${assetType}`, [assetType]);

    const options = useMemo(
      () => [
        {
          value: "selected",
          label: t(`asset-types.${assetType}`, { ns: "tokens" }),
          description: t(`assets.descriptions.${assetType}`),
          icon,
          isSelected: isChecked,
          disabled: isDisabled,
          disabledLabel: isDisabled ? t("assets.deployed-label") : undefined,
          onToggle: (selected: boolean) => {
            onToggle(selected);
          },
        },
      ],
      [assetType, icon, isChecked, isDisabled, onToggle, t]
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

AssetTypeCard.displayName = "AssetTypeCard";
