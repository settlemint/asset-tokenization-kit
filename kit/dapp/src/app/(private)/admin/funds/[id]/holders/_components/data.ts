import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { unstable_cache } from 'next/cache';
import { getAddress } from 'viem';

const FundBalancesFragment = theGraphGraphqlStarterkits(`
  fragment FundBalancesFields on AssetBalance {
      value
      account {
        id
        activityEvents(first: 1, orderBy: timestamp, orderDirection: desc, where: { asset: $activityEventAssetId }) {
          timestamp
        }
      }
  }
`);

const FundBalances = theGraphGraphqlStarterkits(
  `
  query FundBalances($id: ID!, $activityEventAssetId: String!) {
    fund(id: $id) {
      symbol
      holders {
        ...FundBalancesFields
      }
      admins {
        id
      }
    }
  }
`,
  [FundBalancesFragment]
);

const UserQuery = hasuraGraphql(`
  query TransactionUser($id: String!) {
    user(where: { wallet: { _eq: $id } }) {
      wallet
      name
    }
  }
`);

const getUser = unstable_cache(
  async (walletAddress: string) => {
    const user = await hasuraClient.request(UserQuery, {
      id: walletAddress,
    });
    return user.user[0];
  },
  ['holder-user'],
  {
    revalidate: 3_600, // Cache for 1 hour
    tags: ['holder-user'],
  }
);

export async function getFundBalances(id: string) {
  const data = await theGraphClientStarterkits.request(FundBalances, { id, activityEventAssetId: id });
  if (!data.fund) {
    throw new Error('Fund not found');
  }
  const { holders, symbol, admins } = data.fund;
  const adminIds = admins.map((admin) => admin.id);

  const users = await Promise.all(holders.map((holder) => getUser(getAddress(holder.account.id))));

  return holders.map((holder) => {
    const lastAssetActivityTimestamp = holder.account.activityEvents[0]?.timestamp;
    const holderAddress = getAddress(holder.account.id);
    return {
      ...holder,
      symbol,
      type: adminIds.includes(holder.account.id) ? 'Creator / Owner' : 'Regular holder',
      lastActivity: lastAssetActivityTimestamp,
      name: users.find(({ wallet }) => wallet === holderAddress)?.name,
    };
  });
}

export type FundHoldersBalance = Awaited<ReturnType<typeof getFundBalances>>[number];
