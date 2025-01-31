import { AssetTab } from '@/components/blocks/asset-tabs/asset-tab';
import { type StableCoinAsset, getStableCoin } from '../../_components/data';
import { AssetEvents } from '../_components/tabs/events/asset-events';

export default async function StableCoinEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AssetTab<StableCoinAsset> id={id} type="stablecoin" dataAction={getStableCoin} activeTab="events">
      <AssetEvents<StableCoinAsset> id={id} refetchInterval={5000} type="stablecoin" dataAction={getStableCoin} />
    </AssetTab>
  );
}
