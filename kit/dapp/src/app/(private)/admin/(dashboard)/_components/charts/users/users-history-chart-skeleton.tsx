import { ChartSkeleton, type ChartSkeletonVariants } from '../common/chart-skeleton';

export function UsersHistorySkeleton({ variant }: ChartSkeletonVariants) {
  return (
    <ChartSkeleton title="Users" variant={variant} description="Showing users created over the last 7 days">
      <p>No users yet.</p>
      <p>Create a user to see history.</p>
    </ChartSkeleton>
  );
}
