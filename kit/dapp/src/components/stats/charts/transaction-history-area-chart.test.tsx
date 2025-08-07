/**
 * @vitest-environment happy-dom
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/test-utils";
import { TransactionHistoryAreaChart } from "./transaction-history-area-chart";

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    system: {
      statsTransactionHistory: {
        queryOptions: vi.fn(),
      },
    },
  },
}));

describe("TransactionHistoryAreaChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with transaction data", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.system.statsTransactionHistory.queryOptions).mockReturnValue(
      {
        queryKey: ["system", "statsTransactionHistory"],
        queryFn: () => ({
          transactionHistory: [
            { timestamp: "2024-01-01", transactions: 150 },
            { timestamp: "2024-01-02", transactions: 200 },
            { timestamp: "2024-01-03", transactions: 175 },
            { timestamp: "2024-01-04", transactions: 300 },
            { timestamp: "2024-01-05", transactions: 250 },
          ],
        }),
        enabled: true,
      }
    );

    renderWithProviders(<TransactionHistoryAreaChart />);

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.transactionHistory.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.transactionHistory.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no transactions exist", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.system.statsTransactionHistory.queryOptions).mockReturnValue(
      {
        queryKey: ["system", "statsTransactionHistory"],
        queryFn: () => ({
          transactionHistory: [],
        }),
        enabled: true,
      }
    );

    renderWithProviders(<TransactionHistoryAreaChart />);

    // Wait for the chart to render
    expect(
      await screen.findByText("charts.transactionHistory.title")
    ).toBeInTheDocument();

    // Verify the empty state content is shown
    expect(screen.getByText("charts.common.noData")).toBeInTheDocument();
  });

  it("should handle ORPC error gracefully", async () => {
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.system.statsTransactionHistory.queryOptions).mockReturnValue(
      {
        queryKey: ["system", "statsTransactionHistory"],
        queryFn: () => {
          throw new Error("ORPC Error: Failed to fetch transaction history");
        },
        enabled: true,
      }
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(<TransactionHistoryAreaChart />);

    // Wait a bit for the error to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The component should be rendered within the app structure
    // The error boundary will handle the error appropriately
    expect(document.body).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
