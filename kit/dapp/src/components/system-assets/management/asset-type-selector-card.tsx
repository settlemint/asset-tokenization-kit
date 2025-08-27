import { getAssetIcon } from "@/components/system-assets/components/asset-icons";
import { AssetTypeCard } from "@/components/system-assets/components/asset-type-card";
import { TokenTypeEnum } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { memo } from "react";

interface AssetTypeSelectorCardProps {
  assetType: (typeof TokenTypeEnum.options)[number];
  isSelected: boolean;
  isDeployed: boolean;
  isDeploying: boolean;
  hasSystemManagerRole: boolean;
  onToggle: (
    assetType: (typeof TokenTypeEnum.options)[number],
    checked: boolean
  ) => void;
}

export const AssetTypeSelectorCard = memo(function AssetTypeSelectorCard({
  assetType,
  isSelected,
  isDeployed,
  isDeploying,
  hasSystemManagerRole,
  onToggle,
}: AssetTypeSelectorCardProps) {
  const Icon = getAssetIcon(assetType);
  const isDisabled = isDeploying || isDeployed || !hasSystemManagerRole;

  return (
    <AssetTypeCard
      key={assetType}
      assetType={assetType}
      icon={Icon}
      isChecked={isSelected}
      isDisabled={isDisabled}
      onToggle={(checked) => {
        if (!isDisabled) {
          onToggle(assetType, checked);
        }
      }}
    />
  );
});
