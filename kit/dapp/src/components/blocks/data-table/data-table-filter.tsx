"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { take, uniq } from "@/lib/array";
import type { ColumnOption, ElementType } from "@/lib/filters";
import {
  dateFilterDetails,
  determineNewOperator,
  filterTypeOperatorDetails,
  getColumn,
  getColumnMeta,
  isColumnOptionArray,
  multiOptionFilterDetails,
  numberFilterDetails,
  optionFilterDetails,
  textFilterDetails,
  type ColumnDataType,
  type FilterValue,
  type TextFilterOperator,
} from "@/lib/filters";
import { cn } from "@/lib/utils";
import { getDateLocale } from "@/lib/utils/date";
import type { Column, ColumnMeta, RowData, Table } from "@tanstack/react-table";
import { formatDate, isEqual } from "date-fns";
import {
  ArrowRight,
  Circle,
  CircleCheck,
  Ellipsis,
  Filter,
  X,
} from "lucide-react";
import { useLocale, type Locale } from "next-intl";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DateRange } from "react-day-picker";

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
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // Show left blur if scrolled to the right
      setShowLeftBlur(scrollLeft > 0);

      // Show right blur if there's more content to scroll to the right
      // Add a small buffer (1px) to account for rounding errors
      setShowRightBlur(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  // Log blur states for debugging
  // useEffect(() => {
  //   console.log('left:', showLeftBlur, '  right:', showRightBlur)
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
  }, []);

  // Update blur states when children change
  useEffect(() => {
    checkScroll();
  }, [children]);

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

  useEffect(() => {
    if (property && inputRef) {
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
    <Popover
      open={open}
      onOpenChange={async (value) => {
        setOpen(value);
        if (!value) setProperty(undefined);
      }}
    >
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

  return (
    <CommandItem onSelect={() => setProperty(column.id)} className="group">
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

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export function PropertyFilterList<TData>({ table }: { table: Table<TData> }) {
  const filters = table.getState().columnFilters;

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
            return renderFilter<TData, "text">(
              filter as { id: string; value: FilterValue<"text", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "text" },
              table
            );
          case "number":
            return renderFilter<TData, "number">(
              filter as { id: string; value: FilterValue<"number", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "number" },
              table
            );
          case "date":
            return renderFilter<TData, "date">(
              filter as { id: string; value: FilterValue<"date", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "date" },
              table
            );
          case "option":
            return renderFilter<TData, "option">(
              filter as { id: string; value: FilterValue<"option", TData> },
              column,
              meta as ColumnMeta<TData, unknown> & { type: "option" },
              table
            );
          case "multiOption":
            return renderFilter<TData, "multiOption">(
              filter as {
                id: string;
                value: FilterValue<"multiOption", TData>;
              },
              column,
              meta as ColumnMeta<TData, unknown> & {
                type: "multiOption";
              },
              table
            );
          default:
            return null; // Handle unknown types gracefully
        }
      })}
    </>
  );
}

// Generic render function for a filter with type-safe value
function renderFilter<TData, T extends ColumnDataType>(
  filter: { id: string; value: FilterValue<T, TData> },
  column: Column<TData, unknown>,
  meta: ColumnMeta<TData, unknown> & { type: T },
  table: Table<TData>
) {
  const { value } = filter;

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
        onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
      >
        <X className="size-4 -translate-x-0.5" />
      </Button>
    </div>
  );
}

/****** Property Filter Subject ******/

export function PropertyFilterSubject<TData>({
  meta,
}: {
  meta: ColumnMeta<TData, string>;
}) {
  const hasIcon = !!meta?.icon;
  return (
    <span className="flex select-none items-center gap-1 whitespace-nowrap px-2 font-medium">
      {hasIcon && <meta.icon className="size-4 stroke-[2.25px]" />}
      <span>{meta.displayName}</span>
    </span>
  );
}

/****** Property Filter Operator ******/

// Renders the filter operator display and menu for a given column filter
// The filter operator display is the label and icon for the filter operator
// The filter operator menu is the dropdown menu for the filter operator
export function PropertyFilterOperatorController<
  TData,
  T extends ColumnDataType,
