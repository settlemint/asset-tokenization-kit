'use client';

import type { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { DataTable, type DataTableProps } from './data-table';

/**
 * Props for the DataTableServerSide component.
 * @template TData The type of data in the table.
 */
interface DataTableServerSideProps<TData> extends DataTableProps<TData> {
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
export function DataTableServerSide<TData>({
  columns,
  data,
  isLoading,
  icons,
  name,
  initialPageSize = 10,
  rowCount,
  onPageChanged,
}: DataTableServerSideProps<TData>) {
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
      columns={columns}
      data={data}
      isLoading={isLoading}
      icons={icons}
      name={name}
      pagination={pagination}
      tableOptions={{
        manualPagination: true,
        rowCount,
        onPaginationChange: setPagination,
      }}
    />
  );
}
