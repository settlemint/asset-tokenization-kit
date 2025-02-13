import { ChartSkeleton, type ChartSkeletonVariants } from '../common/chart-skeleton';

export function AssetsSupplySkeleton({ variant }: ChartSkeletonVariants) {
  return (
    <ChartSkeleton title="Distribution" variant={variant} description="Showing the distribution of assets (in %)">
      <p>No assets yet.</p>
      <p>Mint assets to see their distribution.</p>
    </ChartSkeleton>
  );
}
