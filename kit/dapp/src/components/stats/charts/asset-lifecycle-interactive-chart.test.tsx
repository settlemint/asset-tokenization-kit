/**
 * @vitest-environment happy-dom
 */
import { type StatsRangePreset } from "@atk/zod/stats-range";
import { renderWithProviders } from "@test/helpers/test-utils";
import {
  createMockQueryError,
  createMockQueryResult,
} from "@test/mocks/suspense-query";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssetLifecycleInteractiveChart } from "./asset-lifecycle-interactive-chart";

const defaultFrom = new Date(Date.UTC(2024, 0, 1));
const defaultTo = new Date(Date.UTC(2024, 0, 2));

const defaultRange: StatsRangePreset = "trailing7Days";

// Mock useQueries while keeping other exports
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueries: vi.fn(),
  };
});

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    system: {
      stats: {
        assetLifecycleByPreset: {
          queryOptions: vi.fn(),
        },
      },
    },
  },
}));

describe("AssetLifecycleInteractiveChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart with lifecycle data", async () => {
    const { useQueries } = await import("@tanstack/react-query");
    const mockData = {
      range: {
        interval: "day" as const,
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
    };
    vi.mocked(useQueries).mockReturnValue([
      createMockQueryResult(mockData),
      createMockQueryResult(mockData),
    ]);

    renderWithProviders(
      <AssetLifecycleInteractiveChart defaultRange={defaultRange} />
    );

    expect(
      await screen.findByText("charts.assetLifecycle.title")
    ).toBeInTheDocument();
  });

  it("should show empty state when no lifecycle data exists", async () => {
    const { useQueries } = await import("@tanstack/react-query");
    const mockData = {
      range: {
        interval: "day" as const,
        from: defaultFrom,
        to: defaultTo,
        isPreset: false,
      },
      data: [],
    };
    vi.mocked(useQueries).mockReturnValue([
      createMockQueryResult(mockData),
      createMockQueryResult(mockData),
    ]);

    renderWithProviders(
      <AssetLifecycleInteractiveChart defaultRange={defaultRange} />
    );

    expect(
      await screen.findByText("charts.assetLifecycle.empty.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText("charts.assetLifecycle.empty.description")
    ).toBeInTheDocument();
  });

  it("should surface ORPC errors", async () => {
    const { useQueries } = await import("@tanstack/react-query");
    vi.mocked(useQueries).mockImplementation(
      createMockQueryError(
        new Error("ORPC Error: Failed to fetch asset lifecycle stats")
      )
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderWithProviders(
        <AssetLifecycleInteractiveChart defaultRange={defaultRange} />
      );
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
