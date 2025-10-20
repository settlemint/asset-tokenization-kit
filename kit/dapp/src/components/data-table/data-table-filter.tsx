import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollBlur } from "@/hooks/use-scroll-blur";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { ArrowRight, Filter, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyFilterOperatorController } from "./filters/operators/operator-controller";
import { PropertyFilterSubject } from "./filters/property-filter-subject";
import type { ColumnDataType } from "./filters/types/column-types";
import type { FilterValue } from "./filters/types/filter-types";
import { getColumn, getColumnMeta } from "./filters/utils/table-helpers";
import { PropertyFilterValueController } from "./filters/values/value-controller";
import { PropertyFilterValueMenu } from "./filters/values/value-menu";

/**
 * Main filter component for data tables.
 * Provides a filter button that opens a menu for column-based filtering.
 * Automatically adapts layout for mobile and desktop views.
 *
 * @param props - Component props
 * @param props.table - The TanStack table instance
 * @returns Filter UI with responsive layout
 */
export function DataTableFilter<TData>({ table }: { table: Table<TData> }) {
  "use no memo";
  const isMobile = useIsMobile();

  // Key by filter count to force re-render when filters change
  const filterCount = table.getState().columnFilters.length;

  if (isMobile) {
    return (
      <div
        key={`mobile-${String(filterCount)}`}
        className="flex w-full items-start justify-between gap-2"
      >
        <TableFilter table={table} />
        <DataTableFilterMobileContainer>
          <PropertyFilterList table={table} />
        </DataTableFilterMobileContainer>
      </div>
    );
  }

  return (
    <div
      key={`desktop-${String(filterCount)}`}
      className="flex w-full items-start justify-between gap-2"
    >
      <TableFilter table={table} />
      <DataTableFilterDesktopContainer>
        <PropertyFilterList table={table} />
      </DataTableFilterDesktopContainer>
    </div>
  );
}

/**
 * Desktop container for filter chips with horizontal scroll and blur effects.
 * Shows gradient blur on edges when content is scrollable.
 *
 * @param props - Component props
 * @param props.children - Filter chip components to display
 * @returns Scrollable container with edge blur effects
 */
export function DataTableFilterDesktopContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { showLeftBlur, showRightBlur, checkScroll } =
    useScrollBlur(scrollContainerRef);

  // Update blur states when children change
  useEffect(() => {
    checkScroll();
  }, [children, checkScroll]);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Left blur effect */}
      {showLeftBlur && (
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent animate-in fade-in-0" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto no-scrollbar"
        onScroll={checkScroll}
      >
        {children}
      </div>

      {/* Right blur effect */}
      {showRightBlur && (
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent animate-in fade-in-0 " />
      )}
    </div>
  );
}

/**
 * Mobile container for filter chips with horizontal scroll and stronger blur effects.
 * Optimized for touch interactions with wider blur gradients.
 *
 * @param props - Component props
 * @param props.children - Filter chip components to display
 * @returns Mobile-optimized scrollable container
 */
export function DataTableFilterMobileContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { showLeftBlur, showRightBlur, checkScroll } =
    useScrollBlur(scrollContainerRef);

  // Update blur states when children change
  useEffect(() => {
    checkScroll();
  }, [children, checkScroll]);

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Left blur effect */}
      {showLeftBlur && (
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent animate-in fade-in-0" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-scroll no-scrollbar"
        onScroll={checkScroll}
      >
        {children}
      </div>

      {/* Right blur effect */}
      {showRightBlur && (
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent animate-in fade-in-0 " />
      )}
    </div>
  );
}

/**
 * Filter button component that opens a popover menu for column selection.
 * Displays available filterable columns and manages filter value input.
 *
 * @param props - Component props
 * @param props.table - The TanStack table instance
 * @returns Filter button with popover menu
 */
