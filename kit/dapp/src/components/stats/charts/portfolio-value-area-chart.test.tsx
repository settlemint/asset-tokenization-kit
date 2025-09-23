import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioValueAreaChart } from "./portfolio-value-area-chart";

// Mock the ORPC client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    system: {
      stats: {
        portfolio: {
          queryOptions: vi.fn(() => ({
            queryKey: ["system", "stats", "portfolio"],
            queryFn: vi.fn(),
          })),
        },
      },
    },
    settings: {
      read: {
        queryOptions: vi.fn(() => ({
          queryKey: ["settings", "read"],
          queryFn: vi.fn(),
        })),
      },
    },
  },
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      // Mock translations for testing
      const translations: Record<string, string> = {
        "charts.portfolioValue.title": "Your portfolio value",
        "charts.portfolioValue.description": `Track how your investments have performed over the last ${String(options?.days) || "30"} days`,
        "charts.portfolioValue.label": "Value",
        "charts.portfolioValue.empty.title": "No data to show yet",
        "charts.portfolioValue.empty.description":
          "Start investing to see your portfolio performance over time",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock date-fns
vi.mock("date-fns/format", () => ({
  format: vi.fn((_date: Date, formatStr: string) => {
    if (formatStr === "MMM dd") {
      return "Jan 01";
    }
    if (formatStr === "MMM dd HH:mm") {
      return "Jan 01 12:00";
    }
    return "Jan 01";
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
      // Mock portfolio data query
      if (options.queryKey?.includes("portfolio")) {
        return {
          data: {
            chartData: [
              { timestamp: "Jan 01", portfolioValue: 1000 },
              { timestamp: "Jan 02", portfolioValue: 1100 },
            ],
            chartConfig: {
              portfolioValue: {
                label: "Portfolio value",
                color: "var(--chart-1)",
              },
            },
            dataKeys: ["portfolioValue"],
          },
        };
      }
      // Mock settings query for base currency
      if (options.queryKey?.includes("settings")) {
        return {
          data: "EUR",
        };
      }
      return { data: null };
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

  it("renders portfolio value chart with default props", () => {
    renderWithQueryClient(<PortfolioValueAreaChart />);

    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });

  it("renders chart with custom interval", () => {
    renderWithQueryClient(<PortfolioValueAreaChart interval="hour" />);

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });

  it("renders chart with custom time range", () => {
    renderWithQueryClient(<PortfolioValueAreaChart timeRange={7} />);

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Track how your investments have performed over the last 7 days/
      )
    ).toBeInTheDocument();
  });

  it("renders chart with date range", () => {
    renderWithQueryClient(
      <PortfolioValueAreaChart
        from="2024-01-01T00:00:00Z"
        to="2024-01-31T23:59:59Z"
      />
    );

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByText("Your portfolio value")).toBeInTheDocument();
  });
});
