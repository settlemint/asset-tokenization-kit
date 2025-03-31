export interface ChartData {
  [key: string]: string | number;
}

export interface AxisConfig<T extends ChartData = ChartData> {
  key: keyof T & string;
  tickFormatter?: (value: string) => string;
  tickMargin?: number;
  angle?: number;
}
