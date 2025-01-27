'use client';

import type { TokenSupplyData } from '@/app/(private)/admin/(dashboard)/_components/dashboard-metrics/token-supply/data';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProcessedTransactionsData } from './transactions/data';
import type { UsersData } from './users/data';

interface MetricItemProps {
  label: string;
  value: string | number;
  subtext: string;
  valueClassName?: string;
}

function MetricItem({ label, value, subtext, valueClassName }: MetricItemProps) {
  return (
    <div className="space-y-1 px-6 text-center first:pl-0 last:pr-0">
      <p className="text-sm">{label}</p>
      <p className={cn('my-2 font-bold text-2xl', valueClassName)}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-muted-foreground text-xs">{subtext}</p>
    </div>
  );
}

interface DashboardMetricsProps {
  tokens: TokenSupplyData;
  users: UsersData;
  transactions: ProcessedTransactionsData;
  network: {
    status: string;
    message: string;
  };
}

export function DashboardMetricsCard({ tokens, users, transactions, network }: DashboardMetricsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
          <MetricItem
            label="Token supply"
            value={tokens.totalSupply}
            subtext={tokens.breakdown.map((item) => `${item.supply.toLocaleString()} ${item.type}`).join(' | ')}
          />
          <MetricItem
            label="Users"
            value={users.totalUsers}
            subtext={`${users.usersInLast24Hours.toLocaleString()} new users`}
          />
          <MetricItem
            label="Transactions"
            value={transactions.totalTransactions}
            subtext={`${transactions.transactionsInLast24Hours.toLocaleString()} in last 24 hours`}
          />
          <MetricItem
            label="Network"
            value={network.status}
            subtext={network.message}
            valueClassName="text-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
