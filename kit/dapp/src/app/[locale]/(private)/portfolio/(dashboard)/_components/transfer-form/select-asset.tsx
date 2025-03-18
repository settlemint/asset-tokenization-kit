import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { Button } from "@/components/ui/button";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface SelectAssetProps {
  onSelect: (asset: Asset) => void;
}

type Asset = UserAsset["asset"] & {
  holders: { value: number; account: { id: string } }[];
};

export function SelectAsset({ onSelect }: SelectAssetProps) {
  const { control } = useFormContext();
  const t = useTranslations("portfolio.transfer-form.select-asset");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleConfirm = () => {
    if (onSelect && selectedAsset) {
      onSelect(selectedAsset);
    } else {
      setSelectedAsset(selectedAsset);
    }
  };

  return (
    <>
      <FormAssets
        control={control}
        name="asset"
        label={t("asset-label")}
        description={t("asset-description")}
        onSelect={onSelect}
      />

      <div className="mt-6 text-right">
        <Button onClick={handleConfirm} disabled={!selectedAsset}>
          Confirm
        </Button>
      </div>
    </>
  );
}
