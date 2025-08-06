/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { defineMeta } from "./meta-definition";
import { getColumn, getColumnMeta } from "./table-helpers";
import type { Table, Column, AccessorFn } from "@tanstack/react-table";

describe("Meta Definition Utils", () => {
  it("should define meta with accessor function", () => {
    const accessor = (row: { name: string }) => row.name;

    const meta = defineMeta(accessor as AccessorFn<unknown>, {
      displayName: "Name",
      type: "text",
    });

    expect(meta.displayName).toBe("Name");
    expect(meta.type).toBe("text");
  });

  it("should preserve all meta properties", () => {
    const accessor = (row: { age: number }) => row.age;

    const meta = defineMeta(accessor as AccessorFn<unknown>, {
      displayName: "Age",
      type: "number",
    });

    expect(meta.displayName).toBe("Age");
    expect(meta.type).toBe("number");
  });

  it("should work with complex accessor functions", () => {
    const accessor = (row: { user: { profile: { email: string } } }) =>
      row.user.profile.email;

    const meta = defineMeta(accessor as AccessorFn<unknown>, {
      displayName: "Email",
      type: "text",
    });

    expect(meta.displayName).toBe("Email");
    expect(meta.type).toBe("text");
  });

  it("should work with option type columns", () => {
    const accessor = (row: { status: string }) => row.status;

    const meta = defineMeta(accessor as AccessorFn<unknown>, {
      displayName: "Status",
      type: "option",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    });

    expect(meta.displayName).toBe("Status");
    expect(meta.type).toBe("option");
    expect(meta.options).toHaveLength(2);
    expect(meta.options?.[0]?.label).toBe("Active");
  });

  it("should work with date type columns", () => {
    const accessor = (row: { createdAt: Date }) => row.createdAt;

    const meta = defineMeta(accessor as AccessorFn<unknown>, {
      displayName: "Created Date",
      type: "date",
    });

    expect(meta.displayName).toBe("Created Date");
    expect(meta.type).toBe("date");
  });
});

describe("Table Helpers", () => {
  const createMockTable = () => {
    const mockColumn: Partial<Column<unknown>> = {
      id: "name",
      columnDef: {
        id: "name",
        meta: {
          displayName: "Name",
          type: "text",
        },
      },
    };

    const mockTable: Partial<Table<unknown>> = {
      getColumn: vi.fn((id: string) => {
        if (id === "name") {
          return mockColumn as Column<unknown>;
        }
        return undefined;
      }),
    };

    return { mockTable: mockTable as Table<unknown>, mockColumn };
  };

  describe("getColumn", () => {
    it("should return column when it exists", () => {
      const { mockTable, mockColumn } = createMockTable();

      const result = getColumn(mockTable, "name");

      expect(result).toBe(mockColumn);
      expect(mockTable.getColumn).toHaveBeenCalledWith("name");
    });

    it("should throw error when column does not exist", () => {
      const { mockTable } = createMockTable();

      expect(() => {
        getColumn(mockTable, "nonexistent");
      }).toThrow("Column with id nonexistent not found");
    });

    it("should handle different column ids", () => {
      const { mockTable } = createMockTable();

      expect(() => {
        getColumn(mockTable, "email");
      }).toThrow("Column with id email not found");

      expect(() => {
        getColumn(mockTable, "status");
      }).toThrow("Column with id status not found");
    });
  });

  describe("getColumnMeta", () => {
    it("should return column meta when it exists", () => {
      const { mockTable } = createMockTable();

      const result = getColumnMeta(mockTable, "name");

      expect(result).toEqual({
        displayName: "Name",
        type: "text",
      });
    });

    it("should throw error when column does not exist", () => {
      const { mockTable } = createMockTable();

      expect(() => {
        getColumnMeta(mockTable, "nonexistent");
      }).toThrow("Column with id nonexistent not found");
    });

    it("should throw error when column meta does not exist", () => {
      const mockColumnWithoutMeta: Partial<Column<unknown>> = {
        id: "nometa",
        columnDef: {
          id: "nometa",
          // No meta property
        },
      };

      const mockTable: Partial<Table<unknown>> = {
        getColumn: vi.fn((id: string) => {
          if (id === "nometa") {
            return mockColumnWithoutMeta as Column<unknown>;
          }
          return undefined;
        }),
      };

      expect(() => {
        getColumnMeta(mockTable as Table<unknown>, "nometa");
      }).toThrow("Column meta not found for column nometa");
    });

    it("should access column through getColumn function", () => {
      const { mockTable } = createMockTable();

      // Spy on getColumn to verify it's called internally
      const getColumnSpy = vi.spyOn({ getColumn }, "getColumn");

      try {
        getColumnMeta(mockTable, "name");
        // Verify getColumn was called (indirectly through the implementation)
        expect(mockTable.getColumn).toHaveBeenCalledWith("name");
      } finally {
        getColumnSpy.mockRestore();
      }
    });
  });
});
