import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { getStablecoinBalances } from './_components/data';
import { columns } from './_components/holders-columns';
import { HoldersTableClient } from './_components/holders-table.client';

const PAGE_SIZE = 1;

export default async function StableCoinHoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AssetTable
      assetConfig={{
        queryKey: [],
        name: 'stablecoin-holders',
      }}
      dataAction={() => getStablecoinBalances(id, { first: PAGE_SIZE, skip: 0 })}
      columns={columns}
    >
      <HoldersTableClient />
    </AssetTable>
  );
}
