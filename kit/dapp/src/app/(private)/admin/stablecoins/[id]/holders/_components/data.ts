import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

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
  query StablecoinBalances($id: ID!, $activityEventAssetId: String!, $first: Int, $skip: Int) {
    stableCoin(id: $id) {
      symbol
      holders(first: $first, skip: $skip) {
        ...StablecoinBalancesFields
      }
      admins {
        id
      }
    }
  }
`,
  [StablecoinBalancesFragment]
);

interface Pagination {
  first?: number;
  skip?: number;
}

export async function getStablecoinBalances(id: string, { first, skip }: Pagination = {}) {
  const data = await theGraphClientStarterkits.request(StablecoinBalances, {
    id,
    activityEventAssetId: id,
    first,
    skip,
  });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }
  const { holders, symbol, admins } = data.stableCoin;
  const adminIds = admins.map((admin) => admin.id);

  return holders.map((holder) => {
    const lastAssetActivityTimestamp = holder.account.activityEvents[0]?.timestamp;
    return {
      ...holder,
      symbol,
      type: adminIds.includes(holder.account.id) ? 'Creator / Owner' : 'Regular holder',
      lastActivity: lastAssetActivityTimestamp,
    };
  });
}

export type StablecoinHoldersBalance = Awaited<ReturnType<typeof getStablecoinBalances>>[number];
