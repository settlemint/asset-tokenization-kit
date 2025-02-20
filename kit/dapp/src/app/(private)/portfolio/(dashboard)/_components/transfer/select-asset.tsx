import { AssetTypeIcon } from '@/components/blocks/asset-type-icon/asset-type-icon';
import type { MyAsset } from '@/components/blocks/my-assets-table/data';
import { Card, CardContent } from '@/components/ui/card';
import type { assetConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';

interface SelectAssetProps {
  assets: MyAsset[];
  onSelect: (asset: MyAsset) => void;
}

export function SelectAsset({ assets, onSelect }: SelectAssetProps) {
  return (
    <div className="mt-6 space-y-2">
      {assets.map((asset) => (
        <Card
          key={asset.asset.id}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => onSelect(asset)}
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
  );
}
