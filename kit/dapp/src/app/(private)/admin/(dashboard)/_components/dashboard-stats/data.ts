'use server';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

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

export type UsersData = {
  totalUsers: number;
  usersInLast24Hours: number;
};

export type ProcessedTransactionsData = {
  totalTransactions: number;
  transactionsInLast24Hours: number;
};

export type AssetsSupplyData = {
  totalSupply: string;
  breakdown: {
    type: string;
    supply: string;
  }[];
};

export async function getUsersData(): Promise<UsersData> {
  const data = await hasuraClient.request(UsersQuery);

  return {
    totalUsers: data.user_aggregate.nodes.length,
    usersInLast24Hours: data.recent_users_aggregate.aggregate?.count ?? 0,
  };
}

export async function getProcessedTransactions(): Promise<ProcessedTransactionsData> {
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

export async function getAssetsSupplyData(): Promise<AssetsSupplyData> {
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

export type DashboardMetrics = {
  usersData: UsersData;
  processedTransactions: ProcessedTransactionsData;
  assetsSupplyData: AssetsSupplyData;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
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
}
