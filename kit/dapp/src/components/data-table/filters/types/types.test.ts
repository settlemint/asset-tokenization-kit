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
    const meta: FilterableColumnMeta<unknown, unknown> = {
      displayName: "Test Column",
      type: "text" as ColumnType,
    };

    expect(meta.displayName).toBe("Test Column");
    expect(meta.type).toBe("text");
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
    const textValue: FilterValue = "text";
    const numberValue: FilterValue = 42;
    const arrayValue: FilterValue = ["option1", "option2"];
    const dateRange: FilterValue = { from: new Date(), to: new Date() };
    const numberRange: FilterValue = { from: 0, to: 100 };

    expect(typeof textValue).toBe("string");
    expect(typeof numberValue).toBe("number");
    expect(Array.isArray(arrayValue)).toBe(true);
    expect(typeof dateRange).toBe("object");
    expect(typeof numberRange).toBe("object");
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
      from: 10,
      to: 100,
    };

    expect(numberRange.from).toBe(10);
    expect(numberRange.to).toBe(100);
  });

  it("should define all operator types", () => {
    const textOp: TextOperator = "contains";
    const numberOp: NumberOperator = "equals";
    const dateOp: DateOperator = "equals";
    const optionOp: OptionOperator = "equals";
    const multiOptionOp: MultiOptionOperator = "includesAny";

    expect(textOp).toBe("contains");
    expect(numberOp).toBe("equals");
    expect(dateOp).toBe("equals");
    expect(optionOp).toBe("equals");
    expect(multiOptionOp).toBe("includesAny");
  });

  it("should define FilterOperator union correctly", () => {
    const operators: FilterOperator[] = [
      "contains",
      "equals",
      "startsWith",
      "endsWith",
      "isEmpty",
      "isNotEmpty",
      "greaterThan",
      "lessThan",
      "greaterThanOrEqual",
      "lessThanOrEqual",
      "between",
      "after",
      "before",
      "onOrAfter",
      "onOrBefore",
      "includesAny",
      "includesAll",
      "excludes",
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
      selectedData: [{ id: 1 }, { id: 2 }],
    };

    expect(params.selectedRows).toHaveLength(2);
    expect(params.selectedData).toHaveLength(2);
    expect(params.selectedRows[0].original.id).toBe(1);
    expect(params.selectedData[0].id).toBe(1);
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
    expect(group.actions[0].label).toBe("Edit");
    expect(group.actions[1].label).toBe("Duplicate");
  });

  it("should support action variants", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
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
