/**
 * @vitest-environment happy-dom
 */
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createExportAction,
  createDeleteAction,
  createArchiveAction,
  createDuplicateAction,
  createAssignAction,
  createTagAction,
  createCommonActionGroup,
  createManagementActionGroup,
  useBulkActions,
} from "./data-table-bulk-actions";
import type { BulkActionContext } from "./types/bulk-actions";
import type { Table } from "@tanstack/react-table";

// Mock document for download testing
let createElementSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // Mock URL.createObjectURL and URL.revokeObjectURL
  globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  globalThis.URL.revokeObjectURL = vi.fn();

  // Mock document.createElement and related methods
  const mockLink = {
    href: "",
    download: "",
    click: vi.fn(),
    remove: vi.fn(),
  };

  createElementSpy = vi
    .spyOn(document, "createElement")
    .mockReturnValue(mockLink as unknown as HTMLElement);
  vi.spyOn(document.body, "append").mockImplementation(() => undefined);
});

describe("data-table-bulk-actions", () => {
  const mockTable = {} as Table<{ id: string; name: string }>;
  const mockContext: BulkActionContext<{ id: string; name: string }> = {
    selectedRows: [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ],
    selectedRowIds: ["1", "2"],
    onComplete: vi.fn(),
    onError: vi.fn(),
    table: mockTable,
  };

  describe("createExportAction", () => {
    it("should create export action with default CSV format", () => {
      const action = createExportAction();

      expect(action.id).toBe("export");
      expect(action.label).toBe("Export CSV");
      expect(action.variant).toBe("outline");
      expect(action.loadingMessage).toBe("Exporting...");
      expect(action.successMessage).toBe("CSV export completed");
      expect(action.errorMessage).toBe("Export failed");
    });

    it("should export as CSV by default", async () => {
      const action = createExportAction();

      await action.execute(mockContext);

      // Check that download was triggered
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it("should export as JSON when specified", async () => {
      const action = createExportAction({ format: "json" });

      expect(action.label).toBe("Export JSON");

      await action.execute(mockContext);

      // Check that download was triggered
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it("should use custom exporter when provided", async () => {
      const customExporter = vi.fn();
      const action = createExportAction({ customExporter });

      await action.execute(mockContext);

      expect(customExporter).toHaveBeenCalledWith(mockContext.selectedRows);
    });

    it("should handle empty data gracefully", async () => {
      const action = createExportAction();
      const emptyContext = {
        ...mockContext,
        selectedRows: [],
        selectedRowIds: [],
      };

      await action.execute(emptyContext);

      // Should not crash
      expect(true).toBe(true);
    });
  });

  describe("createDeleteAction", () => {
    it("should create delete action with confirmation by default", () => {
      const deleteHandler = vi.fn();
      const action = createDeleteAction(deleteHandler);

      expect(action.id).toBe("delete");
      expect(action.label).toBe("Delete");
      expect(action.variant).toBe("destructive");
      expect(action.requiresConfirmation).toBe(true);
      expect(action.confirmationTitle).toBe("Delete selected items");
      expect(action.confirmationAction).toBe("Delete");
    });

    it("should execute delete handler", async () => {
      const deleteHandler = vi.fn();
      const action = createDeleteAction(deleteHandler);

      await action.execute(mockContext);

      expect(deleteHandler).toHaveBeenCalledWith(
        mockContext.selectedRows,
        mockContext.selectedRowIds
      );
      expect(mockContext.onComplete).toHaveBeenCalled();
    });

    it("should allow disabling confirmation", () => {
      const deleteHandler = vi.fn();
      const action = createDeleteAction(deleteHandler, {
        requiresConfirmation: false,
      });

      expect(action.requiresConfirmation).toBe(false);
    });

    it("should use custom confirmation text", () => {
      const deleteHandler = vi.fn();
      const action = createDeleteAction(deleteHandler, {
        confirmationTitle: "Custom Title",
        confirmationDescription: "Custom Description",
      });

      expect(action.confirmationTitle).toBe("Custom Title");
      expect(action.confirmationDescription).toBe("Custom Description");
    });
  });

  describe("createArchiveAction", () => {
    it("should create archive action", () => {
      const archiveHandler = vi.fn();
      const action = createArchiveAction(archiveHandler);

      expect(action.id).toBe("archive");
      expect(action.label).toBe("Archive");
      expect(action.variant).toBe("outline");
      expect(action.requiresConfirmation).toBe(false);
      expect(action.loadingMessage).toBe("Archiving...");
      expect(action.successMessage).toBe("Items archived successfully");
    });

    it("should create unarchive action when specified", () => {
      const archiveHandler = vi.fn();
      const action = createArchiveAction(archiveHandler, {
        unarchive: true,
      });

      expect(action.id).toBe("unarchive");
      expect(action.label).toBe("Unarchive");
      expect(action.loadingMessage).toBe("Unarchiving...");
      expect(action.successMessage).toBe("Items unarchived successfully");
    });

    it("should execute archive handler", async () => {
      const archiveHandler = vi.fn();
      const action = createArchiveAction(archiveHandler);

      await action.execute(mockContext);

      expect(archiveHandler).toHaveBeenCalledWith(
        mockContext.selectedRows,
        mockContext.selectedRowIds
      );
      expect(mockContext.onComplete).toHaveBeenCalled();
    });

    it("should support confirmation", () => {
      const archiveHandler = vi.fn();
      const action = createArchiveAction(archiveHandler, {
        requiresConfirmation: true,
      });

      expect(action.requiresConfirmation).toBe(true);
    });
  });

  describe("createDuplicateAction", () => {
    it("should create duplicate action", () => {
      const duplicateHandler = vi.fn();
      const action = createDuplicateAction(duplicateHandler);

      expect(action.id).toBe("duplicate");
      expect(action.label).toBe("Duplicate");
      expect(action.variant).toBe("outline");
      expect(action.loadingMessage).toBe("Duplicating...");
      expect(action.successMessage).toBe("Items duplicated successfully");
    });

    it("should execute duplicate handler", async () => {
      const duplicateHandler = vi.fn();
      const action = createDuplicateAction(duplicateHandler);

      await action.execute(mockContext);

      expect(duplicateHandler).toHaveBeenCalledWith(
        mockContext.selectedRows,
        mockContext.selectedRowIds
      );
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });

  describe("createAssignAction", () => {
    it("should create assign action", () => {
      const assignHandler = vi.fn();
      const action = createAssignAction(assignHandler, {
        assigneeId: "user-123",
        assigneeName: "John Doe",
      });

      expect(action.id).toBe("assign");
      expect(action.label).toBe("Assign to John Doe");
      expect(action.variant).toBe("outline");
      expect(action.loadingMessage).toBe("Assigning...");
      expect(action.successMessage).toBe("Items assigned to John Doe");
    });

    it("should execute assign handler with assignee ID", async () => {
      const assignHandler = vi.fn();
      const action = createAssignAction(assignHandler, {
        assigneeId: "user-123",
        assigneeName: "John Doe",
      });

      await action.execute(mockContext);

      expect(assignHandler).toHaveBeenCalledWith(
        mockContext.selectedRows,
        mockContext.selectedRowIds,
        "user-123"
      );
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });

  describe("createTagAction", () => {
    it("should create tag action for adding tags", () => {
      const tagHandler = vi.fn();
      const action = createTagAction(tagHandler, {
        tags: ["important", "review"],
      });

      expect(action.id).toBe("tag");
      expect(action.label).toBe("Add tags: important, review");
      expect(action.variant).toBe("outline");
      expect(action.loadingMessage).toBe("Updating tags...");
      expect(action.successMessage).toBe("Tags updated successfully");
    });

    it("should create tag action for removing tags", () => {
      const tagHandler = vi.fn();
      const action = createTagAction(tagHandler, {
        tags: ["important"],
        action: "remove",
      });

      expect(action.label).toBe("Remove tags: important");
    });

    it("should create tag action for replacing tags", () => {
      const tagHandler = vi.fn();
      const action = createTagAction(tagHandler, {
        tags: ["new-tag"],
        action: "replace",
      });

      expect(action.label).toBe("Set tags: new-tag");
    });

    it("should execute tag handler with tags", async () => {
      const tagHandler = vi.fn();
      const tags = ["important", "review"];
      const action = createTagAction(tagHandler, { tags });

      await action.execute(mockContext);

      expect(tagHandler).toHaveBeenCalledWith(
        mockContext.selectedRows,
        mockContext.selectedRowIds,
        tags
      );
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });

  describe("createCommonActionGroup", () => {
    it("should create empty group when no handlers provided", () => {
      const group = createCommonActionGroup({});

      expect(group.id).toBe("common-actions");
      expect(group.label).toBe("Common Actions");
      expect(group.actions).toHaveLength(0);
      expect(group.separator).toBe(true);
    });

    it("should include export action when handler provided", () => {
      const group = createCommonActionGroup({
        onExport: vi.fn(),
      });

      expect(group.actions).toHaveLength(1);
      expect(group.actions[0]?.id).toBe("export");
    });

    it("should include all actions when all handlers provided", () => {
      const group = createCommonActionGroup({
        onExport: vi.fn(),
        onDelete: vi.fn(),
        onArchive: vi.fn(),
        onDuplicate: vi.fn(),
      });

      expect(group.actions).toHaveLength(4);
      expect(group.actions.map((a) => a.id)).toEqual([
        "export",
        "duplicate",
        "archive",
        "delete",
      ]);
    });

    it("should preserve handler order", () => {
      const group = createCommonActionGroup({
        onDelete: vi.fn(),
        onExport: vi.fn(),
      });

      // Export should come before delete based on implementation
      expect(group.actions[0]?.id).toBe("export");
      expect(group.actions[1]?.id).toBe("delete");
    });
  });

  describe("createManagementActionGroup", () => {
    it("should create empty group when no handlers provided", () => {
      const group = createManagementActionGroup({});

      expect(group.id).toBe("management-actions");
      expect(group.label).toBe("Management");
      expect(group.actions).toHaveLength(0);
      expect(group.separator).toBe(true);
    });

    it("should create assign actions for each assignee", () => {
      const group = createManagementActionGroup(
        {
          onAssign: vi.fn(),
        },
        {
          assignees: [
            { id: "user-1", name: "Alice" },
            { id: "user-2", name: "Bob" },
          ],
        }
      );

      expect(group.actions).toHaveLength(2);
      expect(group.actions[0]?.label).toBe("Assign to Alice");
      expect(group.actions[1]?.label).toBe("Assign to Bob");
    });

    it("should create tag action when tags provided", () => {
      const group = createManagementActionGroup(
        {
          onTag: vi.fn(),
        },
        {
          availableTags: ["urgent", "review"],
        }
      );

      expect(group.actions).toHaveLength(1);
      expect(group.actions[0]?.id).toBe("tag");
    });

    it("should not create actions without options", () => {
      const group = createManagementActionGroup({
        onAssign: vi.fn(),
        onTag: vi.fn(),
      });

      // No assignees or tags provided, so no actions created
      expect(group.actions).toHaveLength(0);
    });

    it("should create both assign and tag actions", () => {
      const group = createManagementActionGroup(
        {
          onAssign: vi.fn(),
          onTag: vi.fn(),
        },
        {
          assignees: [{ id: "user-1", name: "Alice" }],
          availableTags: ["urgent"],
        }
      );

      expect(group.actions).toHaveLength(2);
      expect(group.actions[0]?.label).toBe("Assign to Alice");
      expect(group.actions[1]?.id).toBe("tag");
    });
  });

  describe("useBulkActions", () => {
    it("should return empty actions when no options provided", () => {
      const { actions, actionGroups } = useBulkActions({});

      expect(actions).toHaveLength(0);
      expect(actionGroups).toHaveLength(1);
      expect(actionGroups[0]?.actions).toHaveLength(0);
    });

    it("should include custom actions", () => {
      const customAction = {
        id: "custom",
        label: "Custom Action",
        execute: vi.fn(),
      };

      const { actions } = useBulkActions({
        customActions: [customAction],
      });

      expect(actions).toHaveLength(1);
      expect(actions[0]).toBe(customAction);
    });

    it("should create common action group with handlers", () => {
      const { actionGroups } = useBulkActions({
        onExport: vi.fn(),
        onDelete: vi.fn(),
      });

      expect(actionGroups[0]?.actions).toHaveLength(2);
      expect(actionGroups[0]?.actions.map((a) => a.id)).toContain("export");
      expect(actionGroups[0]?.actions.map((a) => a.id)).toContain("delete");
    });
  });

  describe("CSV conversion", () => {
    it("should handle special characters in CSV export", async () => {
      const action = createExportAction();
      const specialContext = {
        ...mockContext,
        selectedRows: [
          { id: "1", name: 'Item with "quotes"' },
          { id: "2", name: "Item with, comma" },
          { id: "3", name: "Item with\nnewline" },
        ],
      };

      await action.execute(specialContext);

      // Verify download was triggered
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it("should handle non-string values in CSV export", async () => {
      const action = createExportAction();
      const mixedContext = {
        ...mockContext,
        selectedRows: [
          { id: 1, active: true, data: null },
          { id: 2, active: false, data: undefined },
        ],
      };

      await action.execute(mixedContext);

      // Should not crash
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
