"use client";

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
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { ArrowRight, Filter, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDataType } from "./filters/types/column-types";
import type { FilterValue } from "./filters/types/filter-types";
import { getColumn, getColumnMeta } from "./filters/utils/table-helpers";
import { PropertyFilterOperatorController } from "./filters/operators/operator-controller";
import { PropertyFilterSubject } from "./filters/property-filter-subject";
import { PropertyFilterValueController } from "./filters/values/value-controller";
import { PropertyFilterValueMenu } from "./filters/values/value-menu";

export function DataTableFilter<TData>({ table }: { table: Table<TData> }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex w-full items-start justify-between gap-2">
        <TableFilter table={table} />
        <DataTableFilterMobileContainer>
          <PropertyFilterList table={table} />
        </DataTableFilterMobileContainer>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start justify-between gap-2">
      <div className="flex md:flex-wrap gap-2 w-full flex-1">
        <TableFilter table={table} />
        <PropertyFilterList table={table} />
      </div>
    </div>
  );
}

export function DataTableFilterMobileContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftBlur, setShowLeftBlur] = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);

  // Check if there's content to scroll and update blur states
  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // Show left blur if scrolled to the right
      setShowLeftBlur(scrollLeft > 0);

      // Show right blur if there's more content to scroll to the right
      // Add a small buffer (1px) to account for rounding errors
      setShowRightBlur(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  // Log blur states for debugging
  // useEffect(() => {
  //   logger.debug('Blur states - left:', showLeftBlur, 'right:', showRightBlur);
  // }, [showLeftBlur, showRightBlur])

  // Set up ResizeObserver to monitor container size
  useEffect(() => {
    if (scrollContainerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(scrollContainerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [checkScroll]);

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

export function TableFilter<TData>({ table }: { table: Table<TData> }) {
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
        />
      ) : (
        <Command loop>
          <CommandInput
            value={value}
            onValueChange={setValue}
            ref={inputRef}
            placeholder="Search..."
          />
          <CommandEmpty>No results.</CommandEmpty>
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
    [property, column, columnMeta, value, table, properties]
  );

  if (!hasFilters) return null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-fit px-2 text-muted-foreground"
        >
          <Filter className="size-4" />
          <span className="hidden md:block">Filter</span>
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
          {Icon && <Icon strokeWidth={2.25} className="size-4" />}
          <span>{displayName ?? column.id}</span>
        </div>
        <ArrowRight className="size-4 opacity-0 group-aria-selected:opacity-100" />
      </div>
    </CommandItem>
  );
}

export function PropertyFilterList<TData>({ table }: { table: Table<TData> }) {
  const filters = table.getState().columnFilters;

  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      table.getColumn(filterId)?.setFilterValue(undefined);
    },
    [table]
  );

  return (
    <>
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
            return (
              <RenderFilter<TData, "option">
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
    </>
  );
}

// Generic render component for a filter with type-safe value
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

  const handleRemoveFilter = useCallback(() => {
    onRemoveFilter(filter.id);
  }, [onRemoveFilter, filter.id]);

  return (
    <div
      key={`filter-${filter.id}`}
      className="flex h-8 items-center rounded-2xl border border-border bg-background shadow-xs text-xs"
    >
      <PropertyFilterSubject meta={meta} />
      <Separator orientation="vertical" />
      <PropertyFilterOperatorController
        column={column}
        columnMeta={meta}
        filter={value} // Typed as FilterValue<T>
      />
      <Separator orientation="vertical" />
      <PropertyFilterValueController
        id={filter.id}
        column={column}
        columnMeta={meta}
        table={table}
      />
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        className="rounded-none rounded-r-2xl text-xs w-7 h-full"
        onClick={handleRemoveFilter}
      >
        <X className="size-4 -translate-x-0.5" />
      </Button>
    </div>
  );
}

/****** Property Filter Subject ******/

/****** Property Filter Value ******/
