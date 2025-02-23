'use client';

import { Button } from '@/components/ui/button';
import type { Column, Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

function formatCellValue(value: unknown): string {
  if (value == null) {
    return '""';
  }

  if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  }

  if (typeof value === 'object') {
    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  }

  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '""')}"`;
  }

  // At this point, value can only be number, boolean, bigint, symbol, or function
  // Functions shouldn't be in table data, and we can safely stringify primitives
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(value);
}

function getColumnHeader<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header;

  if (typeof header === 'string') {
    return header;
  }

  return column.id;
}

function exportTableToCSV<TData>(table: Table<TData>): void {
  try {
    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';

    // Retrieve headers (column names)
    const headers = table
      .getAllLeafColumns()
      .filter((column) => !['select', 'actions'].includes(column.id))
      .map((column) => ({
        id: column.id,
        header: getColumnHeader(column),
      }));

    // Build CSV content
    const csvContent = [
      headers.map(({ header }) => `"${header}"`).join(','),
      ...table
        .getRowModel()
        .rows.map((row) =>
          headers.map(({ id }) => formatCellValue(row.getValue(id))).join(',')
        ),
    ].join('\n');

    // Create a Blob with CSV content
    const blob = new Blob([BOM + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    // Create a link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${table.options.meta?.name ?? 'table'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch {
    toast.error('Failed to export data');
  }
}

interface DataTableExportProps<TData> {
  table: Table<TData>;
}

export function DataTableExport<TData>({ table }: DataTableExportProps<TData>) {
  return (
    <div className="ml-2 flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportTableToCSV(table)}
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  );
}
