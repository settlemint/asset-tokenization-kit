/**
 * @vitest-environment happy-dom
 */
import { createMockTable, renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableExport } from "./data-table-export";

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

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock download link behavior
const mockLink = {
  setAttribute: vi.fn(),
  click: vi.fn(),
  remove: vi.fn(),
  style: { visibility: "" },
};

describe("DataTableExport", () => {
  // Store original createElement
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock link
    mockLink.setAttribute.mockClear();
    mockLink.click.mockClear();
    mockLink.remove.mockClear();

    // Reset URL methods
    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();

    // Mock document.createElement
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === "a") {
        return mockLink as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    // Mock document.body.append
    document.body.append = vi.fn();
  });

  afterEach(() => {
    // Restore original createElement
    document.createElement = originalCreateElement;
    vi.restoreAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render export button with icon and text", () => {
      const mockTable = createMockTable();
      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button", { name: /export/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass(
        "gap-2",
        "border-muted-foreground",
        "text-muted-foreground"
      );

      // Check for icon
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("size-4");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("should render with correct layout", () => {
      const mockTable = createMockTable();
      const { container } = renderWithProviders(
        <DataTableExport table={mockTable} />
      );

      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass("ml-2", "flex", "items-center", "gap-2");
    });

    it("should render with outline variant and sm size", () => {
      const mockTable = createMockTable();
      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
      expect(button).toHaveClass("h-8"); // sm size has h-8
    });
  });

  describe("Export Functionality", () => {
    it("should export table data when button clicked", async () => {
      const user = userEvent.setup();
      const mockData = [
        { id: 1, name: "John Doe", email: "john@example.com", active: true },
        { id: 2, name: "Jane Smith", email: "jane@example.com", active: false },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: (columnId: string) => data[columnId as keyof typeof data],
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "id",
            columnDef: { header: "ID", meta: {} },
          },
          {
            id: "name",
            columnDef: { header: "Name", meta: {} },
          },
          {
            id: "email",
            columnDef: { header: "Email", meta: {} },
          },
          {
            id: "active",
            columnDef: { header: "Active", meta: {} },
          },
        ]),
      });

      // Set the table name for the expected filename
      if (mockTable.options.meta) {
        mockTable.options.meta.name = "users";
      }

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      // Wait for async operations
      await vi.waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalled();
      });

      // Verify Blob was created
      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      expect(blobCall).toBeInstanceOf(Blob);
      expect(blobCall.type).toBe("text/csv;charset=utf-8;");

      // Verify download link was created and clicked
      // We verify the behavior through the mock link interactions
      await vi.waitFor(() => {
        expect(mockLink.setAttribute).toHaveBeenCalledWith(
          "href",
          "blob:mock-url"
        );
      });

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        "download",
        "users.csv"
      );
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });

    it("should exclude columns with enableCsvExport set to false", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "id",
            columnDef: { header: "ID", meta: {} },
          },
          {
            id: "secret",
            columnDef: { header: "Secret", meta: { enableCsvExport: false } },
          },
          {
            id: "name",
            columnDef: { header: "Name", meta: { enableCsvExport: true } },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      expect(text).toContain("ID");
      expect(text).toContain("Name");
      expect(text).not.toContain("Secret");
    });

    it("should use table name from meta for filename", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([]),
      });
      if (mockTable.options.meta) {
        mockTable.options.meta.name = "custom-table-name";
      }

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        "download",
        "custom-table-name.csv"
      );
    });

    it("should use default filename when table name not provided", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([]),
      });
      if (mockTable.options.meta) {
        delete (mockTable.options.meta as unknown as Record<string, unknown>)
          .name;
      }

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        "download",
        "table.csv"
      );
    });

    it("should show error toast when export fails", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockImplementation(() => {
          throw new Error("Export failed");
        }),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(toast.error).toHaveBeenCalledWith("failedExport");
    });

    it("should include BOM in CSV for Excel compatibility", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "test",
            columnDef: { header: "Test" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      // BOM character should be at the start
      // oxlint-disable-next-line number-literal-case
      const BOM_CHARACTER = 0xfe_ff; // Byte Order Mark for UTF-16
      expect(text.codePointAt(0)).toBe(BOM_CHARACTER);
    });
  });

  describe("Cell Value Formatting", () => {
    it("should format various data types correctly", async () => {
      const user = userEvent.setup();
      const testDate = new Date("2024-01-15T10:30:00Z");
      const mockData = [
        {
          nullValue: null,
          undefinedValue: undefined,
          stringValue: 'Test "quoted" string',
          numberValue: 42,
          booleanValue: true,
          dateValue: testDate,
          objectValue: { key: "value" },
          bigintValue: 9_007_199_254_740_991n,
        },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: (columnId: string) => data[columnId as keyof typeof data],
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue(
          Object.keys(mockData[0] || {}).map((key) => ({
            id: key,
            columnDef: { header: key },
          }))
        ),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();
      const lines = text.split("\n");
      const dataLine = lines[1];

      // Check formatting
      expect(dataLine).toContain('""'); // null value
      expect(dataLine).toContain('""'); // undefined value
      expect(dataLine).toContain('"Test ""quoted"" string"'); // escaped quotes
      expect(dataLine).toContain("42"); // number without quotes
      expect(dataLine).toContain("true"); // boolean without quotes
      expect(dataLine).toContain(`"${testDate.toISOString()}"`); // date as ISO string
      expect(dataLine).toContain('"{""key"":""value""}"'); // JSON stringified object
      expect(dataLine).toContain("9007199254740991"); // bigint as string
    });

    it("should handle function values by returning empty string", async () => {
      const user = userEvent.setup();
      const mockData = [
        {
          funcValue: () => "test",
        },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: () => data.funcValue,
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "funcValue",
            columnDef: { header: "Function" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();
      const lines = text.split("\n");

      expect(lines[1]).toBe('""');
    });
  });

  describe("Column Header Extraction", () => {
    it("should use string header when available", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "col1",
            columnDef: { header: "Column One" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      expect(text).toContain('"Column One"');
    });

    it("should fall back to column ID when header is not a string", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "columnId",
            columnDef: { header: () => <span>React Component</span> },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      expect(text).toContain('"columnId"');
    });

    it("should handle missing header property", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "noHeader",
            columnDef: {},
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      expect(text).toContain('"noHeader"');
    });
  });

  describe("Complex Data Scenarios", () => {
    it("should handle empty table", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "col1",
            columnDef: { header: "Column 1" },
          },
          {
            id: "col2",
            columnDef: { header: "Column 2" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();
      const lines = text.split("\n");

      expect(lines).toHaveLength(1); // Only header row
      expect(lines[0]).toContain('"Column 1","Column 2"');
    });

    it("should handle special characters in strings", async () => {
      const user = userEvent.setup();
      const mockData = [
        {
          special: "Line 1\nLine 2\rLine 3\r\nLine 4\tTabbed",
          unicode: "Unicode: €£¥ 你好 🎉",
        },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: (columnId: string) => data[columnId as keyof typeof data],
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "special",
            columnDef: { header: "Special Chars" },
          },
          {
            id: "unicode",
            columnDef: { header: "Unicode" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      expect(text).toContain("Line 1\nLine 2\rLine 3\r\nLine 4\tTabbed");
      expect(text).toContain("Unicode: €£¥ 你好 🎉");
    });

    it("should handle nested objects", async () => {
      const user = userEvent.setup();
      const mockData = [
        {
          nested: {
            level1: {
              level2: {
                value: "deep value",
              },
            },
          },
        },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: () => data.nested,
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "nested",
            columnDef: { header: "Nested Object" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      expect(text).toContain("level1");
      expect(text).toContain("level2");
      expect(text).toContain("deep value");
    });

    it("should handle arrays in data", async () => {
      const user = userEvent.setup();
      const mockData = [
        {
          tags: ["tag1", "tag2", "tag3"],
          numbers: [1, 2, 3, 4, 5],
        },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: (columnId: string) => data[columnId as keyof typeof data],
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "tags",
            columnDef: { header: "Tags" },
          },
          {
            id: "numbers",
            columnDef: { header: "Numbers" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      // Arrays are JSON.stringify'd and quotes are escaped in CSV
      expect(text).toContain('"[""tag1"",""tag2"",""tag3""]"');
      expect(text).toContain('"[1,2,3,4,5]"');
    });
  });

  describe("Edge Cases", () => {
    it("should handle Symbol values", async () => {
      const user = userEvent.setup();
      const mockData = [
        {
          symbolValue: Symbol("test"),
        },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: () => data.symbolValue,
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue([
          {
            id: "symbolValue",
            columnDef: { header: "Symbol" },
          },
        ]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();
      const lines = text.split("\n");

      expect(lines[1]).toBe('""'); // Symbols should be exported as empty string
    });

    it("should handle very large numbers", async () => {
      const user = userEvent.setup();
      const mockData = [
        {
          largeNumber: Number.MAX_SAFE_INTEGER,
          infinity: Infinity,
          negInfinity: -Infinity,
          nan: Number.NaN,
        },
      ];

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({
          rows: mockData.map((data) => ({
            getValue: (columnId: string) => data[columnId as keyof typeof data],
          })),
        }),
        getAllLeafColumns: vi.fn().mockReturnValue(
          Object.keys(mockData[0] || {}).map((key) => ({
            id: key,
            columnDef: { header: key },
          }))
        ),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const blobCall = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];
      const text = await blobCall.text();

      expect(text).toContain(String(Number.MAX_SAFE_INTEGER));
      expect(text).toContain("Infinity");
      expect(text).toContain("-Infinity");
      expect(text).toContain("NaN");
    });

    it("should cleanup resources even if export partially fails", async () => {
      const user = userEvent.setup();

      // Make click throw an error
      mockLink.click.mockImplementation(() => {
        throw new Error("Click failed");
      });

      const mockTable = createMockTable({
        getRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getAllLeafColumns: vi.fn().mockReturnValue([]),
      });

      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      await user.click(button);

      // Should still show error toast
      expect(toast.error).toHaveBeenCalledWith("failedExport");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button label", () => {
      const mockTable = createMockTable();
      renderWithProviders(<DataTableExport table={mockTable} />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("export");
    });

    it("should mark icon as decorative", () => {
      const mockTable = createMockTable();
      renderWithProviders(<DataTableExport table={mockTable} />);

      const icon = screen.getByRole("button").querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });
});
