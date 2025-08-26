import { CheckboxCard } from "@/components/form/checkbox-card";
import type { AssetType } from "@atk/zod/asset-types";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

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
    icon,
    isChecked,
    isDisabled,
    onToggle,
    disabledLabel,
  }: AssetTypeCardProps) => {
    const { t } = useTranslation(["onboarding", "tokens"]);

    return (
      <CheckboxCard
        title={t(`asset-types.${assetType}`, { ns: "tokens" })}
        description={t(`assets.descriptions.${assetType}`)}
        icon={icon}
        isChecked={isChecked}
        isDisabled={isDisabled}
        disabledLabel={disabledLabel ?? (isDisabled ? t("assets.deployed-label") : undefined)}
        onToggle={onToggle}
      />
    );
  }
);

AssetTypeCard.displayName = "AssetTypeCard";