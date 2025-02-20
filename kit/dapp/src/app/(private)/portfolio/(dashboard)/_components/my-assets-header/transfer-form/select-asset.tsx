import { AssetsSearchSelect } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets-header/transfer-form/search-asset';
import { AssetTypeIcon } from '@/components/blocks/asset-type-icon/asset-type-icon';
import type { MyAsset } from '@/components/blocks/my-assets-table/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { assetConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import { useState } from 'react';

interface SelectAssetProps {
  assets: MyAsset[];
  onSelect: (asset: MyAsset) => void;
}

export function SelectAsset({ assets, onSelect }: SelectAssetProps) {
  const [selectedAsset, setSelectedAsset] = useState<MyAsset | null>(null);

  const handleAssetClick = (asset: MyAsset) => {
    setSelectedAsset(asset);
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
    }
  };

  return (
    <div className="mt-6 flex h-[500px] flex-col">
      <AssetsSearchSelect assets={assets} onSelect={handleAssetClick} />
      <div className="mt-4 flex-1 overflow-y-auto pr-2">
        <div className="space-y-2">
          {assets.map((asset) => (
            <Card
              key={asset.asset.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                selectedAsset?.asset.id === asset.asset.id ? 'border-2 border-primary bg-accent' : ''
              }`}
              onClick={() => handleAssetClick(asset)}
            >
              <CardContent className="flex p-4">
                <div className="flex items-center">
                  <AssetTypeIcon type={asset.asset.type as keyof typeof assetConfig} size="md" />
                </div>
                <div className="ml-4 flex flex-col">
                  <span>
                    {asset.asset.name} ({asset.asset.symbol})
                  </span>
                  <span className="text-muted-foreground text-sm">Current balance: {formatNumber(asset.value)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t pt-4">
        <Button className="w-full" size="lg" onClick={handleConfirm} disabled={!selectedAsset}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
