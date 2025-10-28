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
import { AssetSupplyChangesAreaChart } from "./asset-supply-changes-area-chart";

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
      statsSupplyChanges: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

// Mock the lazy-loaded AreaChartComponent to avoid Suspense issues in tests
vi.mock("@/components/charts/area-chart", () => ({
  AreaChartComponent: ({
    title,
    description,
    data,
  }: {
    title: string;
    description: string;
    data: unknown[];
  }) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
      {data.length === 0 && <div>charts.common.noData</div>}
    </div>
  ),
}));

describe("AssetSupplyChangesAreaChart", () => {
  const mockAssetAddress = "0x1234567890abcdef";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with supply changes data", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [
          {
            timestamp: 1_640_995_200,
            totalMinted: 1_000_000,
            totalBurned: 50_000,
          },
          {
            timestamp: 1_641_081_600,
            totalMinted: 1_200_000,
            totalBurned: 75_000,
          },
          {
            timestamp: 1_641_168_000,
            totalMinted: 1_150_000,
            totalBurned: 100_000,
          },
          {
            timestamp: 1_641_254_400,
            totalMinted: 1_300_000,
            totalBurned: 80_000,
          },
          {
            timestamp: 1_641_340_800,
            totalMinted: 1_250_000,
            totalBurned: 120_000,
          },
        ],
        chartConfig: {
          totalMinted: {
            label: "Minted",
            color: "var(--chart-1)",
          },
          totalBurned: {
            label: "Burned",
            color: "var(--chart-3)",
          },
        },
        dataKeys: ["totalMinted", "totalBurned"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [],
        chartConfig: {
          totalMinted: {
            label: "Minted",
            color: "var(--chart-1)",
          },
          totalBurned: {
            label: "Burned",
            color: "var(--chart-3)",
          },
        },
        dataKeys: ["totalMinted", "totalBurned"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        chartData: [
          {
            timestamp: 1_640_995_200,
            totalMinted: 500_000,
            totalBurned: 25_000,
          },
        ],
        chartConfig: {
          totalMinted: {
            label: "Minted",
            color: "var(--chart-1)",
          },
          totalBurned: {
            label: "Burned",
            color: "var(--chart-3)",
          },
        },
        dataKeys: ["totalMinted", "totalBurned"],
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch supply changes")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(
        <AssetSupplyChangesAreaChart assetAddress={mockAssetAddress} />
      );
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
