'use client';
'use no memo'; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { type ComponentType, useMemo, useState } from 'react';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

/**
 * Props for the DataTable component.
 * @template TData The type of data in the table.
 * @template TValue The type of values in the table cells.
 */
interface DataTableProps<TData> {
  /** The column definitions for the table. */
  columns: Parameters<typeof useReactTable<TData>>[0]['columns'];
  /** The data to be displayed in the table. */
  data: TData[];
  isLoading?: boolean;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  name: string;
  toolbarOptions?: {
    enableCsvExport?: boolean;
    enableViewOptions?: boolean;
  };
  paginationOptions?: {
    enablePagination?: boolean;
  };
}

declare module '@tanstack/table-core' {
  // biome-ignore lint/correctness/noUnusedVariables: required for table meta
  interface TableMeta<TData extends RowData> {
    name: string;
    icons?: Record<string, ComponentType<{ className?: string }>>;
  }
}

declare module '@tanstack/react-table' {
  // biome-ignore lint/correctness/noUnusedVariables: required for table meta
  interface ColumnMeta<TData extends RowData, TValue> {
    enableCsvExport?: boolean;
  }
}

/**
/**
 * A reusable data table component with sorting, filtering, and pagination.
 * @template TData The type of data in the table.
 * @template TValue The type of values in the table cells.
 * @param props The component props.
 * @returns The rendered DataTable component.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading,
  icons,
  name,
  toolbarOptions,
  paginationOptions,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: 'includesString',

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },

    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,

    meta: {
      name,
      icons,
    },
  });

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          {columns.map((_column, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-[80%]" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} {...toolbarOptions} />
      <div className="overflow-x-auto">
        <div className="w-full rounded-md bg-card text-sidebar-foreground shadow-lg">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </div>
      </div>
      {table.getRowModel().rows?.length > 0 && <DataTablePagination table={table} {...paginationOptions} />}
    </div>
  );
}
