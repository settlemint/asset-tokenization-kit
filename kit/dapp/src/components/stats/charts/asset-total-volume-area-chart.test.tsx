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
import { AssetTotalVolumeAreaChart } from "./asset-total-volume-area-chart";

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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [
          { timestamp: 1_640_995_200, totalVolume: 5_000_000 },
          { timestamp: 1_641_081_600, totalVolume: 6_200_000 },
          { timestamp: 1_641_168_000, totalVolume: 5_800_000 },
          { timestamp: 1_641_254_400, totalVolume: 7_100_000 },
          { timestamp: 1_641_340_800, totalVolume: 6_900_000 },
        ],
        chartConfig: {
          totalVolume: {
            label: "Total Volume",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["totalVolume"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [],
        chartConfig: {
          totalVolume: {
            label: "Total Volume",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["totalVolume"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [{ timestamp: 1_640_995_200, totalVolume: 2_500_000 }],
        chartConfig: {
          totalVolume: {
            label: "Total Volume",
            color: "var(--chart-1)",
          },
        },
        dataKeys: ["totalVolume"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch volume data")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(
        <AssetTotalVolumeAreaChart assetAddress={mockAssetAddress} />
      );
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
