import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { ContactsTableClient } from './contacts-table-client';
import { getContactsList } from './contacts-table-data';

interface ContactsTableProps {
  from?: Address;
}

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function ContactsTable({ from }: ContactsTableProps) {
  const queryClient = getQueryClient();
  const user = await getAuthenticatedUser();

  const queryKey = queryKeys.pendingTransactions(from);
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getContactsList(user.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>
        <ContactsTableClient queryKey={queryKey} userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