export function TableFilter<TData>({ table }: { table: Table<TData> }) {
  "use no memo";
  const { t } = useTranslation("data-table");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [property, setProperty] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const column = property ? getColumn(table, property) : undefined;
  const columnMeta = property ? getColumnMeta(table, property) : undefined;

  const properties = table
    .getAllColumns()
    .filter((column) => column.getCanFilter());

  const hasFilters = properties.length > 0;

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    if (!value) setProperty(undefined);
  }, []);

  const handleBack = useCallback(() => {
    setProperty(undefined);
  }, []);

  const handleFilterButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (property) {
      inputRef.current?.focus();
      setValue("");
    }
  }, [property]);

  useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  const content = useMemo(
    () =>
      property && column && columnMeta ? (
        <PropertyFilterValueMenu
          id={property}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onBack={handleBack}
        />
      ) : (
        <Command loop className="min-w-[280px]">
          <CommandInput
            value={value}
            onValueChange={setValue}
            ref={inputRef}
            placeholder={t("search")}
          />
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          <CommandList className="max-h-fit">
            <CommandGroup>
              {properties.map((column) => (
                <TableFilterMenuItem
                  key={column.id}
                  column={column}
                  setProperty={setProperty}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      ),
    [property, column, columnMeta, value, table, properties, t, handleBack]
  );

  if (!hasFilters) return null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-fit px-2 text-muted-foreground"
          onClick={handleFilterButtonClick}
        >
          <Filter className="size-4" />
          <span className="hidden md:block">{t("filter")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-fit p-0 origin-(--radix-popover-content-transform-origin)"
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Menu item component for column selection in the filter popover.
 * Displays column name with icon and handles selection.
 *
 * @param props - Component props
 * @param props.column - The table column
 * @param props.setProperty - Callback to set the selected column
 * @returns Menu item component
 */
export function TableFilterMenuItem<TData>({
  column,
  setProperty,
}: {
  column: Column<TData>;
  setProperty: (value: string) => void;
}) {
  const Icon = column.columnDef.meta?.icon;
  const displayName = column.columnDef.meta?.displayName;

  const handleSelect = useCallback(() => {
    setProperty(column.id);
  }, [column.id, setProperty]);

  return (
    <CommandItem onSelect={handleSelect} className="group">
      <div className="flex w-full items-center justify-between">
        <div className="inline-flex items-center gap-1.5">
          {Icon && <Icon className="size-4" />}
          <span>{displayName ?? column.id}</span>
        </div>
        <ArrowRight className="size-4 opacity-0 group-aria-selected:opacity-100" />
      </div>
    </CommandItem>
  );
}

/**
 * Renders the list of active filter chips.
 * Each chip displays the column, operator, and value with a remove button.
 *
 * @param props - Component props
 * @param props.table - The TanStack table instance
 * @returns List of filter chip components
 */
export function PropertyFilterList<TData>({ table }: { table: Table<TData> }) {
  "use no memo";
  // Get filters directly from table state - this will re-render when table updates
  const filters = table.getState().columnFilters;

  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      // Get the column and set its filter to undefined
      // This will trigger the proper onColumnFiltersChange handler
      const column = table.getColumn(filterId);
      if (column) {
        column.setFilterValue(undefined);
      }
    },
    [table]
  );

  // Key the entire list by the filter count to force re-render
  const filterKey = filters.length;

  return (
    <div key={filterKey} className="contents">
      {filters.map((filter) => {
        const { id } = filter;

        const column = getColumn(table, id);
        const meta = getColumnMeta(table, id);

        // Skip if no filter value
        if (!filter.value) return null;

        // Narrow the type based on meta.type and cast filter accordingly
        switch (meta.type) {
          case "text":
            return (
              <RenderFilter<TData, "text">
                key={`filter-${id}`}
                filter={
                  filter as { id: string; value: FilterValue<"text", TData> }
                }
                column={column}
                meta={meta as ColumnMeta<TData, unknown> & { type: "text" }}
                table={table}
                onRemoveFilter={handleRemoveFilter}
              />
            );
          case "number":
            return (
              <RenderFilter<TData, "number">
                key={`filter-${id}`}
                filter={
                  filter as { id: string; value: FilterValue<"number", TData> }
                }
                column={column}
                meta={meta as ColumnMeta<TData, unknown> & { type: "number" }}
                table={table}
                onRemoveFilter={handleRemoveFilter}
              />
            );
          case "date":
            return (
              <RenderFilter<TData, "date">
                key={`filter-${id}`}
                filter={
                  filter as { id: string; value: FilterValue<"date", TData> }
                }
                column={column}
                meta={meta as ColumnMeta<TData, unknown> & { type: "date" }}
                table={table}
                onRemoveFilter={handleRemoveFilter}
              />
            );
          case "option":
          case "status":
            return (
              <RenderFilter<TData, "option">
                key={`filter-${id}`}
                filter={
                  filter as { id: string; value: FilterValue<"option", TData> }
                }
                column={column}
                meta={meta as ColumnMeta<TData, unknown> & { type: "option" }}
                table={table}
                onRemoveFilter={handleRemoveFilter}
              />
            );
          case "multiOption":
            return (
              <RenderFilter<TData, "multiOption">
                key={`filter-${id}`}
                filter={
                  filter as {
                    id: string;
                    value: FilterValue<"multiOption", TData>;
                  }
                }
                column={column}
                meta={
                  meta as ColumnMeta<TData, unknown> & {
                    type: "multiOption";
                  }
                }
                table={table}
                onRemoveFilter={handleRemoveFilter}
              />
            );
          default:
            return null; // Handle unknown types gracefully
        }
      })}
    </div>
  );
}

/**
 * Generic component for rendering a filter chip with type-safe value handling.
 * Displays the filter subject, operator, value, and remove button.
 *
 * @param props - Component props
 * @param props.filter - The filter configuration with ID and value
 * @param props.column - The table column being filtered
 * @param props.meta - Column metadata with type information
 * @param props.table - The TanStack table instance
 * @param props.onRemoveFilter - Callback to remove the filter
 * @returns Filter chip component
 */
function RenderFilter<TData, T extends ColumnDataType>({
  filter,
  column,
  meta,
  table,
  onRemoveFilter,
}: {
  filter: { id: string; value: FilterValue<T, TData> };
  column: Column<TData>;
  meta: ColumnMeta<TData, unknown> & { type: T };
  table: Table<TData>;
  onRemoveFilter: (filterId: string) => void;
}) {
  const { value } = filter;

  const handleRemoveFilter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemoveFilter(filter.id);
    },
    [onRemoveFilter, filter.id]
  );

  const handleFilterChipClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      key={`filter-${filter.id}`}
      className="flex h-8 items-center rounded-md border border-dashed border-border bg-background shadow-xs text-xs"
      onClick={handleFilterChipClick}
    >
      <PropertyFilterSubject meta={meta} />
      <Separator orientation="vertical" className="h-5" />
      <PropertyFilterOperatorController
        column={column}
        columnMeta={meta}
        filter={value} // Typed as FilterValue<T>
      />
      <Separator orientation="vertical" className="h-5" />
      <PropertyFilterValueController
        id={filter.id}
        column={column}
        columnMeta={meta}
        table={table}
      />
      <Separator orientation="vertical" className="h-5" />
      <Button
        variant="ghost"
        size="sm"
        className="rounded-none rounded-r-md h-full px-2 hover:bg-destructive/10"
        onClick={handleRemoveFilter}
        type="button"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

/****** Property Filter Subject ******/

/****** Property Filter Value ******/
