'use server';

import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { unstable_cache } from 'next/cache';
import { DASHBOARD_CHART_QUERY_KEY } from '../consts';

const UsersQuery = hasuraGraphql(`
query UsersQuery($createdAfter: timestamp!) {
  user_aggregate {
    nodes {
      id
    }
  }
  recent_users_aggregate: user_aggregate(
    where: { created_at: { _gt: $createdAfter } }
  ) {
    aggregate {
      count
    }
  }
}
`);

const ProcessedTransactions = portalGraphql(`
  query ProcessedTransactions($processedAfter: String) {
    total: getProcessedTransactions {
      count
    }
    last24Hours: getProcessedTransactions(processedAfter: $processedAfter) {
      count
    }
  }
`);

const TransferFragment = theGraphGraphqlStarterkits(`
  fragment TransferFragment on Event_Transfer {
    from {
      id
    }
    to {
      id
    }
    value
  }
`);

const AssetFragment = theGraphGraphqlStarterkits(`
  fragment AssetFragment on Asset {
    id
    totalSupply
  }
`);

const AssetsSupplyQuery = theGraphGraphqlStarterkits(
  `
  query AssetsSupply($timestamp: BigInt) {
    stableCoins {
      ...AssetFragment
      transfers(where: {timestamp_gt: $timestamp}) {
        ...TransferFragment
      }
    }
    bonds {
      ...AssetFragment
      transfers(where: {timestamp_gt: $timestamp}) {
        ...TransferFragment
      }
    }
    equities {
      ...AssetFragment
      transfers(where: {timestamp_gt: $timestamp}) {
        ...TransferFragment
      }
    }
    cryptoCurrencies {
      ...AssetFragment
      transfers(where: {timestamp_gt: $timestamp}) {
        ...TransferFragment
      }
    }
  }
`,
  [TransferFragment, AssetFragment]
);

async function getUsersData() {
  const data = await hasuraClient.request(UsersQuery, {
    createdAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    totalUsers: data.user_aggregate.nodes.length,
    last24Hours: data.recent_users_aggregate.aggregate?.count ?? 0,
    difference24Hours: data.recent_users_aggregate.aggregate?.count ?? 0,
  };
}

async function getProcessedTransactions() {
  const data = await portalClient.request(ProcessedTransactions, {
    processedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    totalTransactions: data.total?.count ?? 0,
    last24Hours: data.last24Hours?.count ?? 0,
    difference24Hours: data.last24Hours?.count ?? 0,
  };
}

const calculateTotalSupply = (tokens: { totalSupply: string }[]): string => {
  const total = tokens.reduce((sum, token) => sum + BigInt(token.totalSupply), BigInt(0));
  return total.toString();
};

async function getAssetsSupplyData() {
  const timestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000).toString();

  const data = await theGraphClientStarterkits.request(AssetsSupplyQuery, {
    timestamp,
  });
  const breakdown = {
    stableCoins: calculateTotalSupply(data.stableCoins),
    bonds: calculateTotalSupply(data.bonds),
    equities: calculateTotalSupply(data.equities),
    cryptoCurrencies: calculateTotalSupply(data.cryptoCurrencies),
  };

  const totalSupply = Object.values(breakdown).reduce((sum, item) => sum + BigInt(item), BigInt(0));

  const tokensMinted = data.stableCoins.map((token) => {
    const minted = token.transfers
      .filter((transfer) => transfer.from === null)
      .reduce((sum, transfer) => sum + BigInt(transfer.value), BigInt(0));

    return minted;
  });
  const allTokensMinted = tokensMinted.reduce((sum, item) => sum + item, BigInt(0));

  const tokensBurned = data.stableCoins.map((token) => {
    const burned = token.transfers
      .filter((transfer) => transfer.to === null)
      .reduce((sum, transfer) => sum + BigInt(transfer.value), BigInt(0));

    return burned;
  });
  const allTokensBurned = tokensBurned.reduce((sum, item) => sum + item, BigInt(0));

  const totalSupply24hrAgo = BigInt(totalSupply) - allTokensMinted + allTokensBurned;

  return {
    totalSupply: totalSupply.toString(),
    breakdown,
    difference24Hours: (totalSupply - totalSupply24hrAgo).toString(),
    sign: totalSupply - totalSupply24hrAgo >= 0 ? '+' : '-',
  };
}

export async function getDashboardCharts() {
  return await unstable_cache(
    async () => {
      const [usersData, processedTransactions, assetsSupplyData] = await Promise.all([
        getUsersData(),
        getProcessedTransactions(),
        getAssetsSupplyData(),
      ]);

      return {
        usersData,
        processedTransactions,
        assetsSupplyData,
      };
    },
    [DASHBOARD_CHART_QUERY_KEY],
    {
      revalidate: 60,
      tags: [DASHBOARD_CHART_QUERY_KEY],
    }
  )();
}
