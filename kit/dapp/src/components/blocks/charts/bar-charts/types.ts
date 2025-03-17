import type { ChartConfig } from "@/components/ui/chart";

export interface BarChartData {
  [key: string]: string | number;
}

export interface AxisConfig<T extends BarChartData> {
  key: keyof T & string;
  tickFormatter?: (value: string) => string;
  tickMargin?: number;
}

export interface BarChartProps<T extends BarChartData> {
  data: T[];
  config: ChartConfig;
  title: string;
  description?: string;
}

export const defaultTickFormatter = (value: string) => value.slice(0, 3);
export const defaultTickMargin = 10;
