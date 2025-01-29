'use server';

import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { unstable_cache } from 'next/cache';
import { DASHBOARD_STATS_QUERY_KEY } from './consts';

const UsersQuery = hasuraGraphql(`
query UsersQuery {
  user_aggregate {
    nodes {
      id
    }
  }
  recent_users_aggregate: user_aggregate(
    where: { created_at: { _gt: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}" } }
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

const AssetsSupplyQuery = theGraphGraphqlStarterkits(`
  query AssetsSupply {
    stableCoins {
      id
      totalSupply
    }
    bonds {
      id
      totalSupply
    }
    equities {
      id
      totalSupply
    }
    cryptoCurrencies {
      id
      totalSupply
    }
  }
`);

async function getUsersData() {
  const data = await hasuraClient.request(UsersQuery);

  return {
    totalUsers: data.user_aggregate.nodes.length,
    usersInLast24Hours: data.recent_users_aggregate.aggregate?.count ?? 0,
  };
}

async function getProcessedTransactions() {
  const data = await portalClient.request(ProcessedTransactions, {
    processedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    totalTransactions: data.total?.count ?? 0,
    transactionsInLast24Hours: data.last24Hours?.count ?? 0,
  };
}

const calculateTotalSupply = (tokens: { totalSupply: string }[]): string => {
  const total = tokens.reduce((sum, token) => sum + BigInt(token.totalSupply), BigInt(0));
  return total.toString();
};

async function getAssetsSupplyData() {
  const data = await theGraphClientStarterkits.request(AssetsSupplyQuery);

  const breakdown = [
    {
      type: 'Stablecoins',
      supply: calculateTotalSupply(data.stableCoins),
    },
    {
      type: 'Bonds',
      supply: calculateTotalSupply(data.bonds),
    },
    {
      type: 'Equities',
      supply: calculateTotalSupply(data.equities),
    },
    {
      type: 'Cryptocurrencies',
      supply: calculateTotalSupply(data.cryptoCurrencies),
    },
  ];

  const totalSupply = breakdown.reduce((sum, item) => sum + BigInt(item.supply), BigInt(0)).toString();

  return {
    totalSupply,
    breakdown,
  };
}

export async function getDashboardMetrics() {
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
    [DASHBOARD_STATS_QUERY_KEY],
    {
      revalidate: 60,
      tags: [DASHBOARD_STATS_QUERY_KEY],
    }
  )();
}
