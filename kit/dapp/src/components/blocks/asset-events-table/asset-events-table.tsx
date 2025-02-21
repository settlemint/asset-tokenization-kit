import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AssetTableSkeleton } from '../asset-table/asset-table-skeleton';
import { AssetEventsTableClient } from './asset-events-table-client';
import { type EventsListVariables, getEventsList } from './asset-events-table-data';

export type AssetEventsTableProps = {
  variables?: EventsListVariables;
  disableToolbarAndPagination?: boolean;
};

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function AssetEventsTable({ variables, disableToolbarAndPagination }: AssetEventsTableProps) {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.asset.events(variables?.asset);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getEventsList(variables),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>
        <AssetEventsTableClient
          queryKey={queryKey}
          variables={variables}
          disableToolbarAndPagination={disableToolbarAndPagination}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
