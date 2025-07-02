import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { ChevronLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { numberFilterDetails } from "../operators/number-operators";
import type { FilterValue } from "../types/filter-types";

interface PropertyFilterNumberValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
  onClose?: () => void;
  onBack?: () => void;
}

export function PropertyFilterNumberValueMenu<TData, TValue>({
  column,
  columnMeta,
  onClose,
  onBack,
}: PropertyFilterNumberValueMenuProps<TData, TValue>) {
  const { t } = useTranslation("general");
  const maxFromMeta = columnMeta.max;
  const cappedMax = maxFromMeta ?? Number.MAX_SAFE_INTEGER;

  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"number", TData>)
    : undefined;

  const isNumberRange =
    !!filter && numberFilterDetails[filter.operator].target === "multiple";

  const [datasetMin] = column.getFacetedMinMaxValues() ?? [0, 0];
  const safeDatasetMin = datasetMin;

  const initialValues = () => {
    if (filter?.values) {
      return filter.values.map((val) =>
        val >= cappedMax ? `${cappedMax}+` : val.toString()
      );
    }
    return [safeDatasetMin.toString()];
  };

  const [inputValues, setInputValues] = useState<string[]>(initialValues);

  const [tabValue, setTabValue] = useState(isNumberRange ? "range" : "single");

  const handleApply = useCallback(() => {
    const parsedValues = inputValues.map((val) => {
      if (val.includes("+")) {
        return cappedMax;
      }
      const parsed = Number.parseFloat(val);
      return Number.isNaN(parsed) ? 0 : parsed;
    });

    const sortedValues = [...parsedValues].sort((a, b) => a - b);

    const operator = tabValue === "range" ? "is between" : "is";
    const newValues =
      tabValue === "single"
        ? [sortedValues[0] ?? 0]
        : [
            (sortedValues[0] ?? 0) >= cappedMax
              ? cappedMax
              : (sortedValues[0] ?? 0),
            (sortedValues[1] ?? 0) >= cappedMax
              ? cappedMax
              : (sortedValues[1] ?? 0),
          ];

    const filterValue = {
      operator,
      values: newValues,
      columnMeta: column.columnDef.meta,
    } satisfies FilterValue<"number", TData>;

    column.setFilterValue(filterValue);
    onClose?.();
  }, [column, inputValues, cappedMax, tabValue, onClose]);

  const handleClear = useCallback(() => {
    setInputValues([safeDatasetMin.toString()]);
    column.setFilterValue(undefined);
    onClose?.();
  }, [column, safeDatasetMin, onClose]);

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      const newValues = [...inputValues];
      newValues[index] = value;
      setInputValues(newValues);
    },
    [inputValues]
  );

  const sliderValueSingle = useMemo(
    () => [Number(inputValues[0] ?? "0")],
    [inputValues]
  );

  const changeType = useCallback(
    (type: "single" | "range") => {
      setTabValue(type);
      if (type === "single") {
        setInputValues([inputValues[0] ?? "0"]);
      } else {
        const maxValue = inputValues[0] ?? cappedMax.toString();
        setInputValues(["0", maxValue]);
      }
    },
    [cappedMax, inputValues]
  );

  const handleSingleClick = useCallback(() => {
    changeType("single");
  }, [changeType]);

  const handleRangeClick = useCallback(() => {
    changeType("range");
  }, [changeType]);

  const handleSingleSliderChange = useCallback(
    (value: number[]) => {
      handleInputChange(0, value[0]?.toString() ?? "0");
    },
    [handleInputChange]
  );

  const handleRangeSliderChange = useCallback(
    (value: number[]) => {
      handleInputChange(0, value[0]?.toString() ?? "0");
      handleInputChange(1, value[1]?.toString() ?? cappedMax.toString());
    },
    [handleInputChange, cappedMax]
  );

  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(0, e.target.value);
    },
    [handleInputChange]
  );

  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(1, e.target.value);
    },
    [handleInputChange]
  );

  const sliderValueRange = useMemo(
    () => [
      Number(inputValues[0] ?? "0"),
      Number(inputValues[1] ?? cappedMax.toString()),
    ],
    [inputValues, cappedMax]
  );

  const handleSingleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(0, e.target.value);
    },
    [handleInputChange]
  );

  const Icon = columnMeta.icon;
  const displayName = columnMeta.displayName ?? "Filter";

  return (
    <Command className="min-w-[280px]">
      {/* Header with field title and icon - match CommandInput styling */}
      <div className="flex h-9 items-center gap-2 border-b px-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent -ml-1"
            onClick={onBack}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        )}
        {Icon && <Icon className="size-4 shrink-0 opacity-50" />}
        <span className="text-sm text-muted-foreground">{displayName}</span>
      </div>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div className="flex flex-col w-full p-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={tabValue === "single" ? "default" : "outline"}
                size="sm"
                onClick={handleSingleClick}
                className="text-xs"
              >
                {t("components.data-table.filters.number.single")}
              </Button>
              <Button
                variant={tabValue === "range" ? "default" : "outline"}
                size="sm"
                onClick={handleRangeClick}
                className="text-xs"
              >
                {t("components.data-table.filters.number.range")}
              </Button>
            </div>
            {tabValue === "single" ? (
              <div className="flex flex-col gap-2">
                <Slider
                  value={sliderValueSingle}
                  onValueChange={handleSingleSliderChange}
                  min={safeDatasetMin}
                  max={cappedMax}
                  step={1}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={inputValues[0] ?? "0"}
                  onChange={handleSingleInputChange}
                  placeholder={t(
                    "components.data-table.filters.number.placeholder"
                  )}
                  className="w-full"
                  min={safeDatasetMin}
                  max={cappedMax}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Slider
                  value={sliderValueRange}
                  onValueChange={handleRangeSliderChange}
                  min={safeDatasetMin}
                  max={cappedMax}
                  step={1}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-muted-foreground">
                      {t("components.data-table.filters.number.min")}
                    </label>
                    <Input
                      type="number"
                      value={inputValues[0] ?? "0"}
                      placeholder="0"
                      onChange={handleMinInputChange}
                      min={safeDatasetMin}
                      max={cappedMax}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-muted-foreground">
                      {t("components.data-table.filters.number.max")}
                    </label>
                    <Input
                      type="number"
                      value={inputValues[1] ?? `${cappedMax}+`}
                      placeholder={`${cappedMax}+`}
                      onChange={handleMaxInputChange}
                      max={cappedMax}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleApply}
                className="flex-1"
              >
                {t("components.data-table.apply")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                {t("components.data-table.clear")}
              </Button>
            </div>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
