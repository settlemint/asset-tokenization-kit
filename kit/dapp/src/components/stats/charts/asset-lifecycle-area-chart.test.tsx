/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import {
  createMockQueryError,
  createMockQueryResult,
} from "@test/mocks/suspense-query";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type StatsRangeInput } from "@atk/zod/stats-range";

import { AssetLifecycleAreaChart } from "./asset-lifecycle-area-chart";

const defaultFrom = new Date(Date.UTC(2024, 0, 1));
const defaultTo = new Date(Date.UTC(2024, 0, 2));

const defaultInput: StatsRangeInput = {
  interval: "day",
  from: defaultFrom,
  to: defaultTo,
};

// Mock useQuery while keeping other exports
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
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
    const { useQuery } = await import("@tanstack/react-query");
    vi.mocked(useQuery).mockReturnValue(
      createMockQueryResult({
        range: {
          interval: "day",
          from: defaultFrom,
          to: defaultTo,
          isPreset: false,
        },
        data: [
          {
            timestamp: new Date(Date.UTC(2024, 0, 1)),
            assetsCreated: 12,
            assetsLaunched: 9,
          },
          {
            timestamp: new Date(Date.UTC(2024, 0, 2)),
            assetsCreated: 18,
            assetsLaunched: 15,
          },
        ],
      })
    );

    renderWithProviders(<AssetLifecycleAreaChart range={defaultInput} />);

    expect(
      await screen.findByText("charts.assetLifecycle.title")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("charts.assetLifecycle.description")
    ).toBeInTheDocument();
  });

  it("should show empty state when no lifecycle data exists", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    vi.mocked(useQuery).mockReturnValue(
      createMockQueryResult({
        range: {
          interval: "day",
          from: defaultFrom,
          to: defaultTo,
          isPreset: false,
        },
        data: [],
      })
    );

    renderWithProviders(<AssetLifecycleAreaChart range={defaultInput} />);

    expect(
      await screen.findByText("charts.assetLifecycle.empty.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetLifecycle.empty.description")
    ).toBeInTheDocument();
  });

  it("should surface ORPC errors", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    vi.mocked(useQuery).mockImplementation(
      createMockQueryError(
        new Error("ORPC Error: Failed to fetch asset lifecycle stats")
      )
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderWithProviders(<AssetLifecycleAreaChart range={defaultInput} />);
    }).toThrow("ORPC Error: Failed to fetch asset lifecycle stats");

    consoleSpy.mockRestore();
  });
});
