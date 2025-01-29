'use client';

import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DASHBOARD_STATS_QUERY_KEY } from './consts';
import { getDashboardMetrics } from './data';

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
    <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      <Stat>
        <StatLabel>Assets supply</StatLabel>
        <StatValue>{data.assetsSupplyData.totalSupply.toLocaleString()}</StatValue>
        <StatSubtext>
          {data.assetsSupplyData.breakdown.map((item) => `${item.supply.toLocaleString()} ${item.type}`).join(' | ')}
        </StatSubtext>
      </Stat>
      <Stat>
        <StatLabel>Processed transactions</StatLabel>
        <StatValue>{data.processedTransactions.totalTransactions.toLocaleString()}</StatValue>
        <StatSubtext>
          {data.processedTransactions.transactionsInLast24Hours.toLocaleString()} in last 24 hours
        </StatSubtext>
      </Stat>
      <Stat>
        <StatLabel>Users</StatLabel>
        <StatValue>{data.usersData.totalUsers.toLocaleString()}</StatValue>
        <StatSubtext>{data.usersData.usersInLast24Hours.toLocaleString()} in last 24 hours</StatSubtext>
      </Stat>
    </div>
  );
}