>({
  column,
  columnMeta,
  filter,
}: {
  column: Column<TData, unknown>;
  columnMeta: ColumnMeta<TData, unknown>;
  filter: FilterValue<T, TData>;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="m-0 h-full w-fit whitespace-nowrap rounded-none p-0 px-2 text-xs"
        >
          <PropertyFilterOperatorDisplay
            filter={filter}
            filterType={columnMeta.type}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-fit p-0 origin-(--radix-popover-content-transform-origin)"
      >
        <Command loop>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results.</CommandEmpty>
          <CommandList className="max-h-fit">
            <PropertyFilterOperatorMenu
              column={column}
              closeController={close}
            />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function PropertyFilterOperatorDisplay<TData, T extends ColumnDataType>({
  filter,
  filterType,
}: {
  filter: FilterValue<T, TData>;
  filterType: T;
}) {
  const details = filterTypeOperatorDetails[filterType][filter.operator];

  return <span>{details.label}</span>;
}

interface PropertyFilterOperatorMenuProps<TData> {
  column: Column<TData, unknown>;
  closeController: () => void;
}

export function PropertyFilterOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const { type } = column.columnDef.meta!;

  switch (type) {
    case "option":
      return (
        <PropertyFilterOptionOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "multiOption":
      return (
        <PropertyFilterMultiOptionOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "date":
      return (
        <PropertyFilterDateOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "text":
      return (
        <PropertyFilterTextOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "number":
      return (
        <PropertyFilterNumberOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    default:
      return null;
  }
}

function PropertyFilterOptionOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const filter = column.getFilterValue() as FilterValue<"option", TData>;
  const filterDetails = optionFilterDetails[filter.operator];

  const relatedFilters = Object.values(optionFilterDetails).filter(
    (o) => o.target === filterDetails.target
  );

  const changeOperator = (operator: string) => {
    column.setFilterValue((old: typeof filter) => ({
      ...old,
      operator,
    }));
    console.log(`Setting filter operator for ${column.id} to:`, operator);
    closeController();
  };

  return (
    <CommandGroup heading="Operators">
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {r.label}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

function PropertyFilterMultiOptionOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const filter = column.getFilterValue() as FilterValue<"multiOption", TData>;
  const filterDetails = multiOptionFilterDetails[filter.operator];

  const relatedFilters = Object.values(multiOptionFilterDetails).filter(
    (o) => o.target === filterDetails.target
  );

  const changeOperator = (operator: string) => {
    column.setFilterValue((old: typeof filter) => ({
      ...old,
      operator,
    }));
    console.log(`Setting filter operator for ${column.id} to:`, operator);
    closeController();
  };

  return (
    <CommandGroup heading="Operators">
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {r.label}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

function PropertyFilterDateOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const filter = column.getFilterValue() as FilterValue<"date", TData>;
  const filterDetails = dateFilterDetails[filter.operator];

  const relatedFilters = Object.values(dateFilterDetails).filter(
    (o) => o.target === filterDetails.target
  );

  const changeOperator = (operator: string) => {
    column.setFilterValue((old: typeof filter) => ({
      ...old,
      operator,
    }));
    console.log(`Setting filter operator for ${column.id} to:`, operator);
    closeController();
  };

  return (
    <CommandGroup>
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {r.label}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

export function PropertyFilterTextOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const filter = column.getFilterValue() as FilterValue<"text", TData>;
  const filterDetails = textFilterDetails[filter.operator];

  const relatedFilters = Object.values(textFilterDetails).filter(
    (o) => o.target === filterDetails.target
  );

  const changeOperator = (operator: string) => {
    column.setFilterValue((old: typeof filter) => ({
      ...old,
      operator,
    }));
    console.log(`Setting filter operator for ${column.id} to:`, operator);
    closeController();
  };

  return (
    <CommandGroup heading="Operators">
      {relatedFilters.map((r) => {
        return (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {r.label}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

function PropertyFilterNumberOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  // Show all related operators
  const relatedFilters = Object.values(numberFilterDetails);

  const changeOperator = (operator: string) => {
    column.setFilterValue((old: FilterValue<"number", TData>) => ({
      ...old,
      operator,
    }));
    console.log(`Setting filter operator for ${column.id} to:`, operator);
    closeController();
  };

  return (
    <div>
      <CommandGroup heading="Operators">
        {relatedFilters.map((r) => (
          <CommandItem onSelect={changeOperator} value={r.value} key={r.value}>
            {r.label}
          </CommandItem>
        ))}
      </CommandGroup>
    </div>
  );
}

/****** Property Filter Value ******/

export function PropertyFilterValueController<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}) {
  return (
    <Popover>
      <PopoverAnchor className="h-full" />
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="m-0 h-full w-fit whitespace-nowrap rounded-none p-0 px-2 text-xs"
        >
          <PropertyFilterValueDisplay
            id={id}
            column={column}
            columnMeta={columnMeta}
            table={table}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-fit p-0 origin-(--radix-popover-content-transform-origin)"
      >
        <PropertyFilterValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      </PopoverContent>
    </Popover>
  );
}

interface PropertyFilterValueDisplayProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}

export function PropertyFilterValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  switch (columnMeta.type) {
    case "option":
      return (
        <PropertyFilterOptionValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "multiOption":
      return (
        <PropertyFilterMultiOptionValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "date":
      return (
        <PropertyFilterDateValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "text":
      return (
        <PropertyFilterTextValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "number":
      return (
        <PropertyFilterNumberValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    default:
      return null;
  }
}

export function PropertyFilterOptionValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  let options: ColumnOption[];
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null);
  const uniqueVals = uniq(columnVals);

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options;
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn;

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    );
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals;
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const filter = column.getFilterValue() as FilterValue<"option", TData>;
  const selected = options.filter((o) => filter?.values.includes(o.value));

  // We display the selected options based on how many are selected
  //
  // If there is only one option selected, we display its icon and label
  //
  // If there are multiple options selected, we display:
  // 1) up to 3 icons of the selected options
  // 2) the number of selected options
  if (selected.length === 1) {
    const { label, icon: Icon } = selected[0];
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1">
        {hasIcon &&
          (isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="size-4 text-primary" />
          ))}
        <span>{label}</span>
      </span>
    );
  }
  const name = columnMeta.displayName.toLowerCase();
  const pluralName = name.endsWith("s") ? `${name}es` : `${name}s`;

  const hasOptionIcons = !options?.some((o) => !o.icon);

  return (
    <div className="inline-flex items-center gap-0.5">
      {hasOptionIcons &&
        take(selected, 3).map(({ value, icon }) => {
          const Icon = icon!;
          return isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon key={value} className="size-4" />
          );
        })}
      <span className={cn(hasOptionIcons && "ml-1.5")}>
        {selected.length} {pluralName}
      </span>
    </div>
  );
}

export function PropertyFilterMultiOptionValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  let options: ColumnOption[];
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null);
  const uniqueVals = uniq(columnVals);

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options;
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn;

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    );
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals;
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const filter = column.getFilterValue() as FilterValue<"multiOption", TData>;
  const selected = options.filter((o) => filter?.values[0].includes(o.value));

  if (selected.length === 1) {
    const { label, icon: Icon } = selected[0];
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1.5">
        {hasIcon &&
          (isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="size-4 text-primary" />
          ))}

        <span>{label}</span>
      </span>
    );
  }

  const name = columnMeta.displayName.toLowerCase();

  const hasOptionIcons = !columnMeta.options?.some((o) => !o.icon);

  return (
    <div className="inline-flex items-center gap-1.5">
      {hasOptionIcons && (
        <div key="icons" className="inline-flex items-center gap-0.5">
          {take(selected, 3).map(({ value, icon }) => {
            const Icon = icon!;
            return isValidElement(Icon) ? (
              cloneElement(Icon, { key: value })
            ) : (
              <Icon key={value} className="size-4" />
            );
          })}
        </div>
      )}
      <span>
        {selected.length} {name}
      </span>
    </div>
  );
}

function formatDateRange(start: Date, end: Date, locale: Locale) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  const dateLocale = getDateLocale(locale);

  if (sameMonth && sameYear) {
    return `${formatDate(start, "MMM d", { locale: dateLocale })} - ${formatDate(end, "d, yyyy", { locale: dateLocale })}`;
  }

  if (sameYear) {
    return `${formatDate(start, "MMM d", { locale: dateLocale })} - ${formatDate(end, "MMM d, yyyy", { locale: dateLocale })}`;
  }

  return `${formatDate(start, "MMM d, yyyy", { locale: dateLocale })} - ${formatDate(end, "MMM d, yyyy", { locale: dateLocale })}`;
}

export function PropertyFilterDateValueDisplay<TData, TValue>({
  column,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const locale = useLocale();
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"date", TData>)
    : undefined;

  if (!filter) return null;
  if (filter.values.length === 0) return <Ellipsis className="size-4" />;
  if (filter.values.length === 1) {
    const value = filter.values[0];
    const dateLocale = getDateLocale(locale);
    const formattedDateStr = formatDate(value, "MMM d, yyyy", {
      locale: dateLocale,
    });

    return <span>{formattedDateStr}</span>;
  }

  const formattedRangeStr = formatDateRange(
    filter.values[0],
    filter.values[1],
    locale
  );

  return <span>{formattedRangeStr}</span>;
}

export function PropertyFilterTextValueDisplay<TData, TValue>({
  column,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"text", TData>)
    : undefined;

  if (!filter) return null;
  if (filter.values.length === 0 || filter.values[0].trim() === "")
    return <Ellipsis className="size-4" />;

  const value = filter.values[0];

  return <span>{value}</span>;
}

export function PropertyFilterNumberValueDisplay<TData, TValue>({
  column,
  columnMeta,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const maxFromMeta = columnMeta.max;
  const cappedMax = maxFromMeta ?? 2147483647;

  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"number", TData>)
    : undefined;

  if (!filter) return null;

  if (
    filter.operator === "is between" ||
    filter.operator === "is not between"
  ) {
    const minValue = filter.values[0];
    const maxValue =
      filter.values[1] === Number.POSITIVE_INFINITY ||
      filter.values[1] >= cappedMax
        ? `${cappedMax}+`
        : filter.values[1];

    return (
      <span className="tabular-nums tracking-tight">
        {minValue} and {maxValue}
      </span>
    );
  }

  if (!filter.values || filter.values.length === 0) {
    return null;
  }

  const value = filter.values[0];
  return <span className="tabular-nums tracking-tight">{value}</span>;
}

export function PropertyFilterValueMenu<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}) {
  switch (columnMeta.type) {
    case "option":
      return (
        <PropertyFilterOptionValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "multiOption":
      return (
        <PropertyFilterMultiOptionValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "date":
      return (
        <PropertyFilterDateValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "text":
      return (
        <PropertyFilterTextValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "number":
      return (
        <PropertyFilterNumberValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    default:
      return null;
  }
}

interface ProperFilterValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}

export function PropertyFilterOptionValueMenu<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"option", TData>)
    : undefined;

  let options: ColumnOption[];
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null);
  const uniqueVals = uniq(columnVals);

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options;
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn;

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    );
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals;
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const optionsCount: Record<ColumnOption["value"], number> = columnVals.reduce(
    (acc, curr) => {
      const { value } = columnMeta.transformOptionFn
        ? columnMeta.transformOptionFn(curr as ElementType<NonNullable<TValue>>)
        : { value: curr as string };

      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    },
    {} as Record<ColumnOption["value"], number>
  );

  // Handles the selection/deselection of an option for SINGLE option filters
  function handleOptionSelect(value: string, check: boolean) {
    column?.setFilterValue((old: undefined | FilterValue<"option", TData>) => {
      if (check) {
        // If selecting the value that's already the only one selected, do nothing
        if (
          old &&
          old.operator === "is" &&
          old.values.length === 1 &&
          old.values[0] === value
        ) {
          return old;
        }
        // Otherwise, set the filter to be ONLY this value
        console.log(`Setting single option filter for ${column.id} to:`, value);
        return {
          operator: "is",
          values: [value],
          columnMeta: column.columnDef.meta,
        } satisfies FilterValue<"option", TData>;
      } else {
        // If deselecting, clear the filter
        console.log(`Clearing single option filter for ${column.id}`);
        return undefined;
      }
    });
  }

  return (
    <Command loop>
      <CommandInput autoFocus placeholder="Search..." />
      <CommandEmpty>No results.</CommandEmpty>
      <CommandList className="max-h-fit">
        <CommandGroup>
          {options.map((v) => {
            // Determine checked state based ONLY on the first value when operator is 'is'
            const checked = Boolean(
              filter?.operator === "is" && filter?.values?.[0] === v.value
            );
            const count = optionsCount[v.value] ?? 0;

            return (
              <CommandItem
                key={v.value}
                onSelect={() => {
                  // Pass the new checked state directly
                  handleOptionSelect(v.value, !checked);
                }}
                className="group flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-1.5">
                  {checked ? (
                    <CircleCheck className="size-4 text-primary group-hover:text-foreground" />
                  ) : (
                    <Circle className="size-4 opacity-0 group-hover:opacity-100" />
                  )}
                  {v.icon &&
                    (isValidElement(v.icon) ? (
                      v.icon
                    ) : (
                      <v.icon className="size-4 text-primary" />
                    ))}
                  <span>
                    {v.label}
                    <span
                      className={cn(
                        "ml-2 tabular-nums tracking-tight text-muted-foreground text-xs",
                        count === 0 && "slashed-zero"
                      )}
                    >
                      {count < 100 ? count : "100+"}
                    </span>
                  </span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function PropertyFilterMultiOptionValueMenu<
  TData extends RowData,
  TValue,
>({
  id,
  column,
  columnMeta,
  table,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue() as
    | FilterValue<"multiOption", TData>
    | undefined;

  let options: ColumnOption[];
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null);
  const uniqueVals = uniq(columnVals);

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options;
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn;

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    );
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    options = uniqueVals;
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const optionsCount: Record<ColumnOption["value"], number> = columnVals.reduce(
    (acc, curr) => {
      const value = columnMeta.options
        ? (curr as string)
        : columnMeta.transformOptionFn!(
            curr as ElementType<NonNullable<TValue>>
          ).value;

      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    },
    {} as Record<ColumnOption["value"], number>
  );

  // Handles the selection/deselection of an option
  function handleOptionSelect(value: string, check: boolean) {
    if (check) {
      column.setFilterValue(
        (old: undefined | FilterValue<"multiOption", TData>) => {
          if (
            !old ||
            old.values.length === 0 ||
            !old.values[0] ||
            old.values[0].length === 0
          )
            return {
              operator: "include",
              values: [[value]],
              columnMeta: column.columnDef.meta,
            } satisfies FilterValue<"multiOption", TData>;

          const newValues = [uniq([...old.values[0], value])];

          return {
            operator: determineNewOperator(
              "multiOption",
              old.values,
              newValues,
              old.operator
            ),
            values: newValues,
            columnMeta: column.columnDef.meta,
          } satisfies FilterValue<"multiOption", TData>;
        }
      );
    } else
      column.setFilterValue(
        (old: undefined | FilterValue<"multiOption", TData>) => {
          if (!old?.values[0] || old.values[0].length <= 1) return undefined;

          const newValues = [
            uniq([...old.values[0], value]).filter((v) => v !== value),
          ];

          return {
            operator: determineNewOperator(
              "multiOption",
              old.values,
              newValues,
              old.operator
            ),
            values: newValues,
            columnMeta: column.columnDef.meta,
          } satisfies FilterValue<"multiOption", TData>;
        }
      );
  }

  return (
    <Command loop>
      <CommandInput autoFocus placeholder="Search..." />
      <CommandEmpty>No results.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {options.map((v) => {
            const checked = Boolean(filter?.values[0]?.includes(v.value));
            const count = optionsCount[v.value] ?? 0;

            return (
              <CommandItem
                key={v.value}
                onSelect={() => {
                  handleOptionSelect(v.value, !checked);
                }}
                className="group flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    checked={checked}
                    className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
                  />
                  {v.icon &&
                    (isValidElement(v.icon) ? (
                      v.icon
                    ) : (
                      <v.icon className="size-4 text-primary" />
                    ))}
                  <span>
                    {v.label}
                    <span
                      className={cn(
                        "ml-2 tabular-nums tracking-tight text-muted-foreground text-xs",
                        count === 0 && "slashed-zero"
                      )}
                    >
                      {count < 100 ? count : "100+"}
                    </span>
                  </span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function PropertyFilterDateValueMenu<TData, TValue>({
  column,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"date", TData>)
    : undefined;

  const [date, setDate] = useState<DateRange | undefined>({
    from: filter?.values[0] ?? new Date(),
    to: filter?.values[1] ?? undefined,
  });

  function changeDateRange(value: DateRange | undefined) {
    const start = value?.from;
    const end =
      start && value && value.to && !isEqual(start, value.to)
        ? value.to
        : undefined;

    setDate({ from: start, to: end });

    const isRange = start && end;

    const newValues = isRange ? [start, end] : start ? [start] : [];

    column.setFilterValue((old: undefined | FilterValue<"date", TData>) => {
      if (!old || old.values.length === 0)
        return {
          operator: newValues.length > 1 ? "is between" : "is",
          values: newValues,
          columnMeta: column.columnDef.meta,
        } satisfies FilterValue<"date", TData>;

      return {
        operator:
          old.values.length < newValues.length
            ? "is between"
            : old.values.length > newValues.length
              ? "is"
              : old.operator,
        values: newValues,
        columnMeta: column.columnDef.meta,
      } satisfies FilterValue<"date", TData>;
    });
  }

  return (
    <Command>
      {/* <CommandInput placeholder="Search..." /> */}
      {/* <CommandEmpty>No results.</CommandEmpty> */}
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={changeDateRange}
              numberOfMonths={1}
            />
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function PropertyFilterTextValueMenu<TData, TValue>({
  column,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"text", TData>)
    : undefined;

  const [operator, setOperator] = useState<TextFilterOperator>(
    filter?.operator || "contains"
  );

  const changeText = (value: string | number) => {
    column.setFilterValue((old: undefined | FilterValue<"text", TData>) => {
      if (!old || old.values.length === 0)
        return {
          operator,
          values: [String(value)],
          columnMeta: column.columnDef.meta,
        } satisfies FilterValue<"text", TData>;
      return { operator, values: [String(value)] };
    });
  };

  const handleOperatorChange = (newOperator: TextFilterOperator) => {
    setOperator(newOperator);
    column.setFilterValue((old: undefined | FilterValue<"text", TData>) => {
      if (!old || old.values.length === 0) return undefined;
      return {
        ...old,
        operator: newOperator,
      };
    });
  };

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div className="flex flex-col gap-2 p-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={operator === "contains" ? "default" : "outline"}
                size="sm"
                onClick={() => handleOperatorChange("contains")}
                className="text-xs"
              >
                Contains
              </Button>
              <Button
                variant={
                  operator === "does not contain" ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleOperatorChange("does not contain")}
                className="text-xs"
              >
                Does not contain
              </Button>
            </div>
            <DebouncedInput
              placeholder="Search..."
              autoFocus
              value={filter?.values[0] ?? ""}
              onChange={changeText}
              className="w-full mt-1"
            />
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function PropertyFilterNumberValueMenu<TData, TValue>({
  column,
  columnMeta,
}: ProperFilterValueMenuProps<TData, TValue>) {
  const maxFromMeta = columnMeta.max;
  const cappedMax = maxFromMeta ?? Number.MAX_SAFE_INTEGER;

  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"number", TData>)
    : undefined;

  const isNumberRange =
    !!filter && numberFilterDetails[filter.operator].target === "multiple";

  const [datasetMin] = column.getFacetedMinMaxValues() ?? [0, 0];

  const initialValues = () => {
    if (filter?.values) {
      return filter.values.map((val) =>
        val >= cappedMax ? `${cappedMax}+` : val.toString()
      );
    }
    return [datasetMin.toString()];
  };

  const [inputValues, setInputValues] = useState<string[]>(initialValues);

  const changeNumber = (value: number[]) => {
    const sortedValues = [...value].sort((a, b) => a - b);

    column.setFilterValue((old: undefined | FilterValue<"number", TData>) => {
      if (!old || old.values.length === 0) {
        return {
          operator: "is",
          values: sortedValues,
        };
      }

      const operator = numberFilterDetails[old.operator];
      let newValues: number[];

      if (operator.target === "single") {
        newValues = [sortedValues[0]];
      } else {
        newValues = [
          sortedValues[0] >= cappedMax ? cappedMax : sortedValues[0],
          sortedValues[1] >= cappedMax
            ? Number.POSITIVE_INFINITY
            : sortedValues[1],
        ];
      }

      return {
        operator: old.operator,
        values: newValues,
      };
    });
  };

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...inputValues];
    if (isNumberRange && Number.parseInt(value, 10) >= cappedMax) {
      newValues[index] = `${cappedMax}+`;
    } else {
      newValues[index] = value;
    }

    setInputValues(newValues);

    const parsedValues = newValues.map((val) => {
      if (val.trim() === "") return 0;
      if (val === `${cappedMax}+`) return cappedMax;
      return Number.parseInt(val, 10);
    });

    changeNumber(parsedValues);
  };

  const changeType = (type: "single" | "range") => {
    column.setFilterValue((old: undefined | FilterValue<"number", TData>) => {
      if (type === "single") {
        return {
          operator: "is",
          values: [old?.values[0] ?? 0],
        };
      }
      const newMaxValue = old?.values[0] ?? cappedMax;
      return {
        operator: "is between",
        values: [0, newMaxValue],
      };
    });

    if (type === "single") {
      setInputValues([inputValues[0]]);
    } else {
      const maxValue = inputValues[0] || cappedMax.toString();
      setInputValues(["0", maxValue]);
    }
  };

  const slider = {
    value: inputValues.map((val) =>
      val === "" || val === `${cappedMax}+`
        ? cappedMax
        : Number.parseInt(val, 10)
    ),
    onValueChange: (value: number[]) => {
      const values = value.map((val) => (val >= cappedMax ? cappedMax : val));
      setInputValues(
        values.map((v) => (v >= cappedMax ? `${cappedMax}+` : v.toString()))
      );
      changeNumber(values);
    },
  };

  return (
    <Command>
      <CommandList className="w-[300px] px-2 py-2">
        <CommandGroup>
          <div className="flex flex-col w-full">
            <Tabs
              value={isNumberRange ? "range" : "single"}
              onValueChange={(v) =>
                changeType(v === "range" ? "range" : "single")
              }
            >
              <TabsList className="w-full *:text-xs">
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="range">Range</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="flex flex-col gap-4 mt-4">
                <Slider
                  value={[Number(inputValues[0])]}
                  onValueChange={(value) => {
                    handleInputChange(0, value[0].toString());
                  }}
                  min={datasetMin}
                  max={cappedMax}
                  step={1}
                  aria-orientation="horizontal"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Value</span>
                  <Input
                    id="single"
                    type="number"
                    value={inputValues[0]}
                    onChange={(e) => handleInputChange(0, e.target.value)}
                    max={cappedMax}
                  />
                </div>
              </TabsContent>
              <TabsContent value="range" className="flex flex-col gap-4 mt-4">
                <Slider
                  value={slider.value}
                  onValueChange={slider.onValueChange}
                  min={datasetMin}
                  max={cappedMax}
                  step={1}
                  aria-orientation="horizontal"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Min</span>
                    <Input
                      type="number"
                      value={inputValues[0]}
                      onChange={(e) => handleInputChange(0, e.target.value)}
                      max={cappedMax}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Max</span>
                    <Input
                      type="text"
                      value={inputValues[1]}
                      placeholder={`${cappedMax}+`}
                      onChange={(e) => handleInputChange(1, e.target.value)}
                      max={cappedMax}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
