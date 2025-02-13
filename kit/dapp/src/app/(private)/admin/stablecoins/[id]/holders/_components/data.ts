import type { Pagination, Sorting } from '@/components/blocks/asset-table/server-asset-table-client';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const StablecoinBalancesFragment = theGraphGraphqlStarterkits(`
  fragment StablecoinBalancesFields on AssetBalance {
      value
      account {
        id
        activityEvents(first: 1, orderBy: timestamp, orderDirection: desc, where: { asset: $activityEventAssetId }) {
          timestamp
        }
      }
  }
`);

const StablecoinBalances = theGraphGraphqlStarterkits(
  `
  query StablecoinBalances($id: ID!, $activityEventAssetId: String!, $first: Int, $skip: Int, $orderBy: AssetBalance_orderBy, $orderDirection: OrderDirection) {
    stableCoin(id: $id) {
      symbol
      holders(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ...StablecoinBalancesFields
      }
      admins {
        id
      }
    }
    assetStats_collection(interval: hour, where: { asset: $activityEventAssetId }, first: 1) {
      count
    }
  }
`,
  [StablecoinBalancesFragment]
);

export interface StablecoinHolder extends FragmentOf<typeof StablecoinBalancesFragment> {
  symbol: string;
  type: string;
  lastActivity: string;
}

export async function getStablecoinBalances(
  id: string,
  { first, skip }: Pagination = {},
  sorting: Sorting | null = null
) {
  const data = await theGraphClientStarterkits.request(StablecoinBalances, {
    id,
    activityEventAssetId: id,
    first,
    skip,
    orderDirection: sorting?.orderDirection ?? 'desc',
    orderBy: mapSorting(sorting),
  });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }
  const { holders, symbol, admins } = data.stableCoin;
  const count = data.assetStats_collection[0].count;
  const adminIds = admins.map((admin) => admin.id);

  const records = holders.map((holder) => {
    const lastAssetActivityTimestamp = holder.account.activityEvents[0]?.timestamp;
    return {
      ...holder,
      symbol,
      type: adminIds.includes(holder.account.id) ? 'Creator / Owner' : 'Regular holder',
      lastActivity: lastAssetActivityTimestamp,
    };
  });
  return { holders: records, count: Number(count) };
}

function mapSorting(sorting: Sorting | null) {
  switch (sorting?.orderBy) {
    case 'value':
      return 'value';
    case 'wallet':
      return 'id';
    default:
      return null;
  }
}

export type StablecoinHoldersBalance = Awaited<ReturnType<typeof getStablecoinBalances>>['holders'][number];
