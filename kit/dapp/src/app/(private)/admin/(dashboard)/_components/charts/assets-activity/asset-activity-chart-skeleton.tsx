import { ChartSkeleton, type ChartSkeletonVariants } from '../common/chart-skeleton';

export function AssetActivitySkeleton({ variant }: ChartSkeletonVariants) {
  return (
    <ChartSkeleton title="Activity" variant={variant} description="Showing events for each asset type">
      <p>No activity yet.</p>
      <p>Mint, transfer or burn assets to see activity.</p>
    </ChartSkeleton>
  );
}
