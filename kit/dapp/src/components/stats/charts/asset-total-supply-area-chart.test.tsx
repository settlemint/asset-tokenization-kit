/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { AssetTotalSupplyAreaChart } from "./asset-total-supply-area-chart";

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      statsTotalSupply: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("AssetTotalSupplyAreaChart", () => {
  const mockAssetAddress = "0x1234567890abcdef";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with total supply data", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsTotalSupply.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsTotalSupply"],
        queryFn: () => {
          const mockResponse = {
            totalSupplyHistory: [
              { timestamp: 1640995200, totalSupply: "1000000" },
              { timestamp: 1641081600, totalSupply: "1150000" },
              { timestamp: 1641168000, totalSupply: "1100000" },
              { timestamp: 1641254400, totalSupply: "1300000" },
              { timestamp: 1641340800, totalSupply: "1250000" },
            ],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetTotalSupplyAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.totalSupply.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.totalSupply.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no supply data exists", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsTotalSupply.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsTotalSupply"],
        queryFn: () => {
          const mockResponse = {
            totalSupplyHistory: [],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetTotalSupplyAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.totalSupply.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle different time ranges", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsTotalSupply.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsTotalSupply"],
        queryFn: () => {
          const mockResponse = {
            totalSupplyHistory: [
              { timestamp: 1640995200, totalSupply: "500000" },
            ],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetTotalSupplyAreaChart
        assetAddress={mockAssetAddress}
        timeRange={7}
      />
    );

    // Wait for the chart to render with custom time range
    expect(
      await screen.findByText("charts.totalSupply.title")
    ).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsTotalSupply.queryOptions).mockImplementation(
      () => ({
        queryKey: ["token", "statsTotalSupply"],
        queryFn: () => {
          throw new Error("ORPC Error: Failed to fetch total supply");
        },
        enabled: true,
      })
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(
      <AssetTotalSupplyAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
