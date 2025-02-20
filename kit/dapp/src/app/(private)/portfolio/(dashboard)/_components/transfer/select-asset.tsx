import type { MyAsset } from '@/components/blocks/my-assets-table/data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
              <Avatar className="h-6 w-6 border border-foreground-muted">
                <AvatarFallback className="text-[7px]">
                  {getAssetInitials(asset.asset.type as keyof typeof assetConfig)}
                </AvatarFallback>
              </Avatar>
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

function getAssetInitials(type: keyof typeof assetConfig): string {
  switch (type) {
    case 'bond':
      return 'BN';
    case 'cryptocurrency':
      return 'CC';
    case 'equity':
      return 'EQ';
    case 'fund':
      return 'FN';
    case 'stablecoin':
      return 'SC';
    default:
      return 'NA';
  }
}
