/**
 * @vitest-environment happy-dom
 */
import type { Column, ColumnMeta } from "@tanstack/react-table";
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ColumnDataType } from "../types/column-types";
import type { TextFilterOperator } from "../types/filter-types";
import {
  PropertyFilterOperatorController,
  PropertyFilterOperatorDisplay,
  PropertyFilterOperatorMenu,
  PropertyFilterTextOperatorMenu,
} from "./operator-controller";

// Removed unused TestData interface to fix TS6196

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
}));

// Mock the UI command components
vi.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command">{children}</div>
  ),
  CommandEmpty: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-empty">{children}</div>
  ),
  CommandGroup: ({
    children,
    heading,
  }: {
    children: React.ReactNode;
    heading?: string;
  }) => (
    <div data-testid="command-group">
      {heading && <div data-testid="command-group-heading">{heading}</div>}
      {children}
    </div>
  ),
  CommandInput: ({ placeholder }: { placeholder?: string }) => (
    <input data-testid="command-input" placeholder={placeholder} />
  ),
  CommandItem: ({
    children,
    onSelect,
    value,
  }: {
    children: React.ReactNode;
    onSelect?: (value: string) => void;
    value?: string;
  }) => (
    <button
      data-testid="command-item"
      onClick={() => onSelect?.(value || "")}
      data-value={value}
    >
      {children}
    </button>
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-list">{children}</div>
  ),
}));

// Mock logger with a getter function to track calls
let mockDebugCalls: unknown[] = [];
let mockWarnCalls: unknown[] = [];
let mockErrorCalls: unknown[] = [];

vi.mock("@settlemint/sdk-utils/logging", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn((...args) => mockDebugCalls.push(args)),
    warn: vi.fn((...args) => mockWarnCalls.push(args)),
    error: vi.fn((...args) => mockErrorCalls.push(args)),
  })),
}));

// Mock operator details
vi.mock("./operator-mapping", () => ({
  filterTypeOperatorDetails: {
    text: {
      contains: { label: "contains", value: "contains" },
      "does not contain": {
        label: "does not contain",
        value: "does not contain",
      },
      "starts with": { label: "starts with", value: "starts with" },
      "ends with": { label: "ends with", value: "ends with" },
      is: { label: "is", value: "is" },
      "is not": { label: "is not", value: "is not" },
    },
    number: {
      is: { label: "is", value: "is" },
      "is not": { label: "is not", value: "is not" },
      "is greater than": { label: "is greater than", value: "is greater than" },
      "is less than": { label: "is less than", value: "is less than" },
      "is between": { label: "is between", value: "is between" },
    },
    date: {
      is: { label: "is", value: "is" },
      "is not": { label: "is not", value: "is not" },
      "is before": { label: "is before", value: "is before" },
      "is after": { label: "is after", value: "is after" },
      "is between": { label: "is between", value: "is between" },
    },
    option: {
      is: { label: "is", value: "is", target: "single" },
      "is not": { label: "is not", value: "is not", target: "single" },
    },
    multiOption: {
      "include any of": {
        label: "include any of",
        value: "include any of",
        target: "multi",
      },
      exclude: { label: "exclude", value: "exclude", target: "multi" },
      "include all of": {
        label: "include all of",
        value: "include all of",
        target: "multi",
      },
    },
  },
}));

vi.mock("./text-operators", () => ({
  textFilterDetails: {
    contains: { label: "contains", value: "contains" },
    "does not contain": {
      label: "does not contain",
      value: "does not contain",
    },
    "starts with": { label: "starts with", value: "starts with" },
    "ends with": { label: "ends with", value: "ends with" },
    is: { label: "is", value: "is" },
    "is not": { label: "is not", value: "is not" },
  },
}));

vi.mock("./number-operators", () => ({
  numberFilterDetails: {
    is: { label: "is", value: "is" },
    "is not": { label: "is not", value: "is not" },
    "is greater than": { label: "is greater than", value: "is greater than" },
    "is less than": { label: "is less than", value: "is less than" },
    "is between": { label: "is between", value: "is between" },
  },
}));

