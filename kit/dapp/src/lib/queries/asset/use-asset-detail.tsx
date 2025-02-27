import { useEffect, useState } from 'react';
import { type AssetDetailProps, getOptionalAssetDetail } from './asset-detail';

export function useOptionalAssetDetail({ address }: AssetDetailProps) {
  const [asset, setAsset] = useState<Awaited<
    ReturnType<typeof getOptionalAssetDetail>
  > | null>(null);

  useEffect(() => {
    getOptionalAssetDetail({ address })
      .then(setAsset)
      .catch(() => setAsset(null));
  }, [address]);

  return asset;
}
