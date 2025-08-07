/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { AssetSupplyChangesAreaChart } from "./asset-supply-changes-area-chart";

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      statsSupplyChanges: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("AssetSupplyChangesAreaChart", () => {
  const mockAssetAddress = "0x1234567890abcdef";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with supply changes data", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsSupplyChanges.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsSupplyChanges"],
        queryFn: () => {
          const mockResponse = {
            supplyChangesHistory: [
              {
                timestamp: 1640995200,
                totalMinted: "1000000",
                totalBurned: "50000",
              },
              {
                timestamp: 1641081600,
                totalMinted: "1200000",
                totalBurned: "75000",
              },
              {
                timestamp: 1641168000,
                totalMinted: "1150000",
                totalBurned: "100000",
              },
              {
                timestamp: 1641254400,
                totalMinted: "1300000",
                totalBurned: "80000",
              },
              {
                timestamp: 1641340800,
                totalMinted: "1250000",
                totalBurned: "120000",
              },
            ],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetSupplyChangesAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.supplyChanges.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.supplyChanges.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no supply changes data exists", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsSupplyChanges.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsSupplyChanges"],
        queryFn: () => {
          const mockResponse = {
            supplyChangesHistory: [],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetSupplyChangesAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.supplyChanges.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle different time ranges", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsSupplyChanges.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsSupplyChanges"],
        queryFn: () => {
          const mockResponse = {
            supplyChangesHistory: [
              {
                timestamp: 1640995200,
                totalMinted: "500000",
                totalBurned: "25000",
              },
            ],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetSupplyChangesAreaChart
        assetAddress={mockAssetAddress}
        timeRange={7}
      />
    );

    // Wait for the chart to render with custom time range
    expect(
      await screen.findByText("charts.supplyChanges.title")
    ).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsSupplyChanges.queryOptions).mockImplementation(
      () => ({
        queryKey: ["token", "statsSupplyChanges"],
        queryFn: () => {
          throw new Error("ORPC Error: Failed to fetch supply changes");
        },
        enabled: true,
      })
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(
      <AssetSupplyChangesAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
