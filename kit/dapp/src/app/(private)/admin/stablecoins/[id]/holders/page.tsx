import { AssetTab } from '@/components/blocks/asset-tabs/asset-tab';
import { type StableCoinAsset, getStableCoin } from '../../_components/data';
import { AssetHolders } from '../_components/tabs/holders/asset-holders';

export default async function StableCoinHoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AssetTab<StableCoinAsset> id={id} type="stablecoin" dataAction={getStableCoin} activeTab="holders">
      <AssetHolders<StableCoinAsset> id={id} refetchInterval={5000} type="stablecoin" dataAction={getStableCoin} />
    </AssetTab>
  );
}
