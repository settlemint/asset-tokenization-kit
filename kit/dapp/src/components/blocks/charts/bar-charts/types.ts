export interface BarChartData {
  [key: string]: string | number;
}

export interface AxisConfig<T extends BarChartData> {
  key: keyof T & string;
  tickFormatter?: (value: string) => string;
  tickMargin?: number;
}
