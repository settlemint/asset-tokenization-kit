import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';
import { AssetTableSkeleton } from '../asset-table/asset-table-skeleton';
import { getPermissions } from './asset-permissions-table-data';

/**
 * Props for the AssetPermissionsTable component
 */
export interface AssetPermissionsTableProps {
  asset: Address;
  assetConfig: AssetDetailConfig;
}

/**
 * Server component that renders a table of asset permissions with data fetching capabilities
 */
export async function AssetPermissionsTable({
  asset,
  assetConfig,
  children,
}: PropsWithChildren<AssetPermissionsTableProps>) {
  const queryClient = getQueryClient();

  const queryKey = queryKeys.asset.permissions({ type: assetConfig.queryKey, address: asset });

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getPermissions(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>{children}</Suspense>
    </HydrationBoundary>
  );
}
