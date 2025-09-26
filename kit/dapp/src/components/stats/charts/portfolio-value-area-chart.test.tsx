import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type StatsRangeInput } from "@atk/zod/stats-range";

import { PortfolioValueAreaChart } from "./portfolio-value-area-chart";

const mockBaseCurrency = "EUR";

const defaultFrom = new Date("2024-01-01T00:00:00Z");
const defaultTo = new Date("2024-01-31T23:59:59Z");

const defaultRange: StatsRangeInput = {
  from: defaultFrom,
  to: defaultTo,
  interval: "day",
};

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
              queryKey: ["system", "stats", "portfolio"],
              queryFn: vi.fn(() => {
                const typedInput = input as StatsRangeInput | undefined;

                let interval: "day" | "hour" = "day";
                let from = new Date("2024-01-01T00:00:00Z");
                let to = new Date("2024-01-31T23:59:59Z");

                if (typedInput && typeof typedInput !== "string") {
                  interval = typedInput.interval;
                  from = typedInput.from;
                  to = typedInput.to;
                }

                return Promise.resolve({
                  range: {
                    interval,
                    from,
                    to,
                    isPreset: false,
                  },
                  data: [
                    {
                      timestamp: `${from.getTime() / 1000}`,
                      totalValueInBaseCurrency: "1000",
                    },
                    {
                      timestamp: `${to.getTime() / 1000}`,
                      totalValueInBaseCurrency: "1100",
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
  useTranslation: () => ({
    t: (key: string, options: Record<string, unknown> = {}) => {
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
vi.mock("@/components/charts/area-chart", () => ({
  AreaChartComponent: ({
    title,
    description,
    data,
  }: {
    title: string;
    description?: string;
    data: unknown[];
    chartContainerClassName?: string;
  }) => (
    <div data-testid="area-chart">
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

  it("renders portfolio value chart with required props", () => {
    renderWithQueryClient(<PortfolioValueAreaChart range={defaultRange} />);

    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });

  it("renders chart with custom interval", () => {
    renderWithQueryClient(
      <PortfolioValueAreaChart range={{ ...defaultRange, interval: "hour" }} />
    );

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });

  it("renders chart with custom date range", () => {
    const from = new Date("2024-02-01T00:00:00Z");
    const to = new Date("2024-02-08T00:00:00Z");

    renderWithQueryClient(
      <PortfolioValueAreaChart range={{ from, to, interval: "day" }} />
    );

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(
      screen.getByText(
        "See how your portfolio value changed from Feb 01 to Feb 08"
      )
    ).toBeInTheDocument();
  });

  it("renders chart with explicit date range overrides", () => {
    renderWithQueryClient(
      <PortfolioValueAreaChart
        range={{
          from: new Date("2024-03-01T00:00:00Z"),
          to: new Date("2024-03-15T23:59:59Z"),
          interval: "day",
        }}
      />
    );

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });
});