vi.mock("./date-operators", () => ({
  dateFilterDetails: {
    is: { label: "is", value: "is" },
    "is not": { label: "is not", value: "is not" },
    "is before": { label: "is before", value: "is before" },
    "is after": { label: "is after", value: "is after" },
    "is between": { label: "is between", value: "is between" },
  },
}));

vi.mock("./option-operators", () => ({
  optionFilterDetails: {
    is: { label: "is", value: "is", target: "single" },
    "is not": { label: "is not", value: "is not", target: "single" },
  },
}));

vi.mock("./multi-option-operators", () => ({
  multiOptionFilterDetails: {
    "include any of": {
      label: "include any of",
      value: "include any of",
      target: "multi",
    },
    exclude: { label: "exclude", value: "exclude", target: "multi" },
    "include all of": {
      label: "include all of",
      value: "include all of",
      target: "multi",
    },
  },
}));

// Helper to create mock column
function createMockColumn<TData>({
  id = "test",
  filterValue,
  meta,
}: {
  id?: string;
  filterValue?: unknown;
  meta?: ColumnMeta<TData, unknown>;
}) {
  const setFilterValue = vi.fn();
  const getFilterValue = vi.fn().mockReturnValue(filterValue);

  return {
    id,
    getFilterValue,
    setFilterValue,
    columnDef: {
      meta,
    },
  } as unknown as Column<TData>;
}

describe("PropertyFilterOperatorController", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDebugCalls = [];
    mockWarnCalls = [];
    mockErrorCalls = [];
  });

  describe("Basic Rendering", () => {
    it("should render with trigger button", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterOperatorController
          column={column}
          columnMeta={{ type: "text" }}
          filter={{
            operator: "contains",
            values: ["test"],
            columnMeta: undefined,
          }}
        />
      );

      const triggerButton = screen.getByRole("button");
      expect(triggerButton).toBeInTheDocument();
      expect(triggerButton).toHaveClass("m-0", "h-full", "w-fit");
    });

    it("should display current operator", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterOperatorController
          column={column}
          columnMeta={{ type: "text" }}
          filter={{
            operator: "contains",
            values: ["test"],
            columnMeta: undefined,
          }}
        />
      );

      expect(screen.getByText("contains")).toBeInTheDocument();
    });

    it("should open popover when clicked", async () => {
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterOperatorController
          column={column}
          columnMeta={{ type: "text" }}
          filter={{
            operator: "contains",
            values: ["test"],
            columnMeta: undefined,
          }}
        />
      );

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("command-input")).toBeInTheDocument();
      });
    });
  });

  describe("Popover Content", () => {
    it("should show command input and empty state", async () => {
      const column = createMockColumn({
        id: "name",
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterOperatorController
          column={column}
          columnMeta={{ type: "text" }}
          filter={{
            operator: "contains",
            values: ["test"],
            columnMeta: undefined,
          }}
        />
      );

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("command-input")).toBeInTheDocument();
        expect(screen.getByTestId("command-empty")).toBeInTheDocument();
      });
    });

    it("should render operator menu based on column type", async () => {
      const column = createMockColumn({
        id: "name",
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterOperatorController
          column={column}
          columnMeta={{ type: "text" }}
          filter={{
            operator: "contains",
            values: ["test"],
            columnMeta: undefined,
          }}
        />
      );

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        // Text operators should be visible
        expect(screen.getByText("starts with")).toBeInTheDocument();
        expect(screen.getByText("ends with")).toBeInTheDocument();
        expect(screen.getByText("does not contain")).toBeInTheDocument();
      });
    });

    it("should close popover when operator is selected", async () => {
      const column = createMockColumn({
        id: "name",
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterOperatorController
          column={column}
          columnMeta={{ type: "text" }}
          filter={{
            operator: "contains",
            values: ["test"],
            columnMeta: undefined,
          }}
        />
      );

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(async () => {
        const startsWithOption = screen.getByText("starts with");
        expect(startsWithOption).toBeInTheDocument();
        await user.click(startsWithOption);
      });

      await waitFor(() => {
        expect(screen.queryByTestId("command-input")).not.toBeInTheDocument();
      });
    });
  });
});

