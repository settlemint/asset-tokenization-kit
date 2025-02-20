import { AssetsSearchSelect } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets-header/transfer-form/search-asset';
import type { MyAsset } from '@/components/blocks/my-assets-table/data';
import { Button } from '@/components/ui/button';
import {} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
    <div className="mt-6">
      <div className="space-y-2">
        <Label>Asset</Label>
        <AssetsSearchSelect assets={assets} selectedAsset={selectedAsset} onSelect={handleAssetClick} />
      </div>

      <div className="mt-6 text-right">
        <Button onClick={handleConfirm} disabled={!selectedAsset}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
