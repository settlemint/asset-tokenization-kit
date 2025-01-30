import { AssetTab } from '@/components/blocks/asset-tabs/asset-tab';
import { type StableCoinAsset, getStableCoin } from '../../_components/data';
import { AssetTokenPermissions } from '../_components/tabs/token-permissions/asset-token-permissions';

export default async function StableCoinTokenPermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AssetTab<StableCoinAsset> id={id} type="stablecoin" dataAction={getStableCoin} activeTab="token-permissions">
      <AssetTokenPermissions<StableCoinAsset>
        id={id}
        refetchInterval={5000}
        type="stablecoin"
        dataAction={getStableCoin}
      />
    </AssetTab>
  );
}
