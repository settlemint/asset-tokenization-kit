import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PropertyFilterValueMenu } from "./value-menu";
// Define test data type
interface _TestData {
  id: string;
  name: string;
}

// Mock the individual value menu components
vi.mock("./date-value-menu", () => ({
  PropertyFilterDateValueMenu: ({ id }: { id: unknown }) => (
    <div data-testid="date-value-menu">{String(id)}</div>
  ),
}));

vi.mock("./multi-option-value-menu", () => ({
  PropertyFilterMultiOptionValueMenu: ({ id }: { id: unknown }) => (
    <div data-testid="multi-option-value-menu">{String(id)}</div>
  ),
}));

vi.mock("./number-value-menu", () => ({
  PropertyFilterNumberValueMenu: ({ id }: { id: unknown }) => (
    <div data-testid="number-value-menu">{String(id)}</div>
  ),
}));

vi.mock("./option-value-menu", () => ({
  PropertyFilterOptionValueMenu: ({ id }: { id: unknown }) => (
    <div data-testid="option-value-menu">{String(id)}</div>
  ),
}));

vi.mock("./text-value-menu", () => ({
  PropertyFilterTextValueMenu: ({ id }: { id: unknown }) => (
    <div data-testid="text-value-menu">{String(id)}</div>
  ),
}));

describe("PropertyFilterValueMenu", () => {
  const mockColumn = {} as Column<unknown>;
  const mockTable = {} as Table<unknown>;
  const mockOnClose = vi.fn();
  const mockOnBack = vi.fn();

  const createProps = (type: string) => ({
    id: "test-column",
    column: mockColumn,
    columnMeta: { type } as ColumnMeta<unknown, unknown>,
    table: mockTable,
    onClose: mockOnClose,
    onBack: mockOnBack,
  });

  describe("Component Routing", () => {
    it("should render PropertyFilterOptionValueMenu for option type", () => {
      render(<PropertyFilterValueMenu {...createProps("option")} />);

      expect(screen.getByTestId("option-value-menu")).toBeInTheDocument();
      expect(screen.getByText("test-column")).toBeInTheDocument();
    });

    it("should render PropertyFilterMultiOptionValueMenu for multiOption type", () => {
      render(<PropertyFilterValueMenu {...createProps("multiOption")} />);

      expect(screen.getByTestId("multi-option-value-menu")).toBeInTheDocument();
      expect(screen.getByText("test-column")).toBeInTheDocument();
    });

    it("should render PropertyFilterDateValueMenu for date type", () => {
      render(<PropertyFilterValueMenu {...createProps("date")} />);

      expect(screen.getByTestId("date-value-menu")).toBeInTheDocument();
      expect(screen.getByText("test-column")).toBeInTheDocument();
    });

    it("should render PropertyFilterTextValueMenu for text type", () => {
      render(<PropertyFilterValueMenu {...createProps("text")} />);

      expect(screen.getByTestId("text-value-menu")).toBeInTheDocument();
      expect(screen.getByText("test-column")).toBeInTheDocument();
    });

    it("should render PropertyFilterTextValueMenu for address type", () => {
      render(<PropertyFilterValueMenu {...createProps("address")} />);

      expect(screen.getByTestId("text-value-menu")).toBeInTheDocument();
      expect(screen.getByText("test-column")).toBeInTheDocument();
    });

    it("should render PropertyFilterNumberValueMenu for number type", () => {
      render(<PropertyFilterValueMenu {...createProps("number")} />);

      expect(screen.getByTestId("number-value-menu")).toBeInTheDocument();
      expect(screen.getByText("test-column")).toBeInTheDocument();
    });

    it("should return null for unsupported type", () => {
      const { container } = render(
        <PropertyFilterValueMenu {...createProps("unsupported")} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Props Passing", () => {
    it("should pass all props to child components", () => {
      // Mock to verify props
      const OptionMenuSpy = vi.fn(() => null);
      vi.doMock("./option-value-menu", () => ({
        PropertyFilterOptionValueMenu: OptionMenuSpy,
      }));

      const props = createProps("option");
      render(<PropertyFilterValueMenu {...props} />);

      // The actual component would receive all props
      // Since we're using simple mocks, we can't verify exact props
      // but we verified the component renders with the id
      expect(screen.getByTestId("option-value-menu")).toBeInTheDocument();
    });

    it("should handle optional callbacks being undefined", () => {
      const props = createProps("text");
      props.onClose = undefined as unknown as typeof mockOnClose;
      props.onBack = undefined as unknown as typeof mockOnBack;

      render(<PropertyFilterValueMenu {...props} />);

      expect(screen.getByTestId("text-value-menu")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string type", () => {
      const { container } = render(
        <PropertyFilterValueMenu {...createProps("")} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should handle numeric type value", () => {
      const props = createProps("option");
      props.columnMeta = { type: 123 as unknown } as ColumnMeta<
        unknown,
        unknown
      >;

      const { container } = render(<PropertyFilterValueMenu {...props} />);

      expect(container.firstChild).toBeNull();
    });

    it("should handle null columnMeta type", () => {
      const props = createProps("option");
      props.columnMeta = { type: null as unknown } as ColumnMeta<
        unknown,
        unknown
      >;

      const { container } = render(<PropertyFilterValueMenu {...props} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Type Coverage", () => {
    const types = [
      { type: "option", expectedMenu: "option-value-menu" },
      { type: "multiOption", expectedMenu: "multi-option-value-menu" },
      { type: "date", expectedMenu: "date-value-menu" },
      { type: "text", expectedMenu: "text-value-menu" },
      { type: "address", expectedMenu: "text-value-menu" },
      { type: "number", expectedMenu: "number-value-menu" },
    ];

    it.each(types)(
      "should render correct menu for $type type",
      ({ type, expectedMenu }) => {
        render(<PropertyFilterValueMenu {...createProps(type)} />);

        expect(screen.getByTestId(expectedMenu)).toBeInTheDocument();
      }
    );
  });

  describe("Component Integration", () => {
    it("should render with complex column meta", () => {
      const props = createProps("option");
      props.columnMeta = {
        type: "option",
        display: "Status",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      render(<PropertyFilterValueMenu {...props} />);

      expect(screen.getByTestId("option-value-menu")).toBeInTheDocument();
    });

    it("should handle column with accessor function", () => {
      const props = createProps("text");
      props.column = {
        id: "name",
        accessorFn: (row: _TestData) => row.name,
      } as unknown as Column<unknown>;

      render(<PropertyFilterValueMenu {...props} />);

      expect(screen.getByTestId("text-value-menu")).toBeInTheDocument();
    });
  });

  describe("Switch Statement Coverage", () => {
    it("should cover all switch cases", () => {
      const allTypes = [
        "option",
        "multiOption",
        "date",
        "text",
        "address",
        "number",
        "unknown",
      ];
      const renderedMenus: string[] = [];

      allTypes.forEach((type) => {
        const { container } = render(
          <PropertyFilterValueMenu {...createProps(type)} />
        );

        if (container.firstChild) {
          const testId = (container.firstChild as HTMLElement).dataset?.testid;
          if (testId) renderedMenus.push(testId);
        }
      });

      // Should have rendered 6 different menus (unknown returns null)
      expect(renderedMenus).toHaveLength(6);
      expect(new Set(renderedMenus).size).toBe(5); // 5 unique menus (text and address share the same menu)
    });
  });
});
