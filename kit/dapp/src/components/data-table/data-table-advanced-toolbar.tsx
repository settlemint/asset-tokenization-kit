"use client";
"use no memo"; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import { Badge } from "@/components/ui/badge";
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

export interface DataTableAdvancedToolbarOptions {
  enableToolbar?: boolean;
  enableGlobalSearch?: boolean;
  enableFilters?: boolean;
  enableExport?: boolean;
  enableViewOptions?: boolean;
  customActions?: React.ReactNode;
  placeholder?: string;
}

interface DataTableAdvancedToolbarProps<TData>
  extends DataTableAdvancedToolbarOptions {
  table: Table<TData>;
}

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
  const { t } = useTranslation("general");
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState(
    table.getState().globalFilter ?? ""
  );

  const hasFilters = table.getState().columnFilters.length > 0;
  const hasGlobalFilter = table.getState().globalFilter?.length > 0;
  const activeFiltersCount = table.getState().columnFilters.length;

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

  const clearAllFilters = useCallback(() => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
    setSearchValue("");
  }, [table]);

  const clearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

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
                placeholder={placeholder ?? t("components.data-table.search")}
                value={searchValue}
                onChange={handleInputChange}
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
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}{" "}
                  {activeFiltersCount === 1 ? "filter" : "filters"} active
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 text-xs"
                >
                  <FilterXIcon className="h-3 w-3" />
                  Clear all
                </Button>
              </div>
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
                placeholder={placeholder ?? t("components.data-table.search")}
                value={searchValue}
                onChange={handleInputChange}
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
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Actions and View Options */}
        <div className="flex items-center gap-2">
          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <>
              <Badge variant="secondary" className="text-xs font-medium">
                {activeFiltersCount}{" "}
                {activeFiltersCount === 1 ? "filter" : "filters"}
              </Badge>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

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

      {/* Active Filters Display Row (only when filters are active) */}
      {(hasFilters || hasGlobalFilter) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Active filters:</span>
          {hasGlobalFilter && (
            <Badge variant="outline" className="gap-1">
              Search: "{table.getState().globalFilter}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={clearSearch}
              >
                <FilterXIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {activeFiltersCount > 0 && (
            <Badge variant="outline">
              {activeFiltersCount} column{" "}
              {activeFiltersCount === 1 ? "filter" : "filters"}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