describe("PropertyFilterOperatorDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDebugCalls = [];
    mockWarnCalls = [];
    mockErrorCalls = [];
  });

  describe("Known Operators", () => {
    it("should display text operator label", () => {
      renderWithProviders(
        <PropertyFilterOperatorDisplay
          filter={{
            operator: "contains",
            values: ["test"],
            columnMeta: undefined,
          }}
          filterType="text"
        />
      );

      const label = screen.getByText("contains");
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass("text-xs");
    });

    it("should display number operator label", () => {
      renderWithProviders(
        <PropertyFilterOperatorDisplay
          filter={{
            operator: "is greater than",
            values: [10],
            columnMeta: undefined,
          }}
          filterType="number"
        />
      );

      expect(screen.getByText("is greater than")).toBeInTheDocument();
    });

    it("should display date operator label", () => {
      renderWithProviders(
        <PropertyFilterOperatorDisplay
          filter={{
            operator: "is after",
            values: [new Date("2024-01-01")],
            columnMeta: undefined,
          }}
          filterType="date"
        />
      );

      expect(screen.getByText("is after")).toBeInTheDocument();
    });

    it("should display option operator label", () => {
      renderWithProviders(
        <PropertyFilterOperatorDisplay
          filter={{ operator: "is", values: ["active"], columnMeta: undefined }}
          filterType="option"
        />
      );

      expect(screen.getByText("is")).toBeInTheDocument();
    });

    it("should display multiOption operator label", () => {
      renderWithProviders(
        <PropertyFilterOperatorDisplay
          filter={{
            operator: "include any of",
            values: [["tag1", "tag2"]],
            columnMeta: undefined,
          }}
          filterType="multiOption"
        />
      );

      expect(screen.getByText("include any of")).toBeInTheDocument();
    });
  });

  describe("Unknown Operators", () => {
    it("should display raw operator and log warning for unknown operator", () => {
      renderWithProviders(
        <PropertyFilterOperatorDisplay
          filter={{
            operator: "unknown-operator" as unknown as TextFilterOperator,
            values: [],
            columnMeta: undefined,
          }}
          filterType="text"
        />
      );

      expect(screen.getByText("unknown-operator")).toBeInTheDocument();
      expect(mockWarnCalls).toEqual([
        ['Unknown operator "unknown-operator" for filter type "text"'],
      ]);
    });

    it("should handle unknown filter type", () => {
      renderWithProviders(
        <PropertyFilterOperatorDisplay
          filter={{ operator: "is", values: [], columnMeta: undefined }}
          filterType={"unknown" as unknown as ColumnDataType}
        />
      );

      expect(screen.getByText("is")).toBeInTheDocument();
      expect(mockWarnCalls).toEqual([
        ['Unknown operator "is" for filter type "unknown"'],
      ]);
    });
  });
});

