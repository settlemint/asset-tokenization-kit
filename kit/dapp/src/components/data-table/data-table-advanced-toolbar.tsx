import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Table } from "@tanstack/react-table";
import { FilterXIcon, SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTableExport } from "./data-table-export";
import { DataTableFilter } from "./data-table-filter";
import { DataTableViewOptions } from "./data-table-view-options";

/**
 * Configuration options for the DataTableAdvancedToolbar component.
 * Allows fine-grained control over which features are enabled in the toolbar.
 */
export interface DataTableAdvancedToolbarOptions {
  /** Whether to render the toolbar at all. Defaults to true. */
  enableToolbar?: boolean;
  /** Whether to show the global search input. Defaults to true. */
  enableGlobalSearch?: boolean;
  /** Whether to show the filter button and filter chips. Defaults to true. */
  enableFilters?: boolean;
  /** Whether to show the export to CSV button. Defaults to true. */
  enableExport?: boolean;
  /** Whether to show the column visibility toggle. Defaults to true. */
  enableViewOptions?: boolean;
  /** Custom action buttons to display in the toolbar. */
  customActions?: React.ReactNode;
  /** Placeholder text for the search input. Defaults to i18n translation. */
  placeholder?: string;
}

/**
 * Props for the DataTableAdvancedToolbar component.
 * Extends the options interface with the required table instance.
 */
interface DataTableAdvancedToolbarProps<TData>
  extends DataTableAdvancedToolbarOptions {
  /** The TanStack Table instance to control. */
  table: Table<TData>;
}

/**
 * Advanced toolbar component for data tables with search, filters, export, and view options.
 * Provides responsive layouts for desktop and mobile devices.
 *
 * @example
 * ```tsx
 * <DataTableAdvancedToolbar
 *   table={table}
 *   enableGlobalSearch={true}
 *   enableFilters={true}
 *   customActions={<Button>Custom Action</Button>}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A responsive toolbar component
 */
export function DataTableAdvancedToolbar<TData>({
  table,
  enableToolbar = true,
  enableGlobalSearch = true,
  enableFilters = true,
  enableExport = true,
  enableViewOptions = true,
  customActions,
  placeholder,
}: DataTableAdvancedToolbarProps<TData>) {
  const { t } = useTranslation("data-table");
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState(
    String(table.getState().globalFilter ?? "")
  );

  const hasFilters = table.getState().columnFilters.length > 0;
  const hasGlobalFilter = Boolean(
    (table.getState().globalFilter as string | undefined)?.length
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      table.setGlobalFilter(value);
    },
    [table]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleSearchChange(event.target.value);
    },
    [handleSearchChange]
  );

  const clearAllFilters = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      table.setColumnFilters([]);
      table.setGlobalFilter("");
      setSearchValue("");
    },
    [table]
  );

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!enableToolbar) {
    return null;
  }

  // Mobile layout: Stack vertically with better spacing
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Search Section */}
        {enableGlobalSearch && (
          <div className="space-y-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={placeholder ?? t("search")}
                value={searchValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                className="pl-9 h-9"
              />
            </div>
          </div>
        )}

        {/* Filters Section */}
        {enableFilters && (
          <div className="space-y-2">
            <DataTableFilter table={table} />
            {(hasFilters || hasGlobalFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs ml-auto"
              >
                <FilterXIcon className="h-3 w-3" />
                {t("clearAll")}
              </Button>
            )}
          </div>
        )}

        {/* Actions Section */}
        <div className="flex flex-wrap items-center gap-2">
          {customActions}
          {enableExport && <DataTableExport table={table} />}
          {enableViewOptions && <DataTableViewOptions table={table} />}
        </div>
      </div>
    );
  }

  // Desktop layout: Organized sections with visual hierarchy
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Search and Filters */}
        <div className="flex flex-1 items-center gap-4">
          {/* Search Section */}
          {enableGlobalSearch && (
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={placeholder ?? t("search")}
                value={searchValue}
                onChange={handleInputChange}
                onClick={handleInputClick}
                className="pl-9 h-9 bg-background"
              />
            </div>
          )}

          {/* Separator between search and filters */}
          {enableGlobalSearch && enableFilters && (
            <Separator orientation="vertical" className="h-6" />
          )}

          {/* Filters Section */}
          {enableFilters && (
            <div className="flex items-center gap-2">
              <DataTableFilter table={table} />
              {(hasFilters || hasGlobalFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                >
                  <FilterXIcon className="h-4 w-4" />
                  {t("clearAll")}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Actions and View Options */}
        <div className="flex items-center gap-2">
          {/* Custom Actions */}
          {customActions && (
            <>
              {customActions}
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Export and View Options */}
          <div className="flex items-center gap-2">
            {enableExport && <DataTableExport table={table} />}
            {enableViewOptions && <DataTableViewOptions table={table} />}
          </div>
        </div>
      </div>
    </div>
  );
}
