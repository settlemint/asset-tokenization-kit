'use client';

import type { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { DataTable, type DataTableProps } from './data-table';

/**
 * Props for the ServerDataTable component.
 * @template TData The type of data in the table.
 */
interface ServerDataTableProps<TData> extends DataTableProps<TData> {
  initialPageSize?: number;
  onPageChanged?: (pagination: PaginationState) => void;
  rowCount: number;
}

/**
 * A reusable data table component with sorting, filtering, and pagination.
 * @template TData The type of data in the table.
 * @param props The component props.
 * @returns The rendered DataTable component.
 */
export function ServerDataTable<TData>({
  initialPageSize = 10,
  rowCount,
  onPageChanged,
  ...otherProps
}: ServerDataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  useEffect(() => {
    if (typeof onPageChanged === 'function') {
      onPageChanged(pagination);
    }
  }, [pagination, onPageChanged]);

  return (
    <DataTable
      {...otherProps}
      pagination={pagination}
      tableOptions={{
        manualPagination: true,
        rowCount,
        onPaginationChange: setPagination,
      }}
    />
  );
}
