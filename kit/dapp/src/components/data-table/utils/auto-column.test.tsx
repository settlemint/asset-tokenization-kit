/**
 * @vitest-environment happy-dom
 */
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { withAutoCell, withAutoCells, withAutoFeatures } from "./auto-column";

// Mock formatValue
vi.mock("@/lib/utils/format-value", () => ({
  formatValue: vi.fn((value, options) => {
    if (options?.type === "currency") {
      return `$${value}`;
    }
    if (options?.type === "date") {
      return new Date(value).toLocaleDateString();
    }
    if (options?.type === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value ?? "-");
  }),
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: () => Promise.resolve(),
    },
  }),
}));

// Mock auto filter function
vi.mock("../filters/functions/auto-filter", () => ({
  withAutoFilterFn: vi.fn((column) => column),
}));

interface TestData {
  id: number;
  name: string;
  amount: number;
  createdAt: Date;
  isActive: boolean;
}

const testData: TestData = {
  id: 1,
  name: "Test Item",
  amount: 1000,
  createdAt: new Date("2024-01-01"),
  isActive: true,
};

// Helper component to render a cell
function TestCell<TData, TValue>({
  column,
  data,
}: {
  column: ColumnDef<TData, TValue>;
  data: TData;
}) {
  const context = {
    column: {
      columnDef: column,
    },
    getValue: () => {
      if ("accessorKey" in column && column.accessorKey) {
        return (data as Record<string, unknown>)[column.accessorKey as string];
      }
      if ("accessorFn" in column && column.accessorFn) {
        return column.accessorFn(data, 0);
      }
      return undefined;
    },
    row: { original: data },
    table: {} as unknown,
  } as CellContext<TData, TValue>;

  const cell = column.cell;
  if (typeof cell === "function") {
    return <>{cell(context)}</>;
  }
  return <>{flexRender(cell, context)}</>;
}

describe("withAutoCell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Formatting", () => {
    it("should format currency values when type is currency", () => {
      const column = withAutoCell({
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        meta: {
          type: "currency",
          currency: "USD",
        },
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      expect(screen.getByText("$1000")).toBeInTheDocument();
    });

    it("should format date values when type is date", () => {
      const column = withAutoCell({
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created At",
        meta: {
          type: "date",
        },
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      expect(screen.getByText("1/1/2024")).toBeInTheDocument();
    });

    it("should format boolean values when type is boolean", () => {
      const column = withAutoCell({
        id: "isActive",
        accessorKey: "isActive",
        header: "Active",
        meta: {
          type: "boolean",
        },
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      expect(screen.getByText("Yes")).toBeInTheDocument();
    });

    it("should use default formatting when no type is specified", () => {
      const column = withAutoCell({
        id: "name",
        accessorKey: "name",
        header: "Name",
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      expect(screen.getByText("Test Item")).toBeInTheDocument();
    });

    it("should handle null/undefined values", () => {
      const column = withAutoCell({
        id: "missing",
        accessorKey: "missing" as keyof TestData,
        header: "Missing",
        meta: {
          type: "text",
          emptyValue: "N/A",
        },
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  describe("Custom Cell Rendering", () => {
    it("should use custom cell renderer when provided", () => {
      const column = withAutoCell({
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: () => <span>Custom Cell</span>,
        meta: {
          type: "text",
        },
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      expect(screen.getByText("Custom Cell")).toBeInTheDocument();
      expect(screen.queryByText("Test Item")).not.toBeInTheDocument();
    });

    it("should preserve cell props when wrapping", () => {
      const cellFn = vi.fn((context) => <span>{context.getValue()}</span>);

      const column = withAutoCell({
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: cellFn,
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      expect(cellFn).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
          column: expect.objectContaining({
            columnDef: expect.any(Object),
          }),
          row: expect.objectContaining({
            original: testData,
          }),
        })
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle columns without cell property", () => {
      const column = withAutoCell({
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
      });

      expect(column.cell).toBeDefined();
      expect(typeof column.cell).toBe("function");
    });

    it("should handle columns with existing cell as string", () => {
      const column = withAutoCell({
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: () => "Custom String Cell",
      });

      renderWithProviders(<TestCell column={column} data={testData} />);

      // Should wrap the string cell with FormattedCell - returns the cell content
      expect(screen.getByText("Custom String Cell")).toBeInTheDocument();
    });
  });
});

describe("withAutoCells", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply withAutoCell to all columns", () => {
    const columns: ColumnDef<TestData>[] = [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        meta: { type: "currency" },
      },
    ];

    const result = withAutoCells(columns);

    expect(result).toHaveLength(2);
    expect(result[0]?.cell).toBeDefined();
    expect(result[1]?.cell).toBeDefined();
  });
});

describe("withAutoFeatures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply all auto features to columns array", () => {
    const columns: ColumnDef<TestData>[] = [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        meta: { type: "text" },
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        meta: { type: "currency" },
      },
    ];

    const result = withAutoFeatures(columns);

    expect(result).toHaveLength(2);
    // Should have cell functions
    expect(result[0]?.cell).toBeDefined();
    expect(result[1]?.cell).toBeDefined();
    // Currency column should have numeric variant
    expect(result[1]?.meta?.variant).toBe("numeric");
  });

  it("should preserve all original column properties", () => {
    const columns: ColumnDef<TestData>[] = [
      {
        id: "test",
        accessorKey: "name",
        header: "Test Header",
        enableSorting: false,
        enableHiding: true,
        meta: {
          type: "text",
          displayName: "Test Display",
        },
      },
    ];

    const result = withAutoFeatures(columns);

    expect(result[0]?.id).toBe("test");
    expect(
      result[0] && "accessorKey" in result[0]
        ? result[0].accessorKey
        : undefined
    ).toBe("name");
    expect(result[0]?.header).toBe("Test Header");
    expect(result[0]?.enableSorting).toBe(false);
    expect(result[0]?.enableHiding).toBe(true);
    expect(result[0]?.meta?.displayName).toBe("Test Display");
  });

  it("should work with accessor functions", () => {
    const accessorFn = (row: TestData) => row.name.toUpperCase();
    const columns: ColumnDef<TestData>[] = [
      {
        id: "upperName",
        accessorFn,
        header: "Upper Name",
      },
    ];

    const result = withAutoFeatures(columns);

    expect(
      result[0] && "accessorFn" in result[0] ? result[0].accessorFn : undefined
    ).toBe(accessorFn);
    expect(result[0]?.cell).toBeDefined();
  });
});
