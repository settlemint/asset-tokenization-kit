import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type StatsRangePreset } from "@atk/zod/stats-range";

import { PortfolioValueAreaChart } from "./portfolio-value-area-chart";

const mockBaseCurrency = "EUR";

const defaultFrom = new Date("2024-01-01T00:00:00Z");
const defaultTo = new Date("2024-01-31T23:59:59Z");

// Mock the ORPC client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    system: {
      stats: {
        portfolio: {
          queryOptions: vi.fn(
            ({
              enabled,
              input,
              ...rest
            }: { enabled?: boolean; input?: unknown } = {}) => ({
              ...rest,
              enabled,
              queryKey: ["system", "stats", "portfolio", input],
              queryFn: vi.fn(() => {
                const typedInput = input as StatsRangePreset | undefined;

                let interval: "day" | "hour" = "day";
                let from = defaultFrom;
                let to = defaultTo;

                // Handle preset strings
                if (typedInput === "trailing24Hours") {
                  interval = "hour";
                  from = new Date("2024-01-31T00:00:00Z");
                  to = defaultTo;
                }

                return Promise.resolve({
                  range: {
                    interval,
                    from,
                    to,
                    isPreset: true,
                  },
                  data: [
                    {
                      timestamp: from,
                      totalValueInBaseCurrency: 1000,
                    },
                    {
                      timestamp: to,
                      totalValueInBaseCurrency: 1100,
                    },
                  ],
                });
              }),
            })
          ),
        },
      },
    },
    settings: {
      read: {
        queryOptions: vi.fn(
          ({
            enabled,
            input: _input,
            ...rest
          }: { enabled?: boolean; input?: unknown } = {}) => ({
            ...rest,
            enabled,
            queryKey: ["settings", "read"],
            queryFn: vi.fn(() => Promise.resolve(mockBaseCurrency)),
          })
        ),
      },
    },
  },
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: (namespace?: string) => ({
    t: (key: string, options: Record<string, unknown> = {}) => {
      // Handle common namespace timeframe translations
      if (namespace === "common" && key.startsWith("timeframes.")) {
        const preset = key.replace("timeframes.", "");
        if (preset === "trailing24Hours") return "Last 24 hours";
        if (preset === "trailing7Days") return "Last 7 days";
        return preset;
      }

      if (key === "charts.portfolioValue.title") {
        return "Your portfolio value";
      }

      if (key === "charts.portfolioValue.description") {
        const overRange =
          typeof options.overRange === "string" ? options.overRange.trim() : "";
        return `See how your portfolio value changed ${overRange}`.trim();
      }

      if (key === "charts.portfolioValue.label") {
        return "Value";
      }

      if (key === "charts.portfolioValue.empty.title") {
        return "No data to show yet";
      }

      if (key === "charts.portfolioValue.empty.description") {
        return "Start investing to see your portfolio performance over time";
      }

      if (key === "charts.common.intervalLabel.day") {
        return "Daily";
      }

      if (key === "charts.common.intervalLabel.hour") {
        return "Hourly";
      }

      if (key === "charts.common.units.day") {
        const count = Number(options.count ?? 0);
        return `${count} ${count === 1 ? "day" : "days"}`;
      }

      if (key === "charts.common.units.hour") {
        const count = Number(options.count ?? 0);
        return `${count} ${count === 1 ? "hour" : "hours"}`;
      }

      if (key === "charts.common.range.duration") {
        const duration =
          typeof options.duration === "string" ? options.duration : "";
        return `over the last ${duration}`.trim();
      }

      if (key === "charts.common.range.window") {
        return `from ${options.start} to ${options.end}`;
      }

      return key;
    },
    i18n: {
      language: "en",
    },
  }),
}));

// Mock date-fns
vi.mock("date-fns/format", () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    const monthAbbrev = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const day = String(date.getUTCDate()).padStart(2, "0");
    if (formatStr === "MMM dd HH:mm") {
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${monthAbbrev} ${day} ${hours}:${minutes}`;
    }

    return `${monthAbbrev} ${day}`;
  }),
}));

// Mock the chart components
vi.mock("@/components/charts/interactive-chart", () => ({
  InteractiveChartComponent: ({
    title,
    description,
    data,
  }: {
    title: string;
    description?: string;
    data: unknown[];
    chartContainerClassName?: string;
  }) => (
    <div data-testid="interactive-chart">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

vi.mock("@/components/error/component-error-boundary", () => ({
  ComponentErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useSuspenseQuery: vi.fn((options) => {
      if (options.queryKey?.includes("settings")) {
        return {
          data: mockBaseCurrency,
        };
      }

      return { data: undefined };
    }),
  };
});

describe("PortfolioValueAreaChart", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it("renders portfolio value chart with default range", () => {
    renderWithQueryClient(<PortfolioValueAreaChart />);

    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("interactive-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });

  it("renders chart with custom defaultRange", () => {
    renderWithQueryClient(
      <PortfolioValueAreaChart defaultRange="trailing24Hours" />
    );

    expect(screen.getByTestId("interactive-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });

  it("renders chart with trailing7Days preset", () => {
    renderWithQueryClient(
      <PortfolioValueAreaChart defaultRange="trailing7Days" />
    );

    expect(screen.getByTestId("interactive-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });
});
