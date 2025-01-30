'use client';

import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DASHBOARD_STATS_QUERY_KEY } from '../consts';
import { getDashboardMetrics } from './data';

const getVariantForDifference = (difference: string) => {
  if (difference === '0') {
    return 'neutral';
  }

  return difference.startsWith('-') ? 'negative' : 'positive';
};

export function DashboardStatsClient() {
  const { data } = useSuspenseQuery({
    queryKey: [DASHBOARD_STATS_QUERY_KEY],
    queryFn: () => getDashboardMetrics(),
    refetchInterval: 1000 * 10,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
      <Stat>
        <StatLabel>Assets supply</StatLabel>
        <StatValue>{data.assetsSupplyData.totalSupply.toLocaleString()}</StatValue>
        <StatSubtext>
          {data.assetsSupplyData.breakdown
            .slice(0, 2)
            .map((item) => `${item.supply.toLocaleString()} ${item.type}`)
            .join(' | ')}
          <br />
          {data.assetsSupplyData.breakdown
            .slice(2)
            .map((item) => `${item.supply.toLocaleString()} ${item.type}`)
            .join(' | ')}
        </StatSubtext>
      </Stat>

      <Stat>
        <StatLabel>Processed transactions</StatLabel>
        <StatValue>{data.processedTransactions.totalTransactions.toLocaleString()}</StatValue>
        <div className="flex items-center">
          <StatSubtext variant={getVariantForDifference(data.processedTransactions.difference24Hours.toString())}>
            +{data.processedTransactions.difference24Hours}
          </StatSubtext>
          <StatSubtext className="ml-2">Past 24 hours</StatSubtext>
        </div>
      </Stat>

      <Stat>
        <StatLabel>Users</StatLabel>
        <StatValue>{data.usersData.totalUsers.toLocaleString()}</StatValue>
        <div className="flex items-center">
          <StatSubtext variant={getVariantForDifference(data.usersData.difference24Hours.toString())}>
            +{data.usersData.difference24Hours}
          </StatSubtext>
          <StatSubtext className="ml-2">Past 24 hours</StatSubtext>
        </div>
      </Stat>
    </div>
  );
}
