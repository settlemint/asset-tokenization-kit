# DataTable URL State Management

This document explains how to use URL-based state persistence with the DataTable
component using TanStack Router's search parameters.

## Overview

The DataTable component now supports optional URL state persistence, allowing
table state (filters, sorting, pagination, etc.) to be stored in and
synchronized with URL search parameters. This enables:

- **Shareable URLs**: Users can share links with exact table state
- **Browser Navigation**: Back/forward buttons work correctly
- **State Persistence**: Table state survives page refreshes
- **Bookmarkable Views**: Users can bookmark specific table configurations

## Basic Usage

### 1. Enable URL State in Route

First, add search parameter validation to your route:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { dataTableSearchParamsSchema } from "@/components/data-table/utils/search-params";

export const Route = createFileRoute("/your-route")({
  validateSearch: dataTableSearchParamsSchema,
  component: YourComponent,
});
```

### 2. Configure DataTable with URL State

```tsx
<DataTable
  name="my-table"
  data={data}
  columns={() => columns}
  urlState={{
    enabled: true, // Enable URL persistence
    defaultPageSize: 10, // Default page size
    debounceMs: 300, // URL update delay (ms)
    routePath: Route.fullPath, // Type-safe route path
  }}
/>
```

## Configuration Options

### `urlState` Props

| Property                  | Type                 | Default     | Description                          |
| ------------------------- | -------------------- | ----------- | ------------------------------------ |
| `enabled`                 | `boolean`            | `false`     | Enable/disable URL state persistence |
| `defaultPageSize`         | `number`             | `10`        | Default number of items per page     |
| `initialSorting`          | `SortingState`       | `[]`        | Initial sorting configuration        |
| `initialColumnFilters`    | `ColumnFiltersState` | `[]`        | Initial column filters               |
| `initialColumnVisibility` | `VisibilityState`    | `{}`        | Initial column visibility            |
| `debounceMs`              | `number`             | `300`       | Debounce delay for URL updates       |
| `enableGlobalFilter`      | `boolean`            | `true`      | Enable global search/filter          |
| `enableRowSelection`      | `boolean`            | `true`      | Enable row selection persistence     |
| `routePath`               | `string`             | `undefined` | Route path for type-safe access      |

## URL Parameters

When URL state is enabled, the following parameters are managed:

| Parameter  | Description               | Example                                       |
| ---------- | ------------------------- | --------------------------------------------- |
| `page`     | Current page (1-based)    | `?page=2`                                     |
| `pageSize` | Items per page            | `?pageSize=20`                                |
| `search`   | Global search term        | `?search=john`                                |
| `sorting`  | Sort configuration (JSON) | `?sorting=[{"id":"name","desc":false}]`       |
| `filters`  | Column filters (JSON)     | `?filters=[{"id":"status","value":"active"}]` |
| `columns`  | Column visibility (JSON)  | `?columns={"email":false}`                    |
| `selected` | Selected rows (JSON)      | `?selected={"1":true,"2":true}`               |

## Examples

### Basic Table with URL State

```tsx
export const Route = createFileRoute("/users")({
  validateSearch: dataTableSearchParamsSchema,
  component: UsersPage,
});

function UsersPage() {
  return (
    <DataTable
      name="users"
      data={users}
      columns={() => userColumns}
      urlState={{
        enabled: true,
        defaultPageSize: 25,
      }}
      advancedToolbar={{
        enableGlobalSearch: true,
        enableFilters: true,
      }}
    />
  );
}
```

### Custom Configuration

```tsx
<DataTable
  urlState={{
    enabled: true,
    defaultPageSize: 50,
    debounceMs: 500, // Slower URL updates
    enableRowSelection: false, // Disable row selection
    initialSorting: [
      // Default sort
      { id: "createdAt", desc: true },
    ],
    initialColumnVisibility: {
      // Hide some columns initially
      id: false,
      internalNotes: false,
    },
  }}
/>
```

### Minimal Schema (Alternative)

For simpler use cases, you can use the minimal schema:

```tsx
import { minimalDataTableSearchParamsSchema } from "@/components/data-table/utils/search-params";

