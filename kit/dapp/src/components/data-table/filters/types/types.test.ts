/**
 * Contract tests for data table type definitions
 * These tests ensure type contracts are maintained and provide coverage for type-only files
 */
import { describe, it, expect } from "vitest";
import type {
  ColumnOption,
  ColumnOptionWithIcon,
  FilterableColumnMeta,
  ColumnType,
  ElementType,
} from "./column-types";
import type {
  FilterValue,
  DateRange,
  NumberRange,
  FilterOperator,
  TextOperator,
  NumberOperator,
  DateOperator,
  OptionOperator,
  MultiOptionOperator,
} from "./filter-types";
import type {
  DataTableProps,
  BulkActionRowData,
  BulkActionExecuteParams,
} from "./table-extensions";
import type { BulkAction, BulkActionGroup } from "../../types/bulk-actions";

describe("Column Types Contract", () => {
  it("should define ColumnOption interface correctly", () => {
    const option: ColumnOption = {
      label: "Test Label",
      value: "test-value",
    };

    expect(option.label).toBe("Test Label");
    expect(option.value).toBe("test-value");
  });

  it("should define ColumnOptionWithIcon interface correctly", () => {
    const MockIcon = () => null;

    const optionWithIcon: ColumnOptionWithIcon = {
      label: "Test Label",
      value: "test-value",
      icon: MockIcon,
    };

    expect(optionWithIcon.label).toBe("Test Label");
    expect(optionWithIcon.value).toBe("test-value");
    expect(optionWithIcon.icon).toBe(MockIcon);
  });

  it("should define FilterableColumnMeta interface correctly", () => {
    const meta: FilterableColumnMeta = {
      dataType: "text",
    };

    expect(meta.dataType).toBe("text");
  });

  it("should support all column types", () => {
    const textType: ColumnType = "text";
    const numberType: ColumnType = "number";
    const dateType: ColumnType = "date";
    const optionType: ColumnType = "option";
    const multiOptionType: ColumnType = "multiOption";

    expect(textType).toBe("text");
    expect(numberType).toBe("number");
    expect(dateType).toBe("date");
    expect(optionType).toBe("option");
    expect(multiOptionType).toBe("multiOption");
  });

  it("should define ElementType utility correctly", () => {
    type StringArray = string[];
    type StringElement = ElementType<StringArray>;

    // This test verifies the type compiles correctly
    const element: StringElement = "test";
    expect(element).toBe("test");
  });
});

describe("Filter Types Contract", () => {
  it("should define FilterValue type correctly", () => {
    const textValue: FilterValue<"text", unknown> = {
      operator: "contains",
      values: ["text"],
      columnMeta: undefined,
    };
    const numberValue: FilterValue<"number", unknown> = {
      operator: "is",
      values: [42],
      columnMeta: undefined,
    };
    const arrayValue: FilterValue<"multiOption", unknown> = {
      operator: "include",
      values: [["option1", "option2"]],
      columnMeta: undefined,
    };
    const dateValue: FilterValue<"date", unknown> = {
      operator: "is",
      values: [new Date()],
      columnMeta: undefined,
    };
    const optionValue: FilterValue<"option", unknown> = {
      operator: "is",
      values: ["option1"],
      columnMeta: undefined,
    };

    expect(typeof textValue).toBe("object");
    expect(typeof numberValue).toBe("object");
    expect(typeof arrayValue).toBe("object");
    expect(typeof dateValue).toBe("object");
    expect(typeof optionValue).toBe("object");
  });

  it("should define DateRange interface correctly", () => {
    const dateRange: DateRange = {
      from: new Date("2023-01-01"),
      to: new Date("2023-12-31"),
    };

    expect(dateRange.from).toBeInstanceOf(Date);
    expect(dateRange.to).toBeInstanceOf(Date);
  });

  it("should define NumberRange interface correctly", () => {
    const numberRange: NumberRange = {
      min: 10,
      max: 100,
    };

    expect(numberRange.min).toBe(10);
    expect(numberRange.max).toBe(100);
  });

  it("should define all operator types", () => {
    const textOp: TextOperator = "contains";
    const numberOp: NumberOperator = "is";
    const dateOp: DateOperator = "is";
    const optionOp: OptionOperator = "is";
    const multiOptionOp: MultiOptionOperator = "include";

    expect(textOp).toBe("contains");
    expect(numberOp).toBe("is");
    expect(dateOp).toBe("is");
    expect(optionOp).toBe("is");
    expect(multiOptionOp).toBe("include");
  });

  it("should define FilterOperator union correctly", () => {
    const operators: FilterOperator[] = [
      "contains",
      "does not contain",
      "is greater than",
      "is less than",
      "is greater than or equal to",
      "is less than or equal to",
      "is between",
      "is after",
      "is before",
      "is on or after",
      "is on or before",
      "include any of",
      "include all of",
      "exclude",
    ];

    operators.forEach((op) => {
      expect(typeof op).toBe("string");
    });
  });
});

