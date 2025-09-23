/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockSuspenseQueryError,
  createMockSuspenseQueryResult,
} from "@test/mocks/suspense-query";
import { renderWithProviders } from "@test/helpers/test-utils";
import { UserGrowthAreaChart } from "./user-growth-area-chart";

// Mock useSuspenseQuery while keeping other exports
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useSuspenseQuery: vi.fn(),
  };
});

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    user: {
      statsGrowthOverTime: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("UserGrowthAreaChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with user growth data", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        userGrowth: [
          { timestamp: "2024-01-01", users: 100 },
          { timestamp: "2024-01-02", users: 125 },
          { timestamp: "2024-01-03", users: 150 },
          { timestamp: "2024-01-04", users: 180 },
          { timestamp: "2024-01-05", users: 200 },
        ],
        timeRangeDays: 30,
      })
    );

    renderWithProviders(<UserGrowthAreaChart />);

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.userGrowth.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.userGrowth.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no user data exists", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        userGrowth: [],
        timeRangeDays: 30,
      })
    );

    renderWithProviders(<UserGrowthAreaChart />);

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.userGrowth.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch user growth stats")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(<UserGrowthAreaChart />);
    }).toThrow("ORPC Error: Failed to fetch user growth stats");

    consoleSpy.mockRestore();
  });
});
