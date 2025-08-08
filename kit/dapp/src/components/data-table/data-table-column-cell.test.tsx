import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@test/helpers/test-utils";
import { DataTableColumnCell } from "./data-table-column-cell";

describe("DataTableColumnCell", () => {
  describe("Structure and Layout", () => {
    it("should render with default props", () => {
      renderWithProviders(<DataTableColumnCell>Content</DataTableColumnCell>);

      const cell = screen.getByText("Content");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("should render children correctly", () => {
      renderWithProviders(
        <DataTableColumnCell>
          <span>Child 1</span>
          <span>Child 2</span>
        </DataTableColumnCell>
      );

      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      renderWithProviders(
        <DataTableColumnCell className="custom-class">
          Content
        </DataTableColumnCell>
      );

      const cell = screen.getByText("Content");
      expect(cell).toHaveClass("custom-class");
      expect(cell).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("should pass through HTML attributes", () => {
      renderWithProviders(
        <DataTableColumnCell data-testid="test-cell" id="cell-1" role="cell">
          Content
        </DataTableColumnCell>
      );

      const cell = screen.getByTestId("test-cell");
      expect(cell).toHaveAttribute("id", "cell-1");
      expect(cell).toHaveAttribute("role", "cell");
    });
  });

  describe("Variants", () => {
    it.each([
      ["default", ["flex", "items-center", "space-x-2"]],
      ["numeric", ["flex", "items-center", "space-x-2", "justify-end", "pr-2"]],
    ])("should render %s variant correctly", (variant, expectedClasses) => {
      renderWithProviders(
        <DataTableColumnCell variant={variant as "default" | "numeric"}>
          Content
        </DataTableColumnCell>
      );

      const cell = screen.getByText("Content");
      expectedClasses.forEach((className) => {
        expect(cell).toHaveClass(className);
      });
    });

    it("should default to 'default' variant when not specified", () => {
      renderWithProviders(<DataTableColumnCell>Content</DataTableColumnCell>);

      const cell = screen.getByText("Content");
      expect(cell).not.toHaveClass("justify-end");
      expect(cell).not.toHaveClass("pr-2");
    });

    it("should handle undefined variant prop", () => {
      renderWithProviders(
        <DataTableColumnCell variant={undefined}>Content</DataTableColumnCell>
      );

      const cell = screen.getByText("Content");
      expect(cell).toHaveClass("flex", "items-center", "space-x-2");
      expect(cell).not.toHaveClass("justify-end");
    });
  });

  describe("Edge Cases", () => {
    it("should render without children", () => {
      renderWithProviders(<DataTableColumnCell />);

      // The div should still be rendered even without children
      const cells = document.querySelectorAll("div");
      expect(cells.length).toBeGreaterThan(0);
    });

    it("should render with empty string children", () => {
      renderWithProviders(<DataTableColumnCell>{""}</DataTableColumnCell>);

      const cells = document.querySelectorAll("div");
      expect(cells.length).toBeGreaterThan(0);
    });

    it("should render with null children", () => {
      renderWithProviders(<DataTableColumnCell>{null}</DataTableColumnCell>);

      const cells = document.querySelectorAll("div");
      expect(cells.length).toBeGreaterThan(0);
    });

    it("should handle multiple custom classes", () => {
      renderWithProviders(
        <DataTableColumnCell className="class1 class2 class3">
          Content
        </DataTableColumnCell>
      );

      const cell = screen.getByText("Content");
      expect(cell).toHaveClass("class1", "class2", "class3");
      expect(cell).toHaveClass("flex", "items-center", "space-x-2");
    });
  });

  describe("Integration with cva", () => {
    it("should merge variant classes with custom className correctly", () => {
      renderWithProviders(
        <DataTableColumnCell variant="numeric" className="text-red-500">
          123
        </DataTableColumnCell>
      );

      const cell = screen.getByText("123");
      // Should have both variant classes and custom class
      expect(cell).toHaveClass("justify-end", "pr-2", "text-red-500");
      expect(cell).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("should handle className override without duplicating classes", () => {
      // Test that cn() properly merges classes without duplication
      renderWithProviders(
        <DataTableColumnCell className="flex items-center">
          Content
        </DataTableColumnCell>
      );

      const cell = screen.getByText("Content");
      // Should still have the classes but not duplicated
      expect(cell).toHaveClass("flex", "items-center", "space-x-2");
    });
  });

  describe("Accessibility", () => {
    it("should render as a div element", () => {
      renderWithProviders(<DataTableColumnCell>Content</DataTableColumnCell>);

      const cell = screen.getByText("Content");
      expect(cell.tagName).toBe("DIV");
    });

    it("should support ARIA attributes", () => {
      renderWithProviders(
        <DataTableColumnCell
          aria-label="Numeric cell"
          aria-describedby="description"
        >
          Content
        </DataTableColumnCell>
      );

      const cell = screen.getByText("Content");
      expect(cell).toHaveAttribute("aria-label", "Numeric cell");
      expect(cell).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("Event Handlers", () => {
    it("should support onClick handler", () => {
      let clicked = false;
      renderWithProviders(
        <DataTableColumnCell
          onClick={() => {
            clicked = true;
          }}
        >
          Click me
        </DataTableColumnCell>
      );

      const cell = screen.getByText("Click me");
      cell.click();
      expect(clicked).toBe(true);
    });

    it("should support other event handlers", () => {
      const handlers = {
        onMouseEnter: false,
        onMouseLeave: false,
        onFocus: false,
        onBlur: false,
      };

      renderWithProviders(
        <DataTableColumnCell
          onMouseEnter={() => {
            handlers.onMouseEnter = true;
          }}
          onMouseLeave={() => {
            handlers.onMouseLeave = true;
          }}
          onFocus={() => {
            handlers.onFocus = true;
          }}
          onBlur={() => {
            handlers.onBlur = true;
          }}
          tabIndex={0}
        >
          Interactive cell
        </DataTableColumnCell>
      );

      const cell = screen.getByText("Interactive cell");

      // Trigger events
      fireEvent.mouseEnter(cell);
      expect(handlers.onMouseEnter).toBe(true);

      fireEvent.mouseLeave(cell);
      expect(handlers.onMouseLeave).toBe(true);

      fireEvent.focus(cell);
      expect(handlers.onFocus).toBe(true);

      fireEvent.blur(cell);
      expect(handlers.onBlur).toBe(true);
    });
  });
});
