import { AssetTab } from '@/components/blocks/asset-tabs/asset-tab';
import { type StableCoinAsset, getStableCoin } from '../../_components/data';
import { AssetBlockList } from '../_components/tabs/blocklist/asset-blocklist';

export default async function StableCoinHoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AssetTab<StableCoinAsset> id={id} type="stablecoin" dataAction={getStableCoin} activeTab="blocklist">
      <AssetBlockList<StableCoinAsset> id={id} refetchInterval={5000} type="stablecoin" dataAction={getStableCoin} />
    </AssetTab>
  );
}
