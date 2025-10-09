/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import {
  createMockSuspenseQueryError,
  createMockSuspenseQueryResult,
} from "@test/mocks/suspense-query";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssetWalletDistributionChart } from "./asset-wallet-distribution-chart";

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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [
          { range: "0-1K", count: 500 },
          { range: "1K-10K", count: 150 },
          { range: "10K-100K", count: 45 },
          { range: "100K-1M", count: 12 },
          { range: "1M+", count: 3 },
        ],
        chartConfig: {
          count: {
            label: "Holders",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["count"],
      })
    );

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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [],
        chartConfig: {
          count: {
            label: "Holders",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["count"],
      })
    );

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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch wallet distribution")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(
        <AssetWalletDistributionChart assetAddress={mockAssetAddress} />
      );
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
