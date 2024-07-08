import { ChartOptions, ChartType } from "chart.js";

export interface ChartConfig<T extends ChartType> {
    chartType: T;
    xData: string[];
    yData: number[];
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    legend?: boolean;
    options?: ChartOptions;
  }