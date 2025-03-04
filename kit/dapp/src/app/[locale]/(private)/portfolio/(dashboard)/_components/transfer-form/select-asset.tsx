import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { MyAsset } from '@/lib/queries/portfolio/portfolio-dashboard';
import { useState } from 'react';
import { AssetsSearchSelect } from './search-asset';

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
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label>Asset</Label>
          <AssetsSearchSelect assets={assets} selectedAsset={selectedAsset} onSelect={handleAssetClick} />
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