export const Route = createFileRoute("/simple-table")({
  validateSearch: minimalDataTableSearchParamsSchema,
  component: SimpleTable,
});

// This provides: page, pageSize, search, sortBy, sortOrder
```

## Migration Guide

### From Local State to URL State

1. **Add route validation**:

   ```tsx
   // Before
   export const Route = createFileRoute("/table")({
     component: TablePage,
   });

   // After
   export const Route = createFileRoute("/table")({
     validateSearch: dataTableSearchParamsSchema,
     component: TablePage,
   });
   ```

2. **Enable URL state**:

   ```tsx
   // Before
   <DataTable data={data} columns={columns} />

   // After
   <DataTable
     data={data}
     columns={columns}
     urlState={{ enabled: true }}
   />
   ```

3. **Remove manual state management** (if any):
   ```tsx
   // Remove these if you were managing state manually
   // const [filters, setFilters] = useState([]);
   // const [sorting, setSorting] = useState([]);
   ```

## Best Practices

### 1. Route Organization

```tsx
// Keep route definitions clean
export const Route = createFileRoute("/admin/users")({
  validateSearch: dataTableSearchParamsSchema,
  component: AdminUsersPage,
});
```

### 2. Debouncing

```tsx
// Adjust debounce based on your needs
urlState={{
  enabled: true,
  debounceMs: 300,   // Fast for responsive UX
  // debounceMs: 1000,  // Slower for complex tables
}}
```

### 3. Default Values

```tsx
// Set sensible defaults
urlState={{
  enabled: true,
  defaultPageSize: 25,        // Good balance for most tables
  initialSorting: [           // Meaningful default sort
    { id: "updatedAt", desc: true }
  ],
}}
```

### 4. Performance Considerations

```tsx
// For large datasets, consider:
urlState={{
  enabled: true,
  enableRowSelection: false,  // Reduces URL complexity
  debounceMs: 500,           // Slower updates
}}
```

## Troubleshooting

### Common Issues

1. **URL not updating**
   - Ensure `urlState.enabled` is `true`
   - Check route has `validateSearch` configured
   - Verify no JavaScript errors in console

2. **State not persisting on refresh**
   - Confirm route validation schema matches state structure
   - Check browser's query parameter parsing

3. **Type errors**
   - Ensure route has proper TypeScript configuration
   - Verify `routePath` matches actual route

4. **Performance issues**
   - Increase `debounceMs` value
   - Disable unnecessary features like row selection
   - Consider using minimal schema for simple tables

### Debug Mode

```tsx
// Add logging to debug state changes
urlState={{
  enabled: true,
  // Custom debug logging (add to hook if needed)
}}
```

## API Reference

### Types

```tsx
interface UseDataTableStateOptions {
  enableUrlPersistence?: boolean;
  defaultPageSize?: number;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
  debounceMs?: number;
  enableGlobalFilter?: boolean;
  enableRowSelection?: boolean;
  routePath?: string;
}
```

### Schemas

- `dataTableSearchParamsSchema`: Full table state schema
- `minimalDataTableSearchParamsSchema`: Simplified schema for basic tables

### Utilities

- `serializeDataTableState()`: Convert state to URL params
- `deserializeDataTableState()`: Parse URL params to state
- `createDebouncedUrlUpdate()`: Debounced navigation helper

## Advanced Usage

### Custom Search Parameter Schema

```tsx
import { z } from "zod";

const customTableSchema = z.object({
  // Include base table state
  ...dataTableSearchParamsSchema.shape,

  // Add custom parameters
  viewMode: z.enum(["grid", "list"]).default("grid"),
  dateRange: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
});

export const Route = createFileRoute("/custom-table")({
  validateSearch: customTableSchema,
  component: CustomTable,
});
```

### Multiple Tables on Same Page

```tsx
// Use different parameter namespaces
const usersTableSchema = dataTableSearchParamsSchema.transform((data) => ({
  users: data,
}));

const ordersTableSchema = dataTableSearchParamsSchema.transform((data) => ({
  orders: data,
}));

// Combine schemas
const pageSchema = usersTableSchema.merge(ordersTableSchema);
```
