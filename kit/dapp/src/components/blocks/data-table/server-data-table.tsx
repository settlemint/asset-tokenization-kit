'use client';

import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { DataTable, type DataTableProps } from './data-table';

/**
 * Props for the ServerDataTable component.
 * @template TData The type of data in the table.
 */
interface ServerDataTableProps<TData> extends DataTableProps<TData> {
  initialPageSize?: number;
  onPageChanged?: (pagination: PaginationState) => void;
  onFilterChanged?: (filter: ColumnFiltersState) => void;
  onSortingChanged?: (sorting: SortingState) => void;
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
  onFilterChanged,
  onSortingChanged,
  ...otherProps
}: ServerDataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [filter, setFilter] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (typeof onPageChanged === 'function') {
      onPageChanged(pagination);
    }
  }, [pagination, onPageChanged]);

  useEffect(() => {
    if (typeof onFilterChanged === 'function') {
      onFilterChanged(filter);
    }
  }, [filter, onFilterChanged]);

  useEffect(() => {
    if (typeof onSortingChanged === 'function') {
      onSortingChanged(sorting);
    }
  }, [sorting, onSortingChanged]);

  return (
    <DataTable
      {...otherProps}
      pagination={pagination}
      tableOptions={{
        manualPagination: true,
        rowCount,
        onPaginationChange: setPagination,
        manualFiltering: true,
        onColumnFiltersChange: setFilter,
        manualSorting: true,
        onSortingChange: setSorting,
      }}
    />
  );
}
