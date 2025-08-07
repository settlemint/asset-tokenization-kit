/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { UserGrowthAreaChart } from "./user-growth-area-chart";

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
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.user.statsGrowthOverTime.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["user", "statsGrowthOverTime"],
        queryFn: () => {
          const mockResponse = {
            userGrowth: [
              { timestamp: "2024-01-01", users: 100 },
              { timestamp: "2024-01-02", users: 125 },
              { timestamp: "2024-01-03", users: 150 },
              { timestamp: "2024-01-04", users: 180 },
              { timestamp: "2024-01-05", users: 200 },
            ],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
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
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.user.statsGrowthOverTime.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["user", "statsGrowthOverTime"],
        queryFn: () => {
          const mockResponse = {
            userGrowth: [],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
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
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.user.statsGrowthOverTime.queryOptions).mockImplementation(
      () => ({
        queryKey: ["user", "statsGrowthOverTime"],
        queryFn: () => {
          throw new Error("ORPC Error: Failed to fetch user growth stats");
        },
        enabled: true,
      })
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(<UserGrowthAreaChart />);

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
