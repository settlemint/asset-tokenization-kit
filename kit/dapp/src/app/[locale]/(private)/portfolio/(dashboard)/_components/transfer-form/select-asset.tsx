import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { MyAsset } from "@/lib/queries/portfolio/portfolio-dashboard";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface SelectAssetProps {
  assets: MyAsset[];
  onSelect: (asset: MyAsset) => void;
}

export function SelectAsset({ onSelect }: SelectAssetProps) {
  const { control } = useFormContext();
  const t = useTranslations("portfolio.transfer-form.select-asset");
  const [selectedAsset, setSelectedAsset] = useState<MyAsset | null>(null);

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label>Asset</Label>
          <FormAssets
            control={control}
            name="asset"
            label={t("asset-label")}
            description={t("asset-description")}
          />
        </div>

        <div className="mt-6 text-right">
          <Button onClick={handleConfirm} disabled={!selectedAsset}>
            Confirm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
