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
import { TransactionHistoryAreaChart } from "./transaction-history-area-chart";

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
        transactionHistory: {
          queryOptions: vi.fn(),
        },
      },
    },
  },
}));

describe("TransactionHistoryAreaChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with transaction data", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        transactionHistory: [
          { timestamp: "2024-01-01", transactions: 150 },
          { timestamp: "2024-01-02", transactions: 200 },
          { timestamp: "2024-01-03", transactions: 175 },
          { timestamp: "2024-01-04", transactions: 300 },
          { timestamp: "2024-01-05", transactions: 250 },
        ],
      })
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        transactionHistory: [],
      })
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
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch transaction history")
      )
    );

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Expect the component to throw an error, which will be caught by error boundary
    expect(() => {
      renderWithProviders(<TransactionHistoryAreaChart />);
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
