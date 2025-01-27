'use client';

import { Card, CardContent } from '@/components/ui/card';

interface DashboardMetricsProps {
  tokens: {
    totalSupply: number;
    breakdown: {
      type: string;
      supply: number;
    }[];
  };
  users: {
    totalUsers: number;
    newUsers: number;
  };
  transactions: {
    totalTransactions: number;
    transactionsInLast24Hours: number;
  };
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
          <div className="space-y-1 px-6 text-center first:pl-0 last:pr-0">
            <p className="text-sm">Total supply</p>
            <p className="my-2 font-bold text-2xl">{tokens.totalSupply.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">
              {tokens.breakdown.map((item) => `${item.supply.toLocaleString()} ${item.type}`).join(' | ')}
            </p>
          </div>
          <div className="space-y-1 px-6 text-center first:pl-0 last:pr-0">
            <p className="text-sm">Users</p>
            <p className="my-2 font-bold text-2xl">{users.totalUsers.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">{users.newUsers.toLocaleString()} new users</p>
          </div>
          <div className="space-y-1 px-6 text-center first:pl-0 last:pr-0">
            <p className="text-sm">Transactions</p>
            <p className="my-2 font-bold text-2xl">{transactions.totalTransactions.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">
              {transactions.transactionsInLast24Hours.toLocaleString()} in last 24 hours
            </p>
          </div>
          <div className="space-y-1 px-6 text-center first:pl-0 last:pr-0">
            <p className="text-sm">Network</p>
            <p className="my-2 font-bold text-2xl text-green-500">{network.status}</p>
            <p className="text-muted-foreground text-xs">{network.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
