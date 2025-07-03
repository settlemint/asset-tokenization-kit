/**
 * Example usage of DataTable with error boundary
 * This file demonstrates how to use the DataTable component with built-in error handling
 */

import { DataTable } from "./data-table";
import { DataTableErrorBoundary } from "./data-table-error-boundary";
import type { ColumnDef } from "@tanstack/react-table";

// Example data type
interface User {
  id: string;
  name: string;
  email: string;
}

// Example columns
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

// Example data that could cause errors
const problematicData: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  // This could potentially cause rendering issues if not handled properly
  { id: "2", name: null as unknown as string, email: "jane@example.com" },
];

/**
 * Example 1: Using DataTable with built-in error boundary (recommended)
 * The DataTable component is already wrapped with an error boundary by default
 */
export function DataTableWithBuiltInErrorBoundary() {
  return (
    <DataTable
      name="users-table"
      columns={columns}
      data={problematicData}
      // The error boundary is already included!
    />
  );
}

/**
 * Example 2: Using DataTable with custom error handling
 * You can provide custom error handling by wrapping with your own error boundary
 */
export function DataTableWithCustomErrorHandling() {
  return (
    <DataTableErrorBoundary
      tableName="Custom Users Table"
      onError={(error, errorInfo) => {
        // Custom error handling logic
        console.error("Table error:", error);
        // You could send to error tracking service here
      }}
      fallback={({ error, onReset }) => (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-destructive">
            Custom Error Message
          </h2>
          <p className="mt-2 text-muted-foreground">
            Something went wrong: {error?.message}
          </p>
          <button
            onClick={onReset}
            className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            Try Again
          </button>
        </div>
      )}
    >
      <DataTable
        name="users-table-custom"
        columns={columns}
        data={problematicData}
      />
    </DataTableErrorBoundary>
  );
}

/**
 * Example 3: Using DataTableRaw without error boundary
 * Only use this if you need complete control over error handling
 */
import { DataTableRaw } from "./data-table";

export function DataTableWithoutErrorBoundary() {
  // Using DataTableRaw gives you the table without any error boundary
  // You're responsible for handling all errors
  return (
    <DataTableRaw
      name="users-table-raw"
      columns={columns}
      data={problematicData}
    />
  );
}

/**
 * Example 4: Creating a custom wrapped component
 */
import { withDataTableErrorBoundary } from "./data-table-error-boundary";

const MyCustomTable = ({ data }: { data: User[] }) => (
  <DataTableRaw name="my-custom-table" columns={columns} data={data} />
);

// Wrap your custom table component with error boundary
export const MyCustomTableWithErrorBoundary = withDataTableErrorBoundary(
  MyCustomTable,
  {
    tableName: "My Custom Table",
    onError: (error) => {
      console.error("My custom table error:", error);
    },
  }
);