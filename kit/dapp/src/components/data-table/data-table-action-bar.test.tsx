/**
 * @vitest-environment happy-dom
 */
import { createMockTable, renderWithProviders } from "@test/helpers/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DataTableActionBar,
  SimpleDataTableActionBar,
} from "./data-table-action-bar";
import type { BulkAction, BulkActionGroup } from "./types/bulk-actions";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "bulkActions.selectedCount" && params?.count !== undefined) {
        let countStr: string;
        if (typeof params.count === "object" && params.count !== null) {
          countStr = JSON.stringify(params.count);
        } else if (typeof params.count === "string") {
          countStr = params.count;
        } else if (typeof params.count === "number") {
          countStr = params.count.toString();
        } else {
          countStr = "";
        }
        return `${countStr} selected`;
      }
      if (key === "bulkActions.error" && params?.error !== undefined) {
        let errorStr: string;
        if (typeof params.error === "object" && params.error !== null) {
          errorStr = JSON.stringify(params.error);
        } else if (typeof params.error === "string") {
          errorStr = params.error;
        } else if (typeof params.error === "number") {
          errorStr = params.error.toString();
        } else {
          errorStr = "";
        }
        return `Error: ${errorStr}`;
      }
      if (key === "bulkActions.error" && params?.action !== undefined) {
        let actionStr: string;
        if (typeof params.action === "object" && params.action !== null) {
          actionStr = JSON.stringify(params.action);
        } else if (typeof params.action === "string") {
          actionStr = params.action;
        } else if (typeof params.action === "number") {
          actionStr = params.action.toString();
        } else {
          actionStr = "";
        }
        return `Error executing ${actionStr}`;
      }
      return key;
    },
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
}));

