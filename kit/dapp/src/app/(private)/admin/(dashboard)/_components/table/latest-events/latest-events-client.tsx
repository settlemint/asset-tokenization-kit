'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { columns } from './columns';
import { getAssetEvents } from './data';

interface LatestEventsClientProps {
  queryKey: QueryKey;
}

export function LatestEventsClient({ queryKey }: LatestEventsClientProps) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: getAssetEvents,
    refetchInterval: 5000,
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        name="Latest Events"
        toolbarOptions={{ enableCsvExport: false, enableViewOptions: false }}
        paginationOptions={{ enablePagination: false }}
      />
      <div className="mt-4">
        <Link href="/admin/transactions" className="text-muted-foreground text-sm hover:text-primary">
          View all transactions →
        </Link>
      </div>
    </>
  );
}
