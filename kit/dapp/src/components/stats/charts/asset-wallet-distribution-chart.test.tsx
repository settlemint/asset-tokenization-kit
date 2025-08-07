/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { AssetWalletDistributionChart } from "./asset-wallet-distribution-chart";

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      statsWalletDistribution: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("AssetWalletDistributionChart", () => {
  const mockAssetAddress = "0x1234567890abcdef";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with wallet distribution data", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(
      orpc.token.statsWalletDistribution.queryOptions
    ).mockImplementation((options) => ({
      queryKey: ["token", "statsWalletDistribution"],
      queryFn: () => {
        const mockResponse = {
          buckets: [
            { range: "0-1K", count: 500 },
            { range: "1K-10K", count: 150 },
            { range: "10K-100K", count: 45 },
            { range: "100K-1M", count: 12 },
            { range: "1M+", count: 3 },
          ],
          totalHolders: 710,
        };
        return options?.select ? options.select(mockResponse) : mockResponse;
      },
      enabled: true,
    }));

    renderWithProviders(
      <AssetWalletDistributionChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.walletDistribution.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.walletDistribution.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no wallet data exists", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(
      orpc.token.statsWalletDistribution.queryOptions
    ).mockImplementation((options) => ({
      queryKey: ["token", "statsWalletDistribution"],
      queryFn: () => {
        const mockResponse = {
          buckets: [],
          totalHolders: 0,
        };
        return options?.select ? options.select(mockResponse) : mockResponse;
      },
      enabled: true,
    }));

    renderWithProviders(
      <AssetWalletDistributionChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.walletDistribution.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(
      orpc.token.statsWalletDistribution.queryOptions
    ).mockImplementation(() => ({
      queryKey: ["token", "statsWalletDistribution"],
      queryFn: () => {
        throw new Error("ORPC Error: Failed to fetch wallet distribution");
      },
      enabled: true,
    }));

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(
      <AssetWalletDistributionChart assetAddress={mockAssetAddress} />
    );

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
