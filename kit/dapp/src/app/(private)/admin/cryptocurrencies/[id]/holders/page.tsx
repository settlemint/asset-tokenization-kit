import { AssetHoldersTable } from '@/components/blocks/asset-holders-table/asset-holders-table';
import type { Metadata } from 'next';
import type { Address } from 'viem';
import { getCryptocurrency } from '../(details)/_components/data';
import { TableClient } from './_components/table-client';

export const metadata: Metadata = {
  title: 'Holders',
  description: 'Inspect all holders of the stablecoin.',
};

export default async function FundHoldersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { decimals } = await getCryptocurrency(id);
  return (
    <AssetHoldersTable asset={id as Address}>
      <TableClient asset={id as Address} decimals={decimals} />
    </AssetHoldersTable>
  );
}
