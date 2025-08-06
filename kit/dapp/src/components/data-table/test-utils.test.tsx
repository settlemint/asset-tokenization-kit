/**
 * @vitest-environment happy-dom
 */
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Table } from "@tanstack/react-table";
import {
  mockIcons,
  mockRouter,
  createMockColumn,
  waitForLoadingToFinish,
  mockFilterOptions,
  mockBulkActions,
} from "./test-utils";

describe("Test Utils", () => {
  describe("Mock Icons", () => {
    it("should render Filter icon", () => {
      const FilterIcon = mockIcons.Filter;
      if (!FilterIcon) {
        throw new Error("Filter icon not found");
      }
      const { getByTestId } = render(<FilterIcon className="test-class" />);

      const icon = getByTestId("icon-filter");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("test-class");
      expect(icon).toHaveTextContent("Filter");
    });

    it("should render Download icon", () => {
      const DownloadIcon = mockIcons.Download;
      if (!DownloadIcon) {
        throw new Error("Download icon not found");
      }
      const { getByTestId } = render(
        <DownloadIcon className="download-class" />
      );

      const icon = getByTestId("icon-download");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("download-class");
      expect(icon).toHaveTextContent("Download");
    });

    it("should render Settings icon", () => {
      const SettingsIcon = mockIcons.Settings;
      if (!SettingsIcon) {
        throw new Error("Settings icon not found");
      }
      const { getByTestId } = render(
        <SettingsIcon className="settings-class" />
      );

      const icon = getByTestId("icon-settings");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("settings-class");
      expect(icon).toHaveTextContent("Settings");
    });

    it("should render MoreHorizontal icon", () => {
      const MoreIcon = mockIcons.MoreHorizontal;
      if (!MoreIcon) {
        throw new Error("MoreHorizontal icon not found");
      }
      const { getByTestId } = render(<MoreIcon className="more-class" />);

      const icon = getByTestId("icon-more");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("more-class");
      expect(icon).toHaveTextContent("More");
    });
  });

  describe("Mock Router", () => {
    it("should have navigate function", () => {
      expect(mockRouter.navigate).toBeDefined();
      expect(vi.isMockFunction(mockRouter.navigate)).toBe(true);
    });

    it("should have default properties", () => {
      expect(mockRouter.params).toEqual({});
      expect(mockRouter.searchParams).toBeInstanceOf(URLSearchParams);
      expect(mockRouter.pathname).toBe("/test");
    });
  });

  describe("createMockColumn", () => {
    it("should create column with default values", () => {
      const column = createMockColumn({});

      expect(column.id).toBe("test");
      expect(column.columnDef.id).toBe("test");
      expect(column.columnDef.header).toBe("Test");
      expect(
        "accessorKey" in column.columnDef
          ? column.columnDef.accessorKey
          : undefined
      ).toBe("test");
      expect(column.columnDef.enableSorting).toBe(true);
      expect(column.columnDef.enableHiding).toBe(true);
      expect(column.columnDef.meta?.displayName).toBe("Test");
    });

    it("should apply overrides to column", () => {
      const overrides = {
        id: "custom",
        columnDef: {
          id: "custom",
          header: "Custom Header",
          accessorKey: "customKey",
          enableSorting: false,
          enableHiding: false,
          meta: {
            displayName: "Custom Display",
          },
        },
      };

      const column = createMockColumn(overrides);

      expect(column.id).toBe("custom");
      expect(column.columnDef.id).toBe("custom");
      expect(column.columnDef.header).toBe("Custom Header");
      expect(
        "accessorKey" in column.columnDef
          ? column.columnDef.accessorKey
          : undefined
      ).toBe("customKey");
      expect(column.columnDef.enableSorting).toBe(false);
      expect(column.columnDef.enableHiding).toBe(false);
      expect(column.columnDef.meta?.displayName).toBe("Custom Display");
    });

    it("should have sorting methods", () => {
      const column = createMockColumn({});

      expect(column.getCanSort).toBeDefined();
      expect(column.getIsSorted).toBeDefined();
      expect(column.getCanSort()).toBe(true);
      expect(column.getIsSorted()).toBe(false);
    });

    it("should have column structure methods", () => {
      const column = createMockColumn({});

      expect(column.getFlatColumns).toBeDefined();
      expect(column.getLeafColumns).toBeDefined();
      expect(column.getFlatColumns()).toEqual([]);
      expect(column.getLeafColumns()).toEqual([]);
    });
  });

  describe("waitForLoadingToFinish", () => {
    it("should resolve after timeout", async () => {
      const startTime = Date.now();
      await waitForLoadingToFinish();
      const endTime = Date.now();

      // Should resolve almost immediately (within a reasonable threshold)
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe("mockFilterOptions", () => {
    it("should contain expected filter options", () => {
      expect(mockFilterOptions).toHaveLength(3);

      const [active, inactive, pending] = mockFilterOptions;

      expect(active?.label).toBe("Active");
      expect(active?.value).toBe("active");
      expect(active?.icon).toBe(mockIcons.ChevronUp);

      expect(inactive?.label).toBe("Inactive");
      expect(inactive?.value).toBe("inactive");
      expect(inactive?.icon).toBe(mockIcons.ChevronDown);

      expect(pending?.label).toBe("Pending");
      expect(pending?.value).toBe("pending");
      expect(pending?.icon).toBe(mockIcons.Settings);
    });
  });

  describe("mockBulkActions", () => {
    it("should have delete action with confirmation", () => {
      const deleteAction = mockBulkActions.find(
        (action) => action.id === "delete"
      );

      expect(deleteAction).toBeDefined();
      expect(deleteAction?.label).toBe("Delete");
      expect(deleteAction?.variant).toBe("destructive");
      expect(deleteAction?.requiresConfirmation).toBe(true);
      expect(deleteAction?.confirmationTitle).toBe("Delete items");
      expect(deleteAction?.confirmationDescription).toBe("Are you sure?");
      expect(vi.isMockFunction(deleteAction?.execute)).toBe(true);
    });

    it("should have archive action", () => {
      const archiveAction = mockBulkActions.find(
        (action) => action.id === "archive"
      );

      expect(archiveAction).toBeDefined();
      expect(archiveAction?.label).toBe("Archive");
      expect(archiveAction?.requiresConfirmation).toBeUndefined();
      expect(vi.isMockFunction(archiveAction?.execute)).toBe(true);
    });

    it("should execute delete action asynchronously", async () => {
      const deleteAction = mockBulkActions.find(
        (action) => action.id === "delete"
      );

      if (deleteAction) {
        const startTime = Date.now();
        await deleteAction.execute({
          selectedRows: [],
          selectedRowIds: [],
          table: {} as Table<unknown>,
          onComplete: vi.fn(),
          onError: vi.fn(),
        });
        const endTime = Date.now();

        // Should take at least 100ms due to setTimeout
        expect(endTime - startTime).toBeGreaterThanOrEqual(90);
        expect(deleteAction.execute).toHaveBeenCalledWith({
          selectedRows: [],
          selectedRowIds: [],
          table: expect.any(Object),
          onComplete: expect.any(Function),
          onError: expect.any(Function),
        });
      }
    });

    it("should execute archive action asynchronously", async () => {
      const archiveAction = mockBulkActions.find(
        (action) => action.id === "archive"
      );

      if (archiveAction) {
        const startTime = Date.now();
        await archiveAction.execute({
          selectedRows: [],
          selectedRowIds: [],
          table: {} as Table<unknown>,
          onComplete: vi.fn(),
          onError: vi.fn(),
        });
        const endTime = Date.now();

        // Should take at least 100ms due to setTimeout
        expect(endTime - startTime).toBeGreaterThanOrEqual(90);
        expect(archiveAction.execute).toHaveBeenCalledWith({
          selectedRows: [],
          selectedRowIds: [],
          table: expect.any(Object),
          onComplete: expect.any(Function),
          onError: expect.any(Function),
        });
      }
    });
  });
});
