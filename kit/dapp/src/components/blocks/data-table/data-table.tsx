'use client';
'use no memo'; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreVertical } from 'lucide-react';
import { type ComponentType, useMemo, useState } from 'react';
import { DataTablePagination, type DataTablePaginationOptions } from './data-table-pagination';
import { DataTableToolbar, type DataTableToolbarOptions } from './data-table-toolbar';

/**
 * Props for the DataTable component.
 * @template TData The type of data in the table.
 * @template TValue The type of values in the table cells.
 */
export interface DataTableRowAction<TData> {
  label: string;
  component: (row: TData) => React.ReactNode;
}

interface DataTableProps<TData> {
  /** The column definitions for the table. */
  columns: Parameters<typeof useReactTable<TData>>[0]['columns'];
  /** The data to be displayed in the table. */
  data: TData[];
  isLoading?: boolean;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  name: string;
  rowActions?: DataTableRowAction<TData>[];
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  initialSorting?: SortingState;
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
  toolbar,
  pagination,
  rowActions,
  initialSorting,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const memoizedColumns = useMemo(() => {
    if (!rowActions?.length) {
      return columns;
    }

    return [
      ...columns,
      {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row.original} actions={rowActions} />,
      },
    ];
  }, [columns, rowActions]);

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
      <DataTableToolbar table={table} {...toolbar} />
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
      {table.getRowModel().rows?.length > 0 && <DataTablePagination table={table} {...pagination} />}
    </div>
  );
}

function DataTableRowActions<TData>({
  row,
  actions,
}: {
  row: TData;
  actions: DataTableRowAction<TData>[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        {actions?.map((action, index) => (
          <DropdownMenuItem key={index} className="dropdown-menu-item cursor-pointer p-0">
            {action.component(row)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
