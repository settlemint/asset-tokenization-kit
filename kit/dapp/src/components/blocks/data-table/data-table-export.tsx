'use client';

import { Button } from '@/components/ui/button';
import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';

function exportTableToCSV<TData>(table: Table<TData>): void {
  // Retrieve headers (column names)
  const headers = table
    .getAllLeafColumns()
    .filter((column) => column.columnDef.meta?.enableCsvExport !== false)
    .map((column) => column.id);

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...table.getRowModel().rows.map((row) =>
      headers
        .map((header) => {
          const cellValue = row.getValue(header);
          // Handle values that might contain commas or newlines
          return typeof cellValue === 'string' ? `"${cellValue.replace(/"/g, '""')}"` : cellValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create a Blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${table.options.meta?.name ?? 'table'}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface DataTableExportProps<TData> {
  table: Table<TData>;
}

export function DataTableExport<TData>({ table }: DataTableExportProps<TData>) {
  return (
    <div className="ml-2 flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => exportTableToCSV(table)} className="gap-2">
        <Download className="size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  );
}
