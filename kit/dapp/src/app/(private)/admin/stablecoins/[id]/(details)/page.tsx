import { AssetDetails } from '@/components/blocks/asset-tabs/asset-details';
import { icons } from '../../_components/columns';
import { type StableCoinAsset, getStableCoin } from '../../_components/data';
import { AssetDetailsClient } from '../_components/asset-details-client';

export default async function StableCoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AssetDetails<StableCoinAsset> id={id} type="stablecoin" dataAction={getStableCoin}>
      <AssetDetailsClient<StableCoinAsset>
        id={id}
        refetchInterval={5000}
        type="stablecoin"
        dataAction={getStableCoin}
        icons={icons}
      />
    </AssetDetails>
  );
}
