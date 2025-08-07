import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@test/helpers/test-utils";
import { DataTableSkeleton } from "./data-table-skeleton";

describe("DataTableSkeleton", () => {
  describe("Basic Rendering", () => {
    it("should render skeleton table", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      // Should have table
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      // Should have container with animation
      const animatedContainer = container.querySelector(".animate-in");
      expect(animatedContainer).toBeInTheDocument();
    });

    it("should render with border", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const borderedContainer = container.querySelector(".rounded-md.border");
      expect(borderedContainer).toBeInTheDocument();
    });

    it("should render exactly 5 skeleton rows", () => {
      renderWithProviders(<DataTableSkeleton />);

      // Get tbody rows (excluding header row)
      const rows = screen.getAllByRole("row");
      const bodyRows = rows.slice(1); // Skip header row
      expect(bodyRows).toHaveLength(5);
    });

    it("should render 5 columns per row", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      // Check header columns
      const headerCells = container.querySelectorAll("thead th");
      expect(headerCells).toHaveLength(5);

      // Check first body row columns
      const firstRow = container.querySelector("tbody tr");
      const bodyCells = firstRow?.querySelectorAll("td");
      expect(bodyCells).toHaveLength(5);
    });
  });

  describe("Skeleton Elements", () => {
    it("should render skeleton elements in header", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const headerSkeletons = container.querySelectorAll("thead .h-4");
      expect(headerSkeletons).toHaveLength(4); // 4 visible headers, 1 empty
    });

    it("should render skeleton elements in body cells", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const bodySkeletons = container.querySelectorAll(
        String.raw`tbody .bg-muted\/50`
      );
      expect(bodySkeletons.length).toBeGreaterThan(0);
    });

    it("should have different widths for header skeletons", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const skeletons = container.querySelectorAll(
        String.raw`thead .bg-muted\/50`
      );
      expect(skeletons[0]).toHaveClass("w-20");
      expect(skeletons[1]).toHaveClass("w-16");
      expect(skeletons[2]).toHaveClass("w-16");
      expect(skeletons[3]).toHaveClass("w-20");
    });
  });

  describe("Animation", () => {
    it("should have fade-in animation on container", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const animatedDiv = container.querySelector(".animate-in.fade-in-0");
      expect(animatedDiv).toBeInTheDocument();
      expect(animatedDiv).toHaveClass("duration-500");
    });

    it("should have staggered animations on rows", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        expect(row).toHaveClass(
          "animate-in",
          "fade-in-0",
          "slide-in-from-left-1"
        );
        expect(row).toHaveClass(`delay-${index * 50}`);
      });
    });

    it("should have pulse animation on skeleton elements", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const pulsingElements = container.querySelectorAll(".animate-pulse");
      expect(pulsingElements.length).toBeGreaterThan(0);
    });

    it("should have animation delays on cell skeletons", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const firstRowCells = container.querySelectorAll(
        String.raw`tbody tr:first-child .bg-muted\/50`
      );

      // Check that some cells have animation delay styles
      const cellsWithDelay = [...firstRowCells].filter((cell) =>
        cell.getAttribute("style")?.includes("animation-delay")
      );
      expect(cellsWithDelay.length).toBeGreaterThan(0);
    });
  });

  describe("Table Structure", () => {
    it("should have proper table structure", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      expect(container.querySelector("table")).toBeInTheDocument();
      expect(container.querySelector("thead")).toBeInTheDocument();
      expect(container.querySelector("tbody")).toBeInTheDocument();
    });

    it("should have specific column widths", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const firstHeader = container.querySelector("thead th:first-child");
      expect(firstHeader).toHaveClass("w-[150px]");

      const lastHeader = container.querySelector("thead th:last-child");
      expect(lastHeader).toHaveClass("w-[50px]", "text-right");
    });

    it("should have empty last header cell", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const lastHeader = container.querySelector("thead th:last-child");
      expect(
        lastHeader?.querySelector(String.raw`.bg-muted\/50`)
      ).not.toBeInTheDocument();
    });

    it("should have smaller skeleton in last column", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const lastColumnSkeletons = container.querySelectorAll(
        String.raw`tbody td:last-child .bg-muted\/50`
      );
      lastColumnSkeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("h-6", "w-6");
      });
    });
  });

  describe("Styling", () => {
    it("should apply muted background to skeletons", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const skeletons = container.querySelectorAll(String.raw`.bg-muted\/50`);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should have consistent height for row skeletons", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const rowSkeletons = container.querySelectorAll("tbody .h-4");
      expect(rowSkeletons.length).toBeGreaterThan(0);
    });

    it("should align last column to the right", () => {
      const { container } = renderWithProviders(<DataTableSkeleton />);

      const lastCells = container.querySelectorAll("td:last-child");
      lastCells.forEach((cell) => {
        expect(cell).toHaveClass("text-right");
      });
    });
  });

  describe("Responsive", () => {
    it("should maintain structure on small screens", () => {
      Object.defineProperty(globalThis, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<DataTableSkeleton />);

      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });
  });
});
