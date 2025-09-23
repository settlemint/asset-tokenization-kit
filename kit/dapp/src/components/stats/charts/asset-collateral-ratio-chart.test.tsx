/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockSuspenseQueryError,
  createMockSuspenseQueryResult,
} from "@test/mocks/suspense-query";
import { renderWithProviders } from "@test/helpers/test-utils";
import { AssetCollateralRatioChart } from "./asset-collateral-ratio-chart";

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
      statsCollateralRatio: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("AssetCollateralRatioChart", () => {
  const mockAssetAddress = "0x1234567890abcdef";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with collateral data", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        buckets: [
          { name: "collateralAvailable", value: 750 },
          { name: "collateralUsed", value: 250 },
        ],
        totalCollateral: 1000,
        collateralRatio: 25, // 250/1000 * 100
      })
    );

    renderWithProviders(
      <AssetCollateralRatioChart assetAddress={mockAssetAddress} />
    );

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.collateralRatio.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.collateralRatio.description")
    ).toBeInTheDocument();
  });

  it("should not render when no collateral data exists", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        buckets: [],
        totalCollateral: 0,
        collateralRatio: 0,
      })
    );

    const { container } = renderWithProviders(
      <AssetCollateralRatioChart assetAddress={mockAssetAddress} />
    );

    // Wait a bit for any rendering to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Component should return null and not render anything
    expect(container).toBeEmptyDOMElement();
  });

  it("should handle ORPC error gracefully", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch collateral ratio")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(
        <AssetCollateralRatioChart assetAddress={mockAssetAddress} />
      );
    }).toThrow("ORPC Error: Failed to fetch collateral ratio");

    consoleSpy.mockRestore();
  });
});