describe("Table Extensions Contract", () => {
  it("should define DataTableProps interface correctly", () => {
    // This is a complex interface, we test key properties exist
    const props: Partial<DataTableProps<unknown>> = {
      data: [],
      columns: [],
      name: "test-table",
    };

    expect(props.data).toEqual([]);
    expect(props.columns).toEqual([]);
    expect(props.name).toBe("test-table");
  });

  it("should define BulkActionRowData interface correctly", () => {
    const rowData: BulkActionRowData<{ id: number; name: string }> = {
      original: { id: 1, name: "test" },
      index: 0,
      id: "1",
    };

    expect(rowData.original.id).toBe(1);
    expect(rowData.original.name).toBe("test");
    expect(rowData.index).toBe(0);
    expect(rowData.id).toBe("1");
  });

  it("should define BulkActionExecuteParams interface correctly", () => {
    const params: BulkActionExecuteParams<{ id: number }> = {
      selectedRows: [
        { original: { id: 1 }, index: 0, id: "1" },
        { original: { id: 2 }, index: 1, id: "2" },
      ],
      selectedRowIds: ["1", "2"],
    };

    expect(params.selectedRows).toHaveLength(2);
    expect(params.selectedRows[0]?.original.id).toBe(1);
    expect(params.selectedRows[1]?.original.id).toBe(2);
  });
});

describe("Bulk Actions Contract", () => {
  it("should define BulkAction interface correctly", () => {
    const action: BulkAction<{ id: number }> = {
      id: "delete",
      label: "Delete Items",
      variant: "destructive",
      execute: async () => {},
    };

    expect(action.id).toBe("delete");
    expect(action.label).toBe("Delete Items");
    expect(action.variant).toBe("destructive");
    expect(typeof action.execute).toBe("function");
  });

  it("should define BulkAction with confirmation correctly", () => {
    const action: BulkAction<{ id: number }> = {
      id: "archive",
      label: "Archive Items",
      requiresConfirmation: true,
      confirmationTitle: "Archive Confirmation",
      confirmationDescription: "Are you sure?",
      execute: async () => {},
    };

    expect(action.requiresConfirmation).toBe(true);
    expect(action.confirmationTitle).toBe("Archive Confirmation");
    expect(action.confirmationDescription).toBe("Are you sure?");
  });

  it("should define BulkActionGroup interface correctly", () => {
    const group: BulkActionGroup<{ id: number }> = {
      id: "actions-group",
      label: "Actions",
      actions: [
        {
          id: "edit",
          label: "Edit",
          execute: async () => {},
        },
        {
          id: "duplicate",
          label: "Duplicate",
          execute: async () => {},
        },
      ],
    };

    expect(group.label).toBe("Actions");
    expect(group.actions).toHaveLength(2);
    expect(group.actions[0]!.label).toBe("Edit");
    expect(group.actions[1]!.label).toBe("Duplicate");
  });

  it("should support action variants", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
    ] as const;

    variants.forEach((variant) => {
      const action: BulkAction = {
        id: "test",
        label: "Test",
        variant,
        execute: async () => {},
      };

      expect(action.variant).toBe(variant);
    });
  });
});
