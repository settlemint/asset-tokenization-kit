import { AssetDetails } from '@/components/blocks/asset-tabs/asset-details';
import { getStableCoin } from '../../_components/data';

export default async function StableCoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AssetDetails id={id} type="stablecoin" dataAction={getStableCoin} refetchInterval={5000} />;
}
