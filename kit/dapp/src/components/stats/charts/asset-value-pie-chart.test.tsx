/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import {
  createMockSuspenseQueryError,
  createMockSuspenseQueryResult,
} from "@test/mocks/suspense-query";
import { screen } from "@testing-library/react";
import { from } from "dnum";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssetValuePieChart } from "./asset-value-pie-chart";

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
    system: {
      stats: {
        assets: {
          queryOptions: vi.fn(),
        },
      },
    },
  },
}));

describe("AssetValuePieChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with value data", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        totalAssets: 400,
        assetBreakdown: {
          bond: 150,
          equity: 75,
          fund: 50,
          stablecoin: 25,
          deposit: 100,
        },
        totalValue: from("1000000"),
        valueBreakdown: {
          bond: from("450000"),
          equity: from("225000"),
          fund: from("150000"),
          stablecoin: from("75000"),
          deposit: from("100000"),
        },
        tokensCreatedCount: 400,
        tokensLaunchedCount: 350,
        pendingLaunchesCount: 50,
      })
    );

    renderWithProviders(<AssetValuePieChart />);

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.assetValue.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetValue.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no value exists", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        totalAssets: 0,
        assetBreakdown: {
          bond: 0,
          equity: 0,
          fund: 0,
          stablecoin: 0,
          deposit: 0,
        },
        totalValue: from("0"),
        valueBreakdown: {
          bond: from("0"),
          equity: from("0"),
          fund: from("0"),
          stablecoin: from("0"),
          deposit: from("0"),
        },
        tokensCreatedCount: 0,
        tokensLaunchedCount: 0,
        pendingLaunchesCount: 0,
      })
    );

    renderWithProviders(<AssetValuePieChart />);

    // The PieChart component shows empty state when all values are 0
    // This should render the ChartEmptyState component with the empty message
    expect(
      await screen.findByText("charts.assetValue.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch stats")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(<AssetValuePieChart />);
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
