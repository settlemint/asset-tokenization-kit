import { AssetPermissionsTable } from '@/components/blocks/asset-permissions-table/asset-permissions-table';
import { assetConfig } from '@/lib/config/assets';
import type { Address } from 'viem';
import { TableClient } from './_components/table-client';

interface PageProps {
  params: Promise<{ id: Address }>;
}

export default async function StablecoinTokenPermissionsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AssetPermissionsTable assetConfig={assetConfig.stablecoin} asset={id}>
      <TableClient asset={id} />
    </AssetPermissionsTable>
  );
}
