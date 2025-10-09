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
import { AssetTotalSupplyAreaChart } from "./asset-total-supply-area-chart";

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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [
          { timestamp: 1_640_995_200, totalSupply: 1_000_000 },
          { timestamp: 1_641_081_600, totalSupply: 1_150_000 },
          { timestamp: 1_641_168_000, totalSupply: 1_100_000 },
          { timestamp: 1_641_254_400, totalSupply: 1_300_000 },
          { timestamp: 1_641_340_800, totalSupply: 1_250_000 },
        ],
        chartConfig: {
          totalSupply: {
            label: "Total Supply",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["totalSupply"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [],
        chartConfig: {
          totalSupply: {
            label: "Total Supply",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["totalSupply"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [{ timestamp: 1_640_995_200, totalSupply: 500_000 }],
        chartConfig: {
          totalSupply: {
            label: "Total Supply",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["totalSupply"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch total supply")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(
        <AssetTotalSupplyAreaChart assetAddress={mockAssetAddress} />
      );
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
