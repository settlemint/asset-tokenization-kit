import { AssetPermissionsTable } from '@/components/blocks/asset-permissions-table/asset-permissions-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'Token permissions',
  description: 'Manage token permissions for the stablecoin.',
};

export default async function StablecoinTokenPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <AssetPermissionsTable assetConfig={assetConfig.stablecoin} asset={id as Address} />;
}
