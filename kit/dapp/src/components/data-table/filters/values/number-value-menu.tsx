"use client";

import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { DebouncedInput } from "../debounced-input";
import { numberFilterDetails } from "../operators/number-operators";
import type { FilterValue } from "../types/filter-types";

interface PropertyFilterNumberValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}

export function PropertyFilterNumberValueMenu<TData, TValue>({
  column,
  columnMeta,
}: PropertyFilterNumberValueMenuProps<TData, TValue>) {
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

  const changeNumber = useCallback(
    (value: number[]) => {
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
          newValues = [sortedValues[0] ?? 0];
        } else {
          newValues = [
            (sortedValues[0] ?? 0) >= cappedMax
              ? cappedMax
              : (sortedValues[0] ?? 0),
            (sortedValues[1] ?? 0) >= cappedMax
              ? cappedMax
              : (sortedValues[1] ?? 0),
          ];
        }

        return {
          ...old,
          values: newValues,
        };
      });
    },
    [column, cappedMax]
  );

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      const newValues = [...inputValues];
      newValues[index] = value;
      setInputValues(newValues);

      const parsedValues = newValues.map((val) => {
        if (val.includes("+")) {
          return cappedMax;
        }
        const parsed = Number.parseFloat(val);
        return Number.isNaN(parsed) ? 0 : parsed;
      });

      changeNumber(parsedValues);
    },
    [inputValues, cappedMax, changeNumber]
  );

  const sliderValueSingle = useMemo(
    () => [Number(inputValues[0] ?? "0")],
    [inputValues]
  );

  const changeType = useCallback(
    (type: "single" | "range") => {
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
        setInputValues([inputValues[0] ?? "0"]);
      } else {
        const maxValue = inputValues[0] ?? cappedMax.toString();
        setInputValues(["0", maxValue]);
      }
    },
    [column, cappedMax, inputValues]
  );

  const handleTabsValueChange = useCallback(
    (value: string) => {
      changeType(value as "single" | "range");
    },
    [changeType]
  );

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

  const handleSingleValueChange = useCallback(
    (value: string | number) => {
      handleInputChange(0, value.toString());
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

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div className="flex flex-col w-full">
            <Tabs
              value={isNumberRange ? "range" : "single"}
              onValueChange={handleTabsValueChange}
            >
              <TabsList className="w-full *:text-xs">
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="range">Range</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="flex flex-col gap-4 mt-4">
                <Slider
                  value={sliderValueSingle}
                  onValueChange={handleSingleSliderChange}
                  min={safeDatasetMin}
                  max={cappedMax}
                  step={1}
                  className="w-full"
                />
                <DebouncedInput
                  type="number"
                  value={inputValues[0] ?? "0"}
                  onChange={handleSingleValueChange}
                  placeholder="Enter value"
                  className="w-full"
                  min={safeDatasetMin}
                  max={cappedMax}
                />
              </TabsContent>
              <TabsContent value="range" className="flex flex-col gap-4 mt-4">
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
                    <label className="text-xs text-muted-foreground">Min</label>
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
                    <label className="text-xs text-muted-foreground">Max</label>
                    <Input
                      type="number"
                      value={inputValues[1] ?? `${cappedMax}+`}
                      placeholder={`${cappedMax}+`}
                      onChange={handleMaxInputChange}
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
