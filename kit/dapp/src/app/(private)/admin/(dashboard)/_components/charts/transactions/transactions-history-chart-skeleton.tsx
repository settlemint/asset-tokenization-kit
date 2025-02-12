import { ChartSkeleton, type ChartSkeletonVariants } from '../common/chart-skeleton';

export function TransactionsHistorySkeleton({ variant = 'loading' }: ChartSkeletonVariants) {
  return (
    <ChartSkeleton
      title="Transactions"
      variant={variant}
      description="Showing the number of transactions over the last 7 days"
    >
      <p>No transactions yet.</p>
      <p>Design assets to start seeing transactions.</p>
    </ChartSkeleton>
  );
}
