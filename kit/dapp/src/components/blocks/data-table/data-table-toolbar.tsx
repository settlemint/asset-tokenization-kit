'use client';
'use no memo'; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { DataTableExport } from './data-table-export';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  disabled?: boolean;
}

const CAPITAL_LETTER_REGEX = /(?=[A-Z])/;

/**
 * Transforms a camelCase identifier into a pretty title case string
 * @param identifier The identifier to transform
 * @returns The prettified title
 */
function prettifyTitle(identifier: string): string {
  // Split the identifier at capital letters and lowercase everything
  const words = identifier.split(CAPITAL_LETTER_REGEX).map((word) => word.toLowerCase());

  // Capitalize the first letter of each word
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function DataTableToolbar<TData>({ table, disabled }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const facetedColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanFilter())
    .map((column) => ({
      column,
      title: prettifyTitle(column.id),
      options: Array.from(column.getFacetedUniqueValues().entries()).map(([value]) => ({
        label: String(value),
        value: String(value),
        icon: table.options.meta?.icons?.[value],
      })),
    }));

  const globalFilterColumn = table.getAllLeafColumns().find((col) => col.getCanGlobalFilter());

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {globalFilterColumn && (
          <Input
            placeholder="Search..."
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
            disabled={disabled}
          />
        )}
        {(facetedColumns ?? []).map((facet) => {
          return (
            <DataTableFacetedFilter
              showCount={!table.options.manualFiltering}
              key={facet.column.id}
              column={facet.column}
              title={facet.title}
              options={facet.options}
              disabled={disabled}
            />
          );
        })}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} disabled={disabled} />
      <DataTableExport table={table} disabled={disabled} />
    </div>
  );
}
