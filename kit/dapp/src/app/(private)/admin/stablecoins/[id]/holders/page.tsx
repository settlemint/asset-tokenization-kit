import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import type { SortingState } from '@tanstack/react-table';
import { getStablecoinBalances } from './_components/data';
import { columns } from './_components/holders-columns';
import { HoldersTableClient } from './_components/holders-table.client';

export default async function StableCoinHoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const assetConfig = {
    queryKey: [],
    name: 'stablecoin-holders',
  };
  const initialSorting: SortingState = [{ id: 'value', desc: true }];
  return (
    <AssetTable
      assetConfig={assetConfig}
      dataAction={() =>
        getStablecoinBalances(
          id,
          { first: 10, skip: 0 },
          {
            orderBy: 'value',
            orderDirection: 'desc',
          }
        ).then((result) => ({
          assets: result.holders,
          rowCount: result.count,
        }))
      }
      columns={columns}
    >
      <HoldersTableClient id={id} assetConfig={assetConfig} initialSorting={initialSorting} />
    </AssetTable>
  );
}
