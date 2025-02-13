import { AssetTable } from '@/components/blocks/asset-table/asset-table';
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
  return (
    <AssetTable
      assetConfig={assetConfig}
      dataAction={() => getStablecoinBalances(id, { first: 10, skip: 0 }).then((data) => data.holders)}
      columns={columns}
    >
      <HoldersTableClient id={id} assetConfig={assetConfig} />
    </AssetTable>
  );
}
