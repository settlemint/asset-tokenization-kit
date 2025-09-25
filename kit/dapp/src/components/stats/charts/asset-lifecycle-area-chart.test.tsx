/**
 * @vitest-environment happy-dom
 */

const env = process.env;

if (!env.SETTLEMINT_HASURA_ENDPOINT) {
  env.SETTLEMINT_HASURA_ENDPOINT = "http://localhost:8080";
}

if (!env.SETTLEMINT_HASURA_ADMIN_SECRET) {
  env.SETTLEMINT_HASURA_ADMIN_SECRET = "test-secret";
}
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockSuspenseQueryError,
  createMockSuspenseQueryResult,
} from "@test/mocks/suspense-query";
import { renderWithProviders } from "@test/helpers/test-utils";
import { AssetLifecycleAreaChart } from "./asset-lifecycle-area-chart";

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
        assetLifecycle: {
          queryOptions: vi.fn(),
        },
      },
    },
  },
}));

describe("AssetLifecycleAreaChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with lifecycle data", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({
        data: [
          {
            timestamp: `${Date.UTC(2024, 0, 1) / 1000}`,
            assetsCreatedCount: 12,
            assetsLaunchedCount: 9,
          },
          {
            timestamp: `${Date.UTC(2024, 0, 2) / 1000}`,
            assetsCreatedCount: 18,
            assetsLaunchedCount: 15,
          },
        ],
      })
    );

    renderWithProviders(<AssetLifecycleAreaChart />);

    expect(
      await screen.findByText("charts.assetLifecycle.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetLifecycle.description")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetLifecycle.createdLabel")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetLifecycle.launchedLabel")
    ).toBeInTheDocument();
  });

  it("should show empty state when no lifecycle data exists", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockReturnValue(
      createMockSuspenseQueryResult({ data: [] })
    );

    renderWithProviders(<AssetLifecycleAreaChart />);

    expect(
      await screen.findByText("charts.assetLifecycle.empty.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetLifecycle.empty.description")
    ).toBeInTheDocument();
  });

  it("should surface ORPC errors", async () => {
    const { useSuspenseQuery } = await import("@tanstack/react-query");
    vi.mocked(useSuspenseQuery).mockImplementation(
      createMockSuspenseQueryError(
        new Error("ORPC Error: Failed to fetch asset lifecycle stats")
      )
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderWithProviders(<AssetLifecycleAreaChart />);
    }).toThrow("ORPC Error: Failed to fetch asset lifecycle stats");

    consoleSpy.mockRestore();
  });
});
