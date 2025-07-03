/**
 * Chart components built on top of Recharts with theme support.
 *
 * This module provides a set of chart components that integrate seamlessly with
 * the application's theming system. It includes:
 * - ChartContainer: Main wrapper that provides configuration and theming
 * - ChartTooltip: Enhanced tooltip with custom styling
 * - ChartLegend: Themed legend component
 * - Automatic theme-based color switching
 * - Responsive design with aspect ratio preservation
 *
 * The components support both single-color and theme-aware color configurations,
 * allowing charts to adapt their colors based on the current theme (light/dark).
 *
 * @module components/ui/chart
 */

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

/**
 * Theme configuration mapping theme names to CSS selectors.
 * Used for generating theme-specific styles.
 */
const THEMES = { light: "", dark: ".dark" } as const;

/**
 * Configuration type for chart data series.
 * Each key represents a data series with optional label, icon, and color configuration.
 *
 * @example
 * const config: ChartConfig = {
 *   revenue: {
 *     label: "Revenue",
 *     color: "#8884d8",
 *   },
 *   expenses: {
 *     label: "Expenses",
 *     theme: {
 *       light: "#82ca9d",
 *       dark: "#4ade80"
 *     }
 *   }
 * }
 */
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

/**
 * Context properties for chart configuration.
 */
type ChartContextProps = {
  config: ChartConfig;
};

/**
 * Chart context for passing configuration to child components.
 */
const ChartContext = React.createContext<ChartContextProps | null>(null);

/**
 * Hook to access chart configuration from context.
 * Must be used within a ChartContainer component.
 *
 * @returns {ChartContextProps} The chart configuration
 * @throws {Error} If used outside of ChartContainer
 *
 * @example
 * function CustomChartComponent() {
 *   const { config } = useChart();
 *   // Use config to access series labels and colors
 * }
 */
function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

/**
 * Main container component for charts with built-in theming and responsive behavior.
 *
 * This component wraps Recharts components and provides:
 * - Automatic responsive sizing
 * - Theme-aware color management
 * - Consistent styling across all chart types
 * - Context for child components to access configuration
 *
 * @param {React.ComponentProps<"div"> & { config: ChartConfig; children: React.ReactNode }} props - Component props
 * @param {string} [props.id] - Optional unique identifier for the chart
 * @param {string} [props.className] - Additional CSS classes
 * @param {ChartConfig} props.config - Chart configuration with series definitions
 * @param {React.ReactNode} props.children - Recharts components to render
 * @returns {JSX.Element} Container element with chart and styling
 *
 * @example
 * <ChartContainer config={chartConfig}>
 *   <LineChart data={data}>
 *     <Line dataKey="revenue" />
 *     <Line dataKey="expenses" />
 *   </LineChart>
 * </ChartContainer>
 */
function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/**
 * Internal component that generates CSS custom properties for chart colors.
 *
 * This component creates theme-aware CSS variables that are used by chart elements
 * to apply the correct colors based on the current theme. It generates separate
 * style rules for light and dark themes.
 *
 * @param {object} props - Component props
 * @param {string} props.id - Unique chart identifier
 * @param {ChartConfig} props.config - Chart configuration with color definitions
 * @returns {JSX.Element | null} Style element with CSS variables or null if no colors
 */
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

/**
 * Re-export of Recharts Tooltip component for consistency.
 */
const ChartTooltip = RechartsPrimitive.Tooltip;

/**
 * Props for the ChartTooltipContent component.
 */
interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  /** Whether the tooltip is currently active/visible */
  active?: boolean;
  /** Array of data points to display in the tooltip */
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    fill?: string;
    name?: string;
    payload?: Record<string, unknown>;
    value?: number;
  }>;
  /** Whether to hide the tooltip label */
  hideLabel?: boolean;
  /** Whether to hide the color indicator */
  hideIndicator?: boolean;
  /** Style of the indicator: dot, line, or dashed */
  indicator?: "line" | "dot" | "dashed";
  /** Key to use for extracting the name from payload */
  nameKey?: string;
  /** Key to use for extracting the label from payload */
  labelKey?: string;
  /** Custom label content */
  label?: React.ReactNode;
  /** Function to format the label */
  labelFormatter?: (
    value: React.ReactNode,
    payload: ChartTooltipContentProps["payload"]
  ) => React.ReactNode;
  /** CSS class for the label */
  labelClassName?: string;
  /** Function to format individual values */
  formatter?: (
    value: number,
    name: string,
    item: NonNullable<ChartTooltipContentProps["payload"]>[number],
    index: number,
    payload: unknown
  ) => React.ReactNode;
  /** Override color for all indicators */
  color?: string;
}

/**
 * Enhanced tooltip content component for charts.
 *
 * This component provides a customizable tooltip that displays data point information
 * when hovering over chart elements. It supports:
 * - Multiple data series display
 * - Custom formatting for labels and values
 * - Theme-aware styling
 * - Various indicator styles (dot, line, dashed)
 * - Icon support for data series
 *
 * @param {ChartTooltipContentProps} props - Component configuration
 * @returns {JSX.Element | null} Tooltip content or null if inactive
 *
 * @example
 * <ChartTooltip
 *   content={
 *     <ChartTooltipContent
 *       indicator="line"
 *       formatter={(value) => `$${value.toLocaleString()}`}
 *     />
 *   }
 * />
 */
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(
                  item.value,
                  item.name,
                  item,
                  index,
                  item.payload ?? {}
                )
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          }
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Re-export of Recharts Legend component for consistency.
 */
const ChartLegend = RechartsPrimitive.Legend;

/**
 * Props for the ChartLegendContent component.
 */
interface ChartLegendContentProps extends React.ComponentProps<"div"> {
  /** Whether to hide series icons */
  hideIcon?: boolean;
  /** Key to use for extracting names from payload */
  nameKey?: string;
  /** Vertical alignment of the legend */
  verticalAlign?: "top" | "middle" | "bottom";
  /** Legend items data */
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    fill?: string;
    inactive?: boolean;
    payload?: unknown;
    type?: RechartsPrimitive.LegendType;
    value?: string | number;
  }>;
}

/**
 * Enhanced legend content component for charts.
 *
 * This component provides a customizable legend that displays information about
 * data series in the chart. It supports:
 * - Custom icons for each series
 * - Theme-aware color indicators
 * - Flexible positioning (top/bottom)
 * - Internationalized labels from chart config
 *
 * @param {ChartLegendContentProps} props - Component configuration
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hideIcon=false] - Whether to hide series icons
 * @param {Array} [props.payload] - Legend items data
 * @param {"top" | "middle" | "bottom"} [props.verticalAlign="bottom"] - Vertical positioning
 * @param {string} [props.nameKey] - Key for extracting names from data
 * @returns {JSX.Element | null} Legend content or null if no items
 *
 * @example
 * <ChartLegend
 *   content={
 *     <ChartLegendContent
 *       verticalAlign="top"
 *       hideIcon={false}
 *     />
 *   }
 * />
 */
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Helper function to extract configuration for a data series from payload.
 *
 * This function navigates through the payload structure to find the appropriate
 * configuration key, handling nested payload objects and key mapping.
 *
 * @param {ChartConfig} config - Chart configuration object
 * @param {unknown} payload - Data payload from chart
 * @param {string} key - Key to look up in configuration
 * @returns {ChartConfig[string] | undefined} Configuration for the series or undefined
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
