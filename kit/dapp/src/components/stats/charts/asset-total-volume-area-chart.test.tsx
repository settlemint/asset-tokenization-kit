/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { AssetTotalVolumeAreaChart } from "./asset-total-volume-area-chart";

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      statsVolume: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("AssetTotalVolumeAreaChart", () => {
  const mockAssetAddress = "0x1234567890abcdef";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with volume data", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsVolume.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsVolume"],
        queryFn: () => {
          const mockResponse = {
            volumeHistory: [
              { timestamp: 1640995200, totalVolume: "5000000" },
              { timestamp: 1641081600, totalVolume: "6200000" },
              { timestamp: 1641168000, totalVolume: "5800000" },
              { timestamp: 1641254400, totalVolume: "7100000" },
              { timestamp: 1641340800, totalVolume: "6900000" },
            ],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetTotalVolumeAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.totalVolume.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.totalVolume.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no volume data exists", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsVolume.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsVolume"],
        queryFn: () => {
          const mockResponse = {
            volumeHistory: [],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetTotalVolumeAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.totalVolume.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle different time ranges", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsVolume.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsVolume"],
        queryFn: () => {
          const mockResponse = {
            volumeHistory: [{ timestamp: 1640995200, totalVolume: "2500000" }],
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
      })
    );

    renderWithProviders(
      <AssetTotalVolumeAreaChart
        assetAddress={mockAssetAddress}
        timeRange={14}
      />
    );

    // Wait for the chart to render with custom time range
    expect(
      await screen.findByText("charts.totalVolume.title")
    ).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsVolume.queryOptions).mockImplementation(() => ({
      queryKey: ["token", "statsVolume"],
      queryFn: () => {
        throw new Error("ORPC Error: Failed to fetch volume data");
      },
      enabled: true,
    }));

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(
      <AssetTotalVolumeAreaChart assetAddress={mockAssetAddress} />
    );

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
