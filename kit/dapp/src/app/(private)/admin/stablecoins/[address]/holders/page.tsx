import { AssetHoldersTable } from '@/components/blocks/asset-holders-table/asset-holders-table';
import type { Address } from 'viem';
import { TableClient } from './_components/table-client';

interface PageProps {
  params: Promise<{ id: Address }>;
}

export default async function StablecoinHoldersPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AssetHoldersTable asset={id}>
      <TableClient asset={id} />
    </AssetHoldersTable>
  );
}
