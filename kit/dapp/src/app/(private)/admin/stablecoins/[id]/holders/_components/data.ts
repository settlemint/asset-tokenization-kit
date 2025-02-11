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
  query StablecoinBalances($id: ID!, $activityEventAssetId: String!) {
    stableCoin(id: $id) {
      symbol
      holders {
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

export async function getStablecoinBalances(id: string) {
  const data = await theGraphClientStarterkits.request(StablecoinBalances, { id, activityEventAssetId: id });
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
      lastActivity: lastAssetActivityTimestamp ? new Date(Number(lastAssetActivityTimestamp) * 1000) : null,
    };
  });
}

export type StablecoinHoldersBalance = Awaited<ReturnType<typeof getStablecoinBalances>>[number];
