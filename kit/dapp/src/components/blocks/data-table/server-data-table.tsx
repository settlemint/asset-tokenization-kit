'use client';

import type { ColumnFiltersState, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable, type DataTableProps } from './data-table';

/**
 * Props for the ServerDataTable component.
 * @template TData The type of data in the table.
 */
interface ServerDataTableProps<TData> extends DataTableProps<TData> {
  pagination: PaginationState;
  globalFilter?: string;
  onPageChanged?: (pagination: PaginationState) => void;
  onFiltersChanged?: (filter: ColumnFiltersState) => void;
  onGlobalFilterChanged?: (filter: string) => void;
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
  pagination,
  filters,
  sorting,
  rowCount,
  onPageChanged,
  onFiltersChanged,
  onGlobalFilterChanged,
  onSortingChanged,
  ...otherProps
}: ServerDataTableProps<TData>) {
  return (
    <DataTable
      {...otherProps}
      pagination={pagination}
      sorting={sorting}
      filters={filters}
      tableOptions={{
        manualPagination: true,
        rowCount,
        onPaginationChange: onPageChanged as OnChangeFn<PaginationState>,
        manualFiltering: true,
        onColumnFiltersChange: onFiltersChanged as OnChangeFn<ColumnFiltersState>,
        enableGlobalFilter: typeof onGlobalFilterChanged === 'function',
        onGlobalFilterChange: onGlobalFilterChanged as OnChangeFn<string>,
        manualSorting: true,
        onSortingChange: onSortingChanged as OnChangeFn<SortingState>,
      }}
    />
  );
}
