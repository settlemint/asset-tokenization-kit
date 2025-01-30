import { AssetTab } from '@/components/blocks/asset-tabs/asset-tab';
import { type StableCoinAsset, getStableCoin } from '../../_components/data';
import { AssetDetails } from '../_components/tabs/details/asset-details';

export default async function StableCoinDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AssetTab<StableCoinAsset> id={id} type="stablecoin" dataAction={getStableCoin} activeTab="details">
      <AssetDetails<StableCoinAsset> id={id} refetchInterval={5000} type="stablecoin" dataAction={getStableCoin} />
    </AssetTab>
  );
}
