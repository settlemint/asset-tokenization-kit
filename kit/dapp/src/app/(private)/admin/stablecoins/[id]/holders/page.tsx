import { AssetTableServerSide } from '@/components/blocks/asset-table/asset-table-server-side';
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
    <AssetTableServerSide
      assetConfig={assetConfig}
      dataAction={() =>
        getStablecoinBalances(id, { first: 10, skip: 0 }).then((result) => ({
          assets: result.holders,
          rowCount: result.count,
        }))
      }
      columns={columns}
    >
      <HoldersTableClient id={id} assetConfig={assetConfig} />
    </AssetTableServerSide>
  );
}