// Mock motion/react for testing
vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({
      children,
      ...props
    }: Record<string, unknown> & { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger
vi.mock("@settlemint/sdk-utils/logging", () => ({
  createLogger: () => ({
    error: vi.fn(),
  }),
}));

describe("DataTableActionBar", () => {
  const user = userEvent.setup();
  const mockTable = createMockTable();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should not render when no rows selected", () => {
      const { container } = renderWithProviders(
        <DataTableActionBar
          selectedRowIds={[]}
          selectedRows={[]}
          table={mockTable}
          onSelectionClear={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render when rows are selected", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1", "2"]}
          selectedRows={[{ id: "1" }, { id: "2" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
        />
      );

      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });

    it("should show selection count by default", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1", "2", "3"]}
          selectedRows={[{ id: "1" }, { id: "2" }, { id: "3" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
        />
      );

      expect(screen.getByText("3 selected")).toBeInTheDocument();
    });

    it("should hide selection count when showSelectionCount is false", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
          showSelectionCount={false}
        />
      );

      expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
    });

    it("should show clear button", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "bulkActions.clearSelection",
      });
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe("Actions Dropdown", () => {
    const mockActions: BulkAction<{ id: string }>[] = [
      {
        id: "delete",
        label: "Delete",
        execute: vi.fn(),
      },
      {
        id: "archive",
        label: "Archive",
        execute: vi.fn(),
        // Don't set icon to avoid type mismatch - icon is optional anyway
      },
    ];

    it("should show actions dropdown when actions provided", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={mockActions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      expect(actionsButton).toBeInTheDocument();
    });

    it("should show action items when dropdown clicked", async () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={mockActions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      await waitFor(() => {
        expect(screen.getByText("Delete")).toBeInTheDocument();
        expect(screen.getByText("Archive")).toBeInTheDocument();
      });
    });

    it("should execute action when clicked", async () => {
      const mockExecute = vi.fn();
      const actions = [
        {
          id: "test",
          label: "Test Action",
          execute: mockExecute,
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1", "2"]}
          selectedRows={[{ id: "1" }, { id: "2" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      const actionItem = await screen.findByText("Test Action");
      await user.click(actionItem);

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledWith({
          selectedRows: [{ id: "1" }, { id: "2" }],
          selectedRowIds: ["1", "2"],
          table: mockTable,
          onComplete: expect.any(Function),
          onError: expect.any(Function),
        });
      });
    });

    it("should show success toast when action succeeds", async () => {
      const actions = [
        {
          id: "test",
          label: "Test Action",
          execute: vi.fn().mockResolvedValue(undefined),
          successMessage: "Action completed!",
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      const actionItem = await screen.findByText("Test Action");
      await user.click(actionItem);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Action completed!");
      });
    });

    it("should show error toast when action fails", async () => {
      const actions = [
        {
          id: "test",
          label: "Test Action",
          execute: vi.fn().mockRejectedValue(new Error("Test error")),
          errorMessage: "Action failed!",
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      const actionItem = await screen.findByText("Test Action");
      await user.click(actionItem);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Action failed!");
      });
    });

    it("should show loading state during action execution", async () => {
      const actions = [
        {
          id: "test",
          label: "Test Action",
          execute: vi
            .fn()
            .mockImplementation(
              () => new Promise((resolve) => setTimeout(resolve, 100))
            ),
          loadingMessage: "Processing...",
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      const actionItem = await screen.findByText("Test Action");
      await user.click(actionItem);

      // Should show processing state
      await waitFor(() => {
        expect(screen.getByText("bulkActions.processing")).toBeInTheDocument();
      });
    });
  });

  describe("Action Groups", () => {
    const mockActionGroups: BulkActionGroup<{ id: string }>[] = [
      {
        id: "group1",
        label: "Edit Actions",
        actions: [
          { id: "edit", label: "Edit", execute: vi.fn() },
          { id: "duplicate", label: "Duplicate", execute: vi.fn() },
        ],
        separator: true,
      },
    ];

    it("should render action groups", async () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actionGroups={mockActionGroups}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      await waitFor(() => {
        expect(screen.getByText("Edit Actions")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Duplicate")).toBeInTheDocument();
      });
    });

    it("should filter hidden actions in groups", async () => {
      const actionGroups: BulkActionGroup<{ id: string }>[] = [
        {
          id: "group1",
          label: "Actions",
          actions: [
            { id: "visible", label: "Visible", execute: vi.fn() },
            { id: "hidden", label: "Hidden", execute: vi.fn(), hidden: true },
          ],
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actionGroups={actionGroups}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      await waitFor(() => {
        expect(screen.getByText("Visible")).toBeInTheDocument();
        expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
      });
    });
  });

  describe("Select All", () => {
    it("should show select all button by default", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
        />
      );

      expect(screen.getByText("bulkActions.selectAll")).toBeInTheDocument();
    });

    it("should hide select all when enableSelectAll is false", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
          enableSelectAll={false}
        />
      );

      expect(
        screen.queryByText("bulkActions.selectAll")
      ).not.toBeInTheDocument();
    });

    it("should call toggleAllRowsSelected when select all clicked", async () => {
      const toggleAllRowsSelected = vi.fn();
      const table = {
        ...mockTable,
        toggleAllRowsSelected,
      };

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={table}
          onSelectionClear={vi.fn()}
        />
      );

      const selectAllButton = screen.getByText("bulkActions.selectAll");
      await user.click(selectAllButton);

      expect(toggleAllRowsSelected).toHaveBeenCalledWith(true);
    });
  });

  describe("Clear Selection", () => {
    it("should call onSelectionClear when clear button clicked", async () => {
      const onSelectionClear = vi.fn();

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={onSelectionClear}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "bulkActions.clearSelection",
      });
      await user.click(clearButton);

      expect(onSelectionClear).toHaveBeenCalled();
    });

    it("should clear selection after successful action", async () => {
      const onSelectionClear = vi.fn();
      const actions = [
        {
          id: "test",
          label: "Test",
          execute: vi.fn().mockResolvedValue(undefined),
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={onSelectionClear}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      const actionItem = await screen.findByText("Test");
      await user.click(actionItem);

      await waitFor(() => {
        expect(onSelectionClear).toHaveBeenCalled();
      });
    });
  });

  describe("Disabled States", () => {
    it("should disable action based on disabled function", async () => {
      const actions = [
        {
          id: "test",
          label: "Test",
          execute: vi.fn(),
          disabled: (context: { selectedRowIds: string[] }) =>
            context.selectedRowIds.length < 2,
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      const actionItem = await screen.findByText("Test");
      expect(actionItem.closest('[role="menuitem"]')).toHaveAttribute(
        "aria-disabled",
        "true"
      );
    });

    it("should disable actions dropdown when action is loading", async () => {
      const actions: BulkAction<{ id: string }>[] = [
        {
          id: "test",
          label: "Test",
          execute: () => new Promise<void>(() => {}), // Never resolves
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      const actionItem = await screen.findByText("Test");
      await user.click(actionItem);

      // Actions button should be disabled
      await waitFor(() => {
        const button = screen.getByRole("button", {
          name: /bulkActions.processing/i,
        });
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Position and Styling", () => {
    it("should apply bottom position by default", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
        />
      );

      const actionBar = screen.getByText("1 selected").closest(".fixed");
      expect(actionBar).toHaveClass("bottom-6");
    });

    it("should apply top position when specified", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
          position="top"
        />
      );

      const actionBar = screen.getByText("1 selected").closest(".fixed");
      expect(actionBar).toHaveClass("top-6");
    });

    it("should apply custom className", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
          className="custom-class"
        />
      );

      const actionBar = screen.getByText("1 selected").closest(".fixed");
      expect(actionBar).toHaveClass("custom-class");
    });

    it("should apply maxHeight style", () => {
      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          onSelectionClear={vi.fn()}
          maxHeight="100px"
        />
      );

      const actionBar = screen.getByText("1 selected").closest(".fixed");
      expect(actionBar).toHaveStyle({ maxHeight: "100px" });
    });
  });

  describe("Hidden Actions", () => {
    it("should filter out hidden actions", async () => {
      const actions = [
        { id: "visible", label: "Visible", execute: vi.fn() },
        { id: "hidden", label: "Hidden", execute: vi.fn(), hidden: true },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1"]}
          selectedRows={[{ id: "1" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      const actionsButton = screen.getByText("bulkActions.actions");
      await user.click(actionsButton);

      await waitFor(() => {
        expect(screen.getByText("Visible")).toBeInTheDocument();
        expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
      });
    });

    it("should evaluate hidden function", () => {
      const actions = [
        {
          id: "conditional",
          label: "Conditional",
          execute: vi.fn(),
          hidden: (context: { selectedRowIds: string[] }) =>
            context.selectedRowIds.length > 1,
        },
      ];

      renderWithProviders(
        <DataTableActionBar
          selectedRowIds={["1", "2"]}
          selectedRows={[{ id: "1" }, { id: "2" }]}
          table={mockTable}
          actions={actions}
          onSelectionClear={vi.fn()}
        />
      );

      // Should not show actions button if all actions are hidden
      expect(screen.queryByText("bulkActions.actions")).not.toBeInTheDocument();
    });
  });
});

describe("SimpleDataTableActionBar", () => {
  it("should render simplified version", () => {
    renderWithProviders(
      <SimpleDataTableActionBar
        selectedRowIds={["1", "2"]}
        onSelectionClear={vi.fn()}
      />
    );

    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("should not show select all in simple version", () => {
    renderWithProviders(
      <SimpleDataTableActionBar
        selectedRowIds={["1"]}
        onSelectionClear={vi.fn()}
      />
    );

    expect(screen.queryByText("bulkActions.selectAll")).not.toBeInTheDocument();
  });

  it("should support actions in simple version", async () => {
    const actions = [
      {
        id: "test",
        label: "Test",
        execute: vi.fn(),
      },
    ];

    renderWithProviders(
      <SimpleDataTableActionBar
        selectedRowIds={["1"]}
        onSelectionClear={vi.fn()}
        actions={actions}
      />
    );

    const actionsButton = screen.getByText("bulkActions.actions");
    await userEvent.click(actionsButton);

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });
});
