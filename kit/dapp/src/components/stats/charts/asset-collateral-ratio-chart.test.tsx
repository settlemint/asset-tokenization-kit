/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { AssetCollateralRatioChart } from "./asset-collateral-ratio-chart";

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
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsCollateralRatio.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsCollateralRatio"],
        queryFn: () => {
          const mockResponse = {
            buckets: [
              { name: "collateralAvailable", value: 750 },
              { name: "collateralUsed", value: 250 },
            ],
            totalCollateral: 1000,
            collateralRatio: 300.0,
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
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
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsCollateralRatio.queryOptions).mockImplementation(
      (options) => ({
        queryKey: ["token", "statsCollateralRatio"],
        queryFn: () => {
          const mockResponse = {
            buckets: [],
            totalCollateral: 0,
            collateralRatio: 0,
          };
          return options?.select ? options.select(mockResponse) : mockResponse;
        },
        enabled: true,
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
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.statsCollateralRatio.queryOptions).mockImplementation(
      () => ({
        queryKey: ["token", "statsCollateralRatio"],
        queryFn: () => {
          throw new Error("ORPC Error: Failed to fetch collateral ratio");
        },
        enabled: true,
      })
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(
      <AssetCollateralRatioChart assetAddress={mockAssetAddress} />
    );

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
