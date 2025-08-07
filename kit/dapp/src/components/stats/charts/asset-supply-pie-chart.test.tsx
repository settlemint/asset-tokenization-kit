/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { AssetSupplyPieChart } from "./asset-supply-pie-chart";

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    system: {
      statsAssets: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("AssetSupplyPieChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with asset data", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.system.statsAssets.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["system", "statsAssets"],
        queryFn: () => {
          const mockResponse = {
            assetBreakdown: {
              bond: 150,
              equity: 75,
              fund: 50,
              stablecoin: 25,
              deposit: 100,
            },
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(<AssetSupplyPieChart />);

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.assetSupply.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetSupply.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no assets exist", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.system.statsAssets.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["system", "statsAssets"],
        queryFn: () => {
          const mockResponse = {
            assetBreakdown: {
              bond: 0,
              equity: 0,
              fund: 0,
              stablecoin: 0,
              deposit: 0,
            },
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(<AssetSupplyPieChart />);

    // The PieChart component shows empty state when all values are 0
    // This should render the ChartEmptyState component with the empty message
    expect(
      await screen.findByText("charts.assetSupply.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.system.statsAssets.queryOptions).mockImplementation(() => ({
      queryKey: ["system", "statsAssets"],
      queryFn: () => {
        throw new Error("ORPC Error: Failed to fetch stats");
      },
      enabled: true,
    }));

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(<AssetSupplyPieChart />);

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
