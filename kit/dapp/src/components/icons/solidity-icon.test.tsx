import { describe, expect, it, mock } from "bun:test";
import { render } from "@testing-library/react";
import { SolidityIcon } from "./solidity-icon";

// Mock next-themes
void mock.module("next-themes", () => ({
  useTheme: mock(() => ({
    resolvedTheme: "light",
  })),
}));

describe("SolidityIcon", () => {
  it("renders SVG icon correctly", () => {
    const { container } = render(<SolidityIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 1300 1300");
    expect(svg).toHaveAttribute("fill", "none");
  });

  it("applies custom className", () => {
    const { container } = render(
      <SolidityIcon className="custom-class w-10 h-10" />
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class", "w-10", "h-10");
  });

  it("renders correct number of path elements", () => {
    const { container } = render(<SolidityIcon />);

    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(6);
  });

  it("applies correct opacity to paths", () => {
    const { container } = render(<SolidityIcon />);

    const paths = container.querySelectorAll("path");

    // First 3 paths should have opacity 0.45
    for (let i = 0; i < 3; i++) {
      expect(paths[i]).toHaveAttribute("opacity", "0.45");
    }

    // Last 3 paths should have opacity 0.8
    for (let i = 3; i < 6; i++) {
      expect(paths[i]).toHaveAttribute("opacity", "0.8");
    }
  });

  it("uses correct fill color in light theme", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      resolvedTheme: "light",
    });

    const { container } = render(<SolidityIcon />);

    const paths = container.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path).toHaveAttribute("fill", "#050505");
    });
  });

  it("uses correct fill color in dark theme", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      resolvedTheme: "dark",
    });

    const { container } = render(<SolidityIcon />);

    const paths = container.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path).toHaveAttribute("fill", "#FAFAFA");
    });
  });

  it("handles undefined theme gracefully", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      resolvedTheme: undefined,
    });

    const { container } = render(<SolidityIcon />);

    const paths = container.querySelectorAll("path");
    // Should default to light theme color
    paths.forEach((path) => {
      expect(path).toHaveAttribute("fill", "#050505");
    });
  });

  it("maintains proper SVG structure", () => {
    const { container } = render(<SolidityIcon />);

    const svg = container.querySelector("svg");
    const paths = svg?.querySelectorAll("path");

    // Check that all paths have the d attribute
    paths?.forEach((path) => {
      expect(path.hasAttribute("d")).toBe(true);
      expect(path.getAttribute("d")).not.toBe("");
    });
  });

  it("does not render any text content", () => {
    const { container } = render(<SolidityIcon />);

    expect(container.textContent).toBe("");
  });

  it("is accessible with proper xmlns", () => {
    const { container } = render(<SolidityIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
  });
});