describe("PropertyFilterOperatorMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDebugCalls = [];
    mockWarnCalls = [];
    mockErrorCalls = [];
  });

  describe("Column Type Routing", () => {
    it("should render text operator menu for text columns", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(screen.getByText("Operators")).toBeInTheDocument();
      expect(screen.getByText("contains")).toBeInTheDocument();
      expect(screen.getByText("starts with")).toBeInTheDocument();
    });

    it("should render number operator menu for number columns", () => {
      const column = createMockColumn({
        filterValue: { operator: "is", values: [10], columnMeta: undefined },
        meta: { type: "number" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(screen.getByText("is greater than")).toBeInTheDocument();
      expect(screen.getByText("is less than")).toBeInTheDocument();
      expect(screen.getByText("is between")).toBeInTheDocument();
    });

    it("should render date operator menu for date columns", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["2024-01-01"],
          columnMeta: undefined,
        },
        meta: { type: "date" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(screen.getByText("is before")).toBeInTheDocument();
      expect(screen.getByText("is after")).toBeInTheDocument();
      expect(screen.getByText("is between")).toBeInTheDocument();
    });

    it("should render option operator menu for option columns", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["active"],
          columnMeta: undefined,
        },
        meta: { type: "option" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(screen.getByText("is")).toBeInTheDocument();
      expect(screen.getByText("is not")).toBeInTheDocument();
    });

    it("should render multiOption operator menu for multiOption columns", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [["tag1"]],
          columnMeta: undefined,
        },
        meta: { type: "multiOption" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(screen.getByText("include any of")).toBeInTheDocument();
      expect(screen.getByText("exclude")).toBeInTheDocument();
      expect(screen.getByText("include all of")).toBeInTheDocument();
    });

    it("should return null for unknown column type", () => {
      const column = createMockColumn({
        filterValue: { operator: "is", values: [], columnMeta: undefined },
        meta: { type: "unknown" as unknown as ColumnDataType },
      });

      const { container } = renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});

describe("Type-Specific Operator Menus", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDebugCalls = [];
    mockWarnCalls = [];
    mockErrorCalls = [];
  });

  describe("Text Operator Menu", () => {
    it("should display all text operators", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });

      renderWithProviders(
        <PropertyFilterTextOperatorMenu
          column={column}
          closeController={vi.fn()}
        />
      );

      expect(screen.getByText("Operators")).toBeInTheDocument();
      expect(screen.getByText("contains")).toBeInTheDocument();
      expect(screen.getByText("does not contain")).toBeInTheDocument();
      expect(screen.getByText("starts with")).toBeInTheDocument();
      expect(screen.getByText("ends with")).toBeInTheDocument();
      expect(screen.getByText("is")).toBeInTheDocument();
      expect(screen.getByText("is not")).toBeInTheDocument();
    });

    it("should update filter when operator is selected", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        id: "name",
        filterValue: {
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        },
        meta: { type: "text" },
      });
      column.setFilterValue = setFilterValue;

      const closeController = vi.fn();

      renderWithProviders(
        <PropertyFilterTextOperatorMenu
          column={column}
          closeController={closeController}
        />
      );

      const startsWithOption = screen.getByText("starts with");
      await user.click(startsWithOption);

      expect(setFilterValue).toHaveBeenCalled();
      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn({ operator: "contains", values: ["test"] });
      expect(result).toEqual({
        operator: "starts with",
        values: ["test"],
      });
      expect(closeController).toHaveBeenCalled();
    });
  });

  describe("Option Operator Menu with Related Filters", () => {
    it("should only show operators with same target", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["active"],
          columnMeta: undefined,
        },
        meta: { type: "option" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      // Should show both "is" and "is not" as they have same target
      expect(screen.getByText("is")).toBeInTheDocument();
      expect(screen.getByText("is not")).toBeInTheDocument();
    });

    it("should update option filter correctly", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        id: "status",
        filterValue: {
          operator: "is",
          values: ["active"],
          columnMeta: undefined,
        },
        meta: { type: "option" },
      });
      column.setFilterValue = setFilterValue;

      const closeController = vi.fn();

      renderWithProviders(
        <PropertyFilterOperatorMenu
          column={column}
          closeController={closeController}
        />
      );

      const isNotOption = screen.getByText("is not");
      await user.click(isNotOption);

      expect(setFilterValue).toHaveBeenCalled();
      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn({ operator: "is", values: ["active"] });
      expect(result).toEqual({
        operator: "is not",
        values: ["active"],
      });
    });
  });

  describe("MultiOption Operator Menu", () => {
    it("should filter operators by target", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [["tag1", "tag2"]],
          columnMeta: undefined,
        },
        meta: { type: "multiOption" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      // All multi-option operators should be shown as they have same target
      expect(screen.getByText("include any of")).toBeInTheDocument();
      expect(screen.getByText("exclude")).toBeInTheDocument();
      expect(screen.getByText("include all of")).toBeInTheDocument();
    });
  });

  describe("Date Operator Menu", () => {
    it("should show all date operators without filtering", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["2024-01-01"],
          columnMeta: undefined,
        },
        meta: { type: "date" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(screen.getByText("is")).toBeInTheDocument();
      expect(screen.getByText("is not")).toBeInTheDocument();
      expect(screen.getByText("is before")).toBeInTheDocument();
      expect(screen.getByText("is after")).toBeInTheDocument();
      expect(screen.getByText("is between")).toBeInTheDocument();
    });
  });

  describe("Number Operator Menu", () => {
    it("should show all number operators", () => {
      const column = createMockColumn({
        filterValue: { operator: "is", values: [10], columnMeta: undefined },
        meta: { type: "number" },
      });

      renderWithProviders(
        <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
      );

      expect(screen.getByText("is")).toBeInTheDocument();
      expect(screen.getByText("is not")).toBeInTheDocument();
      expect(screen.getByText("is greater than")).toBeInTheDocument();
      expect(screen.getByText("is less than")).toBeInTheDocument();
      expect(screen.getByText("is between")).toBeInTheDocument();
    });

    it("should handle operator change for number columns", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        id: "price",
        filterValue: { operator: "is", values: [100], columnMeta: undefined },
        meta: { type: "number" },
      });
      column.setFilterValue = setFilterValue;

      const closeController = vi.fn();

      renderWithProviders(
        <PropertyFilterOperatorMenu
          column={column}
          closeController={closeController}
        />
      );

      const isBetweenOption = screen.getByText("is between");
      await user.click(isBetweenOption);

      expect(setFilterValue).toHaveBeenCalled();
      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn({ operator: "is", values: [100] });
      expect(result).toEqual({
        operator: "is between",
        values: [100],
      });
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  it("should handle missing column meta gracefully", () => {
    const column = createMockColumn({
      filterValue: { operator: "is", values: [], columnMeta: undefined },
    });

    const { container } = renderWithProviders(
      <PropertyFilterOperatorMenu column={column} closeController={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should handle undefined filter value", () => {
    const column = createMockColumn({
      filterValue: undefined,
      meta: { type: "text" },
    });

    renderWithProviders(
      <PropertyFilterOperatorController
        column={column}
        columnMeta={{ type: "text" }}
        filter={{ operator: "contains", values: [], columnMeta: undefined }}
      />
    );

    expect(screen.getByText("contains")).toBeInTheDocument();
  });

  it("should handle popover state changes", async () => {
    const user = userEvent.setup();
    const column = createMockColumn({
      filterValue: {
        operator: "contains",
        values: ["test"],
        columnMeta: undefined,
      },
      meta: { type: "text" },
    });

    renderWithProviders(
      <PropertyFilterOperatorController
        column={column}
        columnMeta={{ type: "text" }}
        filter={{
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        }}
      />
    );

    const triggerButton = screen.getByRole("button");

    // Open popover
    await user.click(triggerButton);
    await waitFor(() => {
      expect(screen.getByTestId("command-input")).toBeInTheDocument();
    });

    // Close popover by clicking outside
    await user.click(document.body);
    await waitFor(() => {
      expect(screen.queryByTestId("command-input")).not.toBeInTheDocument();
    });
  });
});

describe("Accessibility", () => {
  it("should have proper ARIA attributes on trigger button", () => {
    const column = createMockColumn({
      filterValue: {
        operator: "contains",
        values: ["test"],
        columnMeta: undefined,
      },
      meta: { type: "text" },
    });

    renderWithProviders(
      <PropertyFilterOperatorController
        column={column}
        columnMeta={{ type: "text" }}
        filter={{
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        }}
      />
    );

    const triggerButton = screen.getByRole("button");
    expect(triggerButton).toHaveAttribute("aria-haspopup", "dialog");
    expect(triggerButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should support keyboard navigation in command menu", async () => {
    const user = userEvent.setup();
    const column = createMockColumn({
      filterValue: {
        operator: "contains",
        values: ["test"],
        columnMeta: undefined,
      },
      meta: { type: "text" },
    });

    renderWithProviders(
      <PropertyFilterOperatorController
        column={column}
        columnMeta={{ type: "text" }}
        filter={{
          operator: "contains",
          values: ["test"],
          columnMeta: undefined,
        }}
      />
    );

    const triggerButton = screen.getByRole("button");
    await user.click(triggerButton);

    await waitFor(() => {
      const searchInput = screen.getByTestId("command-input");
      expect(searchInput).toBeInTheDocument();
    });

    // Command component should handle keyboard navigation
    const searchInput = screen.getByTestId("command-input");
    expect(searchInput).toHaveAttribute("placeholder", "search");
  });
});
